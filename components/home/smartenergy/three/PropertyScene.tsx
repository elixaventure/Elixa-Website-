"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PropertyModel, FloorModel, Wall, Opening } from "@/lib/property/types";
import { propertyBounds, floorElevation } from "@/lib/property/types";
import {
  FLOOR_SLAB_THICKNESS,
  WINDOW_DEFAULTS,
  DOOR_DEFAULTS,
  BALCONY_DEFAULTS,
  FRAME_SECTION,
} from "@/lib/property/constants";
import type { LayoutView } from "./ExactLayout";

/**
 * Renders a normalized PropertyModel as an architectural dollhouse.
 *
 * The model is metric (1 unit = 1 metre); a wrapper group uniformly scales
 * the whole property to the scene's framing. Every floor is its own named
 * group with layer sub-groups (BuildingGeometry, Furniture — heating/pipework
 * layers attach here in later phases). Openings are REAL: walls are split
 * around them, with sill/head infill and frame/glazing/leaf joinery.
 */

export interface PropertyViewState {
  view: LayoutView;
  /** floor id, or "all" */
  floor: string;
  exploded: boolean;
  furniture: boolean;
  /** bump to glide the camera back to the default framing */
  resetSignal: number;
}

const SCENE_FIT = 9; // world units the property's longest side maps to

const COL = {
  wallDay: "#efe9df",
  wallNight: "#4a5674",
  slabDay: "#d6dde6",
  slabNight: "#2a3550",
  floorDay: "#f0ece4",
  floorNight: "#3a4664",
  frame: "#f7f4ee",
  glass: "#aecfe8",
  leafIn: "#e9e3d9",
  leafOut: "#68788f",
  rail: "#c9cfd8",
  balcony: "#cfd6cd",
};

/* --------------------------------------------------- per-wall composition --- */

interface WallPiece {
  /** offset along the wall run from its start, m (centre of piece) */
  s: number;
  len: number;
  y: number;
  h: number;
}

interface ComposedWall {
  wall: Wall;
  length: number;
  angle: number;
  cx: number;
  cy: number;
  pieces: WallPiece[];
  openings: { o: Opening; s: number }[];
}

/** split each wall into solid pieces around the openings that pierce it */
function composeFloor(floor: FloorModel): { walls: ComposedWall[]; loose: Opening[] } {
  const walls: ComposedWall[] = floor.walls.map((w) => {
    const dx = w.b.x - w.a.x;
    const dy = w.b.y - w.a.y;
    const length = Math.hypot(dx, dy);
    return {
      wall: w,
      length,
      angle: Math.atan2(dy, dx),
      cx: (w.a.x + w.b.x) / 2,
      cy: (w.a.y + w.b.y) / 2,
      pieces: [],
      openings: [],
    };
  });
  const loose: Opening[] = [];

  for (const o of floor.openings) {
    let host: ComposedWall | null = null;
    if (o.wallId) host = walls.find((w) => w.wall.id === o.wallId) ?? null;
    if (!host) {
      // adopt an unreferenced opening when it sits on a wall's centreline
      for (const w of walls) {
        const dx = w.wall.b.x - w.wall.a.x;
        const dy = w.wall.b.y - w.wall.a.y;
        const t =
          ((o.centre.x - w.wall.a.x) * dx + (o.centre.y - w.wall.a.y) * dy) / (w.length * w.length);
        if (t < -0.02 || t > 1.02) continue;
        const px = w.wall.a.x + dx * t;
        const py = w.wall.a.y + dy * t;
        if (Math.hypot(o.centre.x - px, o.centre.y - py) < w.wall.thickness * 0.75 + 0.05) {
          host = w;
          break;
        }
      }
    }
    if (!host) {
      loose.push(o);
      continue;
    }
    const dx = host.wall.b.x - host.wall.a.x;
    const dy = host.wall.b.y - host.wall.a.y;
    const s = ((o.centre.x - host.wall.a.x) * dx + (o.centre.y - host.wall.a.y) * dy) / host.length;
    host.openings.push({ o, s });
  }

  const H = floor.ceilingHeight;
  for (const w of walls) {
    const h = w.wall.height ?? H;
    w.openings.sort((a, b) => a.s - b.s);
    let cursor = 0;
    for (const { o, s } of w.openings) {
      const s0 = Math.max(0, s - o.width / 2);
      const s1 = Math.min(w.length, s + o.width / 2);
      if (s0 > cursor + 0.02) w.pieces.push({ s: (cursor + s0) / 2, len: s0 - cursor, y: h / 2, h });
      // infill above (and below, for windows) stays part of the wall
      const head = Math.min(o.headHeight ?? (o.kind === "window" ? WINDOW_DEFAULTS.headHeight : DOOR_DEFAULTS.height), h);
      if (h - head > 0.02) w.pieces.push({ s: (s0 + s1) / 2, len: s1 - s0, y: (head + h) / 2, h: h - head });
      if (o.kind === "window") {
        const sill = Math.min(o.sillHeight ?? WINDOW_DEFAULTS.sillHeight, head);
        if (sill > 0.02) w.pieces.push({ s: (s0 + s1) / 2, len: s1 - s0, y: sill / 2, h: sill });
      }
      cursor = Math.max(cursor, s1);
    }
    if (w.length > cursor + 0.02)
      w.pieces.push({ s: (cursor + w.length) / 2, len: w.length - cursor, y: h / 2, h });
  }
  return { walls, loose };
}

