"use client";

/**
 * Procedural 3D product models for the Elixa interactive product studio.
 *
 * Each model is built from primitive geometry on the brand palette so the site
 * is fully interactive TODAY with no external asset dependency. When a real
 * photoreal GLB becomes available for a product, drop it in public/models/<slug>.glb
 * and ProductViewer will load that instead (see ProductViewer.tsx) — no change here.
 *
 * Every model reads an "exploded" flag from ExplodeCtx; individual <Part>s slide
 * along a direction vector to reveal internal components (the "explode view").
 */

import { createContext, useContext, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { IconKey } from "@/content/services";

export const ExplodeCtx = createContext<{ on: boolean }>({ on: false });

type Vec = [number, number, number];

/** A sub-assembly that eases toward its exploded offset and can spin. */
function Part({
  base = [0, 0, 0],
  dir = [0, 0, 0],
  spin = 0,
  children,
}: {
  base?: Vec;
  dir?: Vec;
  spin?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<Group>(null!);
  const t = useRef(0);
  const { on } = useContext(ExplodeCtx);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    t.current += ((on ? 1 : 0) - t.current) * Math.min(1, dt * 4);
    g.position.set(
      base[0] + dir[0] * t.current,
      base[1] + dir[1] * t.current,
      base[2] + dir[2] * t.current
    );
    if (spin) g.rotation.z += dt * spin;
  });
  return <group ref={ref}>{children}</group>;
}

/* ---- shared material palette (matches tailwind.config.ts) ---- */
const NAVY = "#1A3A6B";
const NAVY_DEEP = "#0b1830";
const APPLIANCE = "#eef3f8";
const APPLIANCE_HI = "#ffffff";
const ALUMINIUM = "#c2ccd6";
const GREEN = "#6ABF4B";
const CYAN = "#1D9ED9";
const COPPER = "#c8794a";
const CELL = "#0e1f45";

/* =============================== SOLAR =============================== */
function SolarModel() {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      cells.push(
        <mesh key={`${r}-${c}`} position={[-1.25 + c * 0.5, 0.85 - r * 0.5, 0.06]}>
          <boxGeometry args={[0.44, 0.44, 0.02]} />
          <meshStandardMaterial color={CELL} metalness={0.4} roughness={0.25} />
        </mesh>
      );
    }
  }
  return (
    <group rotation={[-0.5, 0, 0]}>
      {/* panel frame */}
      <mesh castShadow>
        <boxGeometry args={[3.05, 2.15, 0.1]} />
        <meshStandardMaterial color={ALUMINIUM} metalness={0.9} roughness={0.3} />
      </mesh>
      {/* glass */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[2.85, 1.95, 0.06]} />
        <meshStandardMaterial color={NAVY_DEEP} metalness={0.3} roughness={0.15} />
      </mesh>
      {/* cells lift off when exploded */}
      <Part dir={[0, 0, 1.1]}>{cells}</Part>
      {/* rear rails / legs drop away */}
      <Part dir={[0, -0.6, -0.9]}>
        <mesh position={[-1, -0.2, -0.35]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.08, 1.1, 0.08]} />
          <meshStandardMaterial color={ALUMINIUM} metalness={0.9} roughness={0.35} />
        </mesh>
        <mesh position={[1, -0.2, -0.35]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.08, 1.1, 0.08]} />
          <meshStandardMaterial color={ALUMINIUM} metalness={0.9} roughness={0.35} />
        </mesh>
      </Part>
    </group>
  );
}

/* =============================== BATTERY ============================= */
function BatteryModel() {
  return (
    <group>
      {/* internal cell stack (revealed on explode) */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[1.35, 2.5, 0.35]} />
        <meshStandardMaterial color={NAVY} metalness={0.6} roughness={0.4} />
      </mesh>
      {[-0.4, -0.13, 0.13, 0.4].map((x) => (
        <mesh key={x} position={[x, 0, -0.1]}>
          <boxGeometry args={[0.2, 2.3, 0.3]} />
          <meshStandardMaterial color={CYAN} metalness={0.3} roughness={0.5} emissive={CYAN} emissiveIntensity={0.08} />
        </mesh>
      ))}
      {/* glossy front cover slides forward */}
      <Part dir={[0, 0, 1.4]}>
        <mesh castShadow>
          <boxGeometry args={[1.55, 2.75, 0.28]} />
          <meshStandardMaterial color={APPLIANCE_HI} metalness={0.2} roughness={0.15} />
        </mesh>
        {/* status LED */}
        <mesh position={[0.5, 1.05, 0.16]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 24]} />
          <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.9} />
        </mesh>
        {/* flame-tint brand stripe */}
        <mesh position={[0, -1.1, 0.15]}>
          <boxGeometry args={[1.55, 0.16, 0.02]} />
          <meshStandardMaterial color={GREEN} metalness={0.2} roughness={0.4} />
        </mesh>
      </Part>
      {/* wall bracket behind */}
      <mesh position={[0, 0, -0.44]}>
        <boxGeometry args={[1.2, 2.4, 0.06]} />
        <meshStandardMaterial color={ALUMINIUM} metalness={0.9} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ============================== HEAT PUMP =========================== */
