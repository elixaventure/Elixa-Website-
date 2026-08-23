/**
 * Diagnostic recorder for the floor-plan wall extractor.
 *
 * TEMPORARY. Everything here is opt-in: `extractLayout` only allocates a
 * recorder when `{ debug: true }` is passed, which only happens when the page
 * is loaded with `?planDebug=1`. With the flag off there is zero extra work
 * and zero extra memory — the call sites are `dbg?.stage(...)`.
 *
 * To remove entirely: delete this file, delete PlanDebugPanel.tsx, drop the
 * `opts` argument from extractLayout and the `dbg?.` lines inside it.
 */

/** longest side of a recorded stage image — keeps debug memory bounded */
const DBG_MAX = 700;

export interface DebugStage {
  key: string;
  label: string;
  note?: string;
  w: number;
  h: number;
  /** RGBA, w*h*4 */
  rgba: Uint8ClampedArray;
}

export interface PlanDebug {
  srcW: number;
  srcH: number;
  stages: DebugStage[];
  counts: Record<string, number>;
}

/** colour a pixel is painted when a mask bit is set */
export type Palette = Record<number, [number, number, number, number]>;

export class DebugRecorder {
  readonly data: PlanDebug;
  private readonly W: number;
  private readonly H: number;
  private readonly step: number;
  private readonly dw: number;
  private readonly dh: number;

  constructor(W: number, H: number) {
    this.W = W;
    this.H = H;
    this.step = Math.max(1, Math.ceil(Math.max(W, H) / DBG_MAX));
    this.dw = Math.floor(W / this.step);
    this.dh = Math.floor(H / this.step);
    this.data = { srcW: W, srcH: H, stages: [], counts: {} };
  }

  count(key: string, value: number): void {
    this.data.counts[key] = value;
  }

  bump(key: string, by = 1): void {
    this.data.counts[key] = (this.data.counts[key] ?? 0) + by;
  }

  /**
   * Record a full-resolution mask, nearest-neighbour downsampled. Any non-zero
   * value is looked up in `palette`; unlisted values fall back to black.
   */
  stage(key: string, label: string, mask: Uint8Array, palette: Palette, note?: string): void {
    const { W, step, dw, dh } = this;
    const rgba = new Uint8ClampedArray(dw * dh * 4);
    for (let y = 0; y < dh; y++) {
      for (let x = 0; x < dw; x++) {
        const o = (y * dw + x) * 4;
        // max() over the cell so thin 1px lines survive the downsample
        let v = 0;
        for (let sy = 0; sy < step; sy++) {
          for (let sx = 0; sx < step; sx++) {
            const s = mask[(y * step + sy) * W + x * step + sx];
            if (s > v) v = s;
          }
        }
        if (!v) {
          rgba[o] = 255;
          rgba[o + 1] = 255;
          rgba[o + 2] = 255;
          rgba[o + 3] = 255;
          continue;
        }
        const c = palette[v] ?? [20, 20, 20, 255];
        rgba[o] = c[0];
        rgba[o + 1] = c[1];
        rgba[o + 2] = c[2];
        rgba[o + 3] = c[3];
      }
    }
    this.data.stages.push({ key, label, note, w: dw, h: dh, rgba });
  }

  /** Record a grid-resolution mask (the 3px-cell grid), scaled to the same box. */
  gridStage(
    key: string,
    label: string,
    grid: Uint8Array,
    gw: number,
    gh: number,
    palette: Palette,
    note?: string,
  ): void {
    const { dw, dh } = this;
    const rgba = new Uint8ClampedArray(dw * dh * 4);
    for (let y = 0; y < dh; y++) {
      const gy = Math.min(gh - 1, Math.floor((y / dh) * gh));
      for (let x = 0; x < dw; x++) {
        const gx = Math.min(gw - 1, Math.floor((x / dw) * gw));
        const o = (y * dw + x) * 4;
        const v = grid[gy * gw + gx];
        const c = v ? palette[v] ?? [20, 20, 20, 255] : [255, 255, 255, 255];
        rgba[o] = c[0];
        rgba[o + 1] = c[1];
        rgba[o + 2] = c[2];
        rgba[o + 3] = c[3];
      }
    }
    this.data.stages.push({ key, label, note, w: dw, h: dh, rgba });
  }
}

export const DBG = {
  ink: { 1: [30, 30, 30, 255] } as Palette,
  colour: { 1: [200, 30, 30, 255], 2: [30, 40, 200, 255], 3: [40, 150, 60, 255] } as Palette,
  runs: { 1: [235, 170, 60, 255], 2: [20, 90, 220, 255] } as Palette,
  wall: { 1: [20, 90, 220, 255], 2: [225, 35, 35, 255] } as Palette,
  verdict: {
    1: [25, 35, 60, 255], // accepted
    2: [230, 120, 120, 255], // rejected: speck
    3: [235, 175, 60, 255], // rejected: solid blob
    4: [150, 120, 210, 255], // rejected: isolated / outside
  } as Palette,
};
