/**
 * Bridge from the extraction layer to the normalized property model.
 *
 * Both recognition paths (the in-browser extractor and the hosted API
 * adapter) emit a PlanLayout; this converts one PlanLayout into one metric
 * FloorModel, so the renderer only ever consumes normalized property data.
 */

import type { PlanLayout } from "../planLayout";
import type { FloorModel, Wall, Opening, OpeningKind } from "./types";
import { DEFAULT_CEILING_HEIGHT, DEFAULT_INTERNAL_WALL_THICKNESS } from "./constants";

const KIND_MAP: Record<string, OpeningKind> = {
  "window": "window",
  "internal-door": "internal-door",
  "external-door": "external-door",
  "patio-door": "patio-door",
  "open-passage": "passage",
};

export function floorFromLayout(
  layout: PlanLayout,
  opts: { id: string; name: string; level: number; ceilingHeight?: number; planTextureUrl?: string },
): FloorModel | null {
  if (!layout.ok || !layout.boxes.length) return null;
  // world-units → metres: explicit scale wins, else the wall-thickness
  // heuristic the renderer already uses (~280 mm walls)
  const m = layout.metrics;
  const wpm =
    layout.scale?.worldPerMetre ??
    (m && m.wallPx > 0 ? (m.worldPerPx * m.wallPx) / 0.28 : null);
  if (!wpm || wpm <= 0) return null;
  const toM = (v: number) => v / wpm;

  // plan space: shift so the floor's min corner sits at (0,0)
  const ox = toM(-layout.floorW / 2);
  const oy = toM(-layout.floorD / 2);
  const px = (x: number) => toM(x) - ox;
  const py = (z: number) => toM(z) - oy;

  const walls: Wall[] = layout.boxes.map((b, i) => {
    const w = toM(b.w);
    const d = toM(b.d);
    const horizontal = w >= d;
    const cx = px(b.x);
    const cy = py(b.z);
    const half = (horizontal ? w : d) / 2;
    const wall: Wall = {
      id: `${opts.id}-w${i}`,
      floorId: opts.id,
      a: horizontal ? { x: cx - half, y: cy } : { x: cx, y: cy - half },
      b: horizontal ? { x: cx + half, y: cy } : { x: cx, y: cy + half },
      thickness: Math.max(horizontal ? d : w, DEFAULT_INTERNAL_WALL_THICKNESS),
      kind: b.ext ? "external" : "internal",
    };
    if (b.ext && (b.nx || b.nz)) wall.normal = { x: b.nx ?? 0, y: b.nz ?? 0 };
    return wall;
  });

  const openings: Opening[] = (layout.openings ?? []).map((o, i) => ({
    id: `${opts.id}-o${i}`,
    floorId: opts.id,
    kind: KIND_MAP[o.type] ?? "passage",
    centre: { x: px(o.x), y: py(o.z) },
    along: o.along === "x" ? "x" : "y",
    width: toM(o.w),
    wallThickness: toM(o.t),
    external: o.ext === 1,
    ...(o.ext && (o.nx || o.nz) ? { normal: { x: o.nx ?? 0, y: o.nz ?? 0 } } : {}),
    confidence: o.confidence,
  }));

  return {
    id: opts.id,
    name: opts.name,
    level: opts.level,
    ceilingHeight: opts.ceilingHeight ?? DEFAULT_CEILING_HEIGHT,
    walls,
    openings,
    rooms: [],
    balconies: [],
    fixtures: [],
    planTextureUrl: opts.planTextureUrl,
    planTextureRect: { x: 0, y: 0, w: toM(layout.floorW), h: toM(layout.floorD) },
  };
}
