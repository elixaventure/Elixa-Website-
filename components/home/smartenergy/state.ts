/**
 * Elixa Smart Energy Home — illustrative front-end energy model.
 *
 * IMPORTANT: every number here is an ILLUSTRATIVE demonstration, not a certified
 * energy calculation or a savings guarantee. The structure deliberately isolates
 * the maths in pure functions so a real property-specific engine/API can replace
 * `computeEnergy` later without touching the UI or 3D scene.
 */

import type { IconKey } from "@/content/services";

export type TechId =
  | "solar"
  | "battery"
  | "heatpump"
  | "aircon"
  | "thermaskirt"
  | "underfloor"
  | "ev";

export interface Tech {
  id: TechId;
  label: string;
  short: string;
  icon: IconKey;
  emoji: string;
  slug: string;
  blurb: string;
}

export const TECHS: Tech[] = [
  { id: "solar", label: "Solar PV", short: "Solar", icon: "solar", emoji: "☀", slug: "/solar-pv", blurb: "Generate clean electricity directly from your roof." },
  { id: "battery", label: "Battery Storage", short: "Battery", icon: "battery", emoji: "🔋", slug: "/battery-storage", blurb: "Store excess energy and use it when your home needs it." },
  { id: "heatpump", label: "Air Source Heat Pump", short: "Heat Pump", icon: "heatpump", emoji: "🌡", slug: "/air-source-heat-pumps", blurb: "Low-carbon heating designed around your property." },
  { id: "aircon", label: "Air Conditioning", short: "Air Con", icon: "aircon", emoji: "❄", slug: "/air-conditioning", blurb: "Efficient year-round heating and cooling. Installed by fully qualified F-Gas engineers." },
  { id: "thermaskirt", label: "ThermaSkirt Heating", short: "ThermaSkirt", icon: "thermaskirt", emoji: "🔥", slug: "/thermaskirt", blurb: "Discreet skirting heating that warms rooms from the perimeter." },
  { id: "underfloor", label: "Underfloor Heating", short: "Underfloor", icon: "underfloor", emoji: "♨", slug: "/underfloor-heating", blurb: "Even, low-temperature warmth across the whole floor." },
  { id: "ev", label: "EV Charging", short: "EV", icon: "ev", emoji: "⚡", slug: "/ev-charging", blurb: "Smart home charging powered by your own energy." },
];

export const techById = (id: TechId) => TECHS.find((t) => t.id === id)!;

/** Map internal tech id → the marketing service slug (for quote preselect). */
export const TECH_TO_SERVICE_SLUG: Record<TechId, string> = {
  solar: "solar-pv",
  battery: "battery-storage",
  heatpump: "air-source-heat-pumps",
  aircon: "air-conditioning",
  thermaskirt: "thermaskirt",
  underfloor: "underfloor-heating",
  ev: "ev-charging",
};

/* ---------- energy colours (shared with the 3D scene) ---------- */
export const FLOW_COLORS = {
  solar: "#f5c542", // sun → panels (gold)
  renewable: "#6ABF4B", // solar → home (green)
  stored: "#1D9ED9", // solar ↔ battery (cyan)
  heat: "#f2683c", // heat delivery (warm orange)
  cool: "#2b9fd4", // cooling (cool blue)
  grid: "#7b5cff", // grid → home (electric purple)
} as const;

