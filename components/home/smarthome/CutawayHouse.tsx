"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { IconKey } from "@/content/services";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

/* ---------- palette ---------- */
const ELEC = "#f5c542"; // electricity
const HEAT = "#f2683c"; // heat delivery
const COOL = "#2b9fd4"; // cool delivery
const GREEN = "#6ABF4B";
const NAVY = "#1A3A6B";

type Sys = IconKey;

const SYSTEMS: {
  id: Sys;
  label: string;
  slug: string;
  blurb: string;
  flow: "electricity" | "heat" | "cool";
}[] = [
  { id: "solar", label: "Solar PV", slug: "/solar-pv", flow: "electricity", blurb: "Roof panels turn daylight into clean electricity, feeding the inverter, the battery and the whole home." },
  { id: "battery", label: "Battery Storage", slug: "/battery-storage", flow: "electricity", blurb: "Stores surplus solar and cheap off-peak power, then releases it to the home when you need it." },
  { id: "heatpump", label: "Air Source Heat Pump", slug: "/air-source-heat-pumps", flow: "heat", blurb: "Pulls warmth from the outside air and delivers it to your hot water and heating — efficiently and quietly." },
  { id: "aircon", label: "Air Conditioning", slug: "/air-conditioning", flow: "cool", blurb: "The outdoor condenser and indoor unit deliver refreshing cooling in summer and efficient heating in winter." },
  { id: "thermaskirt", label: "ThermaSkirt Heating", slug: "/thermaskirt", flow: "heat", blurb: "Heated skirting warms each room gently from the perimeter — no radiators, no lost wall space." },
  { id: "underfloor", label: "Underfloor Heating", slug: "/underfloor-heating", flow: "heat", blurb: "Warm water runs through the floor, spreading even, low-temperature heat across the whole room." },
  { id: "ev", label: "EV Charging", slug: "/ev-charging", flow: "electricity", blurb: "Smart charging tops up the car on your own solar and battery, or cheap off-peak power overnight." },
];

const flowColor = (f: "electricity" | "heat" | "cool", acMode: "cool" | "heat") =>
  f === "electricity" ? ELEC : f === "cool" ? (acMode === "heat" ? HEAT : COOL) : HEAT;

