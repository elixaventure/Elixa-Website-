/**
 * Structural validation for PropertyModel data. Used by the golden tests and
 * defensively wherever a model crosses a boundary (import, API, storage).
 * Returns human-readable problems rather than throwing, so callers can decide
 * whether an issue is fatal.
 */

import type { PropertyModel, FloorModel, Vec2 } from "./types";

const isVec = (v: unknown): v is Vec2 =>
  typeof v === "object" && v !== null &&
  typeof (v as Vec2).x === "number" && isFinite((v as Vec2).x) &&
  typeof (v as Vec2).y === "number" && isFinite((v as Vec2).y);

export function validateProperty(p: PropertyModel): string[] {
  const errs: string[] = [];
  if (!p.propertyId) errs.push("propertyId missing");
  if (!Array.isArray(p.floors) || p.floors.length === 0) {
    errs.push("no floors");
    return errs;
  }
  const levels = new Set<number>();
  const floorIds = new Set<string>();
  for (const f of p.floors) {
    if (floorIds.has(f.id)) errs.push(`duplicate floor id ${f.id}`);
    floorIds.add(f.id);
    if (levels.has(f.level)) errs.push(`duplicate floor level ${f.level}`);
    levels.add(f.level);
    if (!(f.ceilingHeight > 1.8 && f.ceilingHeight < 6)) {
      errs.push(`floor ${f.id}: implausible ceilingHeight ${f.ceilingHeight}`);
    }
    errs.push(...validateFloor(f));
  }
  return errs;
}

function validateFloor(f: FloorModel): string[] {
  const errs: string[] = [];
  const ids = new Set<string>();
  const dup = (id: string, what: string) => {
    if (ids.has(id)) errs.push(`floor ${f.id}: duplicate ${what} id ${id}`);
    ids.add(id);
  };
  const wallIds = new Set(f.walls.map((w) => w.id));
  for (const w of f.walls) {
    dup(w.id, "wall");
    if (!isVec(w.a) || !isVec(w.b)) errs.push(`wall ${w.id}: bad endpoints`);
    else if (Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y) < 0.05)
      errs.push(`wall ${w.id}: zero length`);
    if (!(w.thickness > 0.03 && w.thickness < 1)) errs.push(`wall ${w.id}: thickness ${w.thickness}`);
    if (w.floorId !== f.id) errs.push(`wall ${w.id}: floorId mismatch`);
  }
  for (const o of f.openings) {
    dup(o.id, "opening");
    if (!isVec(o.centre)) errs.push(`opening ${o.id}: bad centre`);
    if (!(o.width > 0.3 && o.width < 6)) errs.push(`opening ${o.id}: width ${o.width}`);
    if (o.wallId && !wallIds.has(o.wallId)) errs.push(`opening ${o.id}: unknown wallId ${o.wallId}`);
    if (o.kind === "window") {
      const sill = o.sillHeight ?? 0.9;
      const head = o.headHeight ?? 2.1;
      if (!(head > sill)) errs.push(`opening ${o.id}: head ${head} not above sill ${sill}`);
    }
    if (o.floorId !== f.id) errs.push(`opening ${o.id}: floorId mismatch`);
  }
  for (const r of f.rooms) {
    dup(r.id, "room");
    if (!Array.isArray(r.polygon) || r.polygon.length < 3 || !r.polygon.every(isVec))
      errs.push(`room ${r.id}: bad polygon`);
  }
  for (const b of f.balconies) {
    dup(b.id, "balcony");
    if (!Array.isArray(b.polygon) || b.polygon.length < 3 || !b.polygon.every(isVec))
      errs.push(`balcony ${b.id}: bad polygon`);
  }
  return errs;
}
