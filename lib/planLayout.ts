/**
 * Extracts the wall layout from a rasterised floor plan so it can be extruded
 * into real 3D walls — perimeter and internal walls in the drawing's exact
 * positions. Pure client-side image processing, no AI service.
 *
 * v2 pipeline — structure only, annotations rejected upstream:
 *   1. classify pixels: saturated ink (red/blue/green design markup, coloured
 *      leader lines) is annotation, NEVER structure; neutral dark pixels are
 *      candidate ink. Grey room fills lose their interiors on a blurred copy.
 *   2. remove frame-shaped components (sheet borders, phone-UI bars)
 *   3. reject non-structural components at full resolution:
 *      - small components (room labels, dimension text, W/B/CPD tags,
 *        arrowheads, sanitary symbols)
 *      - photographic components (embedded product photos: ink-dense regions
 *        that are continuous-tone rather than line-art)
 *   4. trace LONG straight horizontal/vertical runs — walls are the only long
 *      solid lines (text is gone by now, hatching is diagonal, arcs curve)
 *   5. measure the drawing's own wall-band thickness (mode of long-run band
 *      thickness) and derive the pair-fill gap from it, instead of a
 *      hard-coded gap: walls = thick bands of long runs + fills between
 *      PAIRS of long parallel lines no further apart than a wall is thick.
 *      Isolated dimension lines and furniture edges never pair.
 *   6. grid downsample → speck/blob filters → keep components intersecting
 *      the union of all large wall clusters
 *   7. merge cells into boxes with tolerant row matching, so a straight wall
 *      becomes one box instead of a stack of single-cell strips
 */

import { DebugRecorder, DBG, type PlanDebug, type Palette } from "./planLayoutDebug";

export interface WallBox {
  x: number;
  z: number;
  w: number;
  d: number;
  /** 1 = exterior wall (touches the outside of the building) */
  ext?: 0 | 1;
  /** outward normal (world x/z) for exterior walls */
  nx?: number;
  nz?: number;
}

export interface PlanLayout {
  ok: boolean;
  /** wall footprints in world units, centred on origin (x/z = centre) */
  boxes: WallBox[];
  floorW: number;
  floorD: number;
  /** crop of the source image matching the wall bbox (fractions of full image) */
  crop: { ox: number; oy: number; rw: number; rh: number };
  /** measurements that let real-world scale be attached later */
  metrics?: {
    /** enclosed building footprint (walls + rooms), source-image px² */
    footprintPx2: number;
    /** Three.js world units per source-image pixel */
    worldPerPx: number;
    /** measured wall-band thickness, source px */
    wallPx: number;
    /** the filtered wall grid, bit-packed row-major — lets scale derivation
     * re-seal openings once a floor area is known */
    grid?: { w: number; h: number; cellPx: number; x0: number; y0: number; bits: string };
  };
  /** real-world scale — attached once a floor area is known (see houseModel) */
  scale?: import("./houseModel").PlanScale | null;
  /** per-property heights — defaults until a survey overrides them */
  house?: import("./houseModel").HouseSpec;
}

const WORLD_MAX = 9; // longest side of the extruded layout, world units

/** separable 5x5 box blur on a luminance array */
function boxBlur(lum: Int16Array, W: number, H: number): Int16Array {
  const r = 2;
  const tmp = new Int16Array(W * H);
  const out = new Int16Array(W * H);
  for (let y = 0; y < H; y++) {
    let sum = 0;
    for (let x = -r; x <= r; x++) sum += lum[y * W + Math.min(W - 1, Math.max(0, x))];
    for (let x = 0; x < W; x++) {
      tmp[y * W + x] = sum / (2 * r + 1);
      const add = Math.min(W - 1, x + r + 1);
      const sub = Math.max(0, x - r);
      sum += lum[y * W + add] - lum[y * W + sub];
    }
  }
  for (let x = 0; x < W; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) sum += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
    for (let y = 0; y < H; y++) {
      out[y * W + x] = sum / (2 * r + 1);
      const add = Math.min(H - 1, y + r + 1);
      const sub = Math.max(0, y - r);
      sum += tmp[add * W + x] - tmp[sub * W + x];
    }
  }
  return out;
}

