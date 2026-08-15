"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, RoundedBox, Html } from "@react-three/drei";
import * as THREE from "three";
import { FLOW_COLORS, type TechId, type EnergyModel } from "./state";

/* NOTE: TEMPORARY GEOMETRY. This is a procedurally-built stand-in home so the
   full interaction/energy architecture works today. Replace House + equipment
   meshes with optimised GLTF/GLB production models (Draco/Meshopt) later —
   the state model, flows, camera and UI stay exactly as they are. */

type Vec3 = [number, number, number];

const ANCHORS: Record<string, Vec3> = {
  sun: [5.5, 6.2, -3],
  panels: [-0.4, 2.5, 0.8],
  home: [0, 1.25, 1.25],
  battery: [1.5, 0.95, 0.8],
  heatpump: [-2.3, 0.55, 0.5],
  acOut: [-2.3, 0.45, -0.5],
  acIn: [0.7, 1.75, 0.95],
  floor: [0, 0.14, 0.4],
  ev: [2.75, 0.55, 0.3],
  grid: [-4.2, 1.7, -2],
};

const v = (a: Vec3) => new THREE.Vector3(...a);

/* ---------------- Energy flow (particles along a curve) ---------------- */
function EnergyFlow({
  from,
  to,
  color,
  count = 5,
  speed = 0.45,
  lift = 0.6,
  emphasis = 1,
}: {
  from: Vec3;
  to: Vec3;
  color: string;
  count?: number;
  speed?: number;
  lift?: number;
  emphasis?: number;
}) {
  const curve = useMemo(() => {
    const a = v(from);
    const b = v(to);
    const mid = a.clone().lerp(b, 0.5);
    mid.y += a.distanceTo(b) * 0.18 + lift * 0.4;
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  }, [from, to, lift]);

  const tube = useMemo(() => new THREE.TubeGeometry(curve, 24, 0.014, 6, false), [curve]);
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current = (t.current + dt * speed) % 1;
    const g = group.current;
    if (!g) return;
    g.children.forEach((child, i) => {
      const tt = (t.current + i / count) % 1;
      const p = curve.getPoint(tt);
      child.position.copy(p);
      const pulse = 0.8 + Math.sin(tt * Math.PI) * 0.5;
      child.scale.setScalar(pulse * emphasis);
    });
  });

  return (
    <group>
      <mesh geometry={tube}>
        <meshBasicMaterial color={color} transparent opacity={0.22 * emphasis} />
      </mesh>
      <group ref={group}>
        {Array.from({ length: count }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------------- clickable equipment wrapper ---------------- */
function Pickable({
  id,
  onPick,
  children,
}: {
  id: TechId | "grid";
  onPick: (id: TechId | "grid") => void;
  children: React.ReactNode;
}) {
  return (
    <group
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPick(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      {children}
    </group>
  );
}

/* appear/disappear scale spring */
function Appear({ show, children, y = 0 }: { show: boolean; children: React.ReactNode; y?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const target = show ? 1 : 0.001;
    g.scale.x += (target - g.scale.x) * 0.15;
    g.scale.y += (target - g.scale.y) * 0.15;
    g.scale.z += (target - g.scale.z) * 0.15;
    g.visible = g.scale.x > 0.02;
  });
  return (
    <group ref={ref} position={[0, y, 0]}>
      {children}
    </group>
  );
}

/* ---------------- House shell + interior ---------------- */
function House({
  active,
  isDay,
  flowMode,
  greenness,
  acMode,
  onPick,
}: {
  active: TechId[];
  isDay: boolean;
  flowMode: boolean;
  greenness: number;
  acMode: "cool" | "heat";
  onPick: (id: TechId | "grid") => void;
}) {
  const has = (t: TechId) => active.includes(t);
  const wallOpacity = flowMode ? 0.35 : 1;
  const glassColor = isDay ? "#bfe0f2" : "#2a4a74";
  const windowGlow = !isDay ? 0.5 : 0;

  const heatColor = FLOW_COLORS.heat;
  const acColor = acMode === "cool" ? FLOW_COLORS.cool : FLOW_COLORS.heat;

  return (
    <group>
      {/* ---- shell (walls as planes → dolls-house cutaway) ---- */}
      <group>
        {/* back */}
        <mesh position={[0, 1.1, -1.2]}>
          <planeGeometry args={[3.2, 2.2]} />
          <meshStandardMaterial color="#e7edf4" side={THREE.DoubleSide} transparent opacity={wallOpacity} />
        </mesh>
        {/* left */}
        <mesh position={[-1.6, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 2.2]} />
          <meshStandardMaterial color="#dde5ef" side={THREE.DoubleSide} transparent opacity={wallOpacity} />
        </mesh>
        {/* right */}
        <mesh position={[1.6, 1.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 2.2]} />
          <meshStandardMaterial color="#dde5ef" side={THREE.DoubleSide} transparent opacity={wallOpacity} />
        </mesh>
        {/* floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 2.4]} />
          <meshStandardMaterial color="#cdd7e3" />
        </mesh>
        {/* interior mid partition */}
        <mesh position={[0.2, 1.1, -0.2]}>
          <planeGeometry args={[1.6, 2.2]} />
          <meshStandardMaterial color="#e2e9f1" side={THREE.DoubleSide} transparent opacity={wallOpacity * 0.9} />
        </mesh>
        {/* front glass */}
        <mesh position={[0, 1.05, 1.2]}>
          <planeGeometry args={[3.0, 2.0]} />
          <meshStandardMaterial
            color={glassColor}
            transparent
            opacity={0.16}
            emissive={"#ffd98a"}
            emissiveIntensity={windowGlow}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ---- gable roof ---- */}
      <group position={[0, 2.2, 0]}>
        <mesh position={[0, 0.35, 0.72]} rotation={[-0.56, 0, 0]}>
          <boxGeometry args={[3.5, 0.12, 1.55]} />
          <meshStandardMaterial color="#26467e" />
        </mesh>
        <mesh position={[0, 0.35, -0.72]} rotation={[0.56, 0, 0]}>
          <boxGeometry args={[3.5, 0.12, 1.55]} />
          <meshStandardMaterial color="#1c3762" />
        </mesh>
      </group>

      {/* ================= INTERIOR KIT ================= */}
      {/* underfloor heating */}
      <Appear show={has("underfloor")}>
        <group>
          <mesh position={[0, 0.05, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.9, 2.1]} />
            <meshStandardMaterial color={heatColor} transparent opacity={0.28} emissive={heatColor} emissiveIntensity={0.5} />
          </mesh>
          <RisingHeat color={heatColor} />
        </group>
      </Appear>

      {/* thermaskirt perimeter glow */}
      <Appear show={has("thermaskirt")}>
        <group>
          {[
            { p: [0, 0.14, 1.12] as Vec3, r: [0, 0, 0] as Vec3, w: 2.9 },
            { p: [0, 0.14, -1.12] as Vec3, r: [0, 0, 0] as Vec3, w: 2.9 },
            { p: [-1.52, 0.14, 0] as Vec3, r: [0, Math.PI / 2, 0] as Vec3, w: 2.1 },
          ].map((s, i) => (
            <mesh key={i} position={s.p} rotation={s.r}>
              <boxGeometry args={[s.w, 0.09, 0.05]} />
              <meshStandardMaterial color={heatColor} emissive={heatColor} emissiveIntensity={0.7} />
            </mesh>
          ))}
        </group>
      </Appear>

      {/* battery (wall mounted, right interior) */}
      <Appear show={has("battery")}>
        <Pickable id="battery" onPick={onPick}>
          <RoundedBox args={[0.18, 0.72, 0.36]} radius={0.04} position={[1.5, 0.9, 0.7]}>
            <meshStandardMaterial color="#eef3f8" metalness={0.2} roughness={0.5} />
          </RoundedBox>
          <mesh position={[1.41, 0.9, 0.7]}>
            <boxGeometry args={[0.02, 0.5, 0.24]} />
            <meshStandardMaterial color={FLOW_COLORS.stored} emissive={FLOW_COLORS.stored} emissiveIntensity={0.5} />
          </mesh>
        </Pickable>
      </Appear>

      {/* hot water cylinder (with heat pump) */}
      <Appear show={has("heatpump")}>
        <mesh position={[1.15, 0.55, -0.75]}>
          <cylinderGeometry args={[0.17, 0.17, 0.95, 20]} />
          <meshStandardMaterial color="#f2f5f9" metalness={0.3} roughness={0.4} />
        </mesh>
      </Appear>

      {/* AC indoor unit */}
      <Appear show={has("aircon")}>
        <group>
          <RoundedBox args={[0.7, 0.2, 0.16]} radius={0.05} position={[0.7, 1.78, 0.9]}>
            <meshStandardMaterial color="#ffffff" />
          </RoundedBox>
          <AirBlow color={acColor} origin={[0.7, 1.66, 0.9]} />
        </group>
      </Appear>

      {/* ================= EXTERIOR KIT ================= */}
      {/* solar panels on roof front slope */}
      <Appear show={has("solar")}>
        <Pickable id="solar" onPick={onPick}>
          <group position={[0, 2.55, 0.72]} rotation={[-0.56, 0, 0]}>
            {[-1, 0, 1].map((cx) =>
              [-0.38, 0.38].map((cz) => (
                <mesh key={`${cx}-${cz}`} position={[cx * 0.98, 0.08, cz]}>
                  <boxGeometry args={[0.9, 0.04, 0.66]} />
                  <meshStandardMaterial color="#12244a" metalness={0.5} roughness={0.25} emissive={"#0b1836"} emissiveIntensity={0.2} />
                </mesh>
              ))
            )}
          </group>
        </Pickable>
      </Appear>

      {/* heat pump outdoor */}
      <Appear show={has("heatpump")}>
        <Pickable id="heatpump" onPick={onPick}>
          <group position={[-2.3, 0.4, 0.5]}>
            <RoundedBox args={[0.8, 0.6, 0.5]} radius={0.05}>
              <meshStandardMaterial color="#d7dfe9" metalness={0.4} roughness={0.5} />
            </RoundedBox>
            <mesh position={[0, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.18, 0.03, 8, 24]} />
              <meshStandardMaterial color="#9fb0c4" />
            </mesh>
            {has("heatpump") && <EnvParticles color={heatColor} />}
          </group>
        </Pickable>
      </Appear>

      {/* AC outdoor condenser */}
      <Appear show={has("aircon")}>
        <Pickable id="aircon" onPick={onPick}>
          <group position={[-2.3, 0.35, -0.5]}>
            <RoundedBox args={[0.66, 0.5, 0.4]} radius={0.05}>
              <meshStandardMaterial color="#e8eef5" metalness={0.3} roughness={0.5} />
            </RoundedBox>
            <mesh position={[0, 0, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.14, 0.025, 8, 20]} />
              <meshStandardMaterial color={acColor} emissive={acColor} emissiveIntensity={0.3} />
            </mesh>
          </group>
        </Pickable>
      </Appear>

      {/* EV charger + car */}
      <Appear show={has("ev")}>
        <Pickable id="ev" onPick={onPick}>
          <group position={[2.75, 0, 0.3]}>
            <RoundedBox args={[0.16, 0.9, 0.12]} radius={0.03} position={[0, 0.55, 0]}>
              <meshStandardMaterial color="#eef3f8" />
            </RoundedBox>
            <mesh position={[0.03, 0.7, 0.08]}>
              <boxGeometry args={[0.08, 0.14, 0.04]} />
              <meshStandardMaterial color={FLOW_COLORS.renewable} emissive={FLOW_COLORS.renewable} emissiveIntensity={0.5} />
            </mesh>
            {/* car */}
            <group position={[0.95, 0.28, 0.05]}>
              <RoundedBox args={[1.5, 0.42, 0.7]} radius={0.16}>
                <meshStandardMaterial color="#1A3A6B" metalness={0.6} roughness={0.3} />
              </RoundedBox>
              <RoundedBox args={[0.85, 0.34, 0.62]} radius={0.14} position={[-0.05, 0.32, 0]}>
                <meshStandardMaterial color="#28457a" metalness={0.5} roughness={0.3} />
              </RoundedBox>
              {[[-0.5, -0.2, 0.34], [0.5, -0.2, 0.34], [-0.5, -0.2, -0.34], [0.5, -0.2, -0.34]].map((p, i) => (
                <mesh key={i} position={p as Vec3} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.17, 0.17, 0.12, 16]} />
                  <meshStandardMaterial color="#12203a" />
                </mesh>
              ))}
            </group>
          </group>
        </Pickable>
      </Appear>

      {/* grid connection (always present, subtle) */}
      <Pickable id="grid" onPick={onPick}>
        <group position={[-4.2, 0, -2]}>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 2.6, 8]} />
            <meshStandardMaterial color="#9aa7b8" />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.7, 0.08, 0.08]} />
            <meshStandardMaterial color="#9aa7b8" />
          </mesh>
        </group>
      </Pickable>
    </group>
  );
}

