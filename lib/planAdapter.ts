/**
 * Adapts a hosted recognition service's response (RasterScan-style raster→
 * vector output) into the site's normalized PlanLayout, so the existing 3D
 * dollhouse renders it exactly like a classically-extracted plan.
 *
 * The provider publishes no response schema, so this adapter duck-types the
 * common shapes vector services emit — walls/doors/windows as segments
 * ({x1,y1,x2,y2} | {start,end} | {points:[...]} | [x1,y1,x2,y2]) under a
 * handful of likely container keys — and normalises everything to pixel
 * segments before building geometry. The raw response is logged by planApi,
 * so the first real call shows exactly which branch fired (or should exist).
 */

import type { PlanLayout, PlanOpening, WallBox, OpeningType } from "./planLayout";

const WORLD_MAX = 9; // longest side of the extruded layout, world units

interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  t?: number;
  kind: "wall" | "door" | "window";
}

/* ------------------------------------------------------------ duck typing --- */

type Dict = Record<string, unknown>;
const isDict = (v: unknown): v is Dict => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown): number | null => (typeof v === "number" && isFinite(v) ? v : null);

function asPoint(v: unknown): [number, number] | null {
  if (Array.isArray(v) && v.length >= 2) {
    const x = num(v[0]);
    const y = num(v[1]);
    return x !== null && y !== null ? [x, y] : null;
  }
  if (isDict(v)) {
    const x = num(v.x);
    const y = num(v.y);
    return x !== null && y !== null ? [x, y] : null;
  }
  return null;
}

/** one entry (any of the common vector shapes) → a pixel segment */
function asSeg(v: unknown, kind: Seg["kind"]): Seg | null {
  if (Array.isArray(v) && v.length >= 4 && v.every((n) => typeof n === "number")) {
    return { x1: v[0], y1: v[1], x2: v[2], y2: v[3], kind };
  }
  if (!isDict(v)) return null;
  const t = num(v.thickness) ?? num(v.t) ?? undefined;

  const x1 = num(v.x1), y1 = num(v.y1), x2 = num(v.x2), y2 = num(v.y2);
  if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) return { x1, y1, x2, y2, t, kind };

  const s = asPoint(v.start ?? v.from ?? v.p1 ?? v.a);
  const e = asPoint(v.end ?? v.to ?? v.p2 ?? v.b);
  if (s && e) return { x1: s[0], y1: s[1], x2: e[0], y2: e[1], t, kind };

  const pts = v.points ?? v.polygon ?? v.contour ?? v.coordinates;
  if (Array.isArray(pts)) {
    const ps = pts.map(asPoint).filter((p): p is [number, number] => p !== null);
    if (ps.length === 2) return { x1: ps[0][0], y1: ps[0][1], x2: ps[1][0], y2: ps[1][1], t, kind };
    if (ps.length >= 3) {
      // a polygon outline — reduce to a segment along the bbox's longer axis,
      // with the shorter side as the thickness
      let x0 = Infinity, y0 = Infinity, xM = -Infinity, yM = -Infinity;
      for (const [x, y] of ps) {
        x0 = Math.min(x0, x); y0 = Math.min(y0, y);
        xM = Math.max(xM, x); yM = Math.max(yM, y);
      }
      const w = xM - x0, h = yM - y0;
      if (w >= h) return { x1: x0, y1: (y0 + yM) / 2, x2: xM, y2: (y0 + yM) / 2, t: t ?? h, kind };
      return { x1: (x0 + xM) / 2, y1: y0, x2: (x0 + xM) / 2, y2: yM, t: t ?? w, kind };
    }
  }
  return null;
}