export function CutawayHouse() {
  const [active, setActive] = useState<Sys>("solar");
  const [acMode, setAcMode] = useState<"cool" | "heat">("cool");
  const current = SYSTEMS.find((s) => s.id === active)!;

  const on = (id: Sys) => active === id;
  // dim equipment not part of the active system
  const dim = (ids: Sys[]) => (ids.includes(active) ? 1 : 0.25);
  const select = (id: Sys) => {
    setActive(id);
    track("cta_click", { location: "cutaway-house", label: id });
  };

  const col = flowColor(current.flow, acMode);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-stretch">
      {/* Stage */}
      <div className="relative overflow-hidden rounded-4xl border border-navy/10 bg-gradient-to-b from-[#eaf3fb] to-[#dfeaf4] shadow-elevated">
        <svg viewBox="0 0 1000 640" className="h-full w-full" role="img" aria-label={`Cutaway house showing ${current.label}`}>
          <defs>
            <linearGradient id="ch-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef6fd" />
              <stop offset="1" stopColor="#dce9f5" />
            </linearGradient>
            <linearGradient id="ch-roof" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#22467e" />
              <stop offset="1" stopColor="#16305c" />
            </linearGradient>
            <radialGradient id="ch-sun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffe9a8" />
              <stop offset="1" stopColor="#f5c542" />
            </radialGradient>
          </defs>

          {/* sky + ground */}
          <rect width="1000" height="640" fill="url(#ch-sky)" />
          <rect y="582" width="1000" height="58" fill="#cbe0c4" />
          <rect y="582" width="1000" height="6" fill="#b7d3ae" />

          {/* sun */}
          <g style={{ animation: on("solar") ? "softpulse 2.6s ease-in-out infinite" : undefined }}>
            <circle cx="905" cy="86" r="34" fill="url(#ch-sun)" opacity={on("solar") ? 1 : 0.55} />
            {on("solar") &&
              [0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <line
                  key={a}
                  x1={905 + Math.cos((a * Math.PI) / 180) * 42}
                  y1={86 + Math.sin((a * Math.PI) / 180) * 42}
                  x2={905 + Math.cos((a * Math.PI) / 180) * 54}
                  y2={86 + Math.sin((a * Math.PI) / 180) * 54}
                  stroke={ELEC}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
          </g>

          {/* ===== House shell (cutaway) ===== */}
          {/* roof */}
          <polygon points="150,250 370,120 590,250" fill="url(#ch-roof)" />
          <polygon points="370,120 590,250 560,250 370,150" fill="#0f2547" opacity="0.5" />
          {/* body / rooms */}
          <rect x="182" y="250" width="376" height="332" fill="#f7fafd" stroke="#c4d3e4" strokeWidth="2" />
          {/* mid floor slab (underfloor) */}
          <rect x="182" y="404" width="376" height="20" fill="#e7eef6" stroke="#c4d3e4" strokeWidth="1.5" />
          {/* base slab */}
          <rect x="182" y="566" width="376" height="16" fill="#dbe6f1" />
          {/* interior wall dividing utility */}
          <line x1="360" y1="424" x2="360" y2="566" stroke="#dbe6f1" strokeWidth="3" />
          {/* windows */}
          <rect x="470" y="300" width="60" height="60" rx="3" fill="#cfe6f5" stroke="#b7cde0" />
          <rect x="470" y="470" width="60" height="60" rx="3" fill="#cfe6f5" stroke="#b7cde0" />
          {/* room labels */}
          <text x="450" y="290" textAnchor="end" fontSize="15" fill="#9fb2c6" fontFamily="sans-serif">Bedroom</text>
          <text x="450" y="460" textAnchor="end" fontSize="15" fill="#9fb2c6" fontFamily="sans-serif">Living room</text>

          {/* ===== ThermaSkirt (skirting strips) ===== */}
          <g style={{ opacity: dim(["thermaskirt"]) }}>
            <rect x="188" y="392" width="366" height="8" rx="2" fill={on("thermaskirt") ? HEAT : "#cdd9e6"} />
            <rect x="188" y="554" width="366" height="8" rx="2" fill={on("thermaskirt") ? HEAT : "#cdd9e6"} />
          </g>

          {/* ===== Underfloor coils ===== */}
          <g style={{ opacity: dim(["underfloor"]) }}>
            <path
              d="M192 414 q16 -8 32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t20 0"
              fill="none"
              stroke={on("underfloor") ? HEAT : "#c0cfe0"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* ===== Solar panels on roof ===== */}
          <g style={{ opacity: dim(["solar"]) }}>
            {[0, 1, 2].map((i) => {
              const x = 196 + i * 56;
              const y = 232 - i * 33;
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(-30)`}>
                  <rect width="48" height="30" rx="2" fill={on("solar") ? "#1a3566" : "#26364f"} stroke={on("solar") ? COOL : "#3a4c6b"} strokeWidth="2" />
                  <line x1="16" y1="0" x2="16" y2="30" stroke="#4a6088" strokeWidth="1" />
                  <line x1="32" y1="0" x2="32" y2="30" stroke="#4a6088" strokeWidth="1" />
                </g>
              );
            })}
          </g>

          {/* ===== Utility: inverter, battery, hot-water cylinder ===== */}
          {/* inverter */}
          <g style={{ opacity: dim(["solar", "battery", "ev"]) }}>
            <rect x="196" y="486" width="30" height="42" rx="4" fill={on("solar") || on("battery") || on("ev") ? "#eef7ff" : "#e7eef6"} stroke={ELEC} strokeWidth="2" />
            <ServiceIconGlyph x={202} y={498} />
          </g>
          {/* battery */}
          <g style={{ opacity: dim(["battery", "solar", "ev"]) }}>
            <rect x="236" y="484" width="34" height="80" rx="6" fill={on("battery") ? "#e9f7e5" : "#eef2f7"} stroke={on("battery") ? GREEN : "#c4d3e4"} strokeWidth="2.5" />
            <rect x="248" y="470" width="10" height="14" rx="2" fill={on("battery") ? GREEN : "#c4d3e4"} />
            {[0, 1, 2].map((i) => (
              <rect key={i} x="242" y={498 + i * 18} width="22" height="10" rx="2" fill={on("battery") ? GREEN : "#d5e0ec"} />
            ))}
          </g>
          {/* hot water cylinder */}
          <g style={{ opacity: dim(["heatpump"]) }}>
            <rect x="300" y="470" width="40" height="94" rx="18" fill={on("heatpump") ? "#fdece4" : "#eef2f7"} stroke={on("heatpump") ? HEAT : "#c4d3e4"} strokeWidth="2.5" />
            <ellipse cx="320" cy="470" rx="20" ry="6" fill={on("heatpump") ? HEAT : "#c4d3e4"} opacity="0.6" />
          </g>

          {/* ===== AC indoor unit ===== */}
          <g style={{ opacity: dim(["aircon"]) }}>
            <rect x="196" y="292" width="74" height="20" rx="6" fill={on("aircon") ? "#fff" : "#eef2f7"} stroke={on("aircon") ? col : "#c4d3e4"} strokeWidth="2" />
            <line x1="204" y1="304" x2="262" y2="304" stroke="#c4d3e4" strokeWidth="2" />
          </g>

          {/* ===== Outdoor units: heat pump + AC condenser ===== */}
          <g style={{ opacity: dim(["heatpump"]) }}>
            <rect x="86" y="520" width="76" height="46" rx="6" fill={on("heatpump") ? "#fdece4" : "#e7eef6"} stroke={on("heatpump") ? HEAT : "#b9c8da"} strokeWidth="2.5" />
            <circle cx="124" cy="543" r="15" fill="none" stroke={on("heatpump") ? HEAT : "#9fb2c6"} strokeWidth="2.5" />
            <path d="M124 533 l6 10 -12 0 z" fill={on("heatpump") ? HEAT : "#9fb2c6"} />
          </g>
          <g style={{ opacity: dim(["aircon"]) }}>
            <rect x="16" y="524" width="60" height="42" rx="6" fill={on("aircon") ? "#e8f5fc" : "#e7eef6"} stroke={on("aircon") ? col : "#b9c8da"} strokeWidth="2.5" />
            <circle cx="46" cy="545" r="13" fill="none" stroke={on("aircon") ? col : "#9fb2c6"} strokeWidth="2.5" />
          </g>

          {/* ===== EV charger + car ===== */}
          <g style={{ opacity: dim(["ev"]) }}>
            {/* driveway */}
            <rect x="612" y="566" width="360" height="16" fill="#cdd9e6" />
            {/* charger post */}
            <rect x="678" y="470" width="16" height="96" rx="4" fill={on("ev") ? "#eef7ff" : "#e7eef6"} stroke={on("ev") ? ELEC : "#b9c8da"} strokeWidth="2.5" />
            <rect x="681" y="480" width="10" height="16" rx="2" fill={on("ev") ? ELEC : "#b9c8da"} />
            {/* car */}
            <g>
              <rect x="740" y="512" width="170" height="40" rx="14" fill={NAVY} />
              <path d="M762 512 q20 -30 60 -30 h40 q28 0 44 30 z" fill="#2c4a7a" />
              <circle cx="778" cy="556" r="16" fill="#1b2a44" />
              <circle cx="872" cy="556" r="16" fill="#1b2a44" />
              <circle cx="778" cy="556" r="6" fill="#4a6088" />
              <circle cx="872" cy="556" r="6" fill="#4a6088" />
            </g>
          </g>

          {/* ===================== FLOWS ===================== */}
          {/* Solar → inverter → battery/home */}
          <Flow show={on("solar")} color={ELEC} d="M232 200 L212 250 L212 486" />
          <Flow show={on("solar")} color={ELEC} d="M212 528 L212 545 L360 545 L360 420" delay={0.6} />
          <Flow show={on("solar")} color={ELEC} d="M226 507 L236 520" delay={0.3} />

          {/* Battery ↔ home */}
          <Flow show={on("battery")} color={GREEN} d="M253 484 L253 440 L360 440 L360 420" />
          <Flow show={on("battery")} color={GREEN} d="M253 564 L253 574 L678 574 L686 566" delay={0.5} />

          {/* Heat pump → cylinder → floor/skirting */}
          <Flow show={on("heatpump")} color={HEAT} d="M124 520 L124 500 L300 500" />
          <Flow show={on("heatpump")} color={HEAT} d="M320 470 L320 414 L200 414" delay={0.5} />
          <Flow show={on("heatpump")} color={HEAT} d="M340 500 L360 500" delay={0.3} />

          {/* AC condenser → indoor unit → airflow */}
          <Flow show={on("aircon")} color={col} d="M46 524 L46 350 L233 350 L233 312" />
          {on("aircon") &&
            [0, 1, 2].map((i) => (
              <Flow
                key={i}
                show
                color={col}
                d={`M${214 + i * 22} 314 q${acMode === "cool" ? -10 : 10} 26 0 52`}
                delay={i * 0.25}
                dash="1 12"
              />
            ))}

          {/* Underfloor: warm flow across the slab */}
          <Flow show={on("underfloor")} color={HEAT} d="M192 414 q16 -8 32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t20 0" />

          {/* ThermaSkirt: warm flow along skirting */}
          <Flow show={on("thermaskirt")} color={HEAT} d="M188 396 L554 396" />
          <Flow show={on("thermaskirt")} color={HEAT} d="M188 558 L554 558" delay={0.4} />

          {/* EV: home/battery → charger → car */}
          <Flow show={on("ev")} color={ELEC} d="M253 564 L253 574 L686 574 L686 496" />
          <Flow show={on("ev")} color={ELEC} d="M694 486 L740 486 L740 520" delay={0.5} />
        </svg>

        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-navy backdrop-blur">
          Tap a system to see it work
        </div>
        <FlowLegend flow={current.flow} acMode={acMode} />
      </div>

      {/* Control / info panel */}
      <div className="flex flex-col rounded-4xl border border-navy/10 bg-white p-6 shadow-card sm:p-7">
        <div className="flex flex-wrap gap-2">
          {SYSTEMS.map((s) => (
            <button
              key={s.id}
              onClick={() => select(s.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                active === s.id
                  ? "border-transparent bg-elixa-gradient text-white shadow-glow"
                  : "border-navy/15 text-navy/70 hover:border-elixa-cyan hover:text-navy"
              )}
            >
              <ServiceIcon name={s.id} className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="mt-6 flex-1"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-elixa-gradient-soft text-navy">
                <ServiceIcon name={current.id} className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold">{current.label}</h3>
            </div>
            <p className="mt-4 text-navy/70">{current.blurb}</p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-navy/70">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: col }}
              />
              {current.flow === "electricity"
                ? "Electricity delivery"
                : current.flow === "cool"
                ? acMode === "cool"
                  ? "Cool-air delivery"
                  : "Warm-air delivery"
                : "Heat delivery"}
            </div>

            {current.id === "aircon" && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/50">
                  One system, year-round
                </p>
                <div className="inline-flex rounded-full border border-navy/15 p-1">
                  {(["cool", "heat"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setAcMode(m)}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                        acMode === m
                          ? m === "cool"
                            ? "bg-elixa-cyan text-white"
                            : "bg-[#f2683c] text-white"
                          : "text-navy/60 hover:text-navy"
                      )}
                    >
                      {m === "cool" ? "❄ Cooling" : "🔥 Heating"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Link href={current.slug} className="btn-outline btn-md mt-6 self-start">
          Explore {current.label}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

/** Animated energy flow: a faint guide + travelling dashes. */
function Flow({
  show,
  color,
  d,
  delay = 0,
  dash = "2 14",
}: {
  show: boolean;
  color: string;
  d: string;
  delay?: number;
  dash?: string;
}) {
  if (!show) return null;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.18} strokeWidth={5} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={dash}
        style={{ animation: `flowdash 1.4s linear infinite`, animationDelay: `${delay}s` }}
      />
    </g>
  );
}

function FlowLegend({ flow, acMode }: { flow: "electricity" | "heat" | "cool"; acMode: "cool" | "heat" }) {
  const items = [
    { c: ELEC, label: "Electricity" },
    { c: HEAT, label: "Heat" },
    { c: COOL, label: "Cool air" },
  ];
  const activeLabel =
    flow === "electricity" ? "Electricity" : flow === "cool" ? (acMode === "heat" ? "Heat" : "Cool air") : "Heat";
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-2">
      {items.map((it) => (
        <span
          key={it.label}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold backdrop-blur transition-opacity",
            it.label === activeLabel ? "bg-white/90 text-navy" : "bg-white/50 text-navy/50"
          )}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: it.c }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/** tiny inverter glyph */
function ServiceIconGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M10 2 L4 12 h5 l-2 8 8 -11 h-5 z" fill={ELEC} />
    </g>
  );
}
