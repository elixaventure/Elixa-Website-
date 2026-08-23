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

export interface PlanLayout {
  ok: boolean;
  /** wall footprints in world units, centred on origin (x/z = centre) */
  boxes: { x: number; z: number; w: number; d: number }[];
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

export async function extractLayout(preview: Blob): Promise<PlanLayout | null> {
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

    // 4. walls = thick long-run bands + parallel-pair fills
    const wall = new Uint8Array(W * H);
    for (let y = 1; y < H - 1; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (maskH[i] === 2 && maskH[i - W] === 2 && maskH[i + W] === 2) wall[i] = 1;
      }
    }
    for (let y = 0; y < H; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if (maskV[i] === 2 && maskV[i - 1] === 2 && maskV[i + 1] === 2) wall[i] = 1;
      }
    }
    for (let x = 0; x < W; x++) {
      let prev = -1;
      let prevV = 0;
      for (let y = 0; y < H; y++) {
        const v = maskH[y * W + x];
        if (!v) continue;
        if (prev >= 0 && y - prev >= 2 && y - prev <= gapMax && (v === 2 || prevV === 2)) {
          for (let k = prev; k <= y; k++) wall[k * W + x] = 1;
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
          for (let k = prev; k <= x; k++) wall[y * W + k] = 1;
        }
        prev = x;
        prevV = v;
      }
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
    {
      const { lbl, comps } = label(grid, gw, gh);
      const drop = new Set<number>();
      comps.forEach((cc, id) => {
        const bw = cc.x1 - cc.x0 + 1;
        const bh = cc.y1 - cc.y0 + 1;
        const fill = cc.area / (bw * bh);
        if (cc.area < 12) drop.add(id); // specks
        else if (fill > 0.55 && bw > 8 && bh > 8) drop.add(id); // solid blobs
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
          if (cc.x1 < x0 - mx || cc.x0 > x1 + mx || cc.y1 < y0 - my || cc.y0 > y1 + my) drop.add(id);
        });
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

    const unit = WORLD_MAX / Math.max(bw, bh);
    const floorW = bw * unit;
    const floorD = bh * unit;
    const boxes = merged.map((r) => ({
      x: (r.x - x0 + r.w / 2) * unit - floorW / 2,
      z: (r.y - y0 + r.h / 2) * unit - floorD / 2,
      w: r.w * unit,
      d: r.h * unit,
    }));

    const crop = {
      ox: (x0 * cell) / W,
      oy: (y0 * cell) / H,
      rw: (bw * cell) / W,
      rh: (bh * cell) / H,
    };

    console.info("[elixa] layout extracted:", boxes.length, "wall boxes");
    return { ok: boxes.length >= 8 && boxes.length <= 8000, boxes, floorW, floorD, crop };
  } catch (e) {
    console.warn("[elixa] layout extraction failed", e);
    return null;
  }
}