/** collect segments for one element family from every likely container/key */
function collect(raw: unknown, keys: string[], kind: Seg["kind"]): Seg[] {
  const out: Seg[] = [];
  const containers: unknown[] = [raw];
  if (isDict(raw)) containers.push(raw.data, raw.result, raw.results, raw.plan, raw.output, raw.response);
  for (const c of containers) {
    if (!isDict(c)) continue;
    for (const k of keys) {
      const list = c[k];
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        const s = asSeg(item, kind);
        if (s) out.push(s);
      }
    }
    // generic: a single "lines"/"elements" list with a per-item type field
    for (const k of ["lines", "elements", "items", "objects"]) {
      const list = c[k];
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        if (!isDict(item)) continue;
        const ty = String(item.type ?? item.category ?? item.label ?? "").toLowerCase();
        const wanted =
          (kind === "wall" && ty.includes("wall")) ||
          (kind === "door" && ty.includes("door")) ||
          (kind === "window" && ty.includes("window"));
        if (!wanted) continue;
        const s = asSeg(item, kind);
        if (s) out.push(s);
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------ geometry ------ */

export function adaptRecognition(raw: unknown, imgW: number, imgH: number): PlanLayout | null {
  try {
    const walls = collect(raw, ["walls", "wall", "wall_lines", "wallLines"], "wall");
    const doors = collect(raw, ["doors", "door"], "door");
    const windows = collect(raw, ["windows", "window"], "window");
    if (walls.length < 4) {
      console.info("[elixa] plan adapter: no usable walls in response (", walls.length, ")");
      return null;
    }

    // wall thickness (px): provider values when present, else ~1% of max dim
    const maxDim = Math.max(imgW, imgH);
    const ts = walls.map((s) => s.t).filter((t): t is number => typeof t === "number" && t > 0.5).sort((a, b) => a - b);
    const tPx = ts.length ? ts[Math.floor(ts.length / 2)] : Math.max(3, Math.round(maxDim * 0.01));
    const metresPerPx = 0.28 / Math.max(2, tPx); // walls ≈ 280 mm

    // content bbox over walls (small pad so the floor texture crop breathes)
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const s of walls) {
      bx0 = Math.min(bx0, s.x1, s.x2); by0 = Math.min(by0, s.y1, s.y2);
      bx1 = Math.max(bx1, s.x1, s.x2); by1 = Math.max(by1, s.y1, s.y2);
    }
    const pad = tPx;
    bx0 -= pad; by0 -= pad; bx1 += pad; by1 += pad;
    const bw = bx1 - bx0, bh = by1 - by0;
    if (bw < 20 || bh < 20) return null;
    const unit = WORLD_MAX / Math.max(bw, bh); // world units per px
    const floorW = bw * unit;
    const floorD = bh * unit;
    const wx = (px: number) => (px - bx0) * unit - floorW / 2;
    const wz = (py: number) => (py - by0) * unit - floorD / 2;

    // occupancy grid for the outside flood (walls + sealed openings)
    const cell = Math.max(3, Math.round(Math.max(bw, bh) / 260));
    const gw = Math.max(4, Math.ceil(bw / cell));
    const gh = Math.max(4, Math.ceil(bh / cell));
    const grid = new Uint8Array(gw * gh);
    const stamp = (s: Seg) => {
      const th = Math.max(s.t ?? tPx, tPx);
      const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
      const steps = Math.max(2, Math.ceil(len / (cell / 2)));
      const r = Math.max(1, Math.round(th / 2 / cell));
      for (let i = 0; i <= steps; i++) {
        const px = s.x1 + ((s.x2 - s.x1) * i) / steps;
        const py = s.y1 + ((s.y2 - s.y1) * i) / steps;
        const gx = Math.round((px - bx0) / cell);
        const gy = Math.round((py - by0) / cell);
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) {
            const nx = gx + dx, ny = gy + dy;
            if (nx >= 0 && nx < gw && ny >= 0 && ny < gh) grid[ny * gw + nx] = 1;
          }
      }
    };
    for (const s of walls) stamp(s);
    for (const s of doors) stamp(s); // seal openings so the flood stays out
    for (const s of windows) stamp(s);

    const outside = new Uint8Array(gw * gh);
    {
      const st: number[] = [];
      const push = (gx: number, gy: number) => {
        const i = gy * gw + gx;
        if (gx >= 0 && gx < gw && gy >= 0 && gy < gh && !grid[i] && !outside[i]) {
          outside[i] = 1;
          st.push(i);
        }
      };
      for (let gx = 0; gx < gw; gx++) { push(gx, 0); push(gx, gh - 1); }
      for (let gy = 0; gy < gh; gy++) { push(0, gy); push(gw - 1, gy); }
      while (st.length) {
        const i = st.pop()!;
        const gx = i % gw, gy = (i - gx) / gw;
        push(gx + 1, gy); push(gx - 1, gy); push(gx, gy + 1); push(gx, gy - 1);
      }
    }
    const isOut = (gx: number, gy: number) =>
      gx < 0 || gx >= gw || gy < 0 || gy >= gh || outside[gy * gw + gx] === 1;

    /** which side of an axis-aligned px-rect faces the outdoors */
    const extOf = (rx0: number, ry0: number, rx1: number, ry1: number) => {
      const gx0 = Math.round((rx0 - bx0) / cell), gx1 = Math.round((rx1 - bx0) / cell);
      const gy0 = Math.round((ry0 - by0) / cell), gy1 = Math.round((ry1 - by0) / cell);
      const probe = Math.max(2, Math.round(tPx / cell) + 2);
      let up = 0, down = 0, left = 0, right = 0, n = 0;
      for (let gx = gx0; gx <= gx1; gx++) {
        n++;
        for (let k = 1; k <= probe; k++) if (isOut(gx, gy0 - k)) { up++; break; }
        for (let k = 1; k <= probe; k++) if (isOut(gx, gy1 + k)) { down++; break; }
      }
      let m = 0;
      for (let gy = gy0; gy <= gy1; gy++) {
        m++;
        for (let k = 1; k <= probe; k++) if (isOut(gx0 - k, gy)) { left++; break; }
        for (let k = 1; k <= probe; k++) if (isOut(gx1 + k, gy)) { right++; break; }
      }
      const uf = n ? up / n : 0, df = n ? down / n : 0;
      const lf = m ? left / m : 0, rf = m ? right / m : 0;
      const best = Math.max(uf, df, lf, rf);
      if (best < 0.5) return null;
      if (best === uf) return { nx: 0, nz: -1 };
      if (best === df) return { nx: 0, nz: 1 };
      if (best === lf) return { nx: -1, nz: 0 };
      return { nx: 1, nz: 0 };
    };

    // walls → axis-aligned boxes (diagonals become short stepped runs)
    const boxes: WallBox[] = [];
    const pushBox = (rx0: number, ry0: number, rx1: number, ry1: number) => {
      const box: WallBox = {
        x: wx((rx0 + rx1) / 2),
        z: wz((ry0 + ry1) / 2),
        w: Math.max(rx1 - rx0, tPx * 0.8) * unit,
        d: Math.max(ry1 - ry0, tPx * 0.8) * unit,
      };
      const e = extOf(rx0, ry0, rx1, ry1);
      if (e) { box.ext = 1; box.nx = e.nx; box.nz = e.nz; }
      boxes.push(box);
    };
    for (const s of walls) {
      const th = Math.max(s.t ?? tPx, tPx * 0.6);
      const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
      const len = Math.hypot(dx, dy);
      if (len < 1) continue;
      const ang = Math.abs(Math.atan2(Math.abs(dy), Math.abs(dx)));
      if (ang < 0.26 || Math.abs(dx) < th) {
        // horizontal-ish
        const y = (s.y1 + s.y2) / 2;
        pushBox(Math.min(s.x1, s.x2), y - th / 2, Math.max(s.x1, s.x2), y + th / 2);
      } else if (ang > Math.PI / 2 - 0.26 || Math.abs(dy) < th) {
        const x = (s.x1 + s.x2) / 2;
        pushBox(x - th / 2, Math.min(s.y1, s.y2), x + th / 2, Math.max(s.y1, s.y2));
      } else {
        // genuinely diagonal: approximate with a stepped chain
        const steps = Math.max(2, Math.ceil(len / (th * 1.4)));
        for (let i = 0; i < steps; i++) {
          const px = s.x1 + (dx * (i + 0.5)) / steps;
          const py = s.y1 + (dy * (i + 0.5)) / steps;
          pushBox(px - th * 0.7, py - th * 0.7, px + th * 0.7, py + th * 0.7);
        }
      }
    }

    // doors/windows → classified openings
    const openings: PlanOpening[] = [];
    for (const s of [...doors, ...windows]) {
      const dx = Math.abs(s.x2 - s.x1), dy = Math.abs(s.y2 - s.y1);
      const along: "x" | "z" = dx >= dy ? "x" : "z";
      const lenPx = Math.max(Math.hypot(s.x2 - s.x1, s.y2 - s.y1), tPx);
      const widthM = lenPx * metresPerPx;
      if (widthM < 0.4 || widthM > 5) continue;
      const th = Math.max(s.t ?? tPx, tPx);
      const cx = (s.x1 + s.x2) / 2, cy = (s.y1 + s.y2) / 2;
      const rect =
        along === "x"
          ? ([cx - lenPx / 2, cy - th / 2, cx + lenPx / 2, cy + th / 2] as const)
          : ([cx - th / 2, cy - lenPx / 2, cx + th / 2, cy + lenPx / 2] as const);
      const e = extOf(rect[0], rect[1], rect[2], rect[3]);
      let type: OpeningType;
      let confidence = 0.85; // provider-classified
      if (s.kind === "window") {
        type = "window";
      } else if (e) {
        type = widthM >= 1.5 ? "patio-door" : "external-door";
      } else {
        type = "internal-door";
        confidence = 0.8;
      }
      openings.push({
        id: `o${openings.length}`,
        type,
        x: wx(cx),
        z: wz(cy),
        along,
        w: lenPx * unit,
        t: th * unit,
        ext: e ? 1 : 0,
        ...(e ? { nx: e.nx, nz: e.nz } : {}),
        widthM: Math.round(widthM * 100) / 100,
        confidence,
      });
    }

    let footprintCells = 0;
    for (let i = 0; i < gw * gh; i++) if (!outside[i]) footprintCells++;

    const layout: PlanLayout = {
      // one box per provider wall segment — even a studio flat has 4+
      ok: boxes.length >= 4 && boxes.length <= 8000,
      boxes,
      openings,
      floorW,
      floorD,
      crop: {
        ox: Math.max(0, bx0 / imgW),
        oy: Math.max(0, by0 / imgH),
        rw: Math.min(1, bw / imgW),
        rh: Math.min(1, bh / imgH),
      },
      metrics: {
        footprintPx2: footprintCells * cell * cell,
        worldPerPx: unit,
        wallPx: tPx,
      },
    };
    {
      const byType: Record<string, number> = {};
      for (const o of openings) byType[o.type] = (byType[o.type] ?? 0) + 1;
      console.info(
        "[elixa] plan adapter:", boxes.length, "wall boxes,", openings.length, "openings", JSON.stringify(byType),
      );
    }
    return layout;
  } catch (e) {
    console.warn("[elixa] plan adapter failed", e);
    return null;
  }
}