function HeatPumpModel() {
  const blades: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    blades.push(
      <mesh key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]} position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.16, 0.02]} />
        <meshStandardMaterial color={APPLIANCE} metalness={0.3} roughness={0.5} />
      </mesh>
    );
  }
  return (
    <group>
      {/* body */}
      <mesh castShadow>
        <boxGeometry args={[2.6, 1.9, 1.15]} />
        <meshStandardMaterial color={APPLIANCE} metalness={0.25} roughness={0.45} />
      </mesh>
      {/* heat-exchanger fins (side) slide out */}
      <Part dir={[-1.3, 0, 0]}>
        <mesh position={[-1.28, 0, 0]}>
          <boxGeometry args={[0.08, 1.7, 1.0]} />
          <meshStandardMaterial color={ALUMINIUM} metalness={0.85} roughness={0.35} />
        </mesh>
      </Part>
      {/* front grille + spinning fan slide forward */}
      <Part base={[0, 0, 0.58]} dir={[0, 0, 1.3]}>
        {/* recessed grille ring */}
        <mesh>
          <torusGeometry args={[0.85, 0.09, 16, 40]} />
          <meshStandardMaterial color={NAVY} metalness={0.6} roughness={0.4} />
        </mesh>
        {/* spinning fan */}
        <Part spin={6}>
          <group>
            {blades}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.1, 20]} />
              <meshStandardMaterial color={NAVY} metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </Part>
      </Part>
      {/* feet */}
      <mesh position={[-0.9, -1.05, 0]}>
        <boxGeometry args={[0.3, 0.22, 1.1]} />
        <meshStandardMaterial color={NAVY} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.9, -1.05, 0]}>
        <boxGeometry args={[0.3, 0.22, 1.1]} />
        <meshStandardMaterial color={NAVY} metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ============================ AIR CONDITIONING ====================== */
function AirconModel() {
  return (
    <group>
      {/* wall plate */}
      <mesh position={[0, 0, -0.25]}>
        <boxGeometry args={[3.1, 0.95, 0.06]} />
        <meshStandardMaterial color={ALUMINIUM} metalness={0.8} roughness={0.4} />
      </mesh>
      {/* internal coil (revealed) */}
      <mesh position={[0, 0.05, -0.05]}>
        <boxGeometry args={[2.8, 0.55, 0.28]} />
        <meshStandardMaterial color={CYAN} metalness={0.3} roughness={0.5} emissive={CYAN} emissiveIntensity={0.06} />
      </mesh>
      {/* rounded front cover lifts up + forward */}
      <Part dir={[0, 0.5, 1.0]}>
        <mesh castShadow>
          <boxGeometry args={[3.2, 1.0, 0.5]} />
          <meshStandardMaterial color={APPLIANCE_HI} metalness={0.15} roughness={0.2} />
        </mesh>
        {/* subtle brand accent line */}
        <mesh position={[0, 0.2, 0.26]}>
          <boxGeometry args={[3.2, 0.04, 0.01]} />
          <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.4} />
        </mesh>
      </Part>
      {/* louvre flap swings down */}
      <Part base={[0, -0.5, 0.2]} dir={[0, -0.5, 0.4]}>
        <mesh rotation={[0.5, 0, 0]}>
          <boxGeometry args={[2.9, 0.18, 0.4]} />
          <meshStandardMaterial color={APPLIANCE} metalness={0.2} roughness={0.4} />
        </mesh>
      </Part>
    </group>
  );
}

