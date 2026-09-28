/**
 * Quick Quote — heat pump only.
 *
 * Deliberately narrower than the full enquiry form: solar, battery, EV and
 * air conditioning are not quotable this way, and emitter upgrades are left
 * out for now. Those all still route to /quote.
 *
 * ── Why there are no prices in here yet ─────────────────────────────────
 * The range shown to a visitor is a commercial promise. Nothing in this file
 * is guessed: PRICING stays null until Elixa supply real figures, and while
 * it is null every visitor gets the callback path instead of a number. The
 * questions, the flow and the enquiry that lands in the inbox all work
 * regardless — filling in PRICING is the only step that switches ranges on.
 */

export type OptionKey = string;

export interface Question {
  id: string;
  /** what the visitor is asked */
  title: string;
  /** one line under the question, when it needs explaining */
  hint?: string;
  options: { key: OptionKey; label: string; note?: string }[];
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
  | { kind: "range"; from: number; to: number; grant: number; beforeGrant: Band }
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

  const beforeGrant: Band = {
    from: Math.round(b.from * factor + adds.reduce((s, x) => s + x!.from, 0)),
    to: Math.round(b.to * factor + adds.reduce((s, x) => s + x!.to, 0)),
  };
  const grant = grantFor(a, p);
  return {
    kind: "range",
    beforeGrant,
    grant,
    from: Math.max(0, beforeGrant.from - grant),
    to: Math.max(0, beforeGrant.to - grant),
  };
}

/** Human-readable answers, for the enquiry email. */
export function describe(a: Answers): { k: string; v: string }[] {
  return QUESTIONS.map((q) => ({
    k: q.title.replace(/\?$/, ""),
    v: q.options.find((o) => o.key === a[q.id])?.label ?? "—",
  }));
}
