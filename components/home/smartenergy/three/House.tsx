"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Modern British two-storey property, fully rotatable (360°).
 *
 * Instead of a fixed open façade, the house is complete on all four sides and
 * the ROOF is separated upward (architectural exploded style) so the interior
 * reads from every angle. Whichever WALLS currently sit between the camera and
 * the interior fade out automatically each frame, so wherever the visitor
 * orbits they always see inside — without the house ever looking broken.
 */

/** Vertical separation between the walls and the lifted roof. */
const LIFT = 1.05;

const WALL_NORMALS = {
  front: new THREE.Vector3(0, 0, 1),
  back: new THREE.Vector3(0, 0, -1),
  left: new THREE.Vector3(-1, 0, 0),
  right: new THREE.Vector3(1, 0, 0),
} as const;

type WallId = keyof typeof WALL_NORMALS;

export function House({ isDay, dim }: { isDay: boolean; dim: number }) {
  const c = useMemo(
    () =>
      isDay
        ? { ext: "#dccfbd", extDark: "#cbbba4", interior: "#eef2f7", floor: "#caa274", roof: "#63718e", ground: "#cfe0c6", drive: "#b9c2cc", glass: "#bcd8ec" }
        : { ext: "#36435f", extDark: "#2c3855", interior: "#243b55", floor: "#5a4a38", roof: "#333e5c", ground: "#182a1c", drive: "#2a3548", glass: "#12213a" },
    [isDay]
  );

  // one material list per wall — every mesh belonging to that wall fades together
  const wallMats = useRef<Record<WallId, THREE.MeshStandardMaterial[]>>({
    front: [],
    back: [],
    left: [],
    right: [],
  });
  const register = (wall: WallId) => (m: THREE.MeshStandardMaterial | null) => {
    if (m && !wallMats.current[wall].includes(m)) wallMats.current[wall].push(m);
  };

  const camDir = useRef(new THREE.Vector3());
  useFrame((state) => {
    camDir.current.copy(state.camera.position).setY(0).normalize();
    (Object.keys(WALL_NORMALS) as WallId[]).forEach((k) => {
      const facing = camDir.current.dot(WALL_NORMALS[k]);
      // wall sits between camera and interior → fade it out
      const target = (facing > 0.22 ? 0.1 : 1) * dim;
      wallMats.current[k].forEach((m) => {
        m.opacity += (target - m.opacity) * 0.14;
      });
    });
  });

  const wallMat = (wall: WallId, color: string) => (
    <meshStandardMaterial ref={register(wall)} color={color} roughness={0.85} metalness={0.02} transparent opacity={1} />
  );
  const glassMat = (wall: WallId) => (
    <meshStandardMaterial
      ref={register(wall)}
      color={c.glass}
      roughness={0.1}
      metalness={0.3}
      transparent
      opacity={1}
      emissive={isDay ? "#000000" : "#ffd98a"}
      emissiveIntensity={isDay ? 0 : 0.35}
    />
  );

  return (
    <group>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[34, 22]} />
        <meshStandardMaterial color={c.ground} roughness={1} />
      </mesh>
      {/* driveway (right side, for EV) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.4, 0, 1.9]} receiveShadow>
        <planeGeometry args={[4.2, 4]} />
        <meshStandardMaterial color={c.drive} roughness={0.95} />
      </mesh>

      {/* ---- walls (each fades when it blocks the camera's view inside) ---- */}
      <group>
        {/* back */}
        <mesh position={[0, 2.3, -2]} castShadow receiveShadow>
          <boxGeometry args={[6.2, 4.6, 0.16]} />
          {wallMat("back", c.ext)}
        </mesh>
        <mesh position={[-1.4, 3.4, -2.02]}>
          <boxGeometry args={[1.1, 0.9, 0.05]} />
          {glassMat("back")}
        </mesh>
        {/* front */}
        <mesh position={[0, 2.3, 2]} castShadow receiveShadow>
          <boxGeometry args={[6.2, 4.6, 0.16]} />
          {wallMat("front", c.ext)}
        </mesh>
        <mesh position={[1.5, 3.4, 2.02]}>
          <boxGeometry args={[1.2, 0.9, 0.05]} />
          {glassMat("front")}
        </mesh>
        {/* door on the front */}
        <mesh position={[-1.9, 1.05, 2.02]}>
          <boxGeometry args={[0.85, 2.0, 0.06]} />
          {wallMat("front", isDay ? "#8a97ab" : "#232f4a")}
        </mesh>
        {/* left */}
        <mesh position={[-3, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 4.6, 4]} />
          {wallMat("left", c.extDark)}
        </mesh>
        <mesh position={[-3.02, 3.4, 0.6]}>
          <boxGeometry args={[0.05, 0.9, 1.1]} />
          {glassMat("left")}
        </mesh>
        {/* right */}
        <mesh position={[3, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 4.6, 4]} />
          {wallMat("right", c.extDark)}
        </mesh>
        <mesh position={[3.02, 1.2, 0.6]}>
          <boxGeometry args={[0.05, 0.9, 1.1]} />
          {glassMat("right")}
        </mesh>
      </group>

      {/* ---- floors & partition (stay solid so rooms read) ---- */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[6.2, 0.12, 4]} />
        <meshStandardMaterial color={c.floor} roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.4, -0.2]} receiveShadow>
        <boxGeometry args={[6.2, 0.14, 3.6]} />
        <meshStandardMaterial color={c.floor} roughness={0.75} transparent opacity={dim} />
      </mesh>
      <mesh position={[1.3, 1.2, -0.4]}>
        <boxGeometry args={[0.1, 2.3, 3.2]} />
        <meshStandardMaterial color={c.interior} roughness={0.85} transparent opacity={dim * 0.9} />
      </mesh>

      {/* ---- complete pitched roof, separated upward so the inside stays visible ---- */}
      <group position={[0, LIFT, 0]}>
        {/* front slope (holds solar) — ridge high at z=0, eave low toward +z */}
        <mesh position={[0, 5.42, 1.0]} rotation={[0.675, 0, 0]} castShadow>
          <boxGeometry args={[6.7, 0.16, 2.65]} />
          <meshStandardMaterial color={c.roof} roughness={0.7} />
        </mesh>
        {/* back slope — ridge high at z=0, eave low toward -z */}
        <mesh position={[0, 5.42, -1.0]} rotation={[-0.675, 0, 0]} castShadow>
          <boxGeometry args={[6.7, 0.16, 2.65]} />
          <meshStandardMaterial color={c.roof} roughness={0.7} />
        </mesh>
        {/* ridge cap */}
        <mesh position={[0, 6.28, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 6.72, 8]} />
          <meshStandardMaterial color={c.roof} roughness={0.6} />
        </mesh>
        {/* gable ends travel with the roof */}
        {[-3.28, 3.28].map((x) => (
          <mesh key={x} position={[x, 5.03, 0]}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([0, -0.43, 2, 0, -0.43, -2, 0, 1.17, 0]), 3]}
              />
            </bufferGeometry>
            <meshStandardMaterial color={c.extDark} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
