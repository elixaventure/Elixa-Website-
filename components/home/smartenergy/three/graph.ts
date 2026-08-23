/**
 * Elixa Smart Energy Home — 3D component graph + universal visual language.
 *
 * This is the architecture spine for the interactive 3D home. The house is a
 * connected graph of COMPONENTS (equipment) joined by FLOWS (energy/water paths).
 * Every flow carries a MEDIA type with its own colour, icon, particle shape and
 * movement — so meaning is never conveyed by colour alone (accessibility).
 *
 * Phases 1–2 activate the SOLAR + GRID + core-home nodes fully; later phases
 * (battery, heat pump, water, emitters, AC, EV) plug into the same structures.
 *
 * Coordinate convention (world units):
 *   ground plane y = 0; house front face toward camera at z ≈ +2.
 *   equipment sits on the interior "service plane" ~z = 1.5 so the cutaway
 *   reveals it. x spans the façade left→right.
 */

import type { TechId, EnergyModel } from "../state";

/* ---------------------------------------------------------------- media --- */

export type MediaId =
  | "solar" // sunlight → panels
  | "dc" // DC electricity
  | "ac" // AC electricity (home)
  | "stored" // battery electrical energy
  | "grid" // grid electricity
  | "waterCold" // cold mains water
  | "waterHot" // domestic hot water
  | "heatFlow" // heating flow (warm)
  | "heatReturn" // heating return (cooler)
  | "thermal" // thermal energy leaving water into a room
  | "coolAir" // AC cooling airflow
  | "warmAir" // AC heating airflow
  | "refrigerant"; // refrigerant circuit

export type ParticleShape = "ray" | "pulse" | "droplet" | "ribbon" | "glow";

export interface Media {
  id: MediaId;
  label: string;
  color: string;
  icon: string; // glyph identifier (never colour-only)
  shape: ParticleShape;
  speed: number; // relative flow speed
  /** which view-mode buckets this media belongs to */
  system: "electricity" | "water" | "heating" | "cooling";
}

export const MEDIA: Record<MediaId, Media> = {
  solar: { id: "solar", label: "Sunlight", color: "#f5c542", icon: "☀", shape: "ray", speed: 1.3, system: "electricity" },
  dc: { id: "dc", label: "DC electricity", color: "#28c0e6", icon: "⚡", shape: "pulse", speed: 2.2, system: "electricity" },
  ac: { id: "ac", label: "AC electricity", color: "#1D9ED9", icon: "⚡", shape: "pulse", speed: 2.0, system: "electricity" },
  stored: { id: "stored", label: "Stored energy", color: "#6ABF4B", icon: "🔋", shape: "pulse", speed: 1.6, system: "electricity" },
  grid: { id: "grid", label: "Grid electricity", color: "#7b5cff", icon: "⚡", shape: "pulse", speed: 1.8, system: "electricity" },
  waterCold: { id: "waterCold", label: "Cold mains water", color: "#2f9be0", icon: "💧", shape: "droplet", speed: 1.0, system: "water" },
  waterHot: { id: "waterHot", label: "Hot water", color: "#e2574c", icon: "🚿", shape: "droplet", speed: 1.05, system: "water" },
  heatFlow: { id: "heatFlow", label: "Heating flow", color: "#f2683c", icon: "♨", shape: "droplet", speed: 0.95, system: "heating" },
  heatReturn: { id: "heatReturn", label: "Heating return", color: "#35b1ab", icon: "↩", shape: "droplet", speed: 0.9, system: "heating" },
  thermal: { id: "thermal", label: "Thermal energy", color: "#ffb066", icon: "♨", shape: "glow", speed: 0.6, system: "heating" },
  coolAir: { id: "coolAir", label: "Cool air", color: "#7fc8ea", icon: "❄", shape: "ribbon", speed: 0.8, system: "cooling" },
  warmAir: { id: "warmAir", label: "Warm air", color: "#f0a978", icon: "♨", shape: "ribbon", speed: 0.8, system: "cooling" },
  refrigerant: { id: "refrigerant", label: "Refrigerant", color: "#b98cff", icon: "◆", shape: "pulse", speed: 1.4, system: "cooling" },
};

