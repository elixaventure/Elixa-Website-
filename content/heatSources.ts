/**
 * HEAT SOURCES — the thing that makes the heat, as opposed to the emitters
 * that deliver it.
 *
 * The navigation used to say "Heat Pumps", which is what we lead with but
 * not all we fit. A customer who needs a boiler and sees only heat pumps
 * assumes we cannot help and goes elsewhere; one who sees the full list and
 * the honest comparison tends to arrive at the heat pump by themselves,
 * which is a better conversation than being told.
 *
 * So: heat pump first and strongest, the alternatives stated plainly, and
 * nothing talked down. Every figure here is either already published on this
 * site or is an uncontested industry value — nothing invented, no brands, no
 * prices, no warranty claims.
 */

export interface HeatSourceOption {
  id: string;
  /** tab label — short enough for a phone */
  tab: string;
  name: string;
  /** one line under the heading */
  standfirst: string;
  /** the headline figure and what it means */
  headline: { value: string; label: string };
  body: string[];
  suits: string[];
  /** honest limits — a page with none of these reads as a brochure */
  considerations: string[];
  /** where to read more, when we have a page for it */
  href?: string;
  hrefLabel?: string;
  /** the one we lead with */
  lead?: boolean;
}

export const HEAT_SOURCE_OPTIONS: HeatSourceOption[] = [
  {
    id: "heat-pump",
    tab: "Heat pump",
    name: "Air source heat pump",
    standfirst:
      "What we recommend for most homes, and what the grant money is behind.",
    headline: { value: "3–4 kWh", label: "of heat per kWh of electricity" },
    lead: true,
    body: [
      "A heat pump does not make heat, it moves it — taking warmth out of the outside air and concentrating it into your heating system. That is why it returns several units of heat for every unit of electricity, where a boiler can never return more than the one it burns.",
      "Efficiency depends on the temperature it has to reach, so the emitters matter as much as the pump. We design the whole system together: a room-by-room heat-loss survey first, then the pump, the emitters, the cylinder and the controls around the numbers that survey produces.",
    ],
    suits: [
      "Homes where the fabric is reasonable or can be improved",
      "Anywhere off the gas grid currently on oil or LPG",
      "Homes with, or willing to move to, larger or low-temperature emitters",
      "Anyone pairing heating with solar and battery",
    ],
    considerations: [
      "Needs space outside for the unit and usually a hot water cylinder inside",
      "Costs more to install than a boiler before the grant is applied",
      "Works best at lower flow temperatures, which can mean changing emitters",
    ],
    href: "/air-source-heat-pumps",
    hrefLabel: "Air source heat pumps",
  },
  {
    id: "electric-boiler",
    tab: "Electric boiler",
    name: "Electric boiler",
    standfirst: "No flue, no gas supply, no combustion — in a cupboard.",
    headline: { value: "~100%", label: "efficient at the point of use" },
    body: [
      "An electric boiler heats the same wet system a gas boiler would — the same radiators, the same pipework — using an immersed element instead of a flame. Every unit of electricity it draws becomes a unit of heat.",
      "That sounds better than a heat pump's efficiency until you notice the heat pump returns three or four. An electric boiler is cheap and simple to install and expensive to run, because electricity costs several times what gas does per unit.",
    ],
    suits: [
      "Flats and homes with no gas supply and no room for a heat pump",
      "Small, well-insulated properties with modest heat demand",
      "Replacing a failed boiler quickly where a heat pump is not yet practical",
      "Homes with solar generating a useful share of the year's electricity",
    ],
    considerations: [
      "Running cost is the highest of the three unless paired with solar",
      "Needs sufficient electrical supply and may require a consumer unit upgrade",
      "No grant support — the Boiler Upgrade Scheme does not cover it",
    ],
  },
  {
    id: "gas-boiler",
    tab: "Gas boiler",
    name: "Gas boiler",
    standfirst: "Still the right answer for some homes, and we are Gas Safe registered.",
    headline: { value: "~90%", label: "efficient when properly commissioned" },
    body: [
      "A modern condensing boiler recovers heat from its own flue gases, which is where the last few points of efficiency come from — and why commissioning it properly matters more than the badge on the front.",
      "We would rather fit you a heat pump, and we will tell you when we think one would work. But a boiler on a gas supply remains cheaper to install and cheaper per unit of fuel, and pretending otherwise would not help anybody.",
    ],
    suits: [
      "Homes on the gas grid where a heat pump is not practical yet",
      "An urgent replacement when a boiler has failed mid-winter",
      "Properties whose fabric would make a heat pump work too hard today",
    ],
    considerations: [
      "Burns fossil fuel, and the carbon cost rises as the grid gets cleaner",
      "No grant support, unlike a heat pump",
      "Needs a gas supply, a flue and annual servicing",
    ],
  },
];
