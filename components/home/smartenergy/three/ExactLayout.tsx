"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { PlanLayout } from "@/lib/planLayout";

/**
 * The customer's floor plan extruded into real 3D — perimeter and internal
 * walls raised from the drawing's exact positions, with the plan itself
 * draped as the floor beneath them.
 */
export function ExactLayout({ layout, planUrl, isDay }: { layout: PlanLayout; planUrl?: string | null; isDay: boolean }) {
  const WALL_H = 2.1;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);

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
      // crop the texture to the wall bounding box so floor and walls align
      t.offset.set(layout.crop.ox, 1 - layout.crop.oy - layout.crop.rh);
      t.repeat.set(layout.crop.rw, layout.crop.rh);
      setTex(t);
    });
    return () => {
      cancelled = true;
    };
  }, [planUrl, layout]);

  useEffect(() => () => tex?.dispose(), [tex]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const m = meshRef.current;
    if (!m) return;
    layout.boxes.forEach((b, i) => {
      dummy.position.set(b.x, WALL_H / 2 + 0.06, b.z);
      dummy.scale.set(b.w, WALL_H, b.d);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [layout, dummy]);

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
      {/* extruded walls, exactly where the drawing puts them */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, layout.boxes.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isDay ? "#efe9df" : "#4a5674"} roughness={0.8} metalness={0.02} />
      </instancedMesh>
    </group>
  );
}
