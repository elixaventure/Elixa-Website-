"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { homeHalfWidth, homeWallHeight, type HomeConfig } from "./graph";

/**
 * Parametric modern British property, fully rotatable (360°).
 *
 * The shell is generated from the customer's HomeConfig — bedroom count sets
 * the footprint width, storeys set the height (two-storey or bungalow) and
 * larger homes gain upstairs room divisions. The complete pitched roof is
 * separated upward (architectural exploded style) so the interior reads from
 * every angle, and whichever walls sit between the camera and the interior
 * fade out automatically each frame.
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

export function House({ isDay, dim, home }: { isDay: boolean; dim: number; home: HomeConfig }) {
  const c = useMemo(
    () =>
      isDay
        ? { ext: "#dccfbd", extDark: "#cbbba4", interior: "#eef2f7", floor: "#caa274", roof: "#63718e", ground: "#cfe0c6", drive: "#b9c2cc", glass: "#bcd8ec" }
        : { ext: "#36435f", extDark: "#2c3855", interior: "#243b55", floor: "#5a4a38", roof: "#333e5c", ground: "#182a1c", drive: "#2a3548", glass: "#12213a" },
    [isDay]
  );

  const hx = homeHalfWidth(home); // half-width of footprint
  const H = homeWallHeight(home); // wall height
  const two = home.storeys === 2;
  const W = hx * 2 + 0.2; // wall span
  const roofY = H + 0.82; // slope centre height (pre-lift)
  const ridgeY = H + 1.68;
  const gableY = H + 0.43;

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
        <planeGeometry args={[36, 22]} />
        <meshStandardMaterial color={c.ground} roughness={1} />
      </mesh>
      {/* driveway (right side, for EV) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[hx + 1.5, 0, 1.9]} receiveShadow>
        <planeGeometry args={[4.2, 4]} />
        <meshStandardMaterial color={c.drive} roughness={0.95} />
      </mesh>

      {/* ---- walls (each fades when it blocks the camera's view inside) ---- */}
      <group>
        {/* back */}
        <mesh position={[0, H / 2, -2]} castShadow receiveShadow>
          <boxGeometry args={[W, H, 0.16]} />
          {wallMat("back", c.ext)}
        </mesh>
        <mesh position={[-1.4, two ? 3.4 : 1.5, -2.02]}>
          <boxGeometry args={[1.1, 0.9, 0.05]} />
          {glassMat("back")}
        </mesh>
        {/* front */}
        <mesh position={[0, H / 2, 2]} castShadow receiveShadow>
          <boxGeometry args={[W, H, 0.16]} />
          {wallMat("front", c.ext)}
        </mesh>
        <mesh position={[1.5, two ? 3.4 : 1.5, 2.02]}>
          <boxGeometry args={[1.2, 0.9, 0.05]} />
          {glassMat("front")}
        </mesh>
        {/* door on the front */}
        <mesh position={[-1.9, 1.05, 2.02]}>
          <boxGeometry args={[0.85, 2.0, 0.06]} />
          {wallMat("front", isDay ? "#8a97ab" : "#232f4a")}
        </mesh>
        {/* left */}
        <mesh position={[-hx, H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, H, 4]} />
          {wallMat("left", c.extDark)}
        </mesh>
        <mesh position={[-hx - 0.02, two ? 3.4 : 1.5, 0.6]}>
          <boxGeometry args={[0.05, 0.9, 1.1]} />
          {glassMat("left")}
        </mesh>
        {/* right */}
        <mesh position={[hx, H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, H, 4]} />
          {wallMat("right", c.extDark)}
        </mesh>
        <mesh position={[hx + 0.02, 1.2, 0.6]}>
          <boxGeometry args={[0.05, 0.9, 1.1]} />
          {glassMat("right")}
        </mesh>
      </group>

      {/* ---- floors & partitions ---- */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[W, 0.12, 4]} />
        <meshStandardMaterial color={c.floor} roughness={0.75} />
      </mesh>
      {two && (
        <mesh position={[0, 2.4, -0.2]} receiveShadow>
          <boxGeometry args={[W, 0.14, 3.6]} />
          <meshStandardMaterial color={c.floor} roughness={0.75} transparent opacity={dim} />
        </mesh>
      )}
      {/* ---- interior room plan (parametric) ---- */}
      {/* utility partition (ground, right) */}
      <mesh position={[1.3, 1.2, -0.4]}>
        <boxGeometry args={[0.1, 2.3, 3.2]} />
        <meshStandardMaterial color={c.interior} roughness={0.85} transparent opacity={dim * 0.9} />
      </mesh>
      {/* lounge / kitchen-diner partition (ground, left) with doorway gap */}
      <mesh position={[(-hx + 0.7) / 2, 1.2, 0.2]}>
        <boxGeometry args={[hx + 0.7 - 0.6, 2.3, 0.08]} />
        <meshStandardMaterial color={c.interior} roughness={0.85} transparent opacity={dim * 0.9} />
      </mesh>
      {/* bathroom walls around the shower corner (upstairs, or ground in a bungalow) */}
      <mesh position={[(1.1 + hx) / 2, two ? 3.5 : 1.2, -0.6]}>
        <boxGeometry args={[hx - 1.1, two ? 2.05 : 2.3, 0.08]} />
        <meshStandardMaterial color={c.interior} roughness={0.85} transparent opacity={dim * 0.9} />
      </mesh>
      {two && (
        <mesh position={[1.1, 3.5, -1.3]}>
          <boxGeometry args={[0.08, 2.05, 1.4]} />
          <meshStandardMaterial color={c.interior} roughness={0.85} transparent opacity={dim * 0.9} />
        </mesh>
      )}
      {/* upstairs bedroom divisions grow with the bedroom count */}
      {two &&
        (home.bedrooms >= 4 ? [-hx * 0.34, hx * 0.4] : [0.2])
          .slice(0, home.bedrooms - 2)
          .map((x) => (
            <mesh key={x} position={[x, 3.5, 0.35]}>
              <boxGeometry args={[0.08, 2.05, 3.2]} />
              <meshStandardMaterial color={c.interior} roughness={0.85} transparent opacity={dim * 0.9} />
            </mesh>
          ))}

      <RoomLabels home={home} isDay={isDay} dim={dim} />

      {/* ---- complete pitched roof, separated upward ---- */}
      <group position={[0, LIFT, 0]}>
        {/* front slope (holds solar) — ridge high at z=0, eave low toward +z */}
        <mesh position={[0, roofY, 1.0]} rotation={[0.675, 0, 0]} castShadow>
          <boxGeometry args={[W + 0.5, 0.16, 2.65]} />
          <meshStandardMaterial color={c.roof} roughness={0.7} />
        </mesh>
        {/* back slope */}
        <mesh position={[0, roofY, -1.0]} rotation={[-0.675, 0, 0]} castShadow>
          <boxGeometry args={[W + 0.5, 0.16, 2.65]} />
          <meshStandardMaterial color={c.roof} roughness={0.7} />
        </mesh>
        {/* ridge cap */}
        <mesh position={[0, ridgeY, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, W + 0.52, 8]} />
          <meshStandardMaterial color={c.roof} roughness={0.6} />
        </mesh>
        {/* gable ends travel with the roof */}
        {[-(hx + 0.28), hx + 0.28].map((x) => (
          <mesh key={x} position={[x, gableY, 0]}>
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

/** Floating room names — always face the camera, follow the parametric plan. */
function RoomLabels({ home, isDay, dim }: { home: HomeConfig; isDay: boolean; dim: number }) {
  const hx = homeHalfWidth(home);
  const two = home.storeys === 2;
  const labels: { text: string; pos: [number, number, number] }[] = [
    { text: "Lounge", pos: [-(hx - 1.4), 1.5, 1.15] },
    { text: "Kitchen · Dining", pos: [-(hx - 1.5), 1.5, -1.0] },
    { text: "Utility", pos: [(1.3 + hx) / 2 + 0.2, 1.5, -1.2] },
  ];
  if (two) {
    // bedrooms spread across the first floor, bathroom over the shower corner
    const n = home.bedrooms;
    for (let i = 0; i < n; i++) {
      const x = -hx + ((i + 0.5) * 2 * hx) / n;
      // keep the last label clear of the bathroom corner
      if (i === n - 1) {
        labels.push({ text: `Bedroom ${i + 1}`, pos: [Math.min(x, hx - 1.1), 3.7, 1.0] });
      } else {
        labels.push({ text: `Bedroom ${i + 1}`, pos: [x, 3.7, 0.3] });
      }
    }
    labels.push({ text: "Bathroom", pos: [(1.1 + hx) / 2 + 0.15, 3.7, -1.35] });
  } else {
    labels.push({ text: "Bathroom", pos: [(1.1 + hx) / 2 + 0.15, 1.5, -1.35] });
  }
  return (
    <group>
      {labels.map((l) => (
        <RoomLabel key={`${l.text}${l.pos[0]}`} text={l.text} pos={l.pos} isDay={isDay} dim={dim} />
      ))}
    </group>
  );
}

/**
 * Camera-facing text sprite drawn to an in-memory canvas — fully
 * self-contained (no font fetch, works offline and under strict CSP).
 */
function RoomLabel({ text, pos, isDay, dim }: { text: string; pos: [number, number, number]; isDay: boolean; dim: number }) {
  const { texture, aspect } = useMemo(() => {
    const fs = 44;
    const pad = 20;
    const measure = document.createElement("canvas").getContext("2d")!;
    measure.font = `600 ${fs}px Inter, system-ui, sans-serif`;
    const tw = Math.ceil(measure.measureText(text).width);
    const canvas = document.createElement("canvas");
    canvas.width = tw + pad * 2;
    canvas.height = fs + pad * 1.6;
    const ctx = canvas.getContext("2d")!;
    // soft pill behind the text for legibility against the interior
    ctx.fillStyle = isDay ? "rgba(255,255,255,0.72)" : "rgba(13,23,48,0.72)";
    const r = canvas.height / 2;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, r);
    ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, r);
    ctx.arcTo(0, canvas.height, 0, 0, r);
    ctx.arcTo(0, 0, canvas.width, 0, r);
    ctx.fill();
    ctx.font = `600 ${fs}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isDay ? "#33445e" : "#d7e2f2";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
    const t = new THREE.CanvasTexture(canvas);
    t.anisotropy = 4;
    return { texture: t, aspect: canvas.width / canvas.height };
  }, [text, isDay]);

  const h = 0.3;
  return (
    <sprite position={pos} scale={[h * aspect, h, 1]}>
      <spriteMaterial map={texture} transparent opacity={0.95 * dim} depthWrite={false} toneMapped={false} />
    </sprite>
  );
}
