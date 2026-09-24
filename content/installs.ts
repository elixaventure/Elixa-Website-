/**
 * OUR INSTALLS — real Elixa installations shown on the Projects page.
 *
 * Every entry is a genuine job photographed by the team. Descriptions
 * state only what the photo shows — no invented locations, figures or
 * outcomes. Drop the photo in public/media/projects/<id>.jpg and add an
 * entry here; the page renders from this list.
 */

export interface Install {
  id: string;
  title: string;
  tag: string;
  alt: string;
  blurb: string;
  /** the kit visible in the photo */
  kit: string[];
}

export const INSTALLS: Install[] = [
  {
    id: "thermaskirt-rooms",
    title: "ThermaSkirt, room by room",
    tag: "Heated skirting",
    alt: "Styled lounge with ThermaSkirt heated skirting below panelled walls and herringbone flooring",
    blurb:
      "A whole portfolio of rooms warmed from their edges — herringbone lounges, carpeted bedrooms, tiled bathrooms and oak hallways, each one converted in hours with the walls handed back and not a radiator in sight.",
    kit: ["ThermaSkirt Deco, torus and OV cappings", "Fitted over wood, carpet and tile", "Per-room thermostat control"],
  },
  {
    id: "cotswold-solar-heatpump",
    title: "Stone cottage, fully electrified",
    tag: "Solar + heat pump",
    alt: "Elixa installer looking up at a Cotswold stone home with an all-black solar array and a Vaillant aroTHERM plus heat pump by the patio",
    blurb:
      "An all-black array following the stone roofline, with a Vaillant aroTHERM plus working quietly by the patio below. Solar and heating designed as one system — and signed off with a long look from the garden wall.",
    kit: ["All-black solar array", "Vaillant aroTHERM plus", "Full system design & install"],
  },
  {
    id: "plantroom-cylinder-ufh",
    title: "The plant room, done properly",
    tag: "Cylinder + underfloor",
    alt: "Unvented hot-water cylinder with neatly clipped copper pipework, underfloor heating panels visible in the room beyond",
    blurb:
      "Copper set square and clipped, every run labelled in its place — with the underfloor heating first fix visible in the room beyond. The part of the job nobody sees is the part we're fussiest about.",
    kit: ["Unvented hot-water cylinder", "Copper primaries, clipped & insulated", "Underfloor heating first fix"],
  },
  {
    id: "twin-grant-aerona3",
    title: "Twin Aerona3s for a big renovation",
    tag: "Heat pumps",
    alt: "Two Grant Aerona3 heat pumps installed side by side on concrete bases against the brick gable of a large home under renovation",
    blurb:
      "One pump wasn't the answer for this one — two Grant Aerona3 units share the load on a large home mid-renovation, each on its own base with the pipework paired neatly between them.",
    kit: ["2× Grant Aerona3", "Cascade arrangement", "Dedicated concrete bases"],
  },
  {
    id: "ecodan-retrofit",
    title: "Ecodan on an occupied retrofit",
    tag: "Heat pumps",
    alt: "Mitsubishi Ecodan R32 heat pump on anti-vibration feet against a brick wall, with insulated pipework routed around the kitchen window",
    blurb:
      "A Mitsubishi Ecodan slotted against the back wall of a lived-in home — insulated pipework routed cleanly around the kitchen window, the unit up on anti-vibration feet, the garden handed back as found.",
    kit: ["Mitsubishi Ecodan (R32)", "Insulated external pipework", "Anti-vibration mounts"],
  },
  {
    id: "arotherm-commissioning",
    title: "aroTHERM plus, ready for handover",
    tag: "Heat pumps",
    alt: "Close-up of a Vaillant aroTHERM plus heat pump on a fresh base with anti-vibration mounts, ready for commissioning",
    blurb:
      "The commissioning shot — a Vaillant aroTHERM plus levelled on its new base, mounts torqued, ready to be fired up, balanced and demonstrated before the paperwork is signed.",
    kit: ["Vaillant aroTHERM plus", "New base & anti-vibration mounts", "Commissioned & demonstrated"],
  },
];
