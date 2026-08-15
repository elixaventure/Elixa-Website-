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
      <Line points={linePts} color={media.color} lineWidth={dim ? 1 : 2.2} transparent opacity={dim ? 0.1 : 0.35} />
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
