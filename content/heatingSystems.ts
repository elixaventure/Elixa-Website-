/**
 * THE PRODUCT LISTS — heat sources and emitters the configurator offers.
 *
 * To add or change a product, edit the arrays below; the dropdowns, benefit
 * cards and energy calculation all read from here. Every figure is an honest
 * UK-typical illustrative value (clearly labelled as such in the UI) and is
 * refined by the proper heat-loss survey before anything is quoted.
 *
 * How the numbers drive the calculation (lib/heatingCalc.ts):
 * - a boiler's `efficiency` is heat out ÷ fuel in (0.90 = 90%)
 * - a heat pump's efficiency DEPENDS ON THE EMITTER: lower flow temperature
 *   → higher SCOP. Each emitter carries `scopWithHeatPump`, used instead of
 *   the source's base efficiency when the source is a heat pump.
 */

export type FuelId = "electricity" | "gas" | "oil" | "lpg";

export interface HeatSource {
  id: string;
  name: string;
  fuel: FuelId;
  /** heat delivered per unit fuel (boilers ≤1; heat pumps use emitter SCOP) */
  efficiency: number;
  isHeatPump?: boolean;
  /** shown as the product's benefit list when selected */
  benefits: string[];
  blurb: string;
}

export interface Emitter {
  id: string;
  name: string;
  /** typical flow temperature this emitter runs at, °C (drives the story) */
  flowTemp: number;
  /** seasonal COP a heat pump achieves feeding this emitter */
  scopWithHeatPump: number;
  benefits: string[];
  blurb: string;
  /** which 3D technology lights up in the scene */
  techId?: "thermaskirt" | "underfloor";
}

export const HEAT_SOURCES: HeatSource[] = [
  {
    id: "ashp",
    name: "Air source heat pump",
    fuel: "electricity",
    efficiency: 3.2, // base; the chosen emitter's SCOP takes over
    isHeatPump: true,
    blurb: "Draws free heat from the outside air — several units of heat for every unit of electricity.",
    benefits: [
      "Delivers 3–4 kWh of heat per kWh of electricity",
      "£7,500 Boiler Upgrade Scheme grant available for eligible homes",
      "No flue, no on-site combustion, no fuel deliveries",
      "Lowest-carbon heating option, and gets cleaner as the grid does",
      "Pairs with solar PV and battery to run on your own power",
    ],
  },
  {
    id: "gas-boiler",
    name: "Gas boiler (modern condensing)",
    fuel: "gas",
    efficiency: 0.9,
    blurb: "A new A-rated condensing boiler on the gas grid.",
    benefits: [
      "Familiar technology with low upfront cost",
      "Compact, quick to install where gas is already connected",
      "Around 90% efficient when properly commissioned",
    ],
  },
  {
    id: "oil-boiler",
    name: "Oil boiler",
    fuel: "oil",
    efficiency: 0.87,
    blurb: "Heating oil system for homes off the gas grid.",
    benefits: ["Established option for off-grid homes", "High heat output for older properties"],
  },
  {
    id: "lpg-boiler",
    name: "LPG boiler",
    fuel: "lpg",
    efficiency: 0.9,
    blurb: "Bottled/tank gas for homes off the gas grid.",
    benefits: ["Gas-boiler convenience where mains gas is unavailable"],
  },
  {
    id: "direct-electric",
    name: "Direct electric heating",
    fuel: "electricity",
    efficiency: 1,
    blurb: "Panel heaters or electric boiler — 1 kWh in, 1 kWh out.",
    benefits: ["Cheapest to install, no wet system needed", "100% efficient at the point of use"],
  },
];

export const EMITTERS: Emitter[] = [
  {
    id: "thermaskirt",
    name: "ThermaSkirt heated skirting",
    flowTemp: 40,
    scopWithHeatPump: 4.0,
    techId: "thermaskirt",
    blurb: "Replaces the skirting boards with a discreet perimeter radiator around every room.",
    benefits: [
      "Frees every wall — no radiators taking up space",
      "Low 40°C flow temperature: ideal partner for a heat pump",
      "Warms rooms evenly from the edges, no cold spots",
      "Retrofits with far less disruption than underfloor heating",
      "Room-by-room control and quick response",
    ],
  },
  {
    id: "underfloor",
    name: "Underfloor heating (wet)",
    flowTemp: 35,
    scopWithHeatPump: 4.2,
    techId: "underfloor",
    blurb: "Warm water pipework across the whole floor — invisible, even warmth.",
    benefits: [
      "Completely invisible — no emitters in the room at all",
      "Lowest flow temperature of any emitter: best heat-pump efficiency",
      "Gentle, even warmth underfoot across the whole floor",
      "Ideal for new floors, extensions and renovations",
    ],
  },
  {
    id: "low-temp-rads",
    name: "Low-temperature radiators",
    flowTemp: 45,
    scopWithHeatPump: 3.6,
    blurb: "Larger or fan-assisted radiators sized to run cooler.",
    benefits: [
      "Purpose-sized for heat pumps — better efficiency than standard radiators",
      "Straightforward swap in most rooms",
    ],
  },
  {
    id: "standard-rads",
    name: "Standard radiators",
    flowTemp: 55,
    scopWithHeatPump: 3.1,
    blurb: "Existing panel radiators running at traditional temperatures.",
    benefits: [
      "No changes to the rooms — lowest disruption",
      "Works with any boiler",
      "Higher flow temperature reduces heat-pump efficiency",
    ],
  },
];

/** what the customer heats with TODAY — for the savings comparison */
export const CURRENT_SYSTEMS: { id: string; name: string; fuel: FuelId; efficiency: number }[] = [
  { id: "old-gas", name: "Older gas boiler", fuel: "gas", efficiency: 0.78 },
  { id: "new-gas", name: "Modern gas boiler", fuel: "gas", efficiency: 0.9 },
  { id: "oil", name: "Oil boiler", fuel: "oil", efficiency: 0.85 },
  { id: "lpg", name: "LPG boiler", fuel: "lpg", efficiency: 0.88 },
  { id: "electric", name: "Electric heaters", fuel: "electricity", efficiency: 1 },
];

/** UK-typical unit prices and carbon factors — illustrative, review quarterly */
export const FUEL: Record<FuelId, { name: string; pricePerKwh: number; kgCo2PerKwh: number }> = {
  electricity: { name: "Electricity", pricePerKwh: 0.245, kgCo2PerKwh: 0.13 },
  gas: { name: "Mains gas", pricePerKwh: 0.062, kgCo2PerKwh: 0.183 },
  oil: { name: "Heating oil", pricePerKwh: 0.068, kgCo2PerKwh: 0.247 },
  lpg: { name: "LPG", pricePerKwh: 0.087, kgCo2PerKwh: 0.214 },
};

/** space-heat intensity, kWh per m² per year (typical existing UK home) */
export const HEAT_INTENSITY_KWH_M2 = 110;
/** hot water on top, kWh per year (typical household) */
export const HOT_WATER_KWH = 2500;
/** fallback annual heat demand by bedrooms when no floor area is known */
export const DEMAND_BY_BEDROOMS: Record<number, number> = { 2: 9500, 3: 13000, 4: 16500, 5: 20000 };