export type SystemView = "all" | "electricity" | "water" | "heating" | "cooling";

/* ----------------------------------------------------------- components --- */

export type Vec3 = [number, number, number];

/** A physical piece of equipment in the home. */
export interface ComponentNode {
  id: string;
  name: string;
  /** owning technology, or "core" for always-present infrastructure */
  tech: TechId | "core";
  /** node the EquipmentSheet should open (keeps existing onPick contract) */
  pick: TechId | "grid";
  pos: Vec3;
  tooltip: { title: string; body: string };
  /** ids of components this one is directly connected to (for highlight) */
  connects?: string[];
  /** energy conversion label shown at the node ("DC → AC") */
  converts?: string;
}

/** A directed flow between two component positions, carrying a media. */
export interface FlowEdge {
  id: string;
  from: string; // component id
  to: string; // component id
  media: MediaId;
  /** optional intermediate waypoints (world coords) for nicer routing */
  via?: Vec3[];
  /** predicate: is this flow active given selection + live model + day? */
  active: (ctx: FlowCtx) => boolean;
}

export interface FlowCtx {
  has: (t: TechId) => boolean;
  isDay: boolean;
  model: EnergyModel;
  acMode: "cool" | "heat";
}

/* ------------------------------------------------------ node positions --- */
// Kept in one place so equipment meshes and flow routing never disagree.

