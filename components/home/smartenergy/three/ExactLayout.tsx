"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanLayout, WallBox } from "@/lib/planLayout";
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
  // Without scale we fall back to the legacy proportions.
  const spec = layout.house ?? DEFAULT_HOUSE_SPEC;
  const wpm = layout.scale?.worldPerMetre ?? null;
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

  useEffect(() => {
    heights.current = new Float32Array(boxes.length).fill(view === "plan" ? LOW : CEIL);
  }, [boxes, view]);

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
    </group>
  );
}
