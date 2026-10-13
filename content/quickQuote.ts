/**
 * Quick Quote — heat pump only.
 *
 * Deliberately narrower than the full enquiry form: solar, battery, EV and
 * air conditioning are not quotable this way, and emitter upgrades are left
 * out for now. Those all still route to /quote.
 *
 * Two depths. The seven core questions are what anyone can answer from their
 * sofa. DETAIL_QUESTIONS are the optional extras for someone who knows their
 * own system — where the cylinder goes, how the pipework gets run, which unit
 * they want — and they tighten the range without ever being required. Nobody
 * is made to answer them to get a number, and a "not sure" in there never
 * costs anyone their price.
 *
 * Emitters stay out on purpose. Radiator and underfloor sizing falls out of
 * the room-by-room heat loss, not a dropdown, so the tool says plainly that
 * they are excluded and hands the visitor the phone.
 *
 * ── Why there are no prices in here yet ─────────────────────────────────
 * The range shown to a visitor is a commercial promise. Nothing in this file
 * is guessed: PRICING stays null until Elixa supply real figures, and while
 * it is null every visitor gets the callback path instead of a number. The
 * questions, the flow and the enquiry that lands in the inbox all work
 * regardless — filling in PRICING is the only step that switches ranges on.
 */

import { HEAT_PUMP_RANGE } from "./heatPumpRange";

export type OptionKey = string;

export interface Question {
  id: string;
  /** what the visitor is asked */
  title: string;
  /** one line under the question, when it needs explaining */
  hint?: string;
  options: { key: OptionKey; label: string; note?: string }[];
  /** only asked when this is true of the answers so far */
  when?: (a: Answers) => boolean;
}

/** Every question carries this, and choosing it means we price it by hand. */
export const UNSURE: OptionKey = "unsure";
const unsure = { key: UNSURE, label: "Not sure", note: "We'll work it out for you" };

export const QUESTIONS: Question[] = [
  {
    id: "property",
    title: "What kind of home is it?",
    hint: "Heat loss — and so the size of the unit — depends heavily on this.",
    options: [
      { key: "flat", label: "Flat or apartment" },
      { key: "terraced", label: "Terraced" },
      { key: "semi", label: "Semi-detached" },
      { key: "detached", label: "Detached" },
      { key: "bungalow", label: "Bungalow" },
      unsure,
    ],
  },
  {
    id: "bedrooms",
    title: "How many bedrooms?",
    hint: "A rough proxy for size until we survey properly.",
    options: [
      { key: "1-2", label: "1 – 2" },
      { key: "3", label: "3" },
      { key: "4", label: "4" },
      { key: "5plus", label: "5 or more" },
      unsure,
    ],
  },
  {
    id: "current",
    title: "What heats the home now?",
    hint: "This decides the grant you qualify for as well as the work involved.",
    options: [
      { key: "gas-combi", label: "Gas combi boiler" },
      { key: "gas-system", label: "Gas system boiler", note: "Has a hot water cylinder" },
      { key: "gas-regular", label: "Gas regular boiler", note: "Cylinder and a tank in the loft" },
      { key: "oil", label: "Oil boiler" },
      { key: "lpg", label: "LPG boiler" },
      { key: "electric-storage", label: "Electric storage heaters" },
      { key: "electric-boiler", label: "Electric boiler" },
      { key: "solid-fuel", label: "Solid fuel or other" },
      unsure,
    ],
  },
  {
    id: "target",
    title: "What are you replacing it with?",
    options: [
      { key: "ashp", label: "Air source heat pump" },
      { key: "electric-boiler", label: "Electric boiler" },
      { key: UNSURE, label: "Not sure — advise me", note: "We'll recommend at survey" },
    ],
  },
  {
    id: "pipework",
    title: "What's the pipework situation?",
    hint: "The single biggest swing in a heat pump price after the unit itself.",
    options: [
      { key: "fresh", label: "All fresh pipework needed" },
      { key: "first-fix", label: "Full first fix", note: "Property is open / being renovated" },
      { key: "reuse", label: "Existing pipework can mostly stay" },
      unsure,
    ],
  },
  {
    id: "flooring",
    title: "What are the floors like?",
    hint: "Decides how pipe runs are routed, and how much making good there is.",
    options: [
      { key: "soft", label: "Carpet or timber throughout" },
      { key: "solid", label: "Solid throughout", note: "Tile, stone or concrete" },
      { key: "mixed", label: "Mixed" },
      unsure,
    ],
  },
  {
    id: "distance",
    title: "How far from the heat pump to the cylinder?",
    hint: "A rough pace it out is fine — outside wall to airing cupboard.",
    options: [
      { key: "under5", label: "Up to 5 metres" },
      { key: "5to10", label: "5 – 10 metres" },
      { key: "over10", label: "Over 10 metres" },
      unsure,
    ],
  },
];