export const NODES: Record<string, ComponentNode> = {
  sun: {
    id: "sun", name: "The sun", tech: "solar", pick: "solar", pos: [5.6, 7.6, 0.6],
    tooltip: { title: "Solar radiation", body: "Free energy from the sun strikes your roof and is turned into electricity by the panels." },
    connects: ["solarPanels"],
  },
  solarPanels: {
    id: "solarPanels", name: "Solar panels", tech: "solar", pick: "solar", pos: [1.35, 6.0, 1.7],
    tooltip: { title: "Solar panels", body: "Convert sunlight into DC electrical energy on your roof." },
    connects: ["sun", "inverter"], converts: "Sunlight → DC",
  },
  inverter: {
    id: "inverter", name: "Solar / hybrid inverter", tech: "solar", pick: "solar", pos: [1.75, 1.35, 1.55],
    tooltip: { title: "Solar inverter", body: "Converts the DC electricity generated by your solar panels into AC electricity your home can use." },
    connects: ["solarPanels", "consumerUnit", "battery"], converts: "DC → AC",
  },
  consumerUnit: {
    id: "consumerUnit", name: "Consumer unit", tech: "core", pick: "grid", pos: [2.5, 1.7, 1.55],
    tooltip: { title: "Consumer unit", body: "Distributes electricity to the circuits around your home — solar, battery and grid all meet here." },
    connects: ["inverter", "meter", "homeLoad"],
  },
  meter: {
    id: "meter", name: "Import / export meter", tech: "core", pick: "grid", pos: [3.15, 1.35, 1.75],
    tooltip: { title: "Import / export meter", body: "Measures electricity coming from the grid — and any surplus your home exports back to it." },
    connects: ["consumerUnit", "grid"],
  },
  grid: {
    id: "grid", name: "Grid connection", tech: "core", pick: "grid", pos: [4.9, 2.6, 0.2],
    tooltip: { title: "Grid connection", body: "Your home stays connected to the grid for whatever your own system doesn't supply — and to receive exports." },
    connects: ["meter"],
  },
  homeLoad: {
    id: "homeLoad", name: "Home", tech: "core", pick: "grid", pos: [-1.2, 2.2, 1.5],
    tooltip: { title: "Your home", body: "Lights, appliances and everyday loads. Powered by solar first, then battery, then the grid." },
    connects: ["consumerUnit"],
  },

  /* --- present in the scene as clean equipment; component-level detail lands in later phases --- */
  battery: {
    id: "battery", name: "Battery storage", tech: "battery", pick: "battery", pos: [1.1, 0.75, 1.55],
    tooltip: { title: "Battery storage", body: "Stores surplus solar electricity so you can use it when the sun isn't shining." },
    connects: ["inverter", "consumerUnit"], converts: "Store ↔ Release",
  },
  heatpump: {
    id: "heatpump", name: "Air source heat pump", tech: "heatpump", pick: "heatpump", pos: [-3.7, 0.55, 1.0],
    tooltip: { title: "Air source heat pump", body: "Takes energy from the outside air, adds a little electricity, and delivers useful heat to your home." },
    connects: ["cylinder", "airSource", "consumerUnit"], converts: "Electricity + air → Heat",
  },
  airSource: {
    id: "airSource", name: "Outside air", tech: "heatpump", pick: "heatpump", pos: [-5.5, 1.7, 0.4],
    tooltip: { title: "Energy from the outside air", body: "Even cool air holds thermal energy. The heat pump draws it in and concentrates it into useful heat." },
    connects: ["heatpump"],
  },
  cylinder: {
    id: "cylinder", name: "Hot-water cylinder", tech: "heatpump", pick: "heatpump", pos: [2.9, 0.95, 1.1],
    tooltip: { title: "Pre-plumbed heat-pump cylinder", body: "A pre-plumbed cylinder with buffer, built for heat pumps: cold mains water is heated by the heat pump's coil and stored ready for your showers, baths and taps." },
    connects: ["heatpump", "waterMain", "shower", "kitchenTap"], converts: "Cold water + heat → Hot water",
  },
  waterMain: {
    id: "waterMain", name: "Street water main", tech: "heatpump", pick: "heatpump", pos: [-5.3, 0.25, 2.9],
    tooltip: { title: "Street water main", body: "Cold mains water enters your property from the street supply and feeds the hot-water cylinder." },
    connects: ["cylinder"],
  },
  shower: {
    id: "shower", name: "Shower", tech: "heatpump", pick: "heatpump", pos: [2.2, 3.75, -1.2],
    tooltip: { title: "Shower", body: "Hot water stored in the cylinder supplies your shower and bath." },
    connects: ["cylinder"],
  },
  kitchenTap: {
    id: "kitchenTap", name: "Kitchen tap", tech: "heatpump", pick: "heatpump", pos: [-2.5, 1.15, -1.5],
    tooltip: { title: "Kitchen tap", body: "Hot domestic water from the cylinder, on demand at the tap." },
    connects: ["cylinder"],
  },
  ufManifold: {
    id: "ufManifold", name: "Underfloor manifold", tech: "underfloor", pick: "underfloor", pos: [1.7, 0.75, -1.35],
    tooltip: { title: "Underfloor manifold", body: "Distributes warm heating water into the individual floor zones and balances the flow through each loop." },
    connects: ["heatpump", "ufLoop"],
  },
  ufLoop: {
    id: "ufLoop", name: "Underfloor pipe loops", tech: "underfloor", pick: "underfloor", pos: [-1.1, 0.22, -0.4],
    tooltip: { title: "Underfloor pipe loops", body: "Warm water winds beneath the floor. The heat leaves the water and rises gently into the room — then the cooler water returns to be reheated." },
    connects: ["ufManifold"], converts: "Warm water → Room heat",
  },
  ufAir: {
    id: "ufAir", name: "Room warmth", tech: "underfloor", pick: "underfloor", pos: [-1.1, 1.8, -0.4],
    tooltip: { title: "Room warmth", body: "Even, low-temperature warmth across the whole floor." },
  },
  thermaskirt: {
    id: "thermaskirt", name: "ThermaSkirt", tech: "thermaskirt", pick: "thermaskirt", pos: [-0.85, 0.3, 0.2],
    tooltip: { title: "ThermaSkirt heating profile", body: "Heating water circulates through the skirting profile around the room perimeter, releasing steady warmth into the room." },
    connects: ["heatpump"], converts: "Warm water → Room heat",
  },
  tsAir: {
    id: "tsAir", name: "Room warmth", tech: "thermaskirt", pick: "thermaskirt", pos: [-0.85, 1.8, 1.0],
    tooltip: { title: "Room warmth", body: "Perimeter warmth from the skirting line." },
  },
  acOutdoor: {
    id: "acOutdoor", name: "AC condenser", tech: "aircon", pick: "aircon", pos: [-3.2, 0.5, 0.3],
    tooltip: { title: "Outdoor condenser", body: "The outdoor half of your air-conditioning system. Installed by fully qualified F-Gas engineers." },
    connects: ["acIndoor"],
  },
  acIndoor: {
    id: "acIndoor", name: "Indoor AC unit", tech: "aircon", pick: "aircon", pos: [-1.6, 3.7, 1.55],
    tooltip: { title: "Indoor unit", body: "Delivers cooling in summer and heating in winter — complete climate control from one system." },
    connects: ["acOutdoor"],
  },
  evCharger: {
    id: "evCharger", name: "EV charger", tech: "ev", pick: "ev", pos: [3.5, 1.0, 2.1],
    tooltip: { title: "EV charger", body: "Charges your car from solar and battery first, topping up from the grid when needed." },
    connects: ["consumerUnit", "evCar"],
  },
  evCar: {
    id: "evCar", name: "Electric vehicle", tech: "ev", pick: "ev", pos: [4.9, 0.45, 2.3],
    tooltip: { title: "Electric vehicle", body: "Your car's battery becomes part of the home energy story — ideally charged with your own clean power." },
    connects: ["evCharger"],
  },
};

