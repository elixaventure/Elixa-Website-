"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html, AdaptiveDpr, Environment, Lightformer } from "@react-three/drei";
import { House } from "./House";
import { Equipment } from "./Equipment";
import { Flows } from "./Flows";
import { NODES, FLOWS, type SystemView, type FlowCtx } from "./graph";
import type { TechId, EnergyModel } from "../state";

function Tooltip({ hovered }: { hovered: string | null }) {
  if (!hovered) return null;
  const n = NODES[hovered];
  if (!n) return null;
  return (
    <Html position={[n.pos[0], n.pos[1] + 0.6, n.pos[2]]} center distanceFactor={12} zIndexRange={[20, 0]} pointerEvents="none">
      <div className="pointer-events-none w-52 -translate-y-2 rounded-2xl bg-navy-900/95 px-3.5 py-2.5 text-left shadow-elevated backdrop-blur">
        {n.converts && (
          <span className="mb-1 inline-block rounded-full bg-elixa-cyan/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-elixa-cyan">
            {n.converts}
          </span>
        )}
        <p className="font-display text-[13px] font-bold leading-tight text-white">{n.tooltip.title}</p>
        <p className="mt-1 text-[11px] leading-snug text-white/70">{n.tooltip.body}</p>
      </div>
    </Html>
  );
}

export function Scene({
  active,
  isDay,
  acMode,
  model,
  flowMode,
  view,
  reduced,
  onPick,
}: {
  active: TechId[];
  isDay: boolean;
  acMode: "cool" | "heat";
  model: EnergyModel;
  flowMode: boolean;
  view: SystemView;
  reduced: boolean;
  onPick: (id: TechId | "grid") => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const highlight = useMemo(() => {
    const s = new Set<string>();
    if (hovered) {
      s.add(hovered);
      NODES[hovered]?.connects?.forEach((c) => s.add(c));
    }
    return s;
  }, [hovered]);

  const ctx: FlowCtx = useMemo(
    () => ({ has: (t: TechId) => active.includes(t), isDay, model, acMode }),
    [active, isDay, model, acMode]
  );

  const houseDim = flowMode || hovered ? 0.4 : 1;

  return (
    <Canvas
      shadows
      dpr={[1, reduced ? 1.2 : 2]}
      camera={{ position: [10.5, 8.6, 14.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!touch-none"
      onPointerMissed={() => setHovered(null)}
    >
      <AdaptiveDpr pixelated />
      <color attach="background" args={[isDay ? "#dceaf6" : "#0d1730"]} />
      <fog attach="fog" args={[isDay ? "#dceaf6" : "#0d1730", 22, 40]} />

      {/* lighting */}
      <ambientLight intensity={isDay ? 0.6 : 0.4} color={isDay ? "#ffffff" : "#9db4e0"} />
      <directionalLight
        position={isDay ? [10, 12, 6] : [-8, 9, -4]}
        intensity={isDay ? 1.15 : 0.6}
        color={isDay ? "#fff4e0" : "#b9caf0"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-6}
      />
      <Environment resolution={128}>
        <Lightformer intensity={isDay ? 1.6 : 0.5} position={[0, 6, -4]} scale={[14, 6, 1]} color="#ffffff" />
        <Lightformer intensity={0.7} position={[-6, 3, 4]} scale={[6, 6, 1]} color={isDay ? "#cfe3ff" : "#4a5f8f"} />
      </Environment>

      <House isDay={isDay} dim={houseDim} />

      <Equipment
        active={active}
        hovered={hovered}
        highlight={highlight}
        onHover={setHovered}
        onPick={onPick}
        isDay={isDay}
        acMode={acMode}
        model={model}
      />

      <Flows flows={FLOWS} ctx={ctx} view={view} reduced={reduced} />

      <Tooltip hovered={hovered} />

      <ContactShadows position={[0, 0.02, 0]} opacity={isDay ? 0.4 : 0.25} scale={26} blur={2.6} far={8} />

      <OrbitControls
        makeDefault
        target={[0.4, 1.9, 0.2]}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={12}
        maxDistance={24}
        minPolarAngle={Math.PI * 0.26}
        maxPolarAngle={Math.PI * 0.48}
        minAzimuthAngle={-0.15}
        maxAzimuthAngle={0.95}
      />
    </Canvas>
  );
}
