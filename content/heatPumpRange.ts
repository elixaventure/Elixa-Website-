/**
 * THE HEAT PUMP RANGE — the models shown on the Heat Pumps page.
 *
 * To add, remove or reorder a model, edit this list; the page renders from
 * here. Figures are manufacturer-published typical values (SCOP to EN 14825
 * at low-temperature design), rounded conservatively — the exact unit and
 * size for a home is chosen from the heat-loss survey, never from a list.
 */

export interface HeatPumpModel {
  id: string;
  brand: string;
  model: string;
  /** one line on what the brand/unit has a reputation for */
  knownFor: string;
  refrigerant: string;
  /** output sizes offered across the range */
  sizes: string;
  /** maximum flow temperature the unit can produce */
  maxFlow: string;
  /** typical seasonal efficiency at low-temperature design, approximate */
  scop: string;
  /** sound character in plain words, not a decibel war */
  sound: string;
  /** which homes/situations we tend to specify it for */
  goodFit: string;
}

export const HEAT_PUMP_RANGE: HeatPumpModel[] = [
  {
    id: "vaillant-arotherm-plus",
    brand: "Vaillant",
    model: "aroTHERM plus",
    knownFor: "Premium German engineering with class-leading efficiency on natural refrigerant.",
    refrigerant: "R290 (propane, ultra-low GWP)",
    sizes: "≈ 3.5 – 12 kW",
    maxFlow: "up to 75 °C",
    scop: "≈ 5.0 at 35 °C design",
    sound: "Very quiet — happy near patios and boundaries",
    goodFit:
      "Retrofits that keep existing radiators — the high flow temperature covers homes where emitters can't all change — and anyone who wants the efficiency benchmark.",
  },
  {
    id: "mitsubishi-ecodan",
    brand: "Mitsubishi Electric",
    model: "Ecodan (R290)",
    knownFor: "The UK's largest installed base — a reputation built on reliability and support.",
    refrigerant: "R290 (latest generation)",
    sizes: "≈ 5 – 14 kW",
    maxFlow: "up to 75 °C",
    scop: "≈ 4.6 at 35 °C design",
    sound: "Ultra Quiet models around 45 dB at a metre — among the quietest made",
    goodFit:
      "Tight plots and noise-sensitive placements, and owners who value the deepest UK parts-and-service network over headline numbers.",
  },
  {
    id: "daikin-altherma-3",
    brand: "Daikin",
    model: "Altherma 3",
    knownFor: "Big-brand performance at a sharper price — efficiency close to the premium tier.",
    refrigerant: "R32",
    sizes: "≈ 4 – 16 kW",
    maxFlow: "up to 70 °C (HT versions)",
    scop: "≈ 4.6 – 5.0 at 35 °C design",
    sound: "Quiet, with a dedicated low-noise mode",
    goodFit:
      "Best value-per-point-of-efficiency in the range — a strong default for well-insulated homes with low-temperature emitters.",
  },
  {
    id: "samsung-ehs-mono",
    brand: "Samsung",
    model: "EHS Mono HT Quiet",
    knownFor: "High-temperature capability and smart-home integration at a competitive price.",
    refrigerant: "R32",
    sizes: "≈ 5 – 16 kW",
    maxFlow: "up to 70 °C",
    scop: "≈ 4.5 at 35 °C design",
    sound: "Quiet mode for night-time and close neighbours",
    goodFit:
      "Budget-conscious retrofits that still need hot radiator temperatures, and homes already run on smart-home platforms.",
  },
  {
    id: "grant-aerona3",
    brand: "Grant",
    model: "Aerona3 / Aerona 290",
    knownFor: "Designed for the UK and Irish climate by an off-grid heating specialist.",
    refrigerant: "R32 (Aerona3) · R290 (Aerona 290)",
    sizes: "≈ 6.5 – 17 kW",
    maxFlow: "up to 65 °C",
    scop: "up to ≈ 5.4 (13 kW unit) at 35 °C design",
    sound: "Quiet Mark accredited on popular sizes",
    goodFit:
      "Oil-boiler replacements and larger rural properties — big outputs, honest pricing, and a range that shines in damp UK winters.",
  },
];

/** the honest caveat that sits under the range */
export const RANGE_NOTE =
  "Figures are manufacturer-published typical values at low-temperature design and vary by unit size and conditions. The right pump — brand, model and output — falls out of your heat-loss survey, not a league table: a correctly sized mid-range unit will outperform a poorly sized premium one every winter.";