export interface EnergyModel {
  solarGeneration: number;
  homeDemand: number;
  batteryPct: number;
  batteryCharge: number; // kW into battery
  batteryDischarge: number; // kW out of battery
  gridImport: number;
  evDemand: number;
  heatDemand: number;
  acDemand: number;
  renewablePct: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** The illustrative simulation. Pure function of selection + time of day. */
export function computeEnergy(sel: Set<TechId>, isDay: boolean): EnergyModel {
  const has = (t: TechId) => sel.has(t);

  const base = 2.1;
  const heatDemand = has("heatpump") ? 1.1 : 0;
  const acDemand = has("aircon") ? 0.8 : 0;
  const evDemand = has("ev") ? 1.4 : 0;
  const homeDemand = r1(base + heatDemand + acDemand + evDemand);

  const solarGeneration = has("solar") && isDay ? 3.8 : 0;

  let remaining = homeDemand;
  const solarToHome = Math.min(solarGeneration, remaining);
  remaining -= solarToHome;
  const solarExcess = Math.max(0, solarGeneration - solarToHome);

  let batteryCharge = 0;
  let batteryDischarge = 0;
  if (has("battery")) {
    if (solarExcess > 0 && isDay) batteryCharge = Math.min(solarExcess, 2.5);
    if (remaining > 0) {
      batteryDischarge = Math.min(remaining, 3.0);
      remaining -= batteryDischarge;
    }
  }

  const gridImport = Math.max(0, r1(remaining));
  const renewablePct =
    homeDemand > 0 ? Math.round(((homeDemand - gridImport) / homeDemand) * 100) : 100;
  const batteryPct = has("battery") ? (isDay ? 82 : 61) : 0;

  return {
    solarGeneration: r1(solarGeneration),
    homeDemand,
    batteryPct,
    batteryCharge: r1(batteryCharge),
    batteryDischarge: r1(batteryDischarge),
    gridImport,
    evDemand: r1(evDemand),
    heatDemand: r1(heatDemand),
    acDemand: r1(acDemand),
    renewablePct: Math.max(0, Math.min(100, renewablePct)),
  };
}

/* ---------- illustrative energy score ---------- */
const SCORE_BASE = 42;
const SCORE_WEIGHT: Record<TechId, number> = {
  solar: 16,
  battery: 12,
  heatpump: 10,
  underfloor: 4,
  thermaskirt: 3,
  aircon: 3,
  ev: 6,
};

export function energyScore(sel: Set<TechId>): { score: number; label: string } {
  let score = SCORE_BASE;
  sel.forEach((t) => (score += SCORE_WEIGHT[t]));
  // synergy
  if (sel.has("solar") && sel.has("battery")) score += 4;
  if (sel.has("solar") && sel.has("battery") && sel.has("heatpump")) score += 3;
  if (sel.has("solar") && sel.has("battery") && sel.has("heatpump") && sel.has("ev")) score += 2;
  score = Math.max(SCORE_BASE, Math.min(96, score));

  const core = sel.has("solar") && sel.has("battery") && sel.has("heatpump") && sel.has("ev");
  const label = core ? "Smart Energy Home" : score >= 70 ? "Highly efficient" : score >= 56 ? "Getting smarter" : "Conventional";
  return { score, label };
}

/* ---------- grid dependency ---------- */
export type GridLevel = "High" | "Medium" | "Low" | "Very low";

export function gridDependency(model: EnergyModel): { level: GridLevel; pct: number } {
  const share = model.homeDemand > 0 ? model.gridImport / model.homeDemand : 0;
  const pct = Math.round(share * 100);
  let level: GridLevel = "High";
  if (share < 0.12) level = "Very low";
  else if (share < 0.38) level = "Low";
  else if (share < 0.7) level = "Medium";
  return { level, pct };
}

/* ---------- combination intelligence ---------- */
export function comboMessage(sel: Set<TechId>): { title: string; body: string } | null {
  const s = sel.has("solar");
  const b = sel.has("battery");
  const h = sel.has("heatpump");
  const e = sel.has("ev");
  if (s && b && h && e) return { title: "Integrated Energy Home", body: "One connected energy ecosystem for electricity, heating and transport." };
  if (s && b && h) return { title: "Smarter Home Energy", body: "Generate, store and use renewable electricity to help power your home's heating." };
  if (s && b) return { title: "Great Combination", body: "Store more of the electricity generated by your solar system for use later." };
  return null;
}

/** The four technologies activated by "Build the complete Elixa home". */
export const COMPLETE_HOME: TechId[] = ["solar", "battery", "heatpump", "underfloor", "ev"];

export const SCORE_TOOLTIP =
  "An illustrative comparison showing how integrated technologies can reduce reliance on grid energy. Actual performance varies by property, system design, usage and installation.";