/* --------------------------------------------------------------- flows --- */

export const FLOWS: FlowEdge[] = [
  // ---- Phase 2: SOLAR + GRID (fully implemented) ----
  { id: "sun-panels", from: "sun", to: "solarPanels", media: "solar", active: (c) => c.has("solar") && c.isDay },
  { id: "panels-inv", from: "solarPanels", to: "inverter", media: "dc", active: (c) => c.has("solar") && c.isDay && c.model.solarGeneration > 0 },
  { id: "inv-cu", from: "inverter", to: "consumerUnit", media: "ac", active: (c) => c.has("solar") && c.isDay && c.model.solarGeneration > 0 },
  { id: "cu-home", from: "consumerUnit", to: "homeLoad", media: "ac", via: [[1.4, 1.7, 1.5]], active: () => true },
  // grid import: grid → meter → consumer unit
  { id: "grid-meter", from: "grid", to: "meter", media: "grid", active: (c) => c.model.gridImport > 0 },
  { id: "meter-cu", from: "meter", to: "consumerUnit", media: "grid", active: (c) => c.model.gridImport > 0 },
  // grid export: surplus solar → grid
  { id: "cu-meter-exp", from: "consumerUnit", to: "meter", media: "ac", active: (c) => c.has("solar") && c.isDay && exportSurplus(c) > 0 },
  { id: "meter-grid-exp", from: "meter", to: "grid", media: "ac", active: (c) => c.has("solar") && c.isDay && exportSurplus(c) > 0 },

  // ---- Phase 3: battery ----
  { id: "solar-batt", from: "inverter", to: "battery", media: "stored", active: (c) => c.has("battery") && c.model.batteryCharge > 0 },
  { id: "batt-home", from: "battery", to: "consumerUnit", media: "stored", active: (c) => c.has("battery") && c.model.batteryDischarge > 0 },

  // ---- Phase 4: heat pump + water ----
  // electricity in
  { id: "cu-hp", from: "consumerUnit", to: "heatpump", media: "ac", via: [[-0.2, 0.5, 1.9]], active: (c) => c.has("heatpump") },
  // environmental thermal energy in
  { id: "air-hp", from: "airSource", to: "heatpump", media: "thermal", active: (c) => c.has("heatpump") },
  // heating flow → cylinder coil, cooler return back (closed circulating loop)
  { id: "hp-cyl", from: "heatpump", to: "cylinder", media: "heatFlow", via: [[-1.2, 0.45, 1.5]], active: (c) => c.has("heatpump") },
  { id: "cyl-hp", from: "cylinder", to: "heatpump", media: "heatReturn", via: [[-1.2, 0.12, 1.15]], active: (c) => c.has("heatpump") },
  // cold mains water: street → cylinder
  { id: "main-cyl", from: "waterMain", to: "cylinder", media: "waterCold", via: [[-1.2, 0.18, 2.35]], active: (c) => c.has("heatpump") },
  // hot domestic water: cylinder → shower / kitchen tap
  { id: "cyl-shower", from: "cylinder", to: "shower", media: "waterHot", via: [[2.75, 2.7, -0.2]], active: (c) => c.has("heatpump") },
  { id: "cyl-tap", from: "cylinder", to: "kitchenTap", media: "waterHot", via: [[0.2, 1.7, -0.7]], active: (c) => c.has("heatpump") },

  // ---- Phase 5: heating emitters ----
  // underfloor: heat pump → manifold → loops → heat into room → cooler return
  { id: "hp-ufm", from: "heatpump", to: "ufManifold", media: "heatFlow", via: [[-1.4, 0.5, -0.8]], active: (c) => c.has("underfloor") && c.has("heatpump") },
  { id: "ufm-loop", from: "ufManifold", to: "ufLoop", media: "heatFlow", via: [[0.3, 0.22, -1.0]], active: (c) => c.has("underfloor") },
  { id: "loop-ufair", from: "ufLoop", to: "ufAir", media: "thermal", active: (c) => c.has("underfloor") },
  { id: "loop-ufm-ret", from: "ufLoop", to: "ufManifold", media: "heatReturn", via: [[0.3, 0.14, -1.5]], active: (c) => c.has("underfloor") },
  { id: "ufm-hp-ret", from: "ufManifold", to: "heatpump", media: "heatReturn", via: [[-1.4, 0.2, -1.1]], active: (c) => c.has("underfloor") && c.has("heatpump") },
  // thermaskirt: heat pump → skirting perimeter → heat into room → return
  { id: "hp-ts", from: "heatpump", to: "thermaskirt", media: "heatFlow", via: [[-2.2, 0.35, 0.8]], active: (c) => c.has("thermaskirt") && c.has("heatpump") },
  { id: "ts-tsair", from: "thermaskirt", to: "tsAir", media: "thermal", active: (c) => c.has("thermaskirt") },
  { id: "ts-hp-ret", from: "thermaskirt", to: "heatpump", media: "heatReturn", via: [[-2.4, 0.2, 0.2]], active: (c) => c.has("thermaskirt") && c.has("heatpump") },

  // ---- Phase 7 seam: EV ----
  { id: "cu-ev", from: "consumerUnit", to: "evCharger", media: "ac", via: [[3.2, 1.0, 1.9]], active: (c) => c.has("ev") },
  { id: "ev-car", from: "evCharger", to: "evCar", media: "ac", active: (c) => c.has("ev") },
];

/** Surplus solar available to export after home + battery charging (illustrative). */
function exportSurplus(c: FlowCtx): number {
  const { model } = c;
  const used = model.homeDemand + model.batteryCharge;
  return Math.max(0, Math.round((model.solarGeneration - used) * 10) / 10);
}

/** All component ids belonging to a technology (for reveal/highlight). */
export function componentsFor(tech: TechId | "core"): ComponentNode[] {
  return Object.values(NODES).filter((n) => n.tech === tech);
}