/**
 * The fuel question, narrowed by what the landing page already heard.
 *
 * Somebody who has just said "gas boiler" and is then shown the same eight
 * options, gas combi among them, has been asked the same question twice.
 * Asked instead which KIND of gas boiler, they have been asked a follow-up.
 * The difference is only in what is on screen, and it is the whole
 * difference between the two experiences.
 *
 * Returns null where the answer is already settled and the question should
 * not appear at all.
 */
export function narrowCurrent(fuel?: string, cylinder?: string): Question | null {
  const pick = (id: string) => {
    const q = QUESTIONS.find((x) => x.id === "current")!;
    return q.options.find((o) => o.key === id)!;
  };

  if (fuel === "gas") {
    // Already settled: a gas boiler with no cylinder is a combi.
    if (cylinder === "no") return null;
    const options =
      cylinder === "yes"
        ? [pick("gas-system"), pick("gas-regular")]
        : [pick("gas-combi"), pick("gas-system"), pick("gas-regular")];
    return {
      id: "current",
      title: "Which kind of gas boiler?",
      hint:
        cylinder === "yes"
          ? "You said there is a cylinder, so it is one of these two."
          : "The three it could be.",
      options: [...options, unsure],
    };
  }

  if (fuel === "oil") {
    return {
      id: "current",
      title: "Oil or LPG?",
      hint: "Both are off the gas grid; they qualify for the same grant.",
      options: [pick("oil"), pick("lpg"), unsure],
    };
  }

  return null;
}

/* -------------------------------------------------- the extra detail --- */

/**
 * The optional second depth, for a visitor who knows their own system.
 *
 * None of these is required and none of them can send someone to the
 * callback path — answer them and the range tightens, skip them and nothing
 * changes. "Not sure" is here anyway, because somebody who opened this step
 * may still be sure of two out of three.
 */
export const DETAIL_QUESTIONS: Question[] = [
  {
    id: "cylinder",
    title: "Where's the hot water cylinder going?",
    hint: "If there's one there already, that's usually the answer.",
    options: [
      { key: "existing", label: "Where the current one is", note: "Swapping a cylinder in place" },
      { key: "airing", label: "Airing cupboard" },
      { key: "utility", label: "Utility or plant room" },
      { key: "garage", label: "Garage or outbuilding" },
      { key: "loft", label: "Loft" },
      { key: "tbd", label: "Nowhere obvious yet", note: "We'll find it at survey" },
      unsure,
    ],
  },
  {
    id: "distribution",
    title: "How should the new pipework be run?",
    hint: "You've told us what state it's in — this is how we connect to it.",
    options: [
      { key: "manifold", label: "New manifold, runs out to each emitter" },
      { key: "existing", label: "Tap into the existing pipework" },
      { key: "both", label: "Some of each", note: "Manifold where it's open, tapped in elsewhere" },
      unsure,
    ],
  },
  {
    id: "rads",
    title: "Roughly how many radiators?",
    hint:
      "Not to price them — emitters come out of the heat-loss survey. It tells whoever calls you the size of the conversation before they pick up the phone.",
    options: [
      { key: "upto6", label: "Up to 6" },
      { key: "7to10", label: "7 – 10" },
      { key: "11to15", label: "11 – 15" },
      { key: "16plus", label: "16 or more" },
      { key: "ufh", label: "None — underfloor throughout" },
      unsure,
    ],
  },
  {
    id: "unit",
    title: "Any preference on the heat pump itself?",
    hint: "No prices against these — you'll see the range at the end either way.",
    // Pointless to ask when they are not having a heat pump.
    when: (a) => a.target === "ashp",
    options: [
      ...HEAT_PUMP_RANGE.map((m) => ({
        key: m.id,
        label: `${m.brand} ${m.model}`,
        note: `${m.sizes} · flow ${m.maxFlow}`,
      })),
      { key: UNSURE, label: "No preference", note: "We'll specify it from the heat-loss survey" },
    ],
  },
];

/** Core first, extras after — the order the enquiry reads in. */
export const ALL_QUESTIONS: Question[] = [...QUESTIONS, ...DETAIL_QUESTIONS];

/** The detail questions worth asking, given what they have already said. */
export function detailQuestionsFor(a: Answers): Question[] {
  return DETAIL_QUESTIONS.filter((q) => !q.when || q.when(a));
}

/* ------------------------------------------------------------- pricing --- */

export interface Band {
  from: number;
  to: number;
}

