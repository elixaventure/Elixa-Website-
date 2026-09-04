/**
 * Normalized property model — the single source of truth for the 3D building.
 *
 * The renderer consumes ONLY this model; it never sees the uploaded image,
 * and it does not care whether the data came from the in-browser extractor,
 * the hosted recognition API, hand-authored golden data, or manual edits.
 *
 * All coordinates and dimensions are METRES in plan space (x east, y south);
 * see lib/property/constants.ts for the scale convention.
 */

export interface Vec2 {
  x: number;
  y: number;
}

export type WallKind = "external" | "internal";

export interface Wall {
  id: string;
  floorId: string;
  /** centreline endpoints, metres, plan space */
  a: Vec2;
  b: Vec2;
  thickness: number;
  /** overrides the floor's ceiling height when set (e.g. parapets) */
  height?: number;
  kind: WallKind;
  /** outward normal for external walls (unit-ish, plan space) */
  normal?: Vec2;
}

export type OpeningKind = "window" | "internal-door" | "external-door" | "patio-door" | "passage";

export interface Opening {
  id: string;
  floorId: string;
  /** the wall this opening pierces, when known — openings recovered from a
   * gap in an extracted plan may not have a host wall and then rely on the
   * absolute placement below */
  wallId?: string;
  kind: OpeningKind;
  /** centre of the opening, metres, plan space */
  centre: Vec2;
  /** direction the opening runs along ("x" = east-west wall run) */
  along: "x" | "y";
  width: number;
  /** thickness of the wall it sits in */
  wallThickness: number;
  sillHeight?: number; // windows
  headHeight?: number;
  /** door swing, when the plan shows it */
  swing?: "left" | "right";
  /** true when the opening leads outdoors (incl. onto a balcony) */
  external: boolean;
  /** outward normal when external */
  normal?: Vec2;
  /** recognition confidence 0..1 (1 = hand-authored) */
  confidence: number;
}

export interface Room {
  id: string;
  floorId: string;
  name?: string;
  /** e.g. bedroom, kitchen, bathroom — free text for now */
  type?: string;
  /** closed polygon, metres */
  polygon: Vec2[];
}

export interface Balcony {
  id: string;
  floorId: string;
  polygon: Vec2[];
  railHeight?: number;
}

/** placeholder for future equipment/fixture attachment (Phase 2+) */
export interface Fixture {
  id: string;
  floorId: string;
  type: string;
  at: Vec2;
  rotation?: number;
}

export interface FloorModel {
  id: string;
  name: string;
  /** 0 = ground, 1 = first… drives stacking order */
  level: number;
  /** metres above ground-floor slab top; derived if omitted */
  elevation?: number;
  ceilingHeight: number;
  walls: Wall[];
  openings: Opening[];
  rooms: Room[];
  balconies: Balcony[];
  fixtures: Fixture[];
  /** optional floor-finish texture (object URL of the uploaded plan) */
  planTextureUrl?: string;
  /** plan-space rect the texture covers, metres */
  planTextureRect?: { x: number; y: number; w: number; h: number };
}

export interface PropertyModel {
  propertyId: string;
  name?: string;
  floors: FloorModel[];
  /** where this model came from, for provenance/debugging */
  source?: "manual" | "extracted" | "api" | "golden";
}

/** overall plan-space bounds of a property (all floors), metres */
export function propertyBounds(p: PropertyModel): { x0: number; y0: number; x1: number; y1: number } {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const take = (v: Vec2) => {
    x0 = Math.min(x0, v.x); y0 = Math.min(y0, v.y);
    x1 = Math.max(x1, v.x); y1 = Math.max(y1, v.y);
  };
  for (const f of p.floors) {
    for (const w of f.walls) { take(w.a); take(w.b); }
    for (const b of f.balconies) for (const v of b.polygon) take(v);
    for (const r of f.rooms) for (const v of r.polygon) take(v);
  }
  if (!isFinite(x0)) return { x0: 0, y0: 0, x1: 1, y1: 1 };
  return { x0, y0, x1, y1 };
}

/** elevation (m) of a floor's slab top, honouring explicit overrides */
export function floorElevation(p: PropertyModel, floor: FloorModel, slab: number): number {
  if (typeof floor.elevation === "number") return floor.elevation;
  let e = 0;
  for (const f of [...p.floors].sort((a, b) => a.level - b.level)) {
    if (f.level >= floor.level) break;
    e += f.ceilingHeight + slab;
  }
  return e;
}
