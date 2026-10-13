/**
 * Carrying answers from the advert landing page into the full Quick Quote.
 *
 * The two tools ask overlapping questions, which was fine while they were
 * separate and became rude the moment one linked to the other: somebody who
 * had just said "3 bedrooms, gas boiler" was asked both again, in almost the
 * same words, and could reasonably conclude nobody was listening.
 *
 * So the link carries what was said. Three of the Quick Quote's seven
 * questions are answered before it starts, and the one that cannot be
 * carried outright is narrowed rather than repeated — "you said gas; which
 * kind?" is a follow-up, where asking the eight-option question again is a
 * repeat.
 *
 * It travels in the address rather than in storage. A link is the thing
 * being clicked, it survives a new tab and a blocked cookie jar, and the
 * worst a mangled one can do is leave a question unanswered — which is the
 * behaviour there was before.
 */

export interface Handoff {
  /** Quick Quote answers that are settled, keyed as it keys them. */
  answers: Record<string, string>;
  /** What was carried, in words, to show the visitor it was kept. */
  carried: string[];
  /** The visitor's coarse answer about fuel, for narrowing the next ask. */
  fuel?: string;
  /** Whether they said they have a cylinder — narrows it further. */
  cylinder?: string;
}

/** The link from the landing page's result to the full quote. */
export function handoffLink(answers: Record<string, string>): string {
  const p = new URLSearchParams({ from: "price-check" });
  ["prop", "beds", "baths", "fuel", "cyl"].forEach((k) => {
    if (answers[k]) p.set(k, answers[k]);
  });
  return `/quick-quote/?${p.toString()}`;
}

const PROPERTY = new Set(["flat", "terraced", "semi", "detached", "bungalow"]);
const PROPERTY_LABELS: Record<string, string> = {
  flat: "flat or apartment",
  terraced: "terraced",
  semi: "semi-detached",
  detached: "detached",
  bungalow: "bungalow",
};
const BEDS = new Set(["1-2", "3", "4", "5plus"]);
const FUEL = new Set(["gas", "oil"]);
const CYL = new Set(["yes", "no", "dunno"]);

/**
 * Reads a hand-off out of a query string.
 *
 * Nothing here trusts the address. Every value has to be one of the ones
 * the landing page can actually produce, because an answer arriving from a
 * link is an answer nobody typed, and a junk one would quietly change the
 * price somebody is shown.
 */
export function readHandoff(search: string | null | undefined): Handoff | null {
  if (!search) return null;
  const q = new URLSearchParams(search);
  if (q.get("from") !== "price-check") return null;

  const prop = q.get("prop") ?? "";
  const beds = q.get("beds") ?? "";
  const fuel = q.get("fuel") ?? "";
  const cyl = q.get("cyl") ?? "";

  const answers: Record<string, string> = {};
  const carried: string[] = [];

  if (PROPERTY.has(prop)) {
    answers.property = prop;
    carried.push(PROPERTY_LABELS[prop]);
  }

  if (BEDS.has(beds)) {
    answers.bedrooms = beds;
    carried.push(beds === "5plus" ? "5+ bedrooms" : `${beds} bedrooms`);
  }

  // The landing page prices heat pumps and nothing else, so anyone arriving
  // from it has already answered this one.
  answers.target = "ashp";
  carried.push("air source heat pump");

  if (FUEL.has(fuel)) {
    // Carried at the coarseness it was given. The kind of gas boiler
    // changes nothing about the price — only the grant rate does, and that
    // turns on being off the gas grid — so there is nothing to go back and
    // ask. Where a cylinder answer settles it for free, it is recorded
    // exactly; otherwise the coarse answer stands on its own.
    if (fuel === "gas") {
      answers.current = cyl === "no" ? "gas-combi" : "gas";
      carried.push(cyl === "no" ? "gas combi boiler" : "gas boiler");
    } else {
      answers.current = "oil-lpg";
      carried.push("oil or LPG");
    }
  }

  return {
    answers,
    carried,
    fuel: FUEL.has(fuel) ? fuel : undefined,
    cylinder: CYL.has(cyl) ? cyl : undefined,
  };
}