/* ------------------------------------------------------------- components --- */

export function PropertyScene({
  property,
  isDay,
  state,
}: {
  property: PropertyModel;
  isDay: boolean;
  state: PropertyViewState;
}) {
  const bounds = useMemo(() => propertyBounds(property), [property]);
  const spanX = bounds.x1 - bounds.x0;
  const spanY = bounds.y1 - bounds.y0;
  const fit = SCENE_FIT / Math.max(spanX, spanY, 1);
  const floors = useMemo(() => [...property.floors].sort((a, b) => a.level - b.level), [property]);

  const camDir = useMemo(() => new THREE.Vector3(), []);
  const groupRefs = useRef<Map<string, THREE.Group>>(new Map());
  const floorLift = useRef<Map<string, number>>(new Map());
  const wallScale = useRef<Map<string, number>>(new Map());
  const controls = useThree((s) => s.controls) as { target?: THREE.Vector3 } | null;
  const resetFrames = useRef(0);
  const lastReset = useRef(state.resetSignal);

  useFrame((three) => {
    camDir.copy(three.camera.position).setY(0).normalize();

    // floor stacking + exploded offset (animated)
    for (const f of floors) {
      const g = groupRefs.current.get(f.id);
      if (!g) continue;
      const base = floorElevation(property, f, FLOOR_SLAB_THICKNESS);
      const targetLift = base + (state.exploded ? f.level * f.ceilingHeight * 2.2 : 0);
      const cur = floorLift.current.get(f.id) ?? base;
      const next = cur + (targetLift - cur) * 0.12;
      floorLift.current.set(f.id, next);
      g.position.y = next * fit;
      const visible = state.floor === "all" || state.floor === f.id;
      g.visible = visible;
    }

    // dollhouse cutaway: camera-facing external wall groups sink to a plinth
    groupRefs.current.forEach((g, key) => {
      if (!key.startsWith("wall:")) return;
      const ext = g.userData.ext as boolean;
      const nx = g.userData.nx as number;
      const nz = g.userData.nz as number;
      const H = g.userData.h as number;
      let ratio = 1;
      if (state.view === "plan") ratio = 0.35 / H;
      else if (state.view === "dollhouse") {
        if (ext) {
          const facing = nx * camDir.x + nz * camDir.z;
          ratio = facing > 0.2 ? 0.42 / H : 1;
        } else ratio = Math.min(1, 1.05 / H);
      }
      const cur = wallScale.current.get(key) ?? 1;
      const next = cur + (ratio - cur) * 0.14;
      wallScale.current.set(key, next);
      g.scale.y = next;
    });

    // camera: reset glide + plan-view overhead drift
    if (state.resetSignal !== lastReset.current) {
      lastReset.current = state.resetSignal;
      resetFrames.current = 45;
    }
    if (resetFrames.current > 0) {
      resetFrames.current--;
      const dist = SCENE_FIT * 1.55;
      const home = new THREE.Vector3(0.55, 0.62, 0.85).normalize().multiplyScalar(dist);
      home.y += 1.5;
      three.camera.position.lerp(home, 0.12);
      controls?.target?.lerp(new THREE.Vector3(0, 1.2, 0), 0.12);
    } else if (state.view === "plan") {
      three.camera.position.lerp(new THREE.Vector3(0.01, 15, 0.01), 0.06);
      controls?.target?.lerp(new THREE.Vector3(0, 0, 0), 0.08);
    }
  });

  const wallColor = isDay ? COL.wallDay : COL.wallNight;
  const xray = state.view === "xray";
  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: wallColor,
        roughness: 0.8,
        metalness: 0.02,
        transparent: xray,
        opacity: xray ? 0.3 : 1,
        depthWrite: !xray,
      }),
    [wallColor, xray],
  );

  return (
    <group scale={[fit, fit, fit]} position={[0, 0.06, 0]}>
      {floors.map((f) => (
        <FloorGroup
          key={f.id}
          floor={f}
          isDay={isDay}
          xray={xray}
          furniture={state.furniture}
          wallMat={wallMat}
          register={(key, g) => {
            if (g) groupRefs.current.set(key, g);
            else groupRefs.current.delete(key);
          }}
        />
      ))}
    </group>
  );
}

