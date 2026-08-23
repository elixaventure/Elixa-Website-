/**
 * Extracts the wall layout from a rasterised floor plan so it can be extruded
 * into real 3D walls — perimeter and internal walls in the drawing's exact
 * positions. Pure client-side image processing, no AI service. Tuned and
 * verified against both major drawing styles:
 *   - CAD sheets (hairline boundaries + hatched wall bands, dimension chains)
 *   - estate-agent plans (solid black wall bands, grey room fills)
 *
 * Pipeline:
 *   1. ink = dark pixels, minus the INTERIOR of flat dark regions (grey room
 *      fills are detected on a blurred copy where hairlines vanish)
 *   2. remove frame-shaped components (sheet borders, phone-UI bars)
 *   3. trace LONG straight horizontal/vertical runs — walls are the only long
 *      solid lines (grids are dashed, hatching diagonal, text short)
 *   4. walls = thick bands of long runs (solid-wall plans) + fills between
 *      parallel line pairs where at least one side is long (twin boundary
 *      lines; a long facade line pairs with short piers between windows —
 *      isolated dimension lines never pair)
 *   5. grid downsample → speck/blob filters → keep components intersecting
 *      the union of all large wall clusters (kills headings/annotations
 *      without dropping the wings of L-shaped homes)
 *   6. merge cells into boxes, scale to world units with texture-crop
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

    // 1. ink mask minus interiors of flat dark regions (grey room fills)
    const lum = new Int16Array(W * H);
    const mask = new Uint8Array(W * H);
    for (let i = 0, p = 0; i < W * H; i++, p += 4) {
      const l = 0.299 * img[p] + 0.587 * img[p + 1] + 0.114 * img[p + 2];
      lum[i] = l;
      mask[i] = l < 155 ? 1 : 0;
    }
    {
      const blur = boxBlur(lum, W, H);
      const flat = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) flat[i] = blur[i] < 140 ? 1 : 0;
      const flatInt = erode(flat, W, H, 4);
      for (let i = 0; i < W * H; i++) if (flatInt[i]) mask[i] = 0;
    }
    if (dbg) {
      let ink = 0;
      for (let i = 0; i < W * H; i++) ink += mask[i];
      dbg.count("inkPx", ink);
      dbg.stage("ink", "1 · INK MASK", mask, DBG.ink, "luminance < 155, minus eroded flat fills");
      // observation only: how much of that ink is coloured design markup
      const col = new Uint8Array(W * H);
      let red = 0, blue = 0, green = 0, colInk = 0;
      for (let i = 0, q = 0; i < W * H; i++, q += 4) {
        const r = img[q], g = img[q + 1], b = img[q + 2];
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        if (sat <= 55) continue;
        let v = 0;
        if (r > g + 40 && r > b + 40) { v = 1; red++; }
        else if (b > r + 35 && b > g + 20) { v = 2; blue++; }
        else if (g > r + 30 && g > b + 30) { v = 3; green++; }
        if (v) { col[i] = v; if (mask[i]) colInk++; }
      }
      dbg.count("markupRedPx", red);
      dbg.count("markupBluePx", blue);
      dbg.count("markupGreenPx", green);
      dbg.count("markupCountedAsInkPx", colInk);
      dbg.stage("markup", "2 · DESIGN MARKUP", col, DBG.colour, "red = flow, blue = return, green = connection");
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
      if (drop.size) for (let i = 0; i < W * H; i++) if (mask[i] && drop.has(lbl[i])) mask[i] = 0;
    }

    // 3. long-run tracing (2 = long, 1 = short stub such as a window pier)
    const maxDim = Math.max(W, H);
    const minRun = Math.round(maxDim * 0.022);
    const minStub = Math.max(6, Math.round(maxDim * 0.006));
    const gapMax = Math.round(maxDim * 0.02) + 6;

    const maskH = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      let start = -1;
      for (let x = 0; x <= W; x++) {
        const on = x < W && mask[y * W + x];
        if (on && start < 0) start = x;
        if (!on && start >= 0) {
          const len = x - start;
          const v = len >= minRun ? 2 : len >= minStub ? 1 : 0;
          if (v) for (let k = start; k < x; k++) maskH[y * W + k] = v;
          start = -1;
        }
      }
    }
    const maskV = new Uint8Array(W * H);
    for (let x = 0; x < W; x++) {
      let start = -1;
      for (let y = 0; y <= H; y++) {
        const on = y < H && mask[y * W + x];
        if (on && start < 0) start = y;
        if (!on && start >= 0) {
          const len = y - start;
          const v = len >= minRun ? 2 : len >= minStub ? 1 : 0;
          if (v) for (let k = start; k < y; k++) maskV[k * W + x] = v;
          start = -1;
        }
      }
    }

    if (dbg) {
      dbg.count("minRun", minRun);
      dbg.count("minStub", minStub);
      dbg.count("gapMax", gapMax);
      const runs = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) runs[i] = Math.max(maskH[i], maskV[i]);
      dbg.stage("runs", "3 · RUNS", runs, DBG.runs, "blue = long (>=" + minRun + "px), amber = stub");
    }

    // 4. walls = thick long-run bands + parallel-pair fills
    const wall = new Uint8Array(W * H);
    const prov = dbg ? new Uint8Array(W * H) : null; // 1 = band, 2 = pair fill
    for (let y = 1; y < H - 1; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (maskH[i] === 2 && maskH[i - W] === 2 && maskH[i + W] === 2) {
          wall[i] = 1;
          if (prov) prov[i] = 1;
        }
      }
    }
    for (let y = 0; y < H; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if (maskV[i] === 2 && maskV[i - 1] === 2 && maskV[i + 1] === 2) {
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
        if (prev >= 0 && y - prev >= 2 && y - prev <= gapMax && (v === 2 || prevV === 2)) {
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
        if (prev >= 0 && x - prev >= 2 && x - prev <= gapMax && (v === 2 || prevV === 2)) {
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

    if (dbg && prov) {
      let band = 0, fill = 0;
      for (let i = 0; i < W * H; i++) {
        if (prov[i] === 1) band++;
        else if (prov[i] === 2) fill++;
      }
      dbg.count("wallPxFromBand", band);
      dbg.count("wallPxFromPairFill", fill);
      dbg.stage("wall", "4 · RAW WALL MASK", prov, DBG.wall, "blue = long-run band, red = parallel-pair fill");
    }

    // 5. grid downsample + filters
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
    dbg?.gridStage("gridRaw", "5 · RAW COMPONENTS", grid, gw, gh, DBG.ink, "before any component filtering");
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
        } else if (fill > 0.55 && bw > 8 && bh > 8) {
          drop.add(id); // solid blobs
          why?.set(id, 3);
        }
      });
      // keep only structure intersecting the union of LARGE wall clusters
      const seeds = comps.map((cc, id) => ({ cc, id })).filter(({ cc, id }) => !drop.has(id) && cc.area >= 150);
      if (seeds.length) {
        let x0 = gw, x1 = 0, y0 = gh, y1 = 0;
        for (const { cc } of seeds) {
          if (cc.x0 < x0) x0 = cc.x0;
          if (cc.x1 > x1) x1 = cc.x1;
          if (cc.y0 < y0) y0 = cc.y0;
          if (cc.y1 > y1) y1 = cc.y1;
        }
        const mx = (x1 - x0) * 0.15;
        const my = (y1 - y0) * 0.15;
        comps.forEach((cc, id) => {
          if (drop.has(id) || cc.area >= 150) return;
          if (cc.x1 < x0 - mx || cc.x0 > x1 + mx || cc.y1 < y0 - my || cc.y0 > y1 + my) {
            drop.add(id);
            why?.set(id, 4);
          }
        });
      }
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
        dbg.gridStage("verdict", "6 · ACCEPTED vs REJECTED", verdict, gw, gh, DBG.verdict,
          "navy = accepted, pink = speck, amber = solid blob, violet = isolated");
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

    // 6. horizontal runs → vertical merge → boxes
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
    const open = new Map<string, Run>();
    let prevRow = -2;
    let current = new Map<string, Run>();
    for (const r of runs) {
      if (r.y !== prevRow) {
        open.clear();
        current.forEach((v, k) => open.set(k, v));
        current = new Map();
        prevRow = r.y;
      }
      const key = `${r.x}:${r.w}`;
      const above = open.get(key);
      if (above && above.y + above.h === r.y) {
        above.h += 1;
        current.set(key, above);
      } else {
        merged.push(r);
        current.set(key, r);
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
      dbg.gridStage("final", "7 · FINAL WALL BOXES", finalGrid, gw, gh,
        { 1: [25, 35, 60, 255] } as Palette, boxes.length + " boxes sent to Three.js");
      const c = dbg.data.counts;
      console.info(
        "[elixa] layout debug:",
        "ink=" + c.inkPx,
        "markupAsInk=" + c.markupCountedAsInkPx,
        "wallFromBand=" + c.wallPxFromBand,
        "wallFromPairFill=" + c.wallPxFromPairFill,
        "components=" + c.components,
        "rejected{speck:" + c.rejectedSpeck + ",blob:" + c.rejectedBlob + ",isolated:" + c.rejectedIsolated + "}",
        "boxes=" + c.boxes,
      );
    }
    console.info("[elixa] layout extracted:", boxes.length, "wall boxes");
    return {
      ok: boxes.length >= 8 && boxes.length <= 8000,
      boxes,
      floorW,
      floorD,
      crop,
      ...(dbg ? { debug: dbg.data } : {}),
    };
  } catch (e) {
    console.warn("[elixa] layout extraction failed", e);
    return null;
  }
}
