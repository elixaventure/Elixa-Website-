/**
 * Extracts the wall layout from a rasterised floor plan so it can be extruded
 * into real 3D walls — perimeter and internal walls in the drawing's exact
 * positions. Pure client-side image processing, no AI service:
 *
 *   1. threshold the plan to ink/no-ink
 *   2. flood away anything touching the sheet edge (drawing frame, title block)
 *   3. trace LONG straight horizontal/vertical ink lines (walls are the only
 *      long solid lines — structural grids are dashed, hatching is diagonal,
 *      text is short) and fill between PARALLEL LINE PAIRS a wall's thickness
 *      apart (walls are always drawn as twin boundary lines; dimension lines
 *      are single, so they are rejected)
 *   4. downsample to a grid and merge filled cells into wall boxes
 *
 * Output boxes are in world units, centred, ready to extrude. Includes the
 * texture crop so the plan image can be draped as the floor beneath the walls.
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

const TARGET_W = 1500; // processing resolution (preview is <=1400, so usually 1:1)
const WORLD_MAX = 9; // longest side of the extruded layout, world units

function pass(src: Uint8Array, dst: Uint8Array, W: number, H: number, horizontal: boolean, erode: boolean) {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let v = src[i];
      if (horizontal) {
        const a = x > 0 ? src[i - 1] : erode ? 0 : 0;
        const b = x < W - 1 ? src[i + 1] : erode ? 0 : 0;
        v = erode ? (src[i] && a && b ? 1 : 0) : src[i] || a || b ? 1 : 0;
      } else {
        const a = y > 0 ? src[i - W] : erode ? 0 : 0;
        const b = y < H - 1 ? src[i + W] : erode ? 0 : 0;
        v = erode ? (src[i] && a && b ? 1 : 0) : src[i] || a || b ? 1 : 0;
      }
      dst[i] = v;
    }
  }
}

function morph(mask: Uint8Array, W: number, H: number, op: "erode" | "dilate", times: number): Uint8Array {
  const erode = op === "erode";
  let a = mask;
  let b = new Uint8Array(W * H);
  const tmp = new Uint8Array(W * H);
  for (let t = 0; t < times; t++) {
    pass(a, tmp, W, H, true, erode);
    pass(tmp, b, W, H, false, erode);
    const s = a;
    a = b;
    b = s; // previous buffer becomes scratch for the next round
  }
  return a;
}

export async function extractLayout(preview: Blob): Promise<PlanLayout | null> {
  try {
    const bmp = await createImageBitmap(preview);
    const scale = Math.min(1, TARGET_W / bmp.width);
    const W = Math.max(64, Math.round(bmp.width * scale));
    const H = Math.max(64, Math.round(bmp.height * scale));
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(bmp, 0, 0, W, H);
    bmp.close();
    const img = ctx.getImageData(0, 0, W, H).data;

    // 1. ink mask
    let mask = new Uint8Array(W * H);
    for (let i = 0, p = 0; i < W * H; i++, p += 4) {
      const l = 0.299 * img[p] + 0.587 * img[p + 1] + 0.114 * img[p + 2];
      mask[i] = l < 150 ? 1 : 0;
    }

    // 2. flood away the sheet frame / title block (anything touching the edge band)
    const band = Math.max(2, Math.round(Math.min(W, H) * 0.04));
    const stack: number[] = [];
    const seen = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (x < band || x >= W - band || y < band || y >= H - band) {
          const i = y * W + x;
          if (mask[i] && !seen[i]) {
            seen[i] = 1;
            stack.push(i);
          }
        }
      }
    }
    while (stack.length) {
      const i = stack.pop()!;
      mask[i] = 0;
      const x = i % W;
      const y = (i - x) / W;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && xx < W && yy >= 0 && yy < H) {
          const j = yy * W + xx;
          if (mask[j] && !seen[j]) {
            seen[j] = 1;
            stack.push(j);
          }
        }
      }
    }

    // 3. trace long straight lines, then fill between parallel pairs
    const minRun = Math.round(Math.max(W, H) * 0.022); // ~0.6 m of wall at 1:50
    const gapMax = Math.round(Math.max(W, H) * 0.02) + 6; // max wall thickness px
    const minStub = 9; // short ink runs (wall piers between windows) may pair with a long line

    // 1 = short stub (wall piers between window/door openings), 2 = long line
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

    // pair-fill: solid wall bands between twin boundary lines. At least one
    // side of a pair must be a LONG line — so isolated dimension lines and
    // free-floating text never pair, but a long façade line pairs with the
    // short wall piers between its windows.
    const wall = new Uint8Array(W * H);
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
    mask = wall;

    // 4. grid downsample
    const cell = Math.max(3, Math.round(W / 300));
    const gw = Math.floor(W / cell);
    const gh = Math.floor(H / cell);
    const grid = new Uint8Array(gw * gh);
    let filled = 0;
    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        let sum = 0;
        for (let dy = 0; dy < cell; dy++) for (let dx = 0; dx < cell; dx++) sum += mask[(gy * cell + dy) * W + gx * cell + dx];
        if (sum >= cell * cell * 0.4) {
          grid[gy * gw + gx] = 1;
          filled++;
        }
      }
    }
    // 4b. component filter: keep thin connected structures (walls), drop
    //     solid blobs (photos, logos) and specks (text residue)
    {
      const comp = new Int32Array(gw * gh).fill(-1);
      let nComp = 0;
      const areas: number[] = [];
      const bx0: number[] = [], bx1: number[] = [], by0: number[] = [], by1: number[] = [];
      const q: number[] = [];
      for (let i = 0; i < gw * gh; i++) {
        if (!grid[i] || comp[i] >= 0) continue;
        const id = nComp++;
        areas.push(0); bx0.push(gw); bx1.push(0); by0.push(gh); by1.push(0);
        comp[i] = id; q.push(i);
        while (q.length) {
          const j = q.pop()!;
          const x = j % gw, y = (j - x) / gw;
          areas[id]++;
          if (x < bx0[id]) bx0[id] = x; if (x > bx1[id]) bx1[id] = x;
          if (y < by0[id]) by0[id] = y; if (y > by1[id]) by1[id] = y;
          for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const) {
            const xx = x + dx, yy = y + dy;
            if (xx >= 0 && xx < gw && yy >= 0 && yy < gh) {
              const k = yy * gw + xx;
              if (grid[k] && comp[k] < 0) { comp[k] = id; q.push(k); }
            }
          }
        }
      }
      const drop = new Set<number>();
      for (let id = 0; id < nComp; id++) {
        const bw = bx1[id] - bx0[id] + 1, bh = by1[id] - by0[id] + 1;
        const fill = areas[id] / (bw * bh);
        if (areas[id] < 12) drop.add(id); // specks
        else if (fill > 0.55 && bw > 8 && bh > 8) drop.add(id); // solid blobs
      }
      filled = 0;
      for (let i = 0; i < gw * gh; i++) {
        if (grid[i] && drop.has(comp[i])) grid[i] = 0;
        if (grid[i]) filled++;
      }
    }

    const ratio = filled / (gw * gh);
    if (ratio < 0.004 || ratio > 0.3) return { ok: false, boxes: [], floorW: 0, floorD: 0, crop: { ox: 0, oy: 0, rw: 1, rh: 1 } };

    // content bbox
    let x0 = gw, x1 = 0, y0 = gh, y1 = 0;
    for (let gy = 0; gy < gh; gy++)
      for (let gx = 0; gx < gw; gx++)
        if (grid[gy * gw + gx]) {
          if (gx < x0) x0 = gx;
          if (gx > x1) x1 = gx;
          if (gy < y0) y0 = gy;
          if (gy > y1) y1 = gy;
        }
    const bw = x1 - x0 + 1;
    const bh = y1 - y0 + 1;
    if (bw < 8 || bh < 8) return { ok: false, boxes: [], floorW: 0, floorD: 0, crop: { ox: 0, oy: 0, rw: 1, rh: 1 } };

    // horizontal runs → vertical merge
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

    // scale to world units
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
    return { ok: boxes.length >= 8 && boxes.length <= 6000, boxes, floorW, floorD, crop };
  } catch (e) {
    console.warn("[elixa] layout extraction failed", e);
    return null;
  }
}