function FloorGroup({
  floor,
  isDay,
  xray,
  furniture,
  wallMat,
  register,
}: {
  floor: FloorModel;
  isDay: boolean;
  xray: boolean;
  furniture: boolean;
  wallMat: THREE.Material;
  register: (key: string, g: THREE.Group | null) => void;
}) {
  const composed = useMemo(() => composeFloor(floor), [floor]);

  // slab bounds for this floor
  const sb = useMemo(() => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const w of floor.walls) {
      x0 = Math.min(x0, w.a.x, w.b.x); y0 = Math.min(y0, w.a.y, w.b.y);
      x1 = Math.max(x1, w.a.x, w.b.x); y1 = Math.max(y1, w.a.y, w.b.y);
    }
    if (!isFinite(x0)) return { x0: 0, y0: 0, x1: 1, y1: 1 };
    return { x0: x0 - 0.2, y0: y0 - 0.2, x1: x1 + 0.2, y1: y1 + 0.2 };
  }, [floor]);
  // floors from separately-uploaded plans have unrelated origins: centre each
  // floor on its own footprint so storeys stack aligned
  const centreX = (sb.x0 + sb.x1) / 2;
  const centreY = (sb.y0 + sb.y1) / 2;
  const X = (x: number) => x - centreX;
  const Z = (y: number) => y - centreY;

  return (
    <group name={floor.id} ref={(g) => register(floor.id, g)}>
      <group name="BuildingGeometry">
        {/* slab */}
        <mesh position={[X((sb.x0 + sb.x1) / 2), -FLOOR_SLAB_THICKNESS / 2, Z((sb.y0 + sb.y1) / 2)]} receiveShadow>
          <boxGeometry args={[sb.x1 - sb.x0, FLOOR_SLAB_THICKNESS, sb.y1 - sb.y0]} />
          <meshStandardMaterial color={isDay ? COL.slabDay : COL.slabNight} roughness={0.85} />
        </mesh>
        {/* floor finish */}
        <mesh position={[X((sb.x0 + sb.x1) / 2), 0.005, Z((sb.y0 + sb.y1) / 2)]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[sb.x1 - sb.x0 - 0.1, sb.y1 - sb.y0 - 0.1]} />
          <meshStandardMaterial color={isDay ? COL.floorDay : COL.floorNight} roughness={0.9} />
        </mesh>

        {/* walls, split around their openings */}
        {composed.walls.map((cw) => {
          const h = cw.wall.height ?? floor.ceilingHeight;
          const n = cw.wall.normal;
          return (
            <group
              key={cw.wall.id}
              position={[X(cw.cx), 0, Z(cw.cy)]}
              rotation={[0, -cw.angle, 0]}
              ref={(g) => {
                if (g) {
                  g.userData.ext = cw.wall.kind === "external";
                  g.userData.nx = n?.x ?? 0;
                  g.userData.nz = n?.y ?? 0;
                  g.userData.h = h;
                }
                register(`wall:${floor.id}:${cw.wall.id}`, g);
              }}
            >
              {cw.pieces.map((p, i) => (
                <mesh key={i} position={[p.s - cw.length / 2, p.y, 0]} castShadow={!xray} receiveShadow material={wallMat}>
                  <boxGeometry args={[p.len, p.h, cw.wall.thickness]} />
                </mesh>
              ))}
              {cw.openings.map(({ o, s }) => (
                <group key={o.id} position={[s - cw.length / 2, 0, 0]}>
                  <OpeningJoinery o={o} ceil={h} />
                </group>
              ))}
            </group>
          );
        })}

        {/* openings with no host wall (extracted-plan gaps) render standalone */}
        {composed.loose.map((o) => (
          <group
            key={o.id}
            position={[X(o.centre.x), 0, Z(o.centre.y)]}
            rotation={[0, o.along === "y" ? Math.PI / 2 : 0, 0]}
            ref={(g) => {
              if (g) {
                g.userData.ext = o.external;
                g.userData.nx = o.normal?.x ?? 0;
                g.userData.nz = o.normal?.y ?? 0;
                g.userData.h = floor.ceilingHeight;
              }
              register(`wall:${floor.id}:${o.id}`, g);
            }}
          >
            <StandaloneOpening o={o} ceil={floor.ceilingHeight} wallMat={wallMat} xray={xray} />
          </group>
        ))}

        {/* balconies: slab + rails on outward edges */}
        {floor.balconies.map((b) => (
          <Balcony key={b.id} polygon={b.polygon} railHeight={b.railHeight ?? BALCONY_DEFAULTS.railHeight} X={X} Z={Z} walls={floor.walls} />
        ))}

        {/* room name sprites */}
        {floor.rooms.map((r) => {
          const cx = r.polygon.reduce((s, p) => s + p.x, 0) / r.polygon.length;
          const cy = r.polygon.reduce((s, p) => s + p.y, 0) / r.polygon.length;
          return r.name ? <RoomLabel key={r.id} text={r.name} position={[X(cx), 0.35, Z(cy)]} /> : null;
        })}
      </group>

      {/* future layers attach beside BuildingGeometry: HeatingEquipment,
          Pipework, Annotations. Furniture exists now as an empty toggleable
          layer so the scene graph shape is stable. */}
      <group name="Furniture" visible={furniture} />
    </group>
  );
}

