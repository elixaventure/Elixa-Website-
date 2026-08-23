"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import { NODES, type ComponentNode, MEDIA } from "./graph";
import type { TechId, EnergyModel } from "../state";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const CYLINDER_GLB = `${BASE}/models/cylinder-elite.glb`;

/**
 * Real manufacturer model (UK Cylinders Elite pre-plumbed heat-pump cylinder,
 * converted from the supplied IFC). Real-world scale: 1.86 m tall. Vertex-
 * coloured, so we give every mesh a lit PBR material on load.
 */
function CylinderGLB({ hi }: { hi: boolean }) {
  const { scene } = useGLTF(CYLINDER_GLB);
  const model = useMemo(() => {
    const s = scene.clone(true);
    s.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material = new THREE.MeshStandardMaterial({
          vertexColors: true,
          metalness: 0.25,
          roughness: 0.45,
        });
        o.castShadow = true;
      }
    });
    return s;
  }, [scene]);
  return (
    <group>
      <primitive object={model} position={[0, -0.85, 0]} />
      {hi && (
        <mesh position={[0, -0.83, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.52, 32]} />
          <meshBasicMaterial color="#1D9ED9" transparent opacity={0.6} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

const CYAN = "#1D9ED9";
const GREEN = "#6ABF4B";
const GOLD = "#f5c542";

/** Wrap equipment so it responds to hover / click and opens the existing sheet. */
function Selectable({
  node,
  onHover,
  onPick,
  children,
}: {
  node: ComponentNode;
  onHover: (id: string | null) => void;
  onPick: (id: TechId | "grid") => void;
  children: React.ReactNode;
}) {
  return (
    <group
      position={node.pos}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(node.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onPick(node.pick);
      }}
    >
      {children}
    </group>
  );
}

function body(color: string, hi: boolean, extra: Record<string, unknown> = {}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.5}
      metalness={0.15}
      emissive={hi ? "#ffffff" : color}
      emissiveIntensity={hi ? 0.35 : 0.04}
      {...extra}
    />
  );
}

/** Hand-built tank shown while the manufacturer GLB streams in. */
function ProceduralCylinder({ hi }: { hi: boolean }) {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.25, 20]} />
        {body("#f6f9fc", hi)}
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {body("#f6f9fc", hi)}
      </mesh>
      {[-0.35, -0.2, -0.05].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.025, 10, 28]} />
          <meshStandardMaterial color={MEDIA.heatFlow.color} emissive={MEDIA.heatFlow.color} emissiveIntensity={hi ? 0.5 : 0.2} />
        </mesh>
      ))}
    </group>
  );
}

