"use client";

import { useMemo } from "react";

/**
 * Modern British two-storey property with a tasteful architectural cutaway:
 * the façade (camera-facing side) is left open so interior services are visible,
 * while real side/back walls, floor slabs and a pitched roof keep it reading as a
 * building — not a dollhouse. Palette shifts with day / night.
 */
export function House({ isDay, dim }: { isDay: boolean; dim: number }) {
  const c = useMemo(
    () =>
      isDay
        ? { ext: "#dccfbd", extDark: "#cbbba4", interior: "#eef2f7", floor: "#caa274", roof: "#63718e", ground: "#cfe0c6", drive: "#b9c2cc", glass: "#bcd8ec" }
        : { ext: "#36435f", extDark: "#2c3855", interior: "#243b55", floor: "#5a4a38", roof: "#333e5c", ground: "#182a1c", drive: "#2a3548", glass: "#12213a" },
    [isDay]
  );
  const wallOpacity = dim;

  const wallMat = (color: string, opacity = 1) => (
    <meshStandardMaterial color={color} roughness={0.85} metalness={0.02} transparent opacity={opacity} />
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

      {/* ---- shell (open façade toward +z) ---- */}
      <group>
        {/* back wall */}
        <mesh position={[0, 2.3, -2]} castShadow receiveShadow>
          <boxGeometry args={[6.2, 4.6, 0.16]} />
          {wallMat(c.ext, wallOpacity)}
        </mesh>
        {/* left wall */}
        <mesh position={[-3, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 4.6, 4]} />
          {wallMat(c.extDark, wallOpacity)}
        </mesh>
        {/* right wall */}
        <mesh position={[3, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 4.6, 4]} />
          {wallMat(c.extDark, wallOpacity)}
        </mesh>
        {/* ground-floor slab */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[6.2, 0.12, 4]} />
          <meshStandardMaterial color={c.floor} roughness={0.75} />
        </mesh>
        {/* mid floor */}
        <mesh position={[0, 2.4, -0.2]} receiveShadow>
          <boxGeometry args={[6.2, 0.14, 3.6]} />
          <meshStandardMaterial color={c.floor} roughness={0.75} transparent opacity={wallOpacity} />
        </mesh>
        {/* utility partition (right, ground) */}
        <mesh position={[1.3, 1.2, -0.4]}>
          <boxGeometry args={[0.1, 2.3, 3.2]} />
          {wallMat(c.interior, wallOpacity * 0.9)}
        </mesh>

        {/* windows on side walls */}
        <mesh position={[-3.02, 3.4, 0.6]}>
          <boxGeometry args={[0.04, 0.9, 1.1]} />
          <meshStandardMaterial color={c.glass} roughness={0.1} metalness={0.3} emissive={isDay ? "#000" : "#ffd98a"} emissiveIntensity={isDay ? 0 : 0.35} />
        </mesh>
        <mesh position={[3.02, 1.2, 0.6]}>
          <boxGeometry args={[0.04, 0.9, 1.1]} />
          <meshStandardMaterial color={c.glass} roughness={0.1} metalness={0.3} emissive={isDay ? "#000" : "#ffd98a"} emissiveIntensity={isDay ? 0 : 0.35} />
        </mesh>
      </group>

      {/* ---- pitched roof ---- */}
      {/* front slope (holds solar) */}
      <mesh position={[0, 5.42, 1.0]} rotation={[-0.675, 0, 0]} castShadow>
        <boxGeometry args={[6.5, 0.16, 2.65]} />
        <meshStandardMaterial color={c.roof} roughness={0.7} />
      </mesh>
      {/* back slope */}
      <mesh position={[0, 5.42, -1.0]} rotation={[0.675, 0, 0]} castShadow>
        <boxGeometry args={[6.5, 0.16, 2.65]} />
        <meshStandardMaterial color={c.roof} roughness={0.7} />
      </mesh>
      {/* gable ends (triangles) */}
      {[-3.2, 3.2].map((x) => (
        <mesh key={x} position={[x, 5.03, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([0, -0.43, 2, 0, -0.43, -2, 0, 1.17, 0]), 3]}
            />
          </bufferGeometry>
          {wallMat(c.extDark, wallOpacity)}
        </mesh>
      ))}
    </group>
  );
}