export interface Pricing {
  /** Installed cost before grant, by bedroom count, for an air source heat pump. */
  ashpBase: Record<string, Band>;
  /** Same, for an electric boiler install. */
  electricBoilerBase: Record<string, Band>;
  /** Added to the base, by pipework answer. */
  pipework: Record<string, Band>;
  /** Added to the base, by flooring answer. */
  flooring: Record<string, Band>;
  /** Added to the base, by heat pump → cylinder distance. */
  distance: Record<string, Band>;
  /* ---- the optional detail step. Leave any of these out and that answer
     simply does not move the number, so the core figures can go in first
     and these can follow once they are known. ---- */
  /** Added to the base, by where the cylinder is going. */
  cylinder?: Record<string, Band>;
  /** Added to the base, by how the pipework gets run. */
  distribution?: Record<string, Band>;
  /** Added to the base, by chosen unit — keyed on HEAT_PUMP_RANGE ids. */
  unit?: Record<string, Band>;
  /** Multipliers on the base for property type, where 1 is the baseline. */
  propertyFactor: Record<string, number>;
  /** Boiler Upgrade Scheme, deducted from the total where it applies. */
  grant: { standard: number; offGasGrid: number };
}

/**
 * Real figures go here and the quote tool starts showing ranges. Until then
 * it is null on purpose — see the note at the top of this file. Do not
 * populate this with estimates, illustrative numbers or figures from
 * anywhere but Elixa's own price list.
 */
export const PRICING: Pricing | null = null;

export type Answers = Record<string, OptionKey>;

export type QuoteResult =
  | {
      kind: "range";
      from: number;
      to: number;
      grant: number;
      beforeGrant: Band;
      /** how many of the detail answers actually moved the figure */
      refined: number;
    }
  | { kind: "callback"; reason: "unsure" | "no-pricing" };

/** Electric boilers do not attract the Boiler Upgrade Scheme. */
function grantFor(a: Answers, p: Pricing): number {
  if (a.target !== "ashp") return 0;
  if (a.current === "oil" || a.current === "lpg") return p.grant.offGasGrid;
  return p.grant.standard;
}

export function quote(a: Answers): QuoteResult {
  // Any "not sure" and we price it by hand rather than guess around it.
  if (QUESTIONS.some((q) => a[q.id] === UNSURE || !a[q.id])) {
    return { kind: "callback", reason: "unsure" };
  }
  if (!PRICING) return { kind: "callback", reason: "no-pricing" };

  const p = PRICING;
  const base = a.target === "electric-boiler" ? p.electricBoilerBase : p.ashpBase;
  const b = base[a.bedrooms];
  if (!b) return { kind: "callback", reason: "unsure" };

  const factor = p.propertyFactor[a.property] ?? 1;
  const adds = [p.pipework[a.pipework], p.flooring[a.flooring], p.distance[a.distance]];
  if (adds.some((x) => !x)) return { kind: "callback", reason: "unsure" };

  // The optional extras. A missing answer, a "not sure", or a price list
  // that has no figure for that answer yet all mean the same thing here:
  // leave the number where it was. Never a reason to withhold the range.
  const refinements = (
    [
      [p.cylinder, a.cylinder],
      [p.distribution, a.distribution],
      [p.unit, a.unit],
    ] as [Record<string, Band> | undefined, OptionKey | undefined][]
  )
    .map(([table, answer]) =>
      !table || !answer || answer === UNSURE ? undefined : table[answer],
    )
    .filter((x): x is Band => Boolean(x));

  const extraFrom = refinements.reduce((t, x) => t + x.from, 0);
  const extraTo = refinements.reduce((t, x) => t + x.to, 0);

  const beforeGrant: Band = {
    from: Math.round(b.from * factor + adds.reduce((s, x) => s + x!.from, 0) + extraFrom),
    to: Math.round(b.to * factor + adds.reduce((s, x) => s + x!.to, 0) + extraTo),
  };
  const grant = grantFor(a, p);
  return {
    kind: "range",
    beforeGrant,
    grant,
    refined: refinements.length,
    from: Math.max(0, beforeGrant.from - grant),
    to: Math.max(0, beforeGrant.to - grant),
  };
}

/**
 * Human-readable answers, for the enquiry email and the summary on screen.
 *
 * The core seven always appear, answered or not, so the office can see what
 * was asked. The optional extras appear only when they were answered —
 * listing three em dashes for a step the visitor skipped tells nobody
 * anything.
 */
export function describe(a: Answers): { k: string; v: string }[] {
  const row = (q: Question) => ({
    k: q.title.replace(/\?$/, ""),
    v: q.options.find((o) => o.key === a[q.id])?.label ?? "—",
  });
  return [
    ...QUESTIONS.map(row),
    ...detailQuestionsFor(a)
      .filter((q) => a[q.id])
      .map(row),
  ];
}

/** True once the visitor has answered anything in the detail step. */
export function hasDetail(a: Answers): boolean {
  return DETAIL_QUESTIONS.some((q) => Boolean(a[q.id]));
}

/** Clears the detail answers — used when the visitor backs out of that step. */
export function withoutDetail(a: Answers): Answers {
  const out = { ...a };
  DETAIL_QUESTIONS.forEach((q) => delete out[q.id]);
  return out;
}
