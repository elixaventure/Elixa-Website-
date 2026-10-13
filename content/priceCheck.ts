/**
 * Price Check — the three questions on the advert landing page.
 *
 * Shorter than the Quick Quote on purpose. Somebody who has just tapped a
 * paid advert has given you a few seconds, not a few minutes, and every
 * question after the third is a question some of them leave on. These three
 * are the ones that actually move the number: how big the place is, whether
 * the grant applies, and whether a cylinder has to go in.
 *
 * Anything more detailed belongs on /quick-quote, which is where this sends
 * people who want to be precise.
 *
 * No prices live here, and none live anywhere else in this repository. See
 * lib/estimate.ts.
 */

export interface Choice {
  key: string;
  label: string;
  note?: string;
}

/**
 * A screen. Usually one question, but the first one carries two.
 *
 * Bedrooms and bathrooms are both size questions and both answerable
 * without looking anything up, so they share a screen rather than costing
 * two taps' worth of people. Bedrooms drive the heat loss and so the unit;
 * bathrooms drive the hot water demand and so the cylinder. Asking only the
 * first is how a four-bath house ends up quoted on a 200 litre tank.
 */
export interface Group {
  id: "beds" | "baths";
  label: string;
  options: Choice[];
}

export interface Ask {
  id: "size" | "fuel" | "cyl";
  title: string;
  hint?: string;
  /** A single list of options, or several labelled ones on one screen. */
  options?: Choice[];
  groups?: Group[];
}

export const ASKS: Ask[] = [
  {
    id: "size",
    title: "What would a heat pump cost you?",
    hint: "A few taps. No email, no phone number, no waiting for somebody to ring you back with a figure.",
    groups: [
      {
        id: "beds",
        label: "Bedrooms",
        options: [
          { key: "1-2", label: "1–2" },
          { key: "3", label: "3" },
          { key: "4", label: "4" },
          { key: "5plus", label: "5+" },
        ],
      },
      {
        id: "baths",
        label: "Bathrooms",
        options: [
          { key: "1", label: "1" },
          { key: "2", label: "2" },
          { key: "3plus", label: "3+" },
        ],
      },
    ],
  },
  {
    id: "fuel",
    title: "What heats it now?",
    hint: "This decides the grant you qualify for.",
    options: [
      { key: "gas", label: "Gas boiler" },
      { key: "oil", label: "Oil or LPG", note: "Off the gas grid" },
      { key: "electric", label: "Electric heaters", note: "Storage or panel heaters" },
      { key: "other", label: "Something else", note: "Solid fuel, or nothing yet" },
    ],
  },
  {
    id: "cyl",
    title: "Got a hot water cylinder?",
    hint: "Usually in an airing cupboard. A combi boiler means you haven't got one.",
    options: [
      { key: "yes", label: "Yes, we've got one", note: "Usually in an airing cupboard" },
      { key: "no", label: "No — we're on a combi" },
      { key: "dunno", label: "Not sure" },
    ],
  },
];

/**
 * Why some answers get a conversation instead of a number.
 *
 * Electric heaters usually mean there is no wet system to connect to, and
 * the job is a different and bigger one. A figure worked out from three taps
 * would be wrong, and wrong in the direction that loses the job at survey.
 */
export const NO_PRICE: Record<string, string> = {
  electric:
    "Electric heaters usually mean there are no radiators or pipework for a heat pump to connect to, so the job is a bigger one than three taps can price. It is worth the conversation though — the running-cost saving on a house like yours is normally the largest of anyone's.",
  other:
    "Without knowing what is there now we would only be guessing, and a guess is worth less to you than ten minutes on the phone.",
};

export function pricable(answers: Record<string, string>): boolean {
  return Boolean(answers.fuel) && !NO_PRICE[answers.fuel];
}

/** Every option on a screen, however that screen is laid out. */
export function choicesOf(ask: Ask): Choice[] {
  return ask.options ?? (ask.groups ?? []).flatMap((g) => g.options);
}

/** The answer to one group or question, in words, for the enquiry. */
export function labelFor(id: string, key: string | undefined): string {
  if (!key) return "—";
  for (const a of ASKS) {
    if (a.options && a.id === id) {
      return a.options.find((o) => o.key === key)?.label ?? "—";
    }
    for (const g of a.groups ?? []) {
      if (g.id === id) return g.options.find((o) => o.key === key)?.label ?? "—";
    }
  }
  return "—";
}

/** A screen is answered once every group on it has a pick. */
export function answered(ask: Ask, answers: Record<string, string>): boolean {
  if (ask.options) return Boolean(answers[ask.id]);
  return (ask.groups ?? []).every((g) => Boolean(answers[g.id]));
}

/**
 * Demo figures, read off the link rather than kept in the site.
 *
 * ?demo=10000,12000,14000,16000,1500,7500 — the four bedroom bands, the
 * cost of adding a cylinder, and the grant.
 *
 * This exists so the page can be shown to somebody before the real price
 * list is switched on, and it is built this way on purpose: invented figures
 * on a live commercial site are a liability however well hidden, so they are
 * not in the build at all. Whoever sends the link chooses the numbers, and
 * the page says plainly that is what happened.
 */
export interface DemoPrices {
  base: Record<string, number>;
  cylinder: number;
  grant: number;
}

export function parseDemo(search: string | null | undefined): DemoPrices | null {
  if (!search) return null;
  const raw = new URLSearchParams(search).get("demo");
  if (!raw) return null;
  const n = raw.split(",").map((x) => Number(x.trim()));
  // Six figures, all real, none silly. A bad link gets no demo rather than
  // a half-applied one.
  if (n.length !== 6 || n.some((x) => !isFinite(x) || x < 0 || x > 1_000_000)) return null;
  return {
    base: { "1-2": n[0], "3": n[1], "4": n[2], "5plus": n[3] },
    cylinder: n[4],
    grant: n[5],
  };
}

export interface Figure {
  from: number;
  to: number;
  beforeGrant: number;
  grant: number;
  cylinder: number;
}

/** The same shape of sum the office uses, on whatever figures it is given. */
export function demoFigure(p: DemoPrices, answers: Record<string, string>): Figure | null {
  const base = p.base[answers.beds];
  if (!(base > 0)) return null;
  const cylinder = answers.cyl === "yes" ? 0 : p.cylinder;
  const beforeGrant = base + cylinder;
  const grant = Math.min(p.grant, beforeGrant);
  const after = Math.max(0, beforeGrant - grant);
  // A spread, because three taps cannot justify the precision of a single
  // number. Rounded to £50 so it reads as an estimate and not a quotation.
  return {
    from: Math.round((after * 0.92) / 50) * 50,
    to: Math.round((after * 1.08) / 50) * 50,
    beforeGrant,
    grant,
    cylinder,
  };
}
