/**
 * SIGN-OFFS — completed jobs published from TaskFlow AI.
 *
 * An installer completes the sign-off in the app; the customer leaves a
 * rating and a comment and ticks the publishing permission (see
 * /photo-permission). An admin then reviews the sign-off in TaskFlow and
 * chooses whether it goes on the website. Nothing reaches this file without
 * that human decision.
 *
 * ── The contract ───────────────────────────────────────────────────────
 * TaskFlow writes signoffs.json to the repo; the deploy workflow picks it up
 * and the site rebuilds. The JSON is an array of objects matching SignOff
 * below. Keep the two in step — the loader validates and drops anything
 * malformed rather than rendering a half-built card.
 *
 * ── What must never appear here ────────────────────────────────────────
 * Surname, full address, house number, phone, email, or anything about what
 * the job cost. The permission the customer gave covers a first name, an
 * area, their own words, and photographs of the work — nothing else. The
 * admin screen in TaskFlow should not be able to send more than that.
 *
 * ── Why this file is empty ─────────────────────────────────────────────
 * It stays empty until real sign-offs come through. A testimonial is a claim
 * about a real person; placeholder ones are not written here, not even to
 * see the layout. The page renders nothing while the list is empty.
 */

export interface SignOffPhoto {
  /** public path or absolute URL */
  src: string;
  /** required — describes what the photograph shows */
  alt: string;
}

export interface SignOff {
  /** stable id from TaskFlow, used as the React key and the anchor */
  id: string;
  /** ISO date the job was signed off, e.g. "2026-09-14" */
  date: string;
  /** first name only, or "" where the customer chose to stay anonymous */
  firstName: string;
  /** town or area — never a street or house number */
  area: string;
  /** short summary of the work, written by Elixa not the customer */
  summary: string;
  /** e.g. "Air source heat pump" — drives the filter and the schema */
  system: string;
  /** the customer's own words, unedited */
  comment?: string;
  /** 1–5, whole numbers */
  rating?: number;
  photos?: SignOffPhoto[];
  /** optional walkthrough video */
  video?: { src: string; poster?: string };
}

/**
 * Populated from signoffs.json at build time once the TaskFlow integration
 * is live. Until then the sections that read it render nothing.
 */
export const SIGNOFFS: SignOff[] = [];

/** Newest first — what a visitor wants, and what recency signals reward. */
export function recentSignOffs(limit?: number): SignOff[] {
  const sorted = [...SIGNOFFS].sort((a, b) => b.date.localeCompare(a.date));
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

/** Only ratings we actually hold, so an average is never inferred from nothing. */
export function ratingSummary(): { count: number; average: number } | null {
  const rated = SIGNOFFS.filter((s) => typeof s.rating === "number");
  if (!rated.length) return null;
  const total = rated.reduce((sum, s) => sum + (s.rating as number), 0);
  return { count: rated.length, average: Math.round((total / rated.length) * 10) / 10 };
}

/** "September 2026" — month precision is enough and reveals less. */
export function signOffMonth(s: SignOff): string {
  const d = new Date(s.date);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
