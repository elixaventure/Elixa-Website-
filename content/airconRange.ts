/**
 * AIR CONDITIONING — the units shown on the Air Conditioning page.
 *
 * To add, remove or reorder a unit, edit this list; the page renders from
 * here. Every unit is an air-to-air heat pump — cooling in summer, highly
 * efficient heating in winter. Figures are manufacturer-published typical
 * values for popular sizes, rounded conservatively.
 */

export interface AirconModel {
  id: string;
  brand: string;
  model: string;
  /** one line on what the unit has a reputation for */
  knownFor: string;
  /** energy label band, typical popular sizes */
  efficiency: string;
  /** indoor sound level, lowest fan setting */
  noise: string;
  /** heating capability in plain words */
  heating: string;
  /** single or multi-split capability */
  config: string;
  /** which rooms/situations we tend to specify it for */
  goodFit: string;
}

export const AIRCON_RANGE: AirconModel[] = [
  {
    id: "mitsubishi-msz-ln",
    brand: "Mitsubishi Electric",
    model: "MSZ-LN Zen",
    knownFor:
      "The bedroom specialist — among the quietest wall units made, in premium finishes including onyx black and pearl white.",
    efficiency: "A+++ cooling and heating (popular sizes)",
    noise: "from ≈ 19 dB(A) indoors",
    heating: "Full heating to well below freezing outside",
    config: "Single room, or multi-split from one outdoor unit",
    goodFit:
      "Bedrooms and living rooms where noise and looks matter most — at its lowest fan speed it's quieter than a whisper, and it doesn't look like an office unit.",
  },
  {
    id: "daikin-emura",
    brand: "Daikin",
    model: "Emura 3",
    knownFor:
      "The design icon — a sculpted, matt-finished unit that's won design awards most appliances never enter.",
    efficiency: "up to A+++ cooling and heating",
    noise: "from ≈ 19 dB(A) indoors",
    heating: "Efficient heating with intelligent eye airflow control",
    config: "Single room, or multi-split from one outdoor unit",
    goodFit:
      "Design-led interiors — matt white, silver or black housings that sit on a wall like intent rather than an afterthought, with flagship efficiency underneath.",
  },
  {
    id: "daikin-perfera",
    brand: "Daikin",
    model: "Perfera",
    knownFor:
      "The all-rounder — flagship efficiency and built-in air purification at a friendlier price than the design ranges.",
    efficiency: "up to A+++ cooling and heating",
    noise: "from ≈ 19–20 dB(A) indoors",
    heating: "Strong low-temperature heating performance",
    config: "Single room, or multi-split from one outdoor unit",
    goodFit:
      "Home offices, lofts and garden rooms used every day — the best efficiency-per-pound in the range, with Flash Streamer purification working on allergens as it runs.",
  },
  {
    id: "fujitsu-ke",
    brand: "Fujitsu",
    model: "KE / KG Series",
    knownFor:
      "The dependable value pick — quietly competent hardware from one of the industry's most reliable names.",
    efficiency: "A++ / A+++ by size",
    noise: "from ≈ 21 dB(A) indoors",
    heating: "Reliable heating for daily-use rooms",
    config: "Single room, or multi-split from one outdoor unit",
    goodFit:
      "Multi-room projects and rentals where several rooms need conditioning on a sensible budget — proven kit that just works, year after year.",
  },
];

/** the honest caveat that sits under the range */
export const AIRCON_NOTE =
  "Figures are manufacturer-published values for popular unit sizes and vary by capacity and conditions. The design comes from the room — glazing, aspect and occupancy set the cooling load, and the outdoor unit's position is chosen for neighbours and noise before anything is fixed to a wall.";
