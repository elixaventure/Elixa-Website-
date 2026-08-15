"use client";

import { FLOW_COLORS, type TechId, type EnergyModel } from "./state";

/**
 * Mobile / accessible stage: a state-driven 2D "energy nervous-system" diagram,
 * drawn as a single self-contained SVG (viewBox handles all scaling/centring, so
 * it renders identically on every device). Always renders, reads clearly in
 * portrait, and animates the real flows. Tap a node to open its info sheet.
 */

type NodeId = TechId | "sun" | "home" | "grid";
type P = { id: NodeId; x: number; y: number; label: string; glyph: string; tech?: TechId };

const NODES: P[] = [
  { id: "sun", x: 82, y: 12, label: "Sun", glyph: "☀" },
  { id: "solar", x: 30, y: 24, label: "Solar", glyph: "🔆", tech: "solar" },
  { id: "grid", x: 15, y: 44, label: "Grid", glyph: "🔌" },
  { id: "home", x: 50, y: 56, label: "Home", glyph: "🏠" },
  { id: "battery", x: 83, y: 48, label: "Battery", glyph: "🔋", tech: "battery" },
  { id: "heatpump", x: 20, y: 78, label: "Heat pump", glyph: "♨", tech: "heatpump" },
  { id: "ev", x: 83, y: 86, label: "EV", glyph: "🚗", tech: "ev" },
];
const pos = (id: NodeId) => NODES.find((n) => n.id === id)!;

export function MobileStage({
  active,
  isDay,
  model,
  onPick,
}: {
  active: TechId[];
  isDay: boolean;
  model: EnergyModel;
  acMode: "cool" | "heat";
  onPick: (id: TechId | "grid") => void;
}) {
  const has = (t: TechId) => active.includes(t);
  const supply = has("solar") && isDay ? FLOW_COLORS.renewable : has("battery") ? FLOW_COLORS.stored : FLOW_COLORS.grid;

  type Edge = { from: NodeId; to: NodeId; color: string; delay?: number };
  const edges: Edge[] = [];
  if (has("solar") && isDay) {
    edges.push({ from: "sun", to: "solar", color: FLOW_COLORS.solar });
    edges.push({ from: "solar", to: "home", color: FLOW_COLORS.renewable, delay: 0.3 });
    if (has("battery") && model.batteryCharge > 0) edges.push({ from: "solar", to: "battery", color: FLOW_COLORS.stored, delay: 0.5 });
  }
  if (has("battery") && model.batteryDischarge > 0) edges.push({ from: "battery", to: "home", color: FLOW_COLORS.stored });
  if (model.gridImport > 0) edges.push({ from: "grid", to: "home", color: FLOW_COLORS.grid });
  if (has("heatpump")) {
    edges.push({ from: "home", to: "heatpump", color: supply });
    edges.push({ from: "heatpump", to: "home", color: FLOW_COLORS.heat, delay: 0.4 });
  }
  if (has("ev")) edges.push({ from: "home", to: "ev", color: supply });

  const sub = isDay ? "#5a6b82" : "#aebfd6";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: isDay ? "linear-gradient(180deg,#e8f2fb,#eaf4ee)" : "linear-gradient(180deg,#17263f,#0e1930)" }}
    >
      <svg viewBox="0 0 100 108" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Interactive energy-flow diagram">
        {/* flow edges */}
        {edges.map((e, i) => {
          const a = pos(e.from);
          const b = pos(e.to);
          const mx = (a.x + b.x) / 2 + (a.y < b.y ? 5 : -5);
          const my = (a.y + b.y) / 2;
          const d = `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={e.color} strokeOpacity={0.2} strokeWidth={2} strokeLinecap="round" />
              <path
                d={d}
                fill="none"
                stroke={e.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="2 6"
                style={{ animation: "flowdash 1.3s linear infinite", animationDelay: `${e.delay ?? 0}s` }}
              />
            </g>
          );
        })}

        {/* nodes */}
        {NODES.map((n) => {
          const on = n.tech ? has(n.tech) : true;
          const clickable = !!n.tech || n.id === "grid";
          const r = n.id === "home" ? 8 : 6.4;
          return (
            <g
              key={n.id}
              opacity={n.tech && !on ? 0.34 : 1}
              onClick={() => (n.tech ? onPick(n.tech) : n.id === "grid" ? onPick("grid") : undefined)}
              style={{ cursor: clickable ? "pointer" : "default" }}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={isDay ? "#ffffff" : "#22304d"}
                stroke={n.id === "sun" ? "#f5c542" : on ? FLOW_COLORS.renewable : "#c4d3e4"}
                strokeWidth={1}
              />
              <text x={n.x} y={n.y + r * 0.34} textAnchor="middle" fontSize={r * 0.9} style={{ userSelect: "none" }}>
                {n.glyph}
              </text>
              <text x={n.x} y={n.y + r + 3.6} textAnchor="middle" fontSize="3.2" fontWeight="700" fill={sub} fontFamily="sans-serif">
                {n.label}
              </text>
            </g>
          );
        })}

      </svg>
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-navy backdrop-blur">
        Tap a node
      </div>
    </div>
  );
}
