/**
 * UNDERFLOOR HEATING — the systems shown on the Underfloor Heating page.
 *
 * Unlike heat pumps or panels, underfloor isn't a brand league — it's a
 * choice of construction method driven by what the floor can take. Edit
 * this list to change the systems shown; figures are typical industry
 * values and every design is confirmed by the room-by-room survey.
 */

export interface UnderfloorSystem {
  id: string;
  name: string;
  /** one line on what the method is */
  knownFor: string;
  /** height added on top of the structural floor */
  buildUp: string;
  /** pipework / element used */
  pipe: string;
  /** typical heat output */
  output: string;
  /** warm-up character */
  response: string;
  /** which homes/situations it suits */
  goodFit: string;
}

export const UNDERFLOOR_SYSTEMS: UnderfloorSystem[] = [
  {
    id: "screeded",
    name: "Screeded system",
    knownFor:
      "The classic method — pipework cast into the screed so the whole slab becomes one big, gentle radiator.",
    buildUp: "Pipe + 65–75 mm screed over insulation",
    pipe: "16 mm PE-X barrier pipe at 100–200 mm centres",
    output: "up to ≈ 100 W/m²",
    response: "Slow and steady — the slab holds heat for hours",
    goodFit:
      "New builds, extensions and renovations where the floor is coming up anyway — the cheapest per square metre and the best partner for a heat pump running low and long.",
  },
  {
    id: "overlay",
    name: "Low-profile overlay",
    knownFor:
      "Retrofit without excavation — pre-routed boards laid straight on top of the existing floor.",
    buildUp: "≈ 18–22 mm on top of the existing floor",
    pipe: "12 mm pipe in castellated or routed panels",
    output: "≈ 70–90 W/m²",
    response: "Fast — minutes rather than hours",
    goodFit:
      "Occupied homes where floors are staying put. Doors are usually trimmed rather than floors dug — a whole ground floor is typically converted in days.",
  },
  {
    id: "joisted",
    name: "Between-joist system",
    knownFor:
      "Zero added height — aluminium spreader plates carry the pipe between the joists of a suspended timber floor.",
    buildUp: "None — fitted within the floor void",
    pipe: "16 mm pipe in heat-diffusing aluminium plates",
    output: "≈ 70 W/m²",
    response: "Moderate — quicker than screed, gentler than overlay",
    goodFit:
      "Period properties and any home with suspended timber floors — fitted from below or with boards lifted, keeping original floor levels and thresholds untouched.",
  },
  {
    id: "electric",
    name: "Electric mat",
    knownFor:
      "The single-room solution — a thin heating mat bedded into tile adhesive, no pipework at all.",
    buildUp: "≈ 3–4 mm under the tile adhesive",
    pipe: "150–200 W/m² electric mat with floor sensor",
    output: "≈ 150–200 W/m²",
    response: "Fast — timed to the room's routine",
    goodFit:
      "Bathrooms, en-suites and small kitchens — inexpensive to fit during retiling. Costs more per unit of heat than a wet system, so we specify it for rooms, not whole houses.",
  },
];

/** the honest caveat that sits under the systems */
export const UNDERFLOOR_NOTE =
  "Outputs are typical design values and depend on floor covering, insulation and room heat loss — tile and stone give the most, thick carpet the least. The right method falls out of the survey: what your floors are made of, how much height you can give up, and what's heating the water.";
