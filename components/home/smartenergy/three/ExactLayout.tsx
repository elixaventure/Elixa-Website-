"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanLayout, PlanOpening, WallBox } from "@/lib/planLayout";
import { DEFAULT_HOUSE_SPEC } from "@/lib/houseModel";

export type LayoutView = "dollhouse" | "full" | "plan" | "xray";

/**
 * The customer's floor plan extruded into an architectural dollhouse.
 *
 * Structural height is constant (CEIL); presentation height is derived per
 * frame and never mutates the extracted data:
 * - Dollhouse (default): exterior walls facing the camera sink to plinth
 *   height so the interior stays visible while orbiting; the far exterior
 *   walls stay full so the property's shape reads; interior walls sit at
 *   dollhouse height. Continuously updates as the camera moves.
 * - Full house: everything at full height (exterior check).
 * - Floor plan: all walls low, camera drifts overhead.
 * - X-ray: full height, semi-transparent (technical view).
 */
export function ExactLayout({
  layout,
  planUrl,
  isDay,
  view = "dollhouse",
}: {
  layout: PlanLayout;
  planUrl?: string | null;
  isDay: boolean;
  view?: LayoutView;
}) {
  // structural height comes from the house spec once real-world scale is
  // known (floor area supplied): ceilingHeight metres × world-units/metre.
  // Without an area, scale is estimated from the measured wall thickness
  // (~280 mm) so a long narrow building never gets billboard-height walls;
  // the legacy fixed height only remains for layouts with no metrics at all.
  const spec = layout.house ?? DEFAULT_HOUSE_SPEC;
  const m = layout.metrics;
  const wpm =
    layout.scale?.worldPerMetre ??
    (m && m.wallPx > 0 ? (m.worldPerPx * m.wallPx) / 0.28 : null);
  const CEIL = wpm ? spec.ceilingHeight * wpm : 2.1; // structural wall height
  const INNER = wpm ? Math.min(CEIL * 0.45, 1.05 * wpm) : 0.95; // dollhouse interior display height
  const PLINTH = wpm ? 0.42 * wpm : 0.35; // camera-facing exterior cutaway height
  const LOW = wpm ? 0.35 * wpm : 0.3; // floor-plan mode height

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const heights = useRef<Float32Array | null>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const controls = useThree((s) => s.controls) as { target?: THREE.Vector3 } | null;

  const boxes: WallBox[] = layout.boxes;
  const openings: PlanOpening[] = layout.openings ?? [];
  const openRefs = useRef<(THREE.Group | null)[]>([]);
  const openScales = useRef<Float32Array | null>(null);

  useEffect(() => {
    heights.current = new Float32Array(boxes.length).fill(view === "plan" ? LOW : CEIL);
    openScales.current = new Float32Array(openings.length).fill(1);
  }, [boxes, openings, view]);

  useEffect(() => {
    if (!planUrl) return;
    let cancelled = false;
    new THREE.TextureLoader().load(planUrl, (t) => {
      if (cancelled) {
        t.dispose();
        return;
      }
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.offset.set(layout.crop.ox, 1 - layout.crop.oy - layout.crop.rh);
      t.repeat.set(layout.crop.rw, layout.crop.rh);
      setTex(t);
    });
    return () => {
      cancelled = true;
    };
  }, [planUrl, layout]);

  useEffect(() => () => tex?.dispose(), [tex]);

  useFrame((state) => {
    const m = meshRef.current;
    const hs = heights.current;
    if (!m || !hs || hs.length !== boxes.length) return;

    camDir.copy(state.camera.position).setY(0).normalize();

    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      let target = CEIL;
      if (view === "plan") target = LOW;
      else if (view === "full" || view === "xray") target = CEIL;
      else {
        // dollhouse
        if (b.ext) {
          const facing = (b.nx ?? 0) * camDir.x + (b.nz ?? 0) * camDir.z;
          target = facing > 0.2 ? PLINTH : CEIL;
        } else {
          target = INNER;
        }
      }
      hs[i] += (target - hs[i]) * 0.14;
      dummy.position.set(b.x, hs[i] / 2 + 0.06, b.z);
      dummy.scale.set(b.w, hs[i], b.d);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    // joinery follows its wall's display height (squashes with the cutaway)
    const os = openScales.current;
    if (os && os.length === openings.length) {
      for (let i = 0; i < openings.length; i++) {
        const g = openRefs.current[i];
        if (!g) continue;
        const o = openings[i];
        let ratio = 1;
        if (view === "plan") ratio = LOW / CEIL;
        else if (view === "dollhouse") {
          if (o.ext) {
            const facing = (o.nx ?? 0) * camDir.x + (o.nz ?? 0) * camDir.z;
            ratio = facing > 0.2 ? PLINTH / CEIL : 1;
          } else {
            ratio = INNER / CEIL;
          }
        }
        os[i] += (ratio - os[i]) * 0.14;
        g.scale.y = os[i];
      }
    }

    // floor-plan mode: drift the camera overhead (never fights the user hard)
    if (view === "plan") {
      const cam = state.camera;
      const top = new THREE.Vector3(0.01, 15, 0.01);
      cam.position.lerp(top, 0.06);
      controls?.target?.lerp(new THREE.Vector3(0, 0, 0), 0.08);
    }
  });

  const wallColor = isDay ? "#efe9df" : "#4a5674";
  const xray = view === "xray";

  return (
    <group>
      {/* base slab */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[layout.floorW + 0.7, 0.1, layout.floorD + 0.7]} />
        <meshStandardMaterial color={isDay ? "#d6dde6" : "#2a3550"} roughness={0.85} />
      </mesh>
      {/* the plan as the floor finish */}
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[layout.floorW, layout.floorD]} />
        {tex ? (
          <meshStandardMaterial map={tex} roughness={0.8} />
        ) : (
          <meshStandardMaterial color="#f5f2ec" roughness={0.85} />
        )}
      </mesh>
      {/* walls — presentation height animated per frame, data untouched */}
      <instancedMesh
        key={`${boxes.length}-${xray ? "x" : "s"}`}
        ref={meshRef}
        args={[undefined, undefined, boxes.length]}
        castShadow={!xray}
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={0.8}
          metalness={0.02}
          transparent={xray}
          opacity={xray ? 0.3 : 1}
          depthWrite={!xray}
        />
      </instancedMesh>

      {/* joinery — classified openings become real windows and doors */}
      {openings.map((o, i) => (
        <group
          key={o.id}
          position={[o.x, 0.06, o.z]}
          rotation={[0, o.along === "z" ? Math.PI / 2 : 0, 0]}
          ref={(el) => {
            openRefs.current[i] = el;
          }}
        >
          <OpeningJoinery o={o} ceil={CEIL} metre={wpm ?? CEIL / 2.4} />
        </group>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------- joinery --- */

const FRAME = "#f7f4ee";
const GLASS = "#aecfe8";
const LEAF_IN = "#e9e3d9";
const LEAF_OUT = "#7c8ca1";

/**
 * Placeholder architectural joinery for one classified opening, authored in
 * local space: width along x, wall thickness along z, y up from the slab.
 */
function OpeningJoinery({ o, ceil, metre }: { o: PlanOpening; ceil: number; metre: number }) {
  const sill = Math.min(0.9 * metre, ceil * 0.42);
  const top = Math.min(2.0 * metre, ceil * 0.9);
  const w = o.w;
  const t = o.t;
  const jamb = Math.min(0.07 * metre, w * 0.12);
  const header = (
    <mesh position={[0, (top + ceil) / 2, 0]} castShadow>
      <boxGeometry args={[w, Math.max(ceil - top, 0.02), t]} />
      <meshStandardMaterial color={FRAME} roughness={0.8} />
    </mesh>
  );
  const jambs = (
    <>
      <mesh position={[-w / 2 + jamb / 2, top / 2, 0]}>
        <boxGeometry args={[jamb, top, t]} />
        <meshStandardMaterial color={FRAME} roughness={0.7} />
      </mesh>
      <mesh position={[w / 2 - jamb / 2, top / 2, 0]}>
        <boxGeometry args={[jamb, top, t]} />
        <meshStandardMaterial color={FRAME} roughness={0.7} />
      </mesh>
    </>
  );

  switch (o.type) {
    case "window":
      return (
        <group>
          {/* wall below and above the glass stays solid */}
          <mesh position={[0, sill / 2, 0]} castShadow>
            <boxGeometry args={[w, sill, t]} />
            <meshStandardMaterial color={FRAME} roughness={0.8} />
          </mesh>
          {header}
          {jambs}
          {/* glazing */}
          <mesh position={[0, (sill + top) / 2, 0]}>
            <boxGeometry args={[w - jamb * 2, top - sill, t * 0.25]} />
            <meshStandardMaterial color={GLASS} transparent opacity={0.45} roughness={0.15} metalness={0.1} />
          </mesh>
          {/* centre glazing bar */}
          <mesh position={[0, (sill + top) / 2, 0]}>
            <boxGeometry args={[jamb * 0.6, top - sill, t * 0.3]} />
            <meshStandardMaterial color={FRAME} roughness={0.7} />
          </mesh>
        </group>
      );
    case "patio-door": {
      const panel = (w - jamb * 2) / 2;
      return (
        <group>
          {header}
          {jambs}
          {/* two sliding glazed panels, one set slightly proud */}
          <mesh position={[-panel / 2, top / 2, t * 0.12]}>
            <boxGeometry args={[panel, top, t * 0.18]} />
            <meshStandardMaterial color={GLASS} transparent opacity={0.4} roughness={0.15} metalness={0.1} />
          </mesh>
          <mesh position={[panel / 2, top / 2, -t * 0.12]}>
            <boxGeometry args={[panel, top, t * 0.18]} />
            <meshStandardMaterial color={GLASS} transparent opacity={0.4} roughness={0.15} metalness={0.1} />
          </mesh>
          {/* mullion + track */}
          <mesh position={[0, top / 2, 0]}>
            <boxGeometry args={[jamb * 0.8, top, t * 0.4]} />
            <meshStandardMaterial color={FRAME} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.02 * metre, 0]}>
            <boxGeometry args={[w, 0.04 * metre, t * 0.6]} />
            <meshStandardMaterial color={LEAF_OUT} roughness={0.6} />
          </mesh>
        </group>
      );
    }
    case "external-door":
      return (
        <group>
          {header}
          {jambs}
          <mesh position={[0, top / 2, 0]} castShadow>
            <boxGeometry args={[w - jamb * 2, top, t * 0.45]} />
            <meshStandardMaterial color={LEAF_OUT} roughness={0.6} />
          </mesh>
        </group>
      );
    case "internal-door": {
      const leafW = w - jamb * 2;
      return (
        <group>
          {header}
          {jambs}
          {/* leaf hinged at the left jamb, ajar for the dollhouse look */}
          <group position={[-w / 2 + jamb, 0, 0]} rotation={[0, 0.5, 0]}>
            <mesh position={[leafW / 2, top / 2, 0]} castShadow>
              <boxGeometry args={[leafW, top, Math.min(t * 0.22, 0.05 * metre)]} />
              <meshStandardMaterial color={LEAF_IN} roughness={0.7} />
            </mesh>
          </group>
        </group>
      );
    }
    default:
      // open-passage: header only
      return header;
  }
}
