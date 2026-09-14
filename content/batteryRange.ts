/**
 * BATTERY STORAGE — the systems shown on the Battery Storage page.
 *
 * To add, remove or reorder a model, edit this list; the page renders from
 * here. Figures are manufacturer-published typical values, rounded
 * conservatively — the size and coupling for a home come from how the
 * household actually uses electricity, never from a standard bundle.
 */

export interface BatteryModel {
  id: string;
  brand: string;
  model: string;
  /** one line on what the brand/unit has a reputation for */
  knownFor: string;
  /** usable storage capacity */
  capacity: string;
  /** continuous output power */
  power: string;
  /** cell chemistry */
  chemistry: string;
  /** backup behaviour in a power cut */
  backup: string;
  /** manufacturer warranty, approximate */
  warranty: string;
  /** which homes/situations we tend to specify it for */
  goodFit: string;
}

export const BATTERY_RANGE: BatteryModel[] = [
  {
    id: "tesla-powerwall-3",
    brand: "Tesla",
    model: "Powerwall 3",
    knownFor:
      "The benchmark — a solar inverter and battery in one box, with the slickest app in the business.",
    capacity: "13.5 kWh usable",
    power: "up to ≈ 11 kW (subject to DNO approval)",
    chemistry: "LFP (lithium iron phosphate)",
    backup: "Whole-home backup with the Backup Gateway",
    warranty: "10 years",
    goodFit:
      "Bigger homes and bigger solar arrays — the integrated inverter simplifies new installs, and the high output will run almost anything in the house at once.",
  },
  {
    id: "givenergy-aio",
    brand: "GivEnergy",
    model: "All in One",
    knownFor:
      "The British contender — designed in the UK, with class-leading tariff integration and a 12-year warranty.",
    capacity: "13.5 kWh usable",
    power: "≈ 6 kW continuous",
    chemistry: "LFP (lithium iron phosphate)",
    backup: "Whole-home backup with the Giv-Gateway",
    warranty: "12 years",
    goodFit:
      "Smart-tariff households — it speaks fluently to time-of-use tariffs, and UK-based support with the longest warranty here makes it an easy recommendation.",
  },
  {
    id: "sigenergy-sigenstor",
    brand: "Sigenergy",
    model: "SigenStor",
    knownFor:
      "The modular one — hybrid inverter and stackable battery modules in a single tower you can grow later.",
    capacity: "≈ 8–48 kWh, stackable modules",
    power: "≈ 3.6–12 kW by inverter size",
    chemistry: "LFP (lithium iron phosphate)",
    backup: "Backup capable, specified at design",
    warranty: "10 years",
    goodFit:
      "Homes that will grow into it — start with what you need today and click on more capacity later, with an optional DC EV-charging module in the same tower.",
  },
  {
    id: "foxess-ep",
    brand: "Fox ESS",
    model: "EP / EQ Series",
    knownFor:
      "The value pick — dependable modular LFP storage at the sharpest price per kilowatt-hour.",
    capacity: "≈ 5–20 kWh, stackable modules",
    power: "≈ 3.6–6 kW by inverter",
    chemistry: "LFP (lithium iron phosphate)",
    backup: "EPS backup circuit option",
    warranty: "10 years",
    goodFit:
      "Budget-led projects that still want quality cells and a long warranty — the most storage per pound in the range, paired with a Fox or third-party inverter.",
  },
  {
    id: "myenergi-libbi",
    brand: "myenergi",
    model: "libbi",
    knownFor:
      "The ecosystem player — from the British maker of the zappi charger, so battery, EV charging and solar diversion all think together.",
    capacity: "≈ 5–20 kWh, modular",
    power: "≈ 5 kW continuous",
    chemistry: "LFP (lithium iron phosphate)",
    backup: "Backup option, specified at design",
    warranty: "up to 10 years by component",
    goodFit:
      "Homes already running — or planning — a zappi EV charger or eddi solar diverter: one app, one ecosystem, every kilowatt-hour sent where it earns most.",
  },
];

/** the honest caveat that sits under the range */
export const BATTERY_NOTE =
  "Figures are manufacturer-published typical values and vary by configuration and grid connection. The right battery is sized from your real usage — evening load, tariff windows and what your solar produces. Oversizing wastes money, undersizing wastes sun; standard bundles do both.";