/* --------------------------------------------------------------- joinery ---- */

function OpeningJoinery({ o, ceil }: { o: Opening; ceil: number }) {
  const t = o.wallThickness;
  const w = o.width;
  const head = Math.min(o.headHeight ?? (o.kind === "window" ? WINDOW_DEFAULTS.headHeight : DOOR_DEFAULTS.height), ceil);
  const sill = o.kind === "window" ? Math.min(o.sillHeight ?? WINDOW_DEFAULTS.sillHeight, head - 0.2) : 0;
  const jamb = Math.min(FRAME_SECTION, w * 0.12);
  const frameMat = <meshStandardMaterial color={COL.frame} roughness={0.7} />;
  const glassMat = (
    <meshStandardMaterial color={COL.glass} transparent opacity={0.45} roughness={0.12} metalness={0.1} />
  );

  const jambs = (
    <>
      <mesh position={[-w / 2 + jamb / 2, (sill + head) / 2, 0]}>
        <boxGeometry args={[jamb, head - sill, t * 0.9]} />
        {frameMat}
      </mesh>
      <mesh position={[w / 2 - jamb / 2, (sill + head) / 2, 0]}>
        <boxGeometry args={[jamb, head - sill, t * 0.9]} />
        {frameMat}
      </mesh>
      <mesh position={[0, head - jamb / 2, 0]}>
        <boxGeometry args={[w, jamb, t * 0.9]} />
        {frameMat}
      </mesh>
    </>
  );

  switch (o.kind) {
    case "window":
      return (
        <group>
          {jambs}
          <mesh position={[0, sill + jamb / 2, 0]}>
            <boxGeometry args={[w, jamb, t * 1.15]} />
            {frameMat}
          </mesh>
          <mesh position={[0, (sill + head) / 2, 0]}>
            <boxGeometry args={[w - jamb * 2, head - sill - jamb, t * 0.2]} />
            {glassMat}
          </mesh>
          <mesh position={[0, (sill + head) / 2, 0]}>
            <boxGeometry args={[jamb * 0.5, head - sill - jamb, t * 0.25]} />
            {frameMat}
          </mesh>
        </group>
      );
    case "patio-door": {
      const panel = (w - jamb * 2) / 2;
      return (
        <group>
          {jambs}
          <mesh position={[-panel / 2, head / 2, t * 0.12]}>
            <boxGeometry args={[panel, head - jamb, t * 0.16]} />
            {glassMat}
          </mesh>
          <mesh position={[panel / 2, head / 2, -t * 0.12]}>
            <boxGeometry args={[panel, head - jamb, t * 0.16]} />
            {glassMat}
          </mesh>
          <mesh position={[0, head / 2, 0]}>
            <boxGeometry args={[jamb * 0.7, head, t * 0.4]} />
            {frameMat}
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[w, 0.04, t * 0.6]} />
            <meshStandardMaterial color={COL.leafOut} roughness={0.6} />
          </mesh>
        </group>
      );
    }
    case "external-door":
      return (
        <group>
          {jambs}
          <mesh position={[0, head / 2, 0]} castShadow>
            <boxGeometry args={[w - jamb * 2, head - jamb, Math.min(t * 0.5, DOOR_DEFAULTS.leafThickness * 2)]} />
            <meshStandardMaterial color={COL.leafOut} roughness={0.6} />
          </mesh>
        </group>
      );
    case "internal-door": {
      const leafW = w - jamb * 2;
      const hinge = o.swing === "right" ? 1 : -1;
      return (
        <group>
          {jambs}
          {/* leaf hinged at the swing-side jamb, held ajar */}
          <group position={[hinge < 0 ? -w / 2 + jamb : w / 2 - jamb, 0, 0]} rotation={[0, hinge * DOOR_DEFAULTS.ajarAngle, 0]}>
            <mesh position={[(-hinge * leafW) / 2, head / 2, 0]} castShadow>
              <boxGeometry args={[leafW, head - jamb, DOOR_DEFAULTS.leafThickness]} />
              <meshStandardMaterial color={COL.leafIn} roughness={0.7} />
            </mesh>
          </group>
        </group>
      );
    }
    default:
      // passage: open, header only (already part of the wall infill)
      return null;
  }
}