/** binary erosion (cross), n iterations */
function erode(mask: Uint8Array, W: number, H: number, n: number): Uint8Array {
  let a = mask;
  let b = new Uint8Array(W * H);
  for (let t = 0; t < n; t++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        b[i] =
          a[i] &&
          (x > 0 ? a[i - 1] : 0) &&
          (x < W - 1 ? a[i + 1] : 0) &&
          (y > 0 ? a[i - W] : 0) &&
          (y < H - 1 ? a[i + W] : 0)
            ? 1
            : 0;
      }
    }
    const s = a === mask ? new Uint8Array(W * H) : a;
    a = b;
    b = s;
  }
  return a;
}

interface Comp {
  area: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** connected-component labelling (4-neighbour), returns labels + stats */
function label(mask: Uint8Array, W: number, H: number): { lbl: Int32Array; comps: Comp[] } {
  const lbl = new Int32Array(W * H).fill(-1);
  const comps: Comp[] = [];
  const stack: number[] = [];
  for (let i = 0; i < W * H; i++) {
    if (!mask[i] || lbl[i] >= 0) continue;
    const id = comps.length;
    const c: Comp = { area: 0, x0: W, x1: 0, y0: H, y1: 0 };
    comps.push(c);
    lbl[i] = id;
    stack.push(i);
    while (stack.length) {
      const j = stack.pop()!;
      const x = j % W;
      const y = (j - x) / W;
      c.area++;
      if (x < c.x0) c.x0 = x;
      if (x > c.x1) c.x1 = x;
      if (y < c.y0) c.y0 = y;
      if (y > c.y1) c.y1 = y;
      if (x > 0 && mask[j - 1] && lbl[j - 1] < 0) {
        lbl[j - 1] = id;
        stack.push(j - 1);
      }
      if (x < W - 1 && mask[j + 1] && lbl[j + 1] < 0) {
        lbl[j + 1] = id;
        stack.push(j + 1);
      }
      if (y > 0 && mask[j - W] && lbl[j - W] < 0) {
        lbl[j - W] = id;
        stack.push(j - W);
      }
      if (y < H - 1 && mask[j + W] && lbl[j + W] < 0) {
        lbl[j + W] = id;
        stack.push(j + W);
      }
    }
  }
  return { lbl, comps };
}

/** bit-pack a 0/1 grid to base64 so it can travel with the layout */
function packGrid(
  grid: Uint8Array,
  w: number,
  h: number,
  cellPx: number,
  x0: number,
  y0: number,
): { w: number; h: number; cellPx: number; x0: number; y0: number; bits: string } {
  const bytes = new Uint8Array(Math.ceil((w * h) / 8));
  for (let i = 0; i < w * h; i++) if (grid[i]) bytes[i >> 3] |= 1 << (i & 7);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 =
    typeof btoa === "function"
      ? btoa(bin)
      : (globalThis as unknown as { Buffer: { from(b: Uint8Array): { toString(e: string): string } } }).Buffer
          .from(bytes)
          .toString("base64");
  return { w, h, cellPx, x0, y0, bits: b64 };
}

export async function extractLayout(
  preview: Blob,
  opts?: { debug?: boolean },
): Promise<(PlanLayout & { debug?: PlanDebug }) | null> {
  try {
    const bmp = await createImageBitmap(preview);
    const W = bmp.width;
    const H = bmp.height;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(bmp, 0, 0);
    bmp.close();
    const img = ctx.getImageData(0, 0, W, H).data;
    // TEMPORARY diagnostics — null (and therefore free) unless ?planDebug=1
    const dbg = opts?.debug ? new DebugRecorder(W, H) : null;

    const N = W * H;
    const maxDim = Math.max(W, H);

    // 1. pixel classification: saturated ink is annotation, never structure
    const lum = new Int16Array(N);
    const mask = new Uint8Array(N);
    const markup = dbg ? new Uint8Array(N) : null; // 1 red, 2 blue, 3 green
    let markupPx = 0;
    let markupRed = 0;
    let markupBlue = 0;
    let markupGreen = 0;
    for (let i = 0, p = 0; i < N; i++, p += 4) {
      const r = img[p];
      const g = img[p + 1];
      const b = img[p + 2];
      const mx = r > g ? (r > b ? r : b) : g > b ? g : b;
      const mn = r < g ? (r < b ? r : b) : g < b ? g : b;
      lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      if (mx - mn > 55) {
        // coloured = design markup / leader lines: excluded from structure
        markupPx++;
        if (markup) {
          if (r > g + 40 && r > b + 40) {
            markup[i] = 1;
            markupRed++;
          } else if (b > r + 35 && b > g + 20) {
            markup[i] = 2;
            markupBlue++;
          } else if (g > r + 30 && g > b + 30) {
            markup[i] = 3;
            markupGreen++;
          }
        }
        continue;
      }
      mask[i] = lum[i] < 155 ? 1 : 0;
    }
    {
      // hollow out flat dark regions (grey room fills) on a blurred copy
      const blur = boxBlur(lum, W, H);
      const flat = new Uint8Array(N);
      for (let i = 0; i < N; i++) flat[i] = blur[i] < 140 ? 1 : 0;
      // erode far enough that a WALL BAND has no interior — only large flat
      // regions (room fills, photo slabs) lose their cores. 4 iterations used
      // to hollow 10px walls into twin outlines the band rule couldn't see.
      const flatInt = erode(flat, W, H, Math.max(6, Math.round(maxDim * 0.005)));
      for (let i = 0; i < N; i++) if (flatInt[i]) mask[i] = 0;
    }
    // 2. remove frame-shaped components (sheet borders, phone-UI bars)
    {
      const { lbl, comps } = label(mask, W, H);
      const e = 2;
      const drop = new Set<number>();
      comps.forEach((cc, id) => {
        const edges =
          (cc.x0 <= e ? 1 : 0) + (cc.x1 >= W - 1 - e ? 1 : 0) + (cc.y0 <= e ? 1 : 0) + (cc.y1 >= H - 1 - e ? 1 : 0);
        const bw = cc.x1 - cc.x0 + 1;
        const bh = cc.y1 - cc.y0 + 1;
        if (edges >= 3 || (edges >= 1 && bw > 0.85 * W && bh > 0.85 * H)) drop.add(id);
      });
      if (drop.size) for (let i = 0; i < N; i++) if (mask[i] && drop.has(lbl[i])) mask[i] = 0;
    }

    {
      // bridge hairline breaks: where a coloured design line is drawn ON TOP
      // of a wall band, its chroma bleed dashes the neutral ink into
      // fragments. Close gaps of up to 4px along rows and columns so those
      // walls read as the solid bands they are. (A coloured line on plain
      // paper bridges nothing — there is no ink on either side of it.)
      const G = 4;
      for (let y = 0; y < H; y++) {
        let last = -9;
        for (let x = 0; x < W; x++) {
          if (!mask[y * W + x]) continue;
          if (x - last <= G + 1 && x - last > 1) for (let k = last + 1; k < x; k++) mask[y * W + k] = 1;
          last = x;
        }
      }
      for (let x = 0; x < W; x++) {
        let last = -9;
        for (let y = 0; y < H; y++) {
          if (!mask[y * W + x]) continue;
          if (y - last <= G + 1 && y - last > 1) for (let k = last + 1; k < y; k++) mask[k * W + x] = 1;
          last = y;
        }
      }
    }
    if (dbg && markup) {
      dbg.count("markupRedPx", markupRed);
      dbg.count("markupBluePx", markupBlue);
      dbg.count("markupGreenPx", markupGreen);
      dbg.count("markupCountedAsInkPx", 0); // v2: markup is excluded from ink upstream
      dbg.stage("markup", "1 · DESIGN MARKUP", markup, DBG.colour,
        "saturated ink — excluded from structure entirely");
    }


    // 3. reject non-structural components at full resolution: anything whose
    // bounding box is smaller than a wall is long — room labels, dimension
    // text, W/B/CPD tags, arrowheads, sanitary symbols. Walls all touch one
    // large connected structure, so this cannot take a wall with it.
    let rejectedSmallComps = 0;
    {
      const { lbl, comps } = label(mask, W, H);
      const smallMax = Math.round(maxDim * 0.07);
      const kind = new Uint8Array(comps.length); // 1 small
      comps.forEach((cc, id) => {
        const bw = cc.x1 - cc.x0 + 1;
        const bh = cc.y1 - cc.y0 + 1;
        if (Math.max(bw, bh) < smallMax) {
          kind[id] = 1;
          rejectedSmallComps++;
        }
      });
      const rej = dbg ? new Uint8Array(N) : null;
      for (let i = 0; i < N; i++) {
        if (!mask[i]) continue;
        const k = kind[lbl[i]];
        if (k) {
          if (rej) rej[i] = k;
          mask[i] = 0;
        }
      }
      if (dbg && rej) {
        dbg.count("rejectedSmallComps", rejectedSmallComps);
        dbg.stage("reject", "2 · REJECTED INK", rej, DBG.reject,
          "pink = text/symbols (small components)");
      }
    }
    if (dbg) {
      let ink = 0;
      for (let i = 0; i < N; i++) ink += mask[i];
      dbg.count("inkPx", ink);
      dbg.stage("ink", "3 · STRUCTURAL INK", mask, DBG.ink,
        "neutral dark pixels after all rejection passes");
    }

    // 4. long-run tracing (2 = long, 1 = short stub such as a window pier)
    // text and symbols are already rejected at full resolution, so "long" can
    // be much shorter than in v1: it only needs to beat arc chords and
    // fixture edges, not text strokes. Interior wall piers between door
    // openings are the shortest real walls (~0.35 m).
    const minRun = Math.round(maxDim * 0.012);
    const minStub = Math.max(5, Math.round(maxDim * 0.004));
    // pair fill exists for twin-boundary (hollow/CAD) walls, which are LONG
    // lines; solid piers are caught by the band rule and never need pairing.
    // Demanding very long partners keeps word-smears and fixture edges out.
    const pairMin = Math.round(maxDim * 0.034);

    const maskH = new Uint8Array(N);
    for (let y = 0; y < H; y++) {
      let start = -1;
      for (let x = 0; x <= W; x++) {
        const on = x < W && mask[y * W + x];
        if (on && start < 0) start = x;
        if (!on && start >= 0) {
          const len = x - start;
          const v = len >= pairMin ? 3 : len >= minRun ? 2 : len >= minStub ? 1 : 0;
          if (v) for (let k = start; k < x; k++) maskH[y * W + k] = v;
          start = -1;
        }
      }
    }
    const maskV = new Uint8Array(N);
    for (let x = 0; x < W; x++) {
      let start = -1;
      for (let y = 0; y <= H; y++) {
        const on = y < H && mask[y * W + x];
        if (on && start < 0) start = y;
        if (!on && start >= 0) {
          const len = y - start;
          const v = len >= pairMin ? 3 : len >= minRun ? 2 : len >= minStub ? 1 : 0;
          if (v) for (let k = start; k < y; k++) maskV[k * W + x] = v;
          start = -1;
        }
      }
    }

    // 5. measure the drawing's wall-band thickness: mode of the cross-axis
    // thickness of long-run bands. Derives the pair-fill gap from the drawing
    // itself instead of assuming one.
    const thickHist = new Int32Array(64);
    for (let x = 0; x < W; x++) {
      let run = 0;
      for (let y = 0; y <= H; y++) {
        const on = y < H && maskH[y * W + x] >= 2;
        if (on) run++;
        else if (run) {
          if (run >= 2 && run < 60) thickHist[run]++;
          run = 0;
        }
      }
    }
    let tWall = Math.max(3, Math.round(maxDim * 0.006));
    {
      let best = 0;
      for (let t = 2; t < 48; t++) {
        if (thickHist[t] * t > best) {
          best = thickHist[t] * t;
          tWall = t;
        }
      }
    }
    const gapMax = Math.max(8, Math.round(tWall * 1.6));

    if (dbg) {
      dbg.count("minRun", minRun);
      dbg.count("minStub", minStub);
      dbg.count("tWallPx", tWall);
      dbg.count("gapMax", gapMax);
      const runs = new Uint8Array(N);
      for (let i = 0; i < N; i++) runs[i] = Math.min(2, Math.max(maskH[i], maskV[i]));
      dbg.stage("runs", "4 · RUNS", runs, DBG.runs,
        "blue = long (>=" + minRun + "px), amber = stub · measured wall thickness " + tWall + "px");
    }

    // 6. walls = thick long-run bands + fills between PAIRS of long parallel
    // lines a wall-thickness apart. Both sides must be long: a dimension
    // line, furniture edge or leftover text stroke never has a long partner
    // at wall distance, so it can no longer inflate into wall mass.
    const wall = new Uint8Array(N);
    const prov = dbg ? new Uint8Array(N) : null; // 1 = band, 2 = pair fill
    for (let y = 1; y < H - 1; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (maskH[i] >= 2 && maskH[i - W] >= 2 && maskH[i + W] >= 2) {
          wall[i] = 1;
          if (prov) prov[i] = 1;
        }
      }
    }
    for (let y = 0; y < H; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if (maskV[i] >= 2 && maskV[i - 1] >= 2 && maskV[i + 1] >= 2) {
          wall[i] = 1;
          if (prov) prov[i] = 1;
        }
      }
    }
    for (let x = 0; x < W; x++) {
      let prev = -1;
      let prevV = 0;
      for (let y = 0; y < H; y++) {
        const v = maskH[y * W + x];
        if (!v) continue;
        if (prev >= 0 && y - prev >= 2 && y - prev <= gapMax && v === 3 && prevV === 3) {
          for (let k = prev; k <= y; k++) {
            const j = k * W + x;
            if (prov && !wall[j]) prov[j] = 2;
            wall[j] = 1;
          }
        }
        prev = y;
        prevV = v;
      }
    }
    for (let y = 0; y < H; y++) {
      let prev = -1;
      let prevV = 0;
      for (let x = 0; x < W; x++) {
        const v = maskV[y * W + x];
        if (!v) continue;
        if (prev >= 0 && x - prev >= 2 && x - prev <= gapMax && v === 3 && prevV === 3) {
          for (let k = prev; k <= x; k++) {
            const j = y * W + k;
            if (prov && !wall[j]) prov[j] = 2;
            wall[j] = 1;
          }
        }
        prev = x;
        prevV = v;
      }
    }
    {
      // a wall band is tWall thick. Bold room labels are ~2 wall thicknesses
      // tall and band-qualify once text is this large, so veto wall mass
      // whose cross-axis thickness exceeds 1.8 x tWall UNLESS a long
      // perpendicular run crosses it there (junctions are legitimately fat).
      const tMax = Math.round(tWall * 1.8);
      for (let x = 0; x < W; x++) {
        let start = -1;
        for (let y = 0; y <= H; y++) {
          const on = y < H && wall[y * W + x] !== 0;
          if (on && start < 0) start = y;
          if (!on && start >= 0) {
            if (y - start > tMax) {
              for (let k = start; k < y; k++) {
                const j = k * W + x;
                if (maskV[j] < 2) {
                  wall[j] = 0;
                  if (prov) prov[j] = 0;
                }
              }
            }
            start = -1;
          }
        }
      }
      for (let y = 0; y < H; y++) {
        let start = -1;
        for (let x = 0; x <= W; x++) {
          const on = x < W && wall[y * W + x] !== 0;
          if (on && start < 0) start = x;
          if (!on && start >= 0) {
            if (x - start > tMax) {
              for (let k = start; k < x; k++) {
                const j = y * W + k;
                if (maskH[j] < 2) {
                  wall[j] = 0;
                  if (prov) prov[j] = 0;
                }
              }
            }
            start = -1;
          }
        }
      }
    }

