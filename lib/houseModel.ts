/**
 * Real-world house parameters for the exact-layout 3D model.
 *
 * The extractor normalises the plan to world units (longest side = 9), which
 * says nothing about metres. Scale enters through the floor area: read from
 * the plan's own text when it is a vector PDF, or typed by the customer (it
 * is printed on almost every plan). From footprint px² + area m² we get
 * px/metre, and every joinery height becomes a real dimension.
 *
 * All heights are DEFAULTS on the house spec, not constants in the renderer:
 * a survey or a better plan can override them per property.
 */

import type { PlanLayout } from "./planLayout";

export interface HouseSpec {
  /** floor-to-ceiling, metres */
  ceilingHeight: number;
  internalDoorHeight: number;
  externalDoorHeight: number;
  windowSillHeight: number;
  windowHeadHeight: number;
}

/** UK residential defaults — replaceable per property, never hard-coded downstream */
export const DEFAULT_HOUSE_SPEC: HouseSpec = {
  ceilingHeight: 2.4,
  internalDoorHeight: 2.0,
  externalDoorHeight: 2.1,
  windowSillHeight: 0.9,
  windowHeadHeight: 2.1,
};

export interface PlanScale {
  /** the floor area the scale was derived from, m² */
  areaM2: number;
  /** source-image pixels per metre */
  pxPerMetre: number;
  /** Three.js world units per metre */
  worldPerMetre: number;
}

/**
 * Derive real-world scale for an extracted layout from its enclosed footprint
 * and a known floor area. Returns null when the layout carries no footprint
 * metrics (extraction predates them) or the inputs are implausible.
 */
export function deriveScale(layout: PlanLayout, areaM2: number): PlanScale | null {
  const m = layout.metrics;
  if (!m || !isFinite(areaM2) || areaM2 < 20 || areaM2 > 2000) return null;
  let footprintPx2 = m.footprintPx2 || 0;

  // Preferred: re-measure the footprint with openings sealed. The wall grid
  // has real gaps at every door, window and patio door, so a naive outside
  // flood leaks into the rooms. Bootstrap: estimate px/m from the wall bbox
  // (an L-shaped or rectangular house fills ~85% of its bbox), size a
  // directional 1D closing from that estimate (2.6 m — wider than any
  // window or patio door, narrower than any room), seal, flood, count.
  const g = m.grid;
  if (g) {
    const { w, h, cellPx } = g;
    const grid = unpackGrid(g.bits, w * h);
    // content bbox of the wall cells
    let x0 = w, x1 = 0, y0 = h, y1 = 0, any = false;
    for (let gy = 0; gy < h; gy++)
      for (let gx = 0; gx < w; gx++)
        if (grid[gy * w + gx]) {
          any = true;
          if (gx < x0) x0 = gx;
          if (gx > x1) x1 = gx;
          if (gy < y0) y0 = gy;
          if (gy > y1) y1 = gy;
        }
    if (any) {
      const bboxPx2 = (x1 - x0 + 1) * (y1 - y0 + 1) * cellPx * cellPx;
      const ppm0 = Math.sqrt((bboxPx2 * 0.85) / areaM2);
      const K = Math.max(4, Math.round((2.6 * ppm0) / cellPx));
      const sealed = new Uint8Array(grid);
      for (let gy = y0; gy <= y1; gy++) {
        let last = -1e9;
        for (let gx = x0; gx <= x1; gx++) {
          if (!grid[gy * w + gx]) continue;
          if (gx - last > 1 && gx - last <= K + 1)
            for (let k = last + 1; k < gx; k++) sealed[gy * w + k] = 1;
          last = gx;
        }
      }
      for (let gx = x0; gx <= x1; gx++) {
        let last = -1e9;
        for (let gy = y0; gy <= y1; gy++) {
          if (!grid[gy * w + gx]) continue;
          if (gy - last > 1 && gy - last <= K + 1)
            for (let k = last + 1; k < gy; k++) sealed[k * w + gx] = 1;
          last = gy;
        }
      }
      // outside flood over the sealed grid, bbox-bounded
      const bw = x1 - x0 + 1;
      const bh = y1 - y0 + 1;
      const outside = new Uint8Array(bw * bh);
      const st: number[] = [];
      const push = (bx: number, by: number) => {
        if (bx < 0 || bx >= bw || by < 0 || by >= bh) return;
        const i = by * bw + bx;
        if (outside[i] || sealed[(by + y0) * w + (bx + x0)]) return;
        outside[i] = 1;
        st.push(i);
      };
      for (let bx = 0; bx < bw; bx++) {
        push(bx, 0);
        push(bx, bh - 1);
      }
      for (let by = 0; by < bh; by++) {
        push(0, by);
        push(bw - 1, by);
      }
      while (st.length) {
        const i = st.pop()!;
        const bx = i % bw;
        const by = (i - bx) / bw;
        push(bx + 1, by);
        push(bx - 1, by);
        push(bx, by + 1);
        push(bx, by - 1);
      }
      let cells = 0;
      for (let i = 0; i < bw * bh; i++) if (!outside[i]) cells++;
      const sealedPx2 = cells * cellPx * cellPx;
      // trust the sealed measurement when it lands near the bbox estimate;
      // a wild ratio means the seal failed (huge opening, exotic plan)
      const ratio = sealedPx2 / (bboxPx2 * 0.85);
      if (ratio > 0.55 && ratio < 1.35) footprintPx2 = sealedPx2;
      else footprintPx2 = bboxPx2 * 0.85;
    }
  }

  if (!footprintPx2) return null;
  const pxPerMetre = Math.sqrt(footprintPx2 / areaM2);
  if (!isFinite(pxPerMetre) || pxPerMetre < 4) return null;
  return {
    areaM2,
    pxPerMetre,
    worldPerMetre: m.worldPerPx * pxPerMetre,
  };
}

function unpackGrid(b64: string, n: number): Uint8Array {
  let bytes: Uint8Array;
  if (typeof atob === "function") {
    const bin = atob(b64);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } else {
    const B = (globalThis as unknown as { Buffer: { from(s: string, e: string): Uint8Array } }).Buffer;
    bytes = B.from(b64, "base64");
  }
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = (bytes[i >> 3] >> (i & 7)) & 1;
  return out;
}

/** Attach scale (and the default house spec if absent) to a layout. */
export function applyScale<L extends PlanLayout>(layout: L, areaM2: number): L {
  const scale = deriveScale(layout, areaM2);
  return { ...layout, scale, house: layout.house ?? { ...DEFAULT_HOUSE_SPEC } };
}
