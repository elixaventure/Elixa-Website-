"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { MEDIA, NODES, type FlowEdge, type FlowCtx, type MediaId, type SystemView } from "./graph";

/** Particle count per media shape (halved on mobile). */
const COUNT: Record<string, number> = { ray: 4, pulse: 5, droplet: 4, ribbon: 3, glow: 3 };

function pathPoints(edge: FlowEdge): THREE.Vector3[] {
  const a = NODES[edge.from].pos;
  const b = NODES[edge.to].pos;
  const pts = [new THREE.Vector3(...a)];
  edge.via?.forEach((v) => pts.push(new THREE.Vector3(...v)));
  pts.push(new THREE.Vector3(...b));
  return pts;
}

function ParticleGeo({ shape }: { shape: string }) {
  switch (shape) {
    case "ray":
      return <cylinderGeometry args={[0.02, 0.02, 0.42, 6]} />;
    case "droplet":
      return <sphereGeometry args={[0.075, 12, 12]} />;
    case "ribbon":
      return <planeGeometry args={[0.34, 0.13]} />;
    case "glow":
      return <sphereGeometry args={[0.16, 12, 12]} />;
    default: // pulse
      return <sphereGeometry args={[0.07, 12, 12]} />;
  }
}

/**
 * Physical carrier per media: water/heating media run in coloured pipes,
 * refrigerant in an insulated line, electricity in slim grey conduit (the
 * moving pulses carry the colour, like real cable runs). Sunlight, rising
 * warmth and airflow are unducted — no pipe.
 */
const CARRIER: Partial<Record<string, { r: number; color: string; metalness: number; roughness: number }>> = {
  waterCold: { r: 0.042, color: "#3e7fb2", metalness: 0.15, roughness: 0.5 },
  waterHot: { r: 0.042, color: "#b25548", metalness: 0.15, roughness: 0.5 },
  heatFlow: { r: 0.048, color: "#a96a3d", metalness: 0.65, roughness: 0.35 }, // copper
  heatReturn: { r: 0.048, color: "#8a7355", metalness: 0.6, roughness: 0.4 }, // cooler copper
  refrigerant: { r: 0.045, color: "#d9dee7", metalness: 0.2, roughness: 0.55 }, // insulated line
  dc: { r: 0.022, color: "#5a6675", metalness: 0.3, roughness: 0.55 },
  ac: { r: 0.022, color: "#5a6675", metalness: 0.3, roughness: 0.55 },
  stored: { r: 0.022, color: "#5a6675", metalness: 0.3, roughness: 0.55 },
  grid: { r: 0.022, color: "#5a6675", metalness: 0.3, roughness: 0.55 },
};

function FlowLine({
  edge,
  dim,
  reduced,
}: {
  edge: FlowEdge;
  dim: boolean;
  reduced: boolean;
}) {
  const media = MEDIA[edge.media];
  const carrier = CARRIER[edge.media];
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pathPoints(edge), false, "catmullrom", 0.4), [edge]);
  const linePts = useMemo(() => curve.getPoints(40), [curve]);
  const n = reduced ? Math.max(2, Math.round(COUNT[media.shape] / 2)) : COUNT[media.shape];
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const opacity = dim ? 0.12 : 1;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const phase = (t * media.speed * 0.16 + i / n) % 1;
      const p = curve.getPointAt(phase);
      m.position.copy(p);
      if (media.shape === "ray" || media.shape === "ribbon") {
        const tan = curve.getTangentAt(phase);
        m.lookAt(p.clone().add(tan));
      }
      if (media.shape === "glow" || media.shape === "droplet") {
        const s = 0.7 + Math.sin(phase * Math.PI) * 0.5;
        m.scale.setScalar(s);
      }
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity * (media.shape === "glow" ? 0.5 : 1) * (0.5 + 0.5 * Math.sin(phase * Math.PI));
    }
  });

  return (
    <group>
      {carrier ? (
        // real pipework / conduit along the run
        <mesh castShadow>
          <tubeGeometry args={[curve, 36, carrier.r, 8, false]} />
          <meshStandardMaterial
            color={carrier.color}
            metalness={carrier.metalness}
            roughness={carrier.roughness}
            transparent
            opacity={dim ? 0.15 : 1}
          />
        </mesh>
      ) : (
        <Line points={linePts} color={media.color} lineWidth={dim ? 1 : 2.2} transparent opacity={dim ? 0.1 : 0.35} />
      )}
      {Array.from({ length: n }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <ParticleGeo shape={media.shape} />
          <meshBasicMaterial
            color={media.color}
            transparent
            opacity={opacity}
            side={media.shape === "ribbon" ? THREE.DoubleSide : THREE.FrontSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Flows({
  flows,
  ctx,
  view,
  reduced,
}: {
  flows: FlowEdge[];
  ctx: FlowCtx;
  view: SystemView;
  reduced: boolean;
}) {
  const active = flows.filter((f) => f.active(ctx));
  return (
    <group>
      {active.map((edge) => {
        const inView = view === "all" || MEDIA[edge.media].system === view;
        return <FlowLine key={edge.id} edge={edge} dim={!inView} reduced={reduced} />;
      })}
    </group>
  );
}

export type { MediaId };
