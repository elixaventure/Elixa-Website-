/**
 * The Boiler Upgrade Scheme check.
 *
 * ── What this is allowed to say ─────────────────────────────────────────
 * Nothing here tells anybody they qualify. The grant is applied for by the
 * installer on the owner's behalf, and Ofgem decides. A questionnaire can
 * say "nothing you have told us rules you out", and that is the strongest
 * claim on this page.
 *
 * So there are three outcomes and the price is shown differently for each.
 * Where anything is unknown the visitor sees BOTH figures — what it costs
 * if the grant does not come, and what it costs if it does — rather than
 * one number resting on an assumption nobody checked.
 *
 * ── Where the rules came from ───────────────────────────────────────────
 * Ofgem's scheme pages and the published notice of approved grant
 * categories, read on the date below. They change: the air-to-air rate and
 * the off-gas uplift are both recent, and gov.uk's own pages disagreed
 * with Ofgem's on the uplift at the time of reading.
 *
 * Check these against ofgem.gov.uk before an advertising campaign runs on
 * them, and move the date when you do.
 */
export const RULES_READ = "2026-10-13";

export const SCHEME = {
  name: "Boiler Upgrade Scheme",
  /** Where it applies. Scotland and Northern Ireland have their own. */
  nations: "England and Wales",
  guidance: "https://www.ofgem.gov.uk/environmental-and-social-schemes/boiler-upgrade-scheme-bus",
};

export interface GrantQuestion {
  id: "nation" | "epc" | "history";
  title: string;
  hint?: string;
  options: { key: string; label: string; note?: string }[];
}

/**
 * Three questions, which is as many as a page like this can ask before
 * somebody leaves. Everything else the scheme turns on is either already
 * answered (the system being replaced) or is the installer's to establish
 * at survey.
 */
export const GRANT_QUESTIONS: GrantQuestion[] = [
  {
    id: "nation",
    title: "Where's the property?",
    hint: `The ${SCHEME.name} covers ${SCHEME.nations}. Scotland and Northern Ireland have their own schemes, which we can point you at.`,
    options: [
      { key: "ew", label: "England or Wales" },
      { key: "scotland", label: "Scotland" },
      { key: "ni", label: "Northern Ireland" },
    ],
  },
  {
    id: "epc",
    title: "Does your EPC ask for more insulation?",
    hint: "An Energy Performance Certificate with outstanding loft or cavity wall recommendations has to be dealt with first. Most people don't know offhand — that's a fine answer.",
    options: [
      { key: "clear", label: "No outstanding recommendations" },
      { key: "outstanding", label: "Yes, it recommends insulation" },
      { key: "unknown", label: "I don't know", note: "We'll check it for you" },
    ],
  },
  {
    id: "history",
    title: "Any of these apply?",
    hint: "Each of them puts a property outside the scheme.",
    options: [
      { key: "none", label: "None of these" },
      { key: "newbuild", label: "It's a new build" },
      { key: "previous", label: "We've had this grant before" },
      { key: "social", label: "It's social housing" },
    ],
  },
];

export type Outcome = "likely" | "uncertain" | "unlikely";

export interface Assessment {
  outcome: Outcome;
  /** Said to the visitor, in their terms. */
  reason: string;
  /** Whether the figure after the grant is the one to lead with. */
  leadWithGrant: boolean;
}

/**
 * Reads the answers. Never returns "approved", because this cannot know
 * that and neither can anybody until the installer applies.
 */
export function assess(a: Record<string, string>): Assessment {
  if (a.nation === "scotland" || a.nation === "ni") {
    return {
      outcome: "unlikely",
      reason: `The ${SCHEME.name} covers ${SCHEME.nations} only. ${
        a.nation === "scotland" ? "Scotland" : "Northern Ireland"
      } runs its own scheme with different rules and often a larger amount — worth a conversation, because the figure below does not include it.`,
      leadWithGrant: false,
    };
  }

  if (a.history === "newbuild") {
    return {
      outcome: "unlikely",
      reason:
        "New builds sit outside the scheme, with a narrow exception for self-builds. If yours is a self-build, say so when we speak — it changes the answer.",
      leadWithGrant: false,
    };
  }
  if (a.history === "previous") {
    return {
      outcome: "unlikely",
      reason: "A property can only receive this grant once.",
      leadWithGrant: false,
    };
  }
  if (a.history === "social") {
    return {
      outcome: "unlikely",
      reason: "Social housing is not eligible for this scheme.",
      leadWithGrant: false,
    };
  }

  if (a.epc === "outstanding") {
    return {
      outcome: "uncertain",
      reason:
        "Outstanding loft or cavity wall recommendations on an EPC have to be cleared before the grant can be claimed. That is usually straightforward, and sometimes the recommendation no longer reflects the house — so this is a 'not yet' rather than a 'no'.",
      leadWithGrant: false,
    };
  }
  if (a.epc === "unknown") {
    return {
      outcome: "uncertain",
      reason:
        "We'll pull your EPC and check it before anything is promised. Most homes are fine; the ones that aren't usually need one straightforward job doing first.",
      leadWithGrant: false,
    };
  }

  return {
    outcome: "likely",
    reason:
      "Nothing you've told us rules you out. We apply on your behalf and it comes off your price — but Ofgem decides, so treat the figure below as what we expect rather than what you've been granted.",
    leadWithGrant: true,
  };
}

/** How the figure is labelled, which is where the honesty lives. */
export const HEADLINE: Record<Outcome, string> = {
  likely: "What we'd expect you to pay",
  uncertain: "Both figures, until we've checked",
  unlikely: "What it would cost",
};