/** an opening recovered from a plan gap — renders its own infill + joinery */
function StandaloneOpening({ o, ceil, wallMat, xray }: { o: Opening; ceil: number; wallMat: THREE.Material; xray: boolean }) {
  const head = Math.min(o.headHeight ?? (o.kind === "window" ? WINDOW_DEFAULTS.headHeight : DOOR_DEFAULTS.height), ceil);
  const sill = o.kind === "window" ? Math.min(o.sillHeight ?? WINDOW_DEFAULTS.sillHeight, head - 0.2) : 0;
  return (
    <group>
      {ceil - head > 0.02 && (
        <mesh position={[0, (head + ceil) / 2, 0]} castShadow={!xray} material={wallMat}>
          <boxGeometry args={[o.width, ceil - head, o.wallThickness]} />
        </mesh>
      )}
      {sill > 0.02 && (
        <mesh position={[0, sill / 2, 0]} castShadow={!xray} material={wallMat}>
          <boxGeometry args={[o.width, sill, o.wallThickness]} />
        </mesh>
      )}
      <OpeningJoinery o={o} ceil={ceil} />
    </group>
  );
}

/* --------------------------------------------------------------- balcony ---- */

function Balcony({
  polygon,
  railHeight,
  X,
  Z,
  walls,
}: {
  polygon: { x: number; y: number }[];
  railHeight: number;
  X: (x: number) => number;
  Z: (y: number) => number;
  walls: Wall[];
}) {
  const parts = useMemo(() => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of polygon) {
      x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
    }
    // rail every edge whose midpoint is clear of the building's walls
    const rails: { x: number; y: number; len: number; along: "x" | "y" }[] = [];
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i];
      const b = polygon[(i + 1) % polygon.length];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      let nearWall = false;
      for (const w of walls) {
        const dx = w.b.x - w.a.x, dy = w.b.y - w.a.y;
        const L2 = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((mx - w.a.x) * dx + (my - w.a.y) * dy) / L2));
        const px = w.a.x + dx * t, py = w.a.y + dy * t;
        if (Math.hypot(mx - px, my - py) < 0.35) { nearWall = true; break; }
      }
      if (nearWall) continue;
      const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
      rails.push({ x: mx, y: my, len: Math.hypot(b.x - a.x, b.y - a.y), along: horizontal ? "x" : "y" });
    }
    return { x0, y0, x1, y1, rails };
  }, [polygon, walls]);

  const t = BALCONY_DEFAULTS.railThickness;
  return (
    <group>
      <mesh position={[X((parts.x0 + parts.x1) / 2), 0.02, Z((parts.y0 + parts.y1) / 2)]} receiveShadow>
        <boxGeometry args={[parts.x1 - parts.x0, 0.1, parts.y1 - parts.y0]} />
        <meshStandardMaterial color={COL.balcony} roughness={0.9} />
      </mesh>
      {parts.rails.map((r, i) => (
        <mesh key={i} position={[X(r.x), railHeight / 2 + 0.07, Z(r.y)]} castShadow>
          <boxGeometry args={r.along === "x" ? [r.len, railHeight, t] : [t, railHeight, r.len]} />
          <meshStandardMaterial color={COL.rail} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------ room labels --- */

function RoomLabel({ text, position }: { text: string; position: [number, number, number] }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.font = "600 44px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(30,42,51,0.85)";
    ctx.fillText(text, 256, 64);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }, [text]);
  return (
    <sprite position={position} scale={[2.6, 0.65, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} />
    </sprite>
  );
}
