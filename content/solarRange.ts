/**
 * THE SOLAR PANEL RANGE — the modules shown on the Solar PV page.
 *
 * Edit this list to add, remove or reorder panels; the page renders from
 * here. Figures are manufacturer-published typical values for current
 * residential modules, rounded conservatively — the array your roof gets is
 * designed per aspect from the survey and shading assessment.
 */

export interface SolarModel {
  id: string;
  brand: string;
  model: string;
  /** one line on what the brand/module has a reputation for */
  knownFor: string;
  /** typical residential module power */
  power: string;
  /** module efficiency, approximate */
  efficiency: string;
  /** product warranty */
  productWarranty: string;
  /** performance guarantee */
  performanceWarranty: string;
  /** which roofs/priorities we tend to specify it for */
  goodFit: string;
}

export const SOLAR_RANGE: SolarModel[] = [
  {
    id: "aiko-neostar",
    brand: "Aiko",
    model: "Neostar series",
    knownFor:
      "The efficiency leader — all-black N-type modules with the strongest output per square metre of roof.",
    power: "≈ 475 W",
    efficiency: "≈ 23.8%",
    productWarranty: "15–25 years by series",
    performanceWarranty: "30 years",
    goodFit:
      "Smaller or awkward roofs that need every watt from limited space, and homes where the sleek all-black look matters as much as the output.",
  },
  {
    id: "longi-himo",
    brand: "LONGi",
    model: "Hi-MO X10",
    knownFor:
      "The strong default — top-tier efficiency and output from the world's biggest panel maker, at a sensible price.",
    power: "≈ 485 W",
    efficiency: "≈ 23.8%",
    productWarranty: "15–25 years by series",
    performanceWarranty: "30 years",
    goodFit:
      "Most homes, most roofs — the best balance of efficiency, price and long-term backing in the range.",
  },
  {
    id: "rec-alpha-pure",
    brand: "REC",
    model: "Alpha Pure-R",
    knownFor:
      "Longevity — the lowest degradation in mainstream production (~0.25%/yr), still near full output decades in.",
    power: "≈ 430–450 W",
    efficiency: "≈ 22%+",
    productWarranty: "up to 25 years incl. labour*",
    performanceWarranty: "25 years, ~93% retained",
    goodFit:
      "Forever homes where total energy over 25+ years matters more than the sticker price — the warranty to beat. *Extended cover applies via certified installation.",
  },
  {
    id: "trina-vertex-s",
    brand: "Trina Solar",
    model: "Vertex S+",
    knownFor:
      "High-power innovation with dual-glass durability — robust panels from a tier-1 volume manufacturer.",
    power: "≈ 440–460 W",
    efficiency: "≈ 22–22.5%",
    productWarranty: "25 years",
    performanceWarranty: "30 years",
    goodFit:
      "Exposed or coastal roofs where the dual-glass build earns its keep, and value-led projects that still want long cover.",
  },
  {
    id: "ja-solar",
    brand: "JA Solar",
    model: "JAM54 series",
    knownFor: "Dependable tier-1 output per pound — the value benchmark of the mainstream brands.",
    power: "≈ 455 W",
    efficiency: "≈ 22%",
    productWarranty: "25 years",
    performanceWarranty: "30 years",
    goodFit:
      "Larger arrays where panel count drives the budget — maximum generation for the spend without dropping off the tier-1 list.",
  },
];

/** the honest caveat that sits under the range */
export const SOLAR_RANGE_NOTE =
  "Figures are manufacturer-published typical values for current residential modules and vary by exact model and batch. Real-world yield is decided by your roof — orientation, pitch and shading — which is why we design strings per aspect from the survey rather than quoting a one-size array.";
