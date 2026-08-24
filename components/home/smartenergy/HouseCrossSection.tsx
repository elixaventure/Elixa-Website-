"use client";

import { FLOW_COLORS, type TechId, type EnergyModel } from "./state";

/**
 * State-driven 2D cross-section of a home showing energy SOURCES (solar, battery,
 * grid) and CONSUMERS (heat pump/heating, hot water, air conditioning, EV, home
 * loads) in believable locations, with calm animated flows between them. Drawn as
 * one self-contained SVG (viewBox scales on every device — mobile & desktop).
 *
 * NOTE: illustrative schematic. Flows animate slowly for legibility.
 */

const C = FLOW_COLORS;

function Flow({
  d,
  color,
  show,
  delay = 0,
  dur = 3.6,
}: {
  d: string;
  color: string;
  show: boolean;
  delay?: number;
  dur?: number;
}) {
  if (!show) return null;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.16} strokeWidth={4.5} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeDasharray="4 22"
        style={{ animation: `flowdash ${dur}s linear infinite`, animationDelay: `${delay}s` }}
      />
    </g>
  );
}

function Tag({ x, y, children, dark }: { x: number; y: number; children: string; dark?: boolean }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize="13" fontFamily="Inter, sans-serif" fontWeight={600} fill={dark ? "#c9d6e6" : "#5a6b82"}>
      {children}
    </text>
  );
}