    if (dbg && prov) {
      let band = 0;
      let fill = 0;
      for (let i = 0; i < N; i++) {
        if (prov[i] === 1) band++;
        else if (prov[i] === 2) fill++;
      }
      dbg.count("wallPxFromBand", band);
      dbg.count("wallPxFromPairFill", fill);
      dbg.stage("wall", "5 · RAW WALL MASK", prov, DBG.wall, "blue = long-run band, red = pair fill");
    }

    // 7. grid downsample + filters
    const cell = Math.max(3, Math.round(W / 300));
    const gw = Math.floor(W / cell);
    const gh = Math.floor(H / cell);
    const grid = new Uint8Array(gw * gh);
    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        let sum = 0;
        for (let dy = 0; dy < cell; dy++) for (let dx = 0; dx < cell; dx++) sum += wall[(gy * cell + dy) * W + gx * cell + dx];
        if (sum >= cell * cell * 0.4) grid[gy * gw + gx] = 1;
      }
    }
    // classify exterior walls: flood the EMPTY region from the grid border;
    // a wall box whose side neighbours that region faces the outside
    // seal door/window openings first (dilate walls ~3 cells) so the outside
    // flood cannot leak into the rooms through them
    const sealed = new Uint8Array(grid);
    for (let t = 0; t < 3; t++) {
      const src = new Uint8Array(sealed);
      for (let gy = 0; gy < gh; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          const i = gy * gw + gx;
          if (
            src[i] ||
            (gx > 0 && src[i - 1]) ||
            (gx < gw - 1 && src[i + 1]) ||
            (gy > 0 && src[i - gw]) ||
            (gy < gh - 1 && src[i + gw])
          )
            sealed[i] = 1;
        }
      }
    }
    const outside = new Uint8Array(gw * gh);
    {
      const st: number[] = [];
      const push = (gx: number, gy: number) => {
        const i = gy * gw + gx;
        if (gx >= 0 && gx < gw && gy >= 0 && gy < gh && !sealed[i] && !outside[i]) {
          outside[i] = 1;
          st.push(i);
        }
      };
      for (let gx = 0; gx < gw; gx++) {
        push(gx, 0);
        push(gx, gh - 1);
      }
      for (let gy = 0; gy < gh; gy++) {
        push(0, gy);
        push(gw - 1, gy);
      }
      while (st.length) {
        const i = st.pop()!;
        const gx = i % gw;
        const gy = (i - gx) / gw;
        push(gx + 1, gy);
        push(gx - 1, gy);
        push(gx, gy + 1);
        push(gx, gy - 1);
      }
    }
    const isOut = (gx: number, gy: number) =>
      gx < 0 || gx >= gw || gy < 0 || gy >= gh || outside[gy * gw + gx] === 1;


    dbg?.gridStage("gridRaw", "6 · RAW COMPONENTS", grid, gw, gh, DBG.ink, "before any component filtering");
    {
      const { lbl, comps } = label(grid, gw, gh);
      const drop = new Set<number>();
      const why = dbg ? new Map<number, number>() : null;
      comps.forEach((cc, id) => {
        const bw = cc.x1 - cc.x0 + 1;
        const bh = cc.y1 - cc.y0 + 1;
        const fill = cc.area / (bw * bh);
        if (cc.area < 12) {
          drop.add(id); // specks
          why?.set(id, 2);
          return;
        }
        if (fill > 0.8 && bw > 8 && bh > 8) {
          drop.add(id); // solid blobs — real wall clusters never fill their box
          why?.set(id, 3);
          return;
        }
      });
      if (dbg && why) {
        const verdict = new Uint8Array(gw * gh);
        for (let i = 0; i < gw * gh; i++) {
          if (!grid[i]) continue;
          verdict[i] = drop.has(lbl[i]) ? why.get(lbl[i]) ?? 2 : 1;
        }
        let speck = 0, blob = 0, outside = 0;
        why.forEach((v) => {
          if (v === 2) speck++;
          else if (v === 3) blob++;
          else outside++;
        });
        dbg.count("components", comps.length);
        dbg.count("rejectedSpeck", speck);
        dbg.count("rejectedBlob", blob);
        dbg.count("rejectedIsolated", outside);
        dbg.gridStage("verdict", "7 · ACCEPTED vs REJECTED", verdict, gw, gh, DBG.verdict,
          "navy = accepted, pink = speck, amber = solid blob, violet = floating outside the building");
      }
      if (drop.size) for (let i = 0; i < gw * gh; i++) if (grid[i] && drop.has(lbl[i])) grid[i] = 0;
    }

    // content bbox
    let x0 = gw, x1 = 0, y0 = gh, y1 = 0;
    let filled = 0;
    for (let gy = 0; gy < gh; gy++)
      for (let gx = 0; gx < gw; gx++)
        if (grid[gy * gw + gx]) {
          filled++;
          if (gx < x0) x0 = gx;
          if (gx > x1) x1 = gx;
          if (gy < y0) y0 = gy;
          if (gy > y1) y1 = gy;
        }
    const empty = { ok: false, boxes: [], floorW: 0, floorD: 0, crop: { ox: 0, oy: 0, rw: 1, rh: 1 } };
    if (filled < 60) return empty;
    const bw = x1 - x0 + 1;
    const bh = y1 - y0 + 1;
    if (bw < 8 || bh < 8) return empty;

    // 8. horizontal runs → tolerant vertical merge → boxes. A run continues
    // the box above it when the two overlap by 80% and neither edge drifts
    // more than 2 cells, so a straight wall becomes ONE box even when its
    // rasterised edges wobble by a pixel between rows.
    type Run = { x: number; y: number; w: number; h: number };
    const runs: Run[] = [];
    for (let gy = y0; gy <= y1; gy++) {
      let start = -1;
      for (let gx = x0; gx <= x1 + 1; gx++) {
        const on = gx <= x1 && grid[gy * gw + gx];
        if (on && start < 0) start = gx;
        if (!on && start >= 0) {
          runs.push({ x: start, y: gy, w: gx - start, h: 1 });
          start = -1;
        }
      }
    }
    const merged: Run[] = [];
    let open: Run[] = [];
    let current: Run[] = [];
    let prevRow = -2;
    const matches = (a: Run, r: Run): boolean => {
      const a1 = a.x + a.w;
      const r1 = r.x + r.w;
      const ov = Math.min(a1, r1) - Math.max(a.x, r.x);
      if (ov <= 0) return false;
      if (ov < 0.8 * Math.min(a.w, r.w)) return false;
      return Math.abs(a.x - r.x) <= 2 && Math.abs(a1 - r1) <= 2;
    };
    for (const r of runs) {
      if (r.y !== prevRow) {
        open = r.y === prevRow + 1 ? current : [];
        current = [];
        prevRow = r.y;
      }
      let hit: Run | null = null;
      for (const a of open) {
        if (a.y + a.h === r.y && matches(a, r)) {
          hit = a;
          break;
        }
      }
      if (hit) {
        const right = Math.max(hit.x + hit.w, r.x + r.w);
        hit.x = Math.min(hit.x, r.x);
        hit.w = right - hit.x;
        hit.h += 1;
        current.push(hit);
      } else {
        merged.push(r);
        current.push(r);
      }
    }

    // enclosed footprint: close joinery-width gaps (doors/windows, ~1.2 m)
    // so the outside flood cannot leak into rooms, then count every cell the
    // flood cannot reach. Garage-door-sized openings stay open — a footprint
    // derived this way slightly undercounts on plans with attached garages,
    // which is accepted until openings are modelled explicitly.
    let footprintCells = 0;
    {
      const D = Math.max(6, Math.round((tWall * 7) / cell / 2));
      let a = new Uint8Array(grid);
      for (let t = 0; t < D; t++) {
        const src = new Uint8Array(a);
        for (let gy = 0; gy < gh; gy++) {
          for (let gx = 0; gx < gw; gx++) {
            const i = gy * gw + gx;
            if (
              src[i] ||
              (gx > 0 && src[i - 1]) ||
              (gx < gw - 1 && src[i + 1]) ||
              (gy > 0 && src[i - gw]) ||
              (gy < gh - 1 && src[i + gw])
            )
              a[i] = 1;
          }
        }
      }
      const closed = erode(a, gw, gh, D);
      const out2 = new Uint8Array(gw * gh);
      const st: number[] = [];
      const push2 = (gx: number, gy: number) => {
        const i = gy * gw + gx;
        if (gx >= 0 && gx < gw && gy >= 0 && gy < gh && !closed[i] && !out2[i]) {
          out2[i] = 1;
          st.push(i);
        }
      };
      for (let gx = 0; gx < gw; gx++) {
        push2(gx, 0);
        push2(gx, gh - 1);
      }
      for (let gy = 0; gy < gh; gy++) {
        push2(0, gy);
        push2(gw - 1, gy);
      }
      while (st.length) {
        const i = st.pop()!;
        const gx = i % gw;
        const gy = (i - gx) / gw;
        push2(gx + 1, gy);
        push2(gx - 1, gy);
        push2(gx, gy + 1);
        push2(gx, gy - 1);
      }
      for (let i = 0; i < gw * gh; i++) if (!out2[i]) footprintCells++;
      dbg?.count("footprintCells", footprintCells);
    }

    const unit = WORLD_MAX / Math.max(bw, bh);
    const floorW = bw * unit;
    const floorD = bh * unit;
    const boxes: WallBox[] = merged.map((r) => {
      const box: WallBox = {
        x: (r.x - x0 + r.w / 2) * unit - floorW / 2,
        z: (r.y - y0 + r.h / 2) * unit - floorD / 2,
        w: r.w * unit,
        d: r.h * unit,
      };
      // count outside cells hugging each side
      let up = 0, down = 0, left = 0, right = 0;
      for (let gx = r.x; gx < r.x + r.w; gx++) {
        if (isOut(gx, r.y - 1)) up++;
        if (isOut(gx, r.y + r.h)) down++;
      }
      for (let gy = r.y; gy < r.y + r.h; gy++) {
        if (isOut(r.x - 1, gy)) left++;
        if (isOut(r.x + r.w, gy)) right++;
      }
      const uf = up / r.w, df = down / r.w, lf = left / r.h, rf = right / r.h;
      const best = Math.max(uf, df, lf, rf);
      if (best >= 0.4) {
        box.ext = 1;
        if (best === uf) { box.nx = 0; box.nz = -1; }
        else if (best === df) { box.nx = 0; box.nz = 1; }
        else if (best === lf) { box.nx = -1; box.nz = 0; }
        else { box.nx = 1; box.nz = 0; }
      }
      return box;
    });

    const crop = {
      ox: (x0 * cell) / W,
      oy: (y0 * cell) / H,
      rw: (bw * cell) / W,
      rh: (bh * cell) / H,
    };

    if (dbg) {
      const finalGrid = new Uint8Array(gw * gh);
      for (const r of merged)
        for (let gy = r.y; gy < r.y + r.h; gy++)
          for (let gx = r.x; gx < r.x + r.w; gx++) finalGrid[gy * gw + gx] = 1;
      dbg.count("boxes", boxes.length);
      dbg.count("boxesOneCellTall", merged.filter((r) => r.h === 1).length);
      dbg.gridStage("final", "8 · FINAL WALL BOXES", finalGrid, gw, gh,
        { 1: [25, 35, 60, 255] } as Palette, boxes.length + " boxes sent to Three.js");
      const cts = dbg.data.counts;
      console.info(
        "[elixa] layout debug:",
        "ink=" + cts.inkPx,
        "tWall=" + cts.tWallPx + "px",
        "rejectedComps{small:" + cts.rejectedSmallComps + "}",
        "wallFromBand=" + cts.wallPxFromBand,
        "wallFromPairFill=" + cts.wallPxFromPairFill,
        "components=" + cts.components,
        "boxes=" + cts.boxes,
      );
    }
    console.info("[elixa] layout extracted:", boxes.length, "wall boxes");
    return {
      ok: boxes.length >= 8 && boxes.length <= 8000,
      boxes,
      floorW,
      floorD,
      crop,
      metrics: {
        footprintPx2: footprintCells * cell * cell,
        worldPerPx: unit / cell,
        wallPx: tWall,
        grid: packGrid(grid, gw, gh, cell, x0, y0),
      },
      ...(dbg ? { debug: dbg.data } : {}),
    };
  } catch (e) {
    console.warn("[elixa] layout extraction failed", e);
    return null;
  }
}
