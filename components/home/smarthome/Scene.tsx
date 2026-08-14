"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import type { IconKey } from "@/content/services";
import { hotspots } from "./hotspots";

const GREEN = "#6ABF4B";
const CYAN = "#1D9ED9";
const NAVY = "#1A3A6B";

function useHighlight(active: IconKey | null, id: IconKey) {
  return active === id;
}

/** Small animated airflow cones for the AC unit (blue = cool, warm = heat). */
function Airflow({ mode }: { mode: "cool" | "heat" }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.children.forEach((c, i) => {
      c.position.y -= dt * (0.5 + i * 0.05);
      c.position.z += dt * 0.25;
      if (c.position.y < 0.4) {
        c.position.y = 1.35;
        c.position.z = 1.55;
      }
    });
  });
  const color = mode === "cool" ? CYAN : "#f5a13a";
  return (
    <group ref={ref} position={[0.7, 0, 0]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[(i % 3 - 1) * 0.18, 1.35 - i * 0.12, 1.55]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.06, 0.16, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function House({ active }: { active: IconKey | null }) {
  const solarOn = useHighlight(active, "solar");
  const hpOn = useHighlight(active, "heatpump");
  const acOn = useHighlight(active, "aircon");
  const evOn = useHighlight(active, "ev");
  const batOn = useHighlight(active, "battery");

  return (
    <group position={[0, -0.4, 0]}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[7, 48]} />
        <meshStandardMaterial color="#eaf1f7" />
      </mesh>

      {/* House body */}
      <mesh position={[0, 1, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2, 2.6]} />
        <meshStandardMaterial color="#f4f7fb" />
      </mesh>
      {/* Gable roof */}
      <mesh position={[0, 2.35, 0.6]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.55, 1.1, 4]} />
        <meshStandardMaterial color={NAVY} />
      </mesh>

      {/* Door + windows */}
      <mesh position={[0, 0.7, 1.91]}>
        <boxGeometry args={[0.55, 1.1, 0.06]} />
        <meshStandardMaterial color={NAVY} />
      </mesh>
      <mesh position={[-1, 1.15, 1.91]}>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[1, 1.15, 1.91]}>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.2} />
      </mesh>

      {/* Solar panels on roof */}
      <group position={[-0.85, 2.15, 1.15]} rotation={[-0.62, 0, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[(i % 2) * 0.66 - 0.33, Math.floor(i / 2) * 0.44 - 0.22, 0]} scale={solarOn ? 1.06 : 1}>
            <boxGeometry args={[0.6, 0.4, 0.04]} />
            <meshStandardMaterial
              color={solarOn ? CYAN : "#12224a"}
              emissive={solarOn ? CYAN : "#0a1836"}
              emissiveIntensity={solarOn ? 0.6 : 0.15}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Heat pump (outdoor, left) */}
      <group position={[-2.1, 0.4, 1.1]} scale={hpOn ? 1.12 : 1}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.55, 0.4]} />
          <meshStandardMaterial color={hpOn ? GREEN : "#c7d2df"} emissive={hpOn ? GREEN : "#000"} emissiveIntensity={hpOn ? 0.35 : 0} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.03, 8, 24]} />
          <meshStandardMaterial color="#8fa0b3" />
        </mesh>
      </group>

      {/* AC indoor unit (on wall) */}
      <mesh position={[0.7, 1.55, 1.92]} scale={acOn ? 1.1 : 1}>
        <boxGeometry args={[0.7, 0.22, 0.14]} />
        <meshStandardMaterial color={acOn ? CYAN : "#ffffff"} emissive={acOn ? CYAN : "#000"} emissiveIntensity={acOn ? 0.4 : 0} />
      </mesh>

      {/* Battery (wall, right) */}
      <mesh position={[1.75, 0.55, 1.3]} scale={batOn ? 1.1 : 1}>
        <boxGeometry args={[0.34, 0.7, 0.18]} />
        <meshStandardMaterial color={batOn ? GREEN : "#d3dde8"} emissive={batOn ? GREEN : "#000"} emissiveIntensity={batOn ? 0.35 : 0} />
      </mesh>

      {/* EV charger + car (right) */}
      <group position={[2.4, 0, 0.4]} scale={evOn ? 1.06 : 1}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.18, 1, 0.12]} />
          <meshStandardMaterial color={evOn ? CYAN : "#b9c6d4"} emissive={evOn ? CYAN : "#000"} emissiveIntensity={evOn ? 0.5 : 0} />
        </mesh>
        <mesh position={[-0.75, 0.3, 0.2]}>
          <boxGeometry args={[1.3, 0.4, 0.7]} />
          <meshStandardMaterial color={NAVY} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[-0.75, 0.62, 0.2]}>
          <boxGeometry args={[0.75, 0.35, 0.62]} />
          <meshStandardMaterial color="#2c4a7a" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

export default function Scene({
  active,
  acMode,
  onSelect,
}: {
  active: IconKey | null;
  acMode: "cool" | "heat";
  onSelect: (id: IconKey) => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [5.5, 3.4, 6], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#f6f9fc"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 8, 5]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 4, -3]} intensity={0.3} color={CYAN} />

      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.25}>
        <House active={active} />
        {active === "aircon" && <AcModeOverlay mode={acMode} />}
      </Float>

      {/* Hotspot pins */}
      {hotspots.map((h) => (
        <Html key={h.id} position={h.pos} center distanceFactor={9} zIndexRange={[20, 0]}>
          <button
            onClick={() => onSelect(h.id)}
            aria-label={h.label}
            className={`group relative grid h-6 w-6 place-items-center rounded-full border-2 transition-all ${
              active === h.id
                ? "scale-125 border-white bg-elixa-cyan"
                : "border-white bg-navy/80 hover:scale-110 hover:bg-elixa-cyan"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="pointer-events-none absolute -top-1 left-1/2 h-6 w-6 -translate-x-1/2 animate-pulse-ring rounded-full" />
          </button>
        </Html>
      ))}

      <ContactShadows position={[0, -0.4, 0]} opacity={0.35} scale={12} blur={2.4} far={4} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}

/** Separate overlay so AC airflow colour reflects the mode toggle. */
function AcModeOverlay({ mode }: { mode: "cool" | "heat" }) {
  return (
    <group position={[0, -0.4, 0]}>
      <Airflow mode={mode} />
    </group>
  );
}
