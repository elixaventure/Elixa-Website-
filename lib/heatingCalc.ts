/**
 * Illustrative annual energy calculation for a chosen heating system.
 *
 * Pure functions over the product catalogue (content/heatingSystems.ts):
 * demand comes from the customer's floor area when a plan has given us one
 * (or a bedrooms-based fallback), the chosen source + emitter set the system
 * efficiency, and fuel prices/carbon factors turn that into £/year and
 * kg CO₂/year — plus a comparison against what the home runs on today.
 * Always presented as illustrative; the heat-loss survey refines it.
 */

import {
  HEAT_SOURCES,
  EMITTERS,
  CURRENT_SYSTEMS,
  FUEL,
  HEAT_INTENSITY_KWH_M2,
  HOT_WATER_KWH,
  DEMAND_BY_BEDROOMS,
  type HeatSource,
  type Emitter,
} from "@/content/heatingSystems";

export interface SystemChoice {
  currentId: string;
  sourceId: string;
  emitterId: string;
}

export interface SystemResult {
  source: HeatSource;
  emitter: Emitter;
  /** heat the home needs, kWh/yr (space + hot water) */
  demandKwh: number;
  /** overall efficiency of the chosen system (SCOP for heat pumps) */
  efficiency: number;
  /** fuel bought, kWh/yr */
  fuelKwh: number;
  annualCost: number;
  annualCo2Kg: number;
  current: { name: string; annualCost: number; annualCo2Kg: number };
  savingPerYear: number;
  co2SavedKg: number;
}

export function annualHeatDemand(areaM2: number | null, bedrooms: number): number {
  if (areaM2 && areaM2 > 20) return Math.round(areaM2 * HEAT_INTENSITY_KWH_M2 + HOT_WATER_KWH);
  return DEMAND_BY_BEDROOMS[Math.min(5, Math.max(2, bedrooms))] ?? DEMAND_BY_BEDROOMS[3];
}

export function calculateSystem(
  choice: SystemChoice,
  areaM2: number | null,
  bedrooms: number,
): SystemResult | null {
  const source = HEAT_SOURCES.find((s) => s.id === choice.sourceId);
  const emitter = EMITTERS.find((e) => e.id === choice.emitterId);
  const current = CURRENT_SYSTEMS.find((c) => c.id === choice.currentId) ?? CURRENT_SYSTEMS[0];
  if (!source || !emitter) return null;

  const demandKwh = annualHeatDemand(areaM2, bedrooms);
  // the emitter's flow temperature sets a heat pump's real-world efficiency
  const efficiency = source.isHeatPump ? emitter.scopWithHeatPump : source.efficiency;
  const fuelKwh = demandKwh / efficiency;
  const fuel = FUEL[source.fuel];
  const annualCost = fuelKwh * fuel.pricePerKwh;
  const annualCo2Kg = fuelKwh * fuel.kgCo2PerKwh;

  const curFuel = FUEL[current.fuel];
  const curKwh = demandKwh / current.efficiency;
  const curCost = curKwh * curFuel.pricePerKwh;
  const curCo2 = curKwh * curFuel.kgCo2PerKwh;

  return {
    source,
    emitter,
    demandKwh,
    efficiency,
    fuelKwh: Math.round(fuelKwh),
    annualCost: Math.round(annualCost),
    annualCo2Kg: Math.round(annualCo2Kg),
    current: { name: current.name, annualCost: Math.round(curCost), annualCo2Kg: Math.round(curCo2) },
    savingPerYear: Math.round(curCost - annualCost),
    co2SavedKg: Math.round(curCo2 - annualCo2Kg),
  };
}
