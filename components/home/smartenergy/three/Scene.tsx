"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, AdaptiveDpr, Environment, Lightformer } from "@react-three/drei";
import { House } from "./House";
import { Equipment } from "./Equipment";
import { Flows } from "./Flows";
import { PlanMat } from "./PlanMat";
import { ExactLayout, type LayoutView } from "./ExactLayout";
import { PropertyScene, FixturesOverlay, type PropertyViewState, type PlacementState } from "./PropertyScene";
import { ShowcaseModel } from "./ShowcaseModel";
import type { PropertyModel } from "@/lib/property/types";
import type { PlanLayout } from "@/lib/planLayout";
import { FLOWS, layoutFor, DEFAULT_HOME, type HomeConfig, type SystemView, type FlowCtx } from "./graph";
import type { TechId, EnergyModel } from "../state";

export function Scene({
  active,
  isDay,
  acMode,
  model,
  flowMode,
  view,
  reduced,
  home = DEFAULT_HOME,
  planUrl,
  planRooms,
  layout,
  layoutOn,
  layoutView,
  property,
  propertyState,
  showcaseUrl,
  showcaseOn,
  placement,
  onPick,
  onHoverChange,
}: {
  active: TechId[];
  isDay: boolean;
  acMode: "cool" | "heat";
  model: EnergyModel;
  flowMode: boolean;
  view: SystemView;
  reduced: boolean;
  home?: HomeConfig;
  /** object URL of the customer's rasterised floor plan, shown in-scene */
  planUrl?: string | null;
  /** room names read from the plan — relabels the 3D rooms */
  planRooms?: string[];
  /** extracted wall layout + whether to show it instead of the smart home */
  layout?: PlanLayout | null;
  layoutOn?: boolean;
  layoutView?: LayoutView;
  /** normalized property model — preferred over the raw layout when present */
  property?: PropertyModel | null;
  propertyState?: PropertyViewState;
  /** pre-built showcase GLB shown in place of the generated dollhouse */
  showcaseUrl?: string | null;
  showcaseOn?: boolean;
  placement?: PlacementState;
  onPick: (id: TechId | "grid") => void;
  /** notifies the parent (screen-space tooltip) — kept OUT of the canvas to
      avoid the DOM label stealing the pointer and flickering the hover. */
  onHoverChange?: (id: string | null) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const nodes = useMemo(() => layoutFor(home), [home]);
  const handleHover = (id: string | null) => {
    setHovered(id);
    onHoverChange?.(id);
  };

  const highlight = useMemo(() => {
    const s = new Set<string>();
    if (hovered) {
      s.add(hovered);
      nodes[hovered]?.connects?.forEach((c) => s.add(c));
    }
    return s;
  }, [hovered, nodes]);

  const ctx: FlowCtx = useMemo(
    () => ({ has: (t: TechId) => active.includes(t), isDay, model, acMode }),
    [active, isDay, model, acMode]
  );

  const houseDim = flowMode || hovered ? 0.4 : 1;

  return (
    <Canvas
      shadows
      dpr={[1, reduced ? 1.2 : 2]}
      camera={{ position: [11.6, 9.4, 15.8], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!touch-none"
      onPointerMissed={() => handleHover(null)}
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

      {layoutOn && showcaseOn && showcaseUrl ? (
        <>
          <ShowcaseModel url={showcaseUrl} />
          {property && <FixturesOverlay property={property} placement={placement} />}
        </>
      ) : layoutOn && property && propertyState ? (
        <PropertyScene property={property} isDay={isDay} state={propertyState} placement={placement} />
      ) : layoutOn && layout?.ok ? (
        <ExactLayout layout={layout} planUrl={planUrl} isDay={isDay} view={layoutView} />
      ) : (
        <>
          <House isDay={isDay} dim={houseDim} home={home} planRooms={planRooms} />

          <Equipment
            active={active}
            nodes={nodes}
            hovered={hovered}
            highlight={highlight}
            onHover={handleHover}
            onPick={onPick}
            isDay={isDay}
            acMode={acMode}
            model={model}
          />

          <Flows flows={FLOWS} nodes={nodes} ctx={ctx} view={view} reduced={reduced} />

          {planUrl && <PlanMat url={planUrl} />}
        </>
      )}

      <ContactShadows position={[0, 0.02, 0]} opacity={isDay ? 0.4 : 0.25} scale={26} blur={2.6} far={8} />

      <OrbitControls
        makeDefault
        target={[0.2, 2.6, 0.1]}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={13}
        maxDistance={26}
        minPolarAngle={layoutOn && layoutView === "plan" ? Math.PI * 0.02 : Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.48}
      />
    </Canvas>
  );
}