/* rising heat particles for underfloor */
function RisingHeat({ color }: { color: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    g.current?.children.forEach((c, i) => {
      c.position.y += dt * (0.25 + (i % 3) * 0.05);
      if (c.position.y > 1.6) c.position.y = 0.1;
    });
  });
  return (
    <group ref={g}>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[(i % 5) * 0.55 - 1.1, 0.1 + (i / 10) * 1.4, ((i % 3) - 1) * 0.5]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* AC airflow arcs */
function AirBlow({ color, origin }: { color: string; origin: Vec3 }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    g.current?.children.forEach((c) => {
      c.position.y -= dt * 0.5;
      c.position.z += dt * 0.3;
      if (c.position.y < 0.4) {
        c.position.y = origin[1];
        c.position.z = origin[2];
      }
    });
  });
  return (
    <group ref={g}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[origin[0] + ((i % 3) - 1) * 0.18, origin[1] - i * 0.1, origin[2]]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/* environmental energy drawn into the heat pump */
function EnvParticles({ color }: { color: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    g.current?.children.forEach((c) => {
      c.position.x += dt * 0.4;
      if (c.position.x > 0) c.position.x = -0.8 - Math.random() * 0.4;
    });
  });
  return (
    <group ref={g}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.8 - (i / 6) * 0.5, 0.1 + ((i % 3) - 1) * 0.15, 0]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* Orbit controls target the house on every device. Auto-rotate only on desktop
   (auto-rotate in portrait was swinging the camera off the house). */
function Rig({ isMobile }: { isMobile: boolean }) {
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      autoRotate={!isMobile}
      autoRotateSpeed={0.32}
      enableZoom
      minDistance={7}
      maxDistance={16}
      minPolarAngle={Math.PI / 3.6}
      maxPolarAngle={Math.PI / 2.08}
      minAzimuthAngle={isMobile ? -Math.PI / 5 : -Math.PI / 2.6}
      maxAzimuthAngle={isMobile ? Math.PI / 5 : Math.PI / 3}
      target={[0, 1.1, 0]}
    />
  );
}