export function HouseCrossSection({
  active,
  isDay,
  acMode,
  model,
  flowMode,
  onPick,
}: {
  active: TechId[];
  isDay: boolean;
  acMode: "cool" | "heat";
  model: EnergyModel;
  flowMode: boolean;
  onPick: (id: TechId | "grid") => void;
}) {
  const has = (t: TechId) => active.includes(t);
  const supply = has("solar") && isDay ? C.renewable : has("battery") ? C.stored : C.grid;
  const houseOpacity = flowMode ? 0.5 : 1;
  const wall = isDay ? "#e7edf4" : "#20304d";
  const wallLine = isDay ? "#c4d3e4" : "#33456a";
  const roomFill = isDay ? "#f6f9fc" : "#1a2740";
  const warm = has("heatpump") || has("thermaskirt") || has("underfloor") || (has("aircon") && acMode === "heat");
  const clickCursor = { cursor: "pointer" } as const;

  const Equip = ({ tech, children }: { tech: TechId | "grid"; children: React.ReactNode }) => (
    <g onClick={() => onPick(tech)} style={clickCursor}>
      {children}
    </g>
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: isDay ? "linear-gradient(180deg,#dcecf8,#e9f3ec)" : "linear-gradient(180deg,#132038,#0b1526)" }}
    >
      <svg viewBox="0 0 940 600" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Cross-section of a smart energy home">
        {/* sky glow / sun / moon */}
        <circle cx={840} cy={78} r={30} fill={isDay ? "#ffd873" : "#cdd7ec"} opacity={isDay ? 1 : 0.6} />
        {isDay && has("solar") && [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return <line key={deg} x1={840 + Math.cos(r) * 36} y1={78 + Math.sin(r) * 36} x2={840 + Math.cos(r) * 46} y2={78 + Math.sin(r) * 46} stroke={C.solar} strokeWidth={3} strokeLinecap="round" />;
        })}

        {/* ground */}
        <rect x={0} y={548} width={940} height={52} fill={isDay ? "#cfe0c6" : "#1a2a1c"} />
        <rect x={640} y={548} width={300} height={8} fill={isDay ? "#c3cedb" : "#243247"} />

        {/* ===== HOUSE SHELL (cutaway) ===== */}
        <g opacity={houseOpacity}>
          {/* roof */}
          <polygon points="278,250 470,150 662,250" fill={isDay ? "#22467e" : "#16305c"} />
          {/* body */}
          <rect x={300} y={250} width={340} height={298} fill={roomFill} stroke={wallLine} strokeWidth={2} />
          {/* mid floor slab (underfloor zone) */}
          <rect x={300} y={378} width={340} height={18} fill={isDay ? "#e6edf6" : "#243c5a"} />
          <rect x={300} y={378} width={340} height={18} fill={isDay ? "#e6edf6" : "#22324f"} stroke={wallLine} strokeWidth={1} />
          {/* base slab */}
          <rect x={300} y={536} width={340} height={12} fill={isDay ? "#d6e1ee" : "#26374f"} />
          {/* room divider (utility partition) */}
          <line x1={560} y1={396} x2={560} y2={536} stroke={wallLine} strokeWidth={2} />
          {/* windows */}
          <rect x={470} y={296} width={54} height={54} rx={3} fill={isDay ? "#cfe6f5" : "#0f1c34"} stroke={wallLine} />
          {!isDay && <rect x={470} y={296} width={54} height={54} rx={3} fill="#ffd98a" opacity={0.5} />}
          {/* room labels */}
          <Tag x={410} y={286} dark={!isDay}>Bedroom</Tag>
          <Tag x={430} y={470} dark={!isDay}>Living room</Tag>
          <Tag x={600} y={430} dark={!isDay}>Utility</Tag>
        </g>

        {/* ===== CONSUMERS: home loads (always) ===== */}
        <g opacity={houseOpacity}>
          {/* ceiling light */}
          <circle cx={420} cy={410} r={5} fill={isDay ? "#f5d36b" : "#ffdf8a"} />
          <line x1={420} y1={396} x2={420} y2={405} stroke={wallLine} />
        </g>

        {/* underfloor coils */}
        {has("underfloor") && (
          <Equip tech="underfloor">
            <path d="M312 387 q14 -7 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t20 0" fill="none" stroke={C.heat} strokeWidth={3} strokeLinecap="round" />
            <Tag x={470} y={368} dark={!isDay}>Underfloor heating</Tag>
          </Equip>
        )}

        {/* thermaskirt strips */}
        {has("thermaskirt") && (
          <Equip tech="thermaskirt">
            <rect x={306} y={528} width={330} height={7} rx={2} fill={C.heat} />
            <rect x={306} y={372} width={330} height={6} rx={2} fill={C.heat} />
          </Equip>
        )}

        {/* solar panels on roof */}
        {has("solar") && (
          <Equip tech="solar">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${330 + i * 58} ${216 - i * 30}) rotate(-27)`}>
                <rect width={52} height={30} rx={2} fill="#12244a" stroke={C.stored} strokeWidth={2} />
                <line x1={17} y1={0} x2={17} y2={30} stroke="#3a4c6b" />
                <line x1={35} y1={0} x2={35} y2={30} stroke="#3a4c6b" />
              </g>
            ))}
          </Equip>
        )}

        {/* grid: pole + meter (always) */}
        <Equip tech="grid">
          <line x1={110} y1={300} x2={110} y2={548} stroke={isDay ? "#9aa7b8" : "#5b6b86"} strokeWidth={5} />
          <line x1={92} y1={300} x2={128} y2={300} stroke={isDay ? "#9aa7b8" : "#5b6b86"} strokeWidth={5} />
          <line x1={112} y1={306} x2={300} y2={318} stroke={isDay ? "#9aa7b8" : "#5b6b86"} strokeWidth={2} />
          <rect x={286} y={452} width={20} height={26} rx={2} fill={isDay ? "#eef3f8" : "#243c5a"} stroke={C.grid} strokeWidth={2} />
          <Tag x={128} y={296} dark={!isDay}>Grid</Tag>
        </Equip>

        {/* inverter + consumer unit */}
        {(has("solar") || has("battery")) && (
          <g>
            <rect x={322} y={486} width={26} height={40} rx={4} fill={isDay ? "#eef7ff" : "#243c5a"} stroke={C.solar} strokeWidth={2} />
            <path d="M335 494 l-6 12 h5 l-2 10 8 -14 h-5 z" fill={C.solar} />
            <Tag x={335} y={540} dark={!isDay}>Inverter</Tag>
          </g>
        )}

        {/* battery */}
        {has("battery") && (
          <Equip tech="battery">
            <rect x={362} y={484} width={34} height={62} rx={5} fill={isDay ? "#eaf7e5" : "#1d3a24"} stroke={C.renewable} strokeWidth={2.5} />
            <rect x={374} y={478} width={10} height={8} rx={2} fill={C.renewable} />
            <text x={379} y={520} textAnchor="middle" fontSize="12" fontWeight={700} fill={isDay ? "#2f7d3a" : "#8fe0a0"}>{model.batteryPct}%</text>
            <Tag x={379} y={560} dark={!isDay}>Battery</Tag>
          </Equip>
        )}

        {/* hot water cylinder (with heat pump) */}
        {has("heatpump") && (
          <g>
            <rect x={585} y={460} width={36} height={86} rx={16} fill={isDay ? "#fdece4" : "#3a281f"} stroke={C.heat} strokeWidth={2.5} />
            <Tag x={603} y={560} dark={!isDay}>Hot water</Tag>
          </g>
        )}

        {/* heat pump (outdoor) */}
        {has("heatpump") && (
          <Equip tech="heatpump">
            <rect x={168} y={500} width={74} height={46} rx={6} fill={isDay ? "#fdece4" : "#3a281f"} stroke={C.heat} strokeWidth={2.5} />
            <circle cx={205} cy={523} r={14} fill="none" stroke={C.heat} strokeWidth={2.5} />
            <Tag x={205} y={562} dark={!isDay}>Heat pump</Tag>
          </Equip>
        )}

        {/* air conditioning: outdoor + indoor */}
        {has("aircon") && (
          <Equip tech="aircon">
            <rect x={96} y={506} width={58} height={40} rx={6} fill={isDay ? "#e8f5fc" : "#193040"} stroke={acMode === "cool" ? C.cool : C.heat} strokeWidth={2.5} />
            <rect x={330} y={268} width={70} height={18} rx={5} fill={isDay ? "#ffffff" : "#22304d"} stroke={acMode === "cool" ? C.cool : C.heat} strokeWidth={2} />
            <Tag x={125} y={562} dark={!isDay}>AC unit</Tag>
          </Equip>
        )}

        {/* EV charger + car */}
        {has("ev") && (
          <Equip tech="ev">
            <rect x={742} y={470} width={16} height={78} rx={4} fill={isDay ? "#eef7ff" : "#243c5a"} stroke={C.solar} strokeWidth={2.5} />
            <g>
              <rect x={782} y={500} width={130} height={34} rx={12} fill="#1A3A6B" />
              <path d="M800 500 q16 -24 48 -24 h30 q22 0 34 24 z" fill="#2c4a7a" />
              <circle cx={812} cy={536} r={13} fill="#12203a" />
              <circle cx={884} cy={536} r={13} fill="#12203a" />
            </g>
            <Tag x={820} y={562} dark={!isDay}>EV charging</Tag>
          </Equip>
        )}

        {/* ===================== FLOWS (calm) ===================== */}
        {/* solar */}
        <Flow show={has("solar") && isDay} color={C.solar} d="M812 92 L410 196" />
        <Flow show={has("solar") && isDay} color={C.renewable} d="M392 200 L334 250 L334 486" delay={0.6} />
        <Flow show={has("solar") && isDay} color={C.renewable} d="M345 470 L345 330 L470 330 L470 405" delay={1.1} />
        <Flow show={has("solar") && isDay && has("battery") && model.batteryCharge > 0} color={C.stored} d="M348 505 L362 512" delay={0.9} />
        {/* battery discharge */}
        <Flow show={has("battery") && model.batteryDischarge > 0} color={C.stored} d="M362 512 L345 512 L345 420 L470 420" />
        {/* grid import */}
        <Flow show={model.gridImport > 0} color={C.grid} d="M118 306 L296 316 L296 465 L322 465" />
        {/* heat pump → cylinder → floor */}
        <Flow show={has("heatpump")} color={C.heat} d="M205 500 L205 480 L585 480" delay={0.2} />
        <Flow show={has("heatpump")} color={C.heat} d="M603 460 L603 388 L330 388" delay={0.8} />
        <Flow show={has("heatpump")} color={"#35b1ab"} d="M330 396 L603 396" delay={1.4} dur={4.2} />
        {/* AC airflow into bedroom */}
        {has("aircon") && [0, 1, 2].map((i) => (
          <Flow key={i} show color={acMode === "cool" ? C.cool : C.heat} d={`M${350 + i * 20} 288 q${acMode === "cool" ? -8 : 8} 22 0 44`} delay={i * 0.4} dur={3} />
        ))}
        {/* EV */}
        <Flow show={has("ev")} color={supply} d="M345 505 L345 540 L750 540 L750 490" delay={0.4} />
      </svg>
    </div>
  );
}