/* ============================== THERMASKIRT ======================== */
function ThermaskirtModel() {
  return (
    <group rotation={[0.15, 0, 0]}>
      {/* wall behind */}
      <mesh position={[0, 0.4, -0.35]}>
        <boxGeometry args={[3.4, 1.4, 0.08]} />
        <meshStandardMaterial color={APPLIANCE} metalness={0.05} roughness={0.7} />
      </mesh>
      {/* finned heating element (revealed) */}
      <mesh position={[0, -0.55, -0.05]}>
        <boxGeometry args={[3.0, 0.28, 0.12]} />
        <meshStandardMaterial color={COPPER} metalness={0.85} roughness={0.3} emissive={"#c8794a"} emissiveIntensity={0.12} />
      </mesh>
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (
        <mesh key={x} position={[x, -0.55, -0.05]}>
          <boxGeometry args={[0.05, 0.5, 0.3]} />
          <meshStandardMaterial color={ALUMINIUM} metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
      {/* aluminium fascia clips off forward */}
      <Part dir={[0, 0, 0.9]}>
        <mesh castShadow position={[0, -0.55, 0.16]}>
          <boxGeometry args={[3.3, 0.75, 0.06]} />
          <meshStandardMaterial color={APPLIANCE_HI} metalness={0.35} roughness={0.25} />
        </mesh>
        {/* rounded top bullnose — horizontal edge along the fascia */}
        <mesh position={[0, -0.18, 0.13]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 3.3, 20]} />
          <meshStandardMaterial color={APPLIANCE_HI} metalness={0.35} roughness={0.25} />
        </mesh>
      </Part>
      {/* floor */}
      <mesh position={[0, -1.02, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 1]} />
        <meshStandardMaterial color={"#d9c3a5"} roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ============================== UNDERFLOOR ========================= */
function UnderfloorModel() {
  const pipes: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const z = -0.8 + i * 0.4;
    pipes.push(
      <mesh key={`p${i}`} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 2.6, 16]} />
        <meshStandardMaterial color={CYAN} metalness={0.4} roughness={0.4} />
      </mesh>
    );
    // return bends
    const x = i % 2 === 0 ? 1.3 : -1.3;
    pipes.push(
      <mesh key={`b${i}`} position={[x, 0, z + 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.07, 12, 20, Math.PI]} />
        <meshStandardMaterial color={CYAN} metalness={0.4} roughness={0.4} />
      </mesh>
    );
  }
  return (
    <group rotation={[0.35, 0, 0]}>
      {/* insulation base */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[3.0, 0.16, 2.4]} />
        <meshStandardMaterial color={"#f2c14e"} roughness={0.8} />
      </mesh>
      {/* pipe loops */}
      <group position={[0, 0.0, 0]}>{pipes}</group>
      {/* screed + floor panel lifts up to reveal pipes */}
      <Part dir={[0, 1.3, 0]}>
        <mesh castShadow position={[0, 0.25, 0]}>
          <boxGeometry args={[3.0, 0.14, 2.4]} />
          <meshStandardMaterial color={"#c9a06a"} roughness={0.6} metalness={0.05} />
        </mesh>
        {/* plank grooves */}
        {[-0.8, -0.27, 0.27, 0.8].map((z) => (
          <mesh key={z} position={[0, 0.33, z]}>
            <boxGeometry args={[3.0, 0.01, 0.02]} />
            <meshStandardMaterial color={"#a9855660"} />
          </mesh>
        ))}
      </Part>
    </group>
  );
}

/* ================================= EV ============================== */
function EvModel() {
  return (
    <group>
      {/* internal board (revealed) */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[1.15, 1.75, 0.22]} />
        <meshStandardMaterial color={NAVY} metalness={0.5} roughness={0.5} />
      </mesh>
      {/* front housing slides forward */}
      <Part dir={[0, 0, 1.2]}>
        <mesh castShadow>
          <boxGeometry args={[1.3, 1.95, 0.4]} />
          <meshStandardMaterial color={APPLIANCE_HI} metalness={0.2} roughness={0.2} />
        </mesh>
        {/* status ring */}
        <mesh position={[0, 0.35, 0.22]}>
          <torusGeometry args={[0.32, 0.05, 16, 40]} />
          <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.8} />
        </mesh>
        {/* socket */}
        <mesh position={[0, -0.45, 0.22]}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
          <meshStandardMaterial color={NAVY_DEEP} metalness={0.4} roughness={0.4} />
        </mesh>
      </Part>
      {/* coiled cable */}
      <Part base={[0.85, -0.4, 0.2]} dir={[0.9, 0, 0.4]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.06, 12, 40]} />
          <meshStandardMaterial color={NAVY_DEEP} metalness={0.2} roughness={0.6} />
        </mesh>
      </Part>
    </group>
  );
}

const MODELS: Record<IconKey, () => JSX.Element> = {
  solar: SolarModel,
  battery: BatteryModel,
  heatpump: HeatPumpModel,
  aircon: AirconModel,
  thermaskirt: ThermaskirtModel,
  underfloor: UnderfloorModel,
  ev: EvModel,
};

export function ProductModel({ icon }: { icon: IconKey }) {
  const M = MODELS[icon] ?? BatteryModel;
  return <M />;
}