/* ---------------- flow derivation from state ---------------- */
function useFlows(active: TechId[], isDay: boolean, model: EnergyModel, quality: "high" | "low") {
  const has = (t: TechId) => active.includes(t);
  const c = quality === "low" ? 3 : 5;
  const flows: { key: string; from: Vec3; to: Vec3; color: string; count: number; speed?: number }[] = [];

  if (has("solar") && isDay) {
    flows.push({ key: "sun-panels", from: ANCHORS.sun, to: ANCHORS.panels, color: FLOW_COLORS.solar, count: c, speed: 0.5 });
    flows.push({ key: "panels-home", from: ANCHORS.panels, to: ANCHORS.home, color: FLOW_COLORS.renewable, count: c });
    if (has("battery") && model.batteryCharge > 0)
      flows.push({ key: "panels-battery", from: ANCHORS.panels, to: ANCHORS.battery, color: FLOW_COLORS.stored, count: c });
  }
  if (has("battery") && model.batteryDischarge > 0)
    flows.push({ key: "battery-home", from: ANCHORS.battery, to: ANCHORS.home, color: FLOW_COLORS.stored, count: c });
  if (model.gridImport > 0)
    flows.push({ key: "grid-home", from: ANCHORS.grid, to: ANCHORS.home, color: FLOW_COLORS.grid, count: c, speed: 0.4 });

  if (has("heatpump")) {
    const supply = has("solar") && isDay ? FLOW_COLORS.renewable : has("battery") ? FLOW_COLORS.stored : FLOW_COLORS.grid;
    flows.push({ key: "home-hp", from: ANCHORS.home, to: ANCHORS.heatpump, color: supply, count: c });
    flows.push({ key: "hp-floor", from: ANCHORS.heatpump, to: ANCHORS.floor, color: FLOW_COLORS.heat, count: c });
  }
  if (has("ev")) {
    const supply = has("solar") && isDay ? FLOW_COLORS.renewable : has("battery") ? FLOW_COLORS.stored : FLOW_COLORS.grid;
    flows.push({ key: "home-ev", from: ANCHORS.home, to: ANCHORS.ev, color: supply, count: c });
  }
  return flows;
}