/** Slow-spinning heat-pump fan. */
function Fan() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 2.4;
  });
  return (
    <group ref={ref}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
          <boxGeometry args={[0.4, 0.07, 0.015]} />
          <meshStandardMaterial color="#dfe7f0" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
        <meshStandardMaterial color="#1A3A6B" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

/* geometry per component, authored around local origin */
function Geo({ id, hi, isDay, acMode, model }: { id: string; hi: boolean; isDay: boolean; acMode: "cool" | "heat"; model: EnergyModel }) {
  switch (id) {
    case "sun":
      return (
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshBasicMaterial color={isDay ? GOLD : "#cdd7ec"} toneMapped={false} />
        </mesh>
      );
    case "solarPanels":
      // tilted array matching the front roof slope
      return (
        <group rotation={[0.675, 0, 0]}>
          {[-1, 0, 1].map((i) => (
            <group key={i} position={[i * 1.35, 0.12, 0]}>
              {/* frame */}
              <mesh castShadow>
                <boxGeometry args={[1.28, 0.1, 1.95]} />
                {body("#e7edf4", hi, { metalness: 0.6, roughness: 0.3 })}
              </mesh>
              {/* cells */}
              <mesh position={[0, 0.06, 0]}>
                <boxGeometry args={[1.16, 0.04, 1.82]} />
                {body("#16305e", hi, { metalness: 0.35, roughness: 0.2 })}
              </mesh>
              {[-0.6, -0.2, 0.2, 0.6].map((z) => (
                <mesh key={z} position={[0, 0.09, z * 0.9]}>
                  <boxGeometry args={[1.16, 0.01, 0.02]} />
                  <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={hi ? 0.6 : 0.3} toneMapped={false} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      );
    case "inverter":
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.6, 0.24]} />
            {body("#eef7ff", hi)}
          </mesh>
          <mesh position={[0, 0, 0.13]}>
            <planeGeometry args={[0.2, 0.2]} />
            <meshBasicMaterial color={GOLD} toneMapped={false} />
          </mesh>
        </group>
      );
    case "consumerUnit":
      return (
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.36, 0.16]} />
          {body("#dfe7f0", hi)}
        </mesh>
      );
    case "meter":
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.4, 0.18]} />
            {body("#eef3f8", hi)}
          </mesh>
          <mesh position={[0, 0.05, 0.1]}>
            <circleGeometry args={[0.09, 20]} />
            <meshBasicMaterial color={MEDIA.grid.color} toneMapped={false} />
          </mesh>
        </group>
      );
    case "grid":
      return (
        <group>
          {/* pole to ground */}
          <mesh position={[0, -1.3, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 5.2, 10]} />
            {body(isDay ? "#9aa7b8" : "#5b6b86", hi)}
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[1.2, 0.1, 0.1]} />
            {body(isDay ? "#9aa7b8" : "#5b6b86", hi)}
          </mesh>
          {/* supply line toward the meter */}
          <mesh position={[-0.95, 0.4, 0.55]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.02, 0.02, 2.0, 6]} />
            <meshStandardMaterial color={MEDIA.grid.color} emissive={MEDIA.grid.color} emissiveIntensity={0.2} />
          </mesh>
        </group>
      );
    case "homeLoad":
      return (
        <group>
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color={isDay ? "#f5d36b" : "#ffdf8a"} toneMapped={false} />
          </mesh>
        </group>
      );
    case "battery": {
      const pct = Math.max(0.06, model.batteryPct / 100);
      const charging = model.batteryCharge > 0;
      const discharging = model.batteryDischarge > 0;
      const led = charging ? GREEN : discharging ? CYAN : "#8aa0bd";
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.52, 0.9, 0.3]} />
            {body("#f2f6f9", hi)}
          </mesh>
          {/* charge window */}
          <mesh position={[0, -0.02, 0.155]}>
            <planeGeometry args={[0.3, 0.68]} />
            <meshStandardMaterial color="#0e1f45" roughness={0.35} />
          </mesh>
          {/* state-of-charge fill — height tracks batteryPct live */}
          <mesh position={[0, -0.36 + (0.68 * pct) / 2 + 0.02, 0.16]}>
            <planeGeometry args={[0.26, 0.68 * pct]} />
            <meshBasicMaterial color={charging ? GREEN : discharging ? CYAN : "#4f9e63"} toneMapped={false} />
          </mesh>
          {/* status LED: green = charging, cyan = supplying the home */}
          <mesh position={[0.16, 0.38, 0.16]}>
            <circleGeometry args={[0.035, 16]} />
            <meshBasicMaterial color={led} toneMapped={false} />
          </mesh>
        </group>
      );
    }
    case "cylinder":
      // real manufacturer unit, procedural tank as the loading fallback
      return (
        <Suspense fallback={<ProceduralCylinder hi={hi} />}>
          <CylinderGLB hi={hi} />
        </Suspense>
      );
    case "heatpump":
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[1.0, 0.8, 0.55]} />
            {body("#eef3f8", hi)}
          </mesh>
          {/* intake grille on the outside-air side */}
          {[-0.25, -0.1, 0.05, 0.2].map((y) => (
            <mesh key={y} position={[-0.51, y, 0]}>
              <boxGeometry args={[0.02, 0.05, 0.45]} />
              <meshStandardMaterial color="#c6d2de" metalness={0.4} roughness={0.5} />
            </mesh>
          ))}
          {/* fan ring + live spinning fan */}
          <mesh position={[0, 0, 0.28]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.28, 0.035, 10, 28]} />
            <meshStandardMaterial color="#1A3A6B" emissive={MEDIA.heatFlow.color} emissiveIntensity={hi ? 0.3 : 0.08} />
          </mesh>
          <group position={[0, 0, 0.3]}>
            <Fan />
          </group>
          {/* feet */}
          {[-0.35, 0.35].map((x) => (
            <mesh key={x} position={[x, -0.45, 0]}>
              <boxGeometry args={[0.12, 0.1, 0.5]} />
              <meshStandardMaterial color="#1A3A6B" roughness={0.6} />
            </mesh>
          ))}
        </group>
      );
    case "airSource":
      // soft translucent intake ring — the thermal particles animate into the pump
      return (
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.3, 0.05, 10, 24]} />
          <meshStandardMaterial
            color={MEDIA.thermal.color}
            emissive={MEDIA.thermal.color}
            emissiveIntensity={hi ? 0.6 : 0.25}
            transparent
            opacity={0.55}
          />
        </mesh>
      );
    case "waterMain":
      return (
        <group>
          {/* rising main + stopcock cap at the street */}
          <mesh>
            <cylinderGeometry args={[0.09, 0.09, 0.5, 12]} />
            {body(MEDIA.waterCold.color, hi, { roughness: 0.35 })}
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.08, 12]} />
            {body("#1A3A6B", hi)}
          </mesh>
        </group>
      );
    case "shower":
      return (
        <group>
          {/* riser + shower head + tray */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.9, 10]} />
            {body("#c6d2de", hi, { metalness: 0.7, roughness: 0.3 })}
          </mesh>
          <mesh position={[0, 0.55, 0.14]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
            {body("#c6d2de", hi, { metalness: 0.7, roughness: 0.3 })}
          </mesh>
          <mesh position={[0, -0.38, 0.08]}>
            <boxGeometry args={[0.55, 0.06, 0.55]} />
            {body("#eef2f7", hi)}
          </mesh>
        </group>
      );
    case "kitchenTap":
      return (
        <group>
          {/* worktop + swan-neck tap */}
          <mesh position={[0, -0.18, 0]}>
            <boxGeometry args={[0.7, 0.3, 0.45]} />
            {body("#dfe7f0", hi)}
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.25, 10]} />
            {body("#c6d2de", hi, { metalness: 0.7, roughness: 0.3 })}
          </mesh>
          <mesh position={[0, 0.2, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.09, 0.028, 8, 16, Math.PI]} />
            {body("#c6d2de", hi, { metalness: 0.7, roughness: 0.3 })}
          </mesh>
        </group>
      );
    case "ufManifold":
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.55, 0.3, 0.14]} />
            {body("#dfe7f0", hi, { metalness: 0.6, roughness: 0.3 })}
          </mesh>
          {/* flow (orange) and return (teal) port rails */}
          {[0.08, -0.08].map((y, r) => (
            <group key={y}>
              <mesh position={[0, y, 0.08]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.03, 0.03, 0.5, 10]} />
                <meshStandardMaterial
                  color={r === 0 ? MEDIA.heatFlow.color : MEDIA.heatReturn.color}
                  emissive={r === 0 ? MEDIA.heatFlow.color : MEDIA.heatReturn.color}
                  emissiveIntensity={hi ? 0.5 : 0.18}
                />
              </mesh>
              {[-0.16, 0, 0.16].map((x) => (
                <mesh key={x} position={[x, y - 0.09, 0.08]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
                  <meshStandardMaterial color="#c6d2de" metalness={0.7} roughness={0.3} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      );
    case "ufLoop":
      // floor cutaway: screed patch exposing the serpentine warm-water loops
      return (
        <group>
          <mesh position={[0, -0.06, 0]}>
            <boxGeometry args={[1.7, 0.05, 1.3]} />
            {body("#a98a5f", hi, { roughness: 0.9 })}
          </mesh>
          {[-0.5, -0.25, 0, 0.25, 0.5].map((z, i) => (
            <mesh key={z} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 1.5, 10]} />
              <meshStandardMaterial
                color={MEDIA.heatFlow.color}
                emissive={MEDIA.heatFlow.color}
                emissiveIntensity={hi ? 0.55 : 0.22}
              />
            </mesh>
          ))}
          {/* return bends at alternating ends */}
          {[-0.375, 0.125].map((z) => (
            <mesh key={`r${z}`} position={[0.75, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.125, 0.035, 8, 16, Math.PI]} />
              <meshStandardMaterial color={MEDIA.heatFlow.color} emissive={MEDIA.heatFlow.color} emissiveIntensity={hi ? 0.55 : 0.22} />
            </mesh>
          ))}
          {[-0.125, 0.375].map((z) => (
            <mesh key={`l${z}`} position={[-0.75, 0, z]} rotation={[Math.PI / 2, 0, Math.PI]}>
              <torusGeometry args={[0.125, 0.035, 8, 16, Math.PI]} />
              <meshStandardMaterial color={MEDIA.heatFlow.color} emissive={MEDIA.heatFlow.color} emissiveIntensity={hi ? 0.55 : 0.22} />
            </mesh>
          ))}
        </group>
      );
    case "thermaskirt":
      // heated skirting profile around the living-room perimeter
      return (
        <group>
          {/* left wall run */}
          <mesh position={[-1.95, 0, 0]} castShadow>
            <boxGeometry args={[0.06, 0.2, 3.5]} />
            {body("#eef2f7", hi, { metalness: 0.45, roughness: 0.35 })}
          </mesh>
          {/* front + back wall runs */}
          {[1.68, -1.68].map((z) => (
            <mesh key={z} position={[-0.2, 0, z]} castShadow>
              <boxGeometry args={[3.55, 0.2, 0.06]} />
              {body("#eef2f7", hi, { metalness: 0.45, roughness: 0.35 })}
            </mesh>
          ))}
          {/* warm waterline glow along each run */}
          <mesh position={[-1.92, 0, 0]}>
            <boxGeometry args={[0.02, 0.05, 3.44]} />
            <meshStandardMaterial color={MEDIA.heatFlow.color} emissive={MEDIA.heatFlow.color} emissiveIntensity={hi ? 0.7 : 0.3} />
          </mesh>
          {[1.65, -1.65].map((z) => (
            <mesh key={`g${z}`} position={[-0.2, 0, z]}>
              <boxGeometry args={[3.5, 0.05, 0.02]} />
              <meshStandardMaterial color={MEDIA.heatFlow.color} emissive={MEDIA.heatFlow.color} emissiveIntensity={hi ? 0.7 : 0.3} />
            </mesh>
          ))}
        </group>
      );
    case "ufAir":
    case "tsAir":
    case "acAir":
      return null;
    case "acOutdoor":
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.6, 0.4]} />
            {body("#e8f5fc", hi)}
          </mesh>
          {/* fan ring on the outward face */}
          <mesh position={[-0.41, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.2, 0.03, 10, 24]} />
            <meshStandardMaterial color="#1A3A6B" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* refrigerant service valves */}
          {[0.12, -0.02].map((y) => (
            <mesh key={y} position={[0.42, y - 0.15, 0.1]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 0.1, 8]} />
              <meshStandardMaterial color={MEDIA.refrigerant.color} metalness={0.5} roughness={0.35} />
            </mesh>
          ))}
        </group>
      );
    case "acIndoor": {
      const col = acMode === "cool" ? MEDIA.coolAir.color : MEDIA.warmAir.color;
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.32, 0.28]} />
            {body("#ffffff", hi)}
          </mesh>
          <mesh position={[0, -0.1, 0.15]}>
            <boxGeometry args={[1.0, 0.04, 0.02]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} />
          </mesh>
        </group>
      );
    }
    case "evCharger":
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.5, 0.18]} />
            {body("#eef7ff", hi)}
          </mesh>
          <mesh position={[0, 0.08, 0.11]}>
            <torusGeometry args={[0.09, 0.025, 12, 24]} />
            <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.7} />
          </mesh>
        </group>
      );
    case "evCar":
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[1.7, 0.4, 0.8]} />
            {body("#1A3A6B", hi)}
          </mesh>
          <mesh position={[0.05, 0.42, 0]}>
            <boxGeometry args={[0.9, 0.36, 0.72]} />
            {body("#2c4a7a", hi)}
          </mesh>
          {[-0.55, 0.55].map((x) =>
            [-0.42, 0.42].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, -0.18, z]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.12, 16]} />
                <meshStandardMaterial color="#12203a" />
              </mesh>
            ))
          )}
        </group>
      );
    default:
      return null;
  }
}

const CORE = new Set(["consumerUnit", "meter", "grid", "homeLoad"]);

export function Equipment({
  active,
  hovered,
  highlight,
  onHover,
  onPick,
  isDay,
  acMode,
  model,
}: {
  active: TechId[];
  hovered: string | null;
  highlight: Set<string>;
  onHover: (id: string | null) => void;
  onPick: (id: TechId | "grid") => void;
  isDay: boolean;
  acMode: "cool" | "heat";
  model: EnergyModel;
}) {
  const has = (t: TechId) => active.includes(t);
  const show = (n: ComponentNode) => {
    if (CORE.has(n.id)) return true;
    if (n.id === "sun") return has("solar");
    if (n.id === "inverter") return has("solar") || has("battery");
    if (n.tech === "core") return true;
    return has(n.tech as TechId);
  };

  return (
    <group>
      {Object.values(NODES).map((n) => {
        if (!show(n)) return null;
        const hi = hovered === n.id || highlight.has(n.id);
        return (
          <Selectable key={n.id} node={n} onHover={onHover} onPick={onPick}>
            <Geo id={n.id} hi={hi} isDay={isDay} acMode={acMode} model={model} />
          </Selectable>
        );
      })}
    </group>
  );
}