/* ---------------- Scene ---------------- */
export default function Scene({
  active,
  isDay,
  flowMode,
  greenness,
  acMode,
  model,
  quality,
  isMobile,
  onPick,
}: {
  active: TechId[];
  isDay: boolean;
  flowMode: boolean;
  greenness: number;
  acMode: "cool" | "heat";
  model: EnergyModel;
  quality: "high" | "low";
  isMobile: boolean;
  onPick: (id: TechId | "grid") => void;
}) {
  const flows = useFlows(active, isDay, model, quality);
  const grass = new THREE.Color("#9fb59b").lerp(new THREE.Color("#6fae5a"), greenness);
  const sky = isDay
    ? new THREE.Color("#d7e9f6").lerp(new THREE.Color("#e3f3ea"), greenness * 0.5)
    : new THREE.Color("#132038");
  // Stable identity so R3F applies it once and doesn't clobber CameraFit each render.
  const camProp = useMemo(
    () =>
      isMobile
        ? { position: [2.4, 4, 12.8] as [number, number, number], fov: 48 }
        : { position: [6.8, 5, 9] as [number, number, number], fov: 40 },
    [isMobile]
  );

  return (
    <Canvas
      shadows={quality === "high"}
      dpr={quality === "low" ? [1, 1.4] : [1, 1.8]}
      camera={camProp}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[sky.getStyle()]} />
      <fog attach="fog" args={[sky.getStyle(), 16, 30]} />

      {/* lighting reacts to day/night */}
      <ambientLight intensity={isDay ? 0.85 : 0.4} color={isDay ? "#ffffff" : "#9db6df"} />
      <directionalLight
        position={ANCHORS.sun}
        intensity={isDay ? 1.15 : 0.25}
        color={isDay ? "#fff3da" : "#8ea6d6"}
        castShadow={quality === "high"}
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight intensity={0.25} color={isDay ? "#ffffff" : "#33415f"} groundColor={grass.getStyle()} />

      {/* sun / moon */}
      <mesh position={ANCHORS.sun}>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshBasicMaterial color={isDay ? "#ffe08a" : "#cdd7ec"} toneMapped={false} />
      </mesh>

      {/* ground + driveway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[13, 60]} />
        <meshStandardMaterial color={grass.getStyle()} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.9, 0.01, 0.3]}>
        <planeGeometry args={[3.2, 1.5]} />
        <meshStandardMaterial color="#c2cdda" />
      </mesh>

      <House active={active} isDay={isDay} flowMode={flowMode} greenness={greenness} acMode={acMode} onPick={onPick} />

      {flows.map((f) => (
        <EnergyFlow key={f.key} from={f.from} to={f.to} color={f.color} count={f.count} speed={f.speed} emphasis={flowMode ? 1.5 : 1} />
      ))}

      {/* F-Gas trust label when AC active */}
      {active.includes("aircon") && (
        <Html position={[-2.3, 1.1, -0.5]} center distanceFactor={10} zIndexRange={[10, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-navy shadow">
            Installed by qualified F-Gas engineers
          </div>
        </Html>
      )}

      <ContactShadows position={[0, 0.01, 0]} opacity={isDay ? 0.35 : 0.18} scale={16} blur={2.6} far={5} />
      <Rig isMobile={isMobile} />
    </Canvas>
  );
}
