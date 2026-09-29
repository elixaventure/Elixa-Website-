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
 * Read from content/signoffs.json at build time — the file TaskFlow writes.
 *
 * Read from disk in a try/catch rather than imported, deliberately. This file
 * is written by an external system, and a plain import means one malformed
 * character there fails the build and blocks every later change to the site
 * until somebody notices. Instead a broken file degrades to no sign-offs, the
 * site keeps building, and the reason is printed in the build log.
 *
 * Safe because only server components read this. If that ever changes, this
 * has to change with it.
 */
function loadSignOffs(): SignOff[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs") as typeof import("fs");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require("path") as typeof import("path");
    const file = path.join(process.cwd(), "content", "signoffs.json");
    if (!fs.existsSync(file)) return [];
    const raw: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(raw)) {
      console.warn("[signoffs] expected an array — ignoring the file");
      return [];
    }
    const ok: SignOff[] = [];
    raw.forEach((item, i) => {
      const bad = invalidReason(item);
      if (bad) {
        // One malformed entry must not take the good ones down with it.
        console.warn(`[signoffs] skipping entry ${i}: ${bad}`);
        return;
      }
      ok.push(item as SignOff);
    });
    return ok;
  } catch (e) {
    console.warn("[signoffs] could not be read —", (e as Error).message);
    return [];
  }
}

/** Returns why an entry is unusable, or null when it is fine. */
function invalidReason(v: unknown): string | null {
  if (typeof v !== "object" || v === null) return "not an object";
  const o = v as Record<string, unknown>;
  for (const k of ["id", "date", "area", "summary", "system"]) {
    if (typeof o[k] !== "string" || !(o[k] as string).trim()) return `missing ${k}`;
  }
  if (typeof o.firstName !== "string") return "missing firstName (use \"\" for anonymous)";
  if (Number.isNaN(Date.parse(o.date as string))) return `unparseable date "${o.date}"`;
  if (o.rating !== undefined) {
    const r = o.rating;
    if (typeof r !== "number" || r < 1 || r > 5) return `rating must be 1-5, got ${String(r)}`;
  }
  if (o.photos !== undefined) {
    if (!Array.isArray(o.photos)) return "photos must be an array";
    for (const ph of o.photos as unknown[]) {
      const q = ph as Record<string, unknown>;
      if (typeof q?.src !== "string" || typeof q?.alt !== "string") {
        return "each photo needs src and alt";
      }
    }
  }
  return null;
}

export const SIGNOFFS: SignOff[] = loadSignOffs();

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

/**
 * A readable, permanent URL for one sign-off.
 *
 * Built from the system and the town — the words somebody would actually
 * search — with a short tail from TaskFlow's id so two ThermaSkirt jobs in
 * Manchester can never collide. The tail rather than a counter because a
 * counter would renumber every later job the moment an earlier one is
 * withdrawn, breaking URLs that are already indexed.
 */
export function signOffSlug(s: SignOff): string {
  const kebab = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const tail = s.id.replace(/[^a-z0-9]/gi, "").slice(-6).toLowerCase();
  return [kebab(s.system), kebab(s.area), tail].filter(Boolean).join("-");
}

export function findSignOff(slug: string): SignOff | undefined {
  return SIGNOFFS.find((s) => signOffSlug(s) === slug);
}

/** "ThermaSkirt in Manchester" — the page title, and what people search. */
export function signOffTitle(s: SignOff): string {
  return `${systemLabel(s)} in ${s.area}`;
}

/**
 * Newest first, grouped by the month they were signed off.
 *
 * Nothing is ever dropped. Every completed job is a page that can be found,
 * and five a month compounds — throwing the old ones away would throw away
 * the reason the site gets found at all.
 */
export function signOffsByMonth(): { month: string; items: SignOff[] }[] {
  const groups: { month: string; items: SignOff[] }[] = [];
  for (const s of recentSignOffs()) {
    const month = signOffMonth(s);
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.items.push(s);
    else groups.push({ month, items: [s] });
  }
  return groups;
}

/**
 * Brand names, spelt the way the brand spells them.
 *
 * The system is a free-text field in TaskFlow, so "Thermaskirt" and
 * "thermaskirt" both arrive, and until now both became an <h1>. This only
 * corrects the capitals of names we own or install under licence — it never
 * changes a word, and anything unrecognised passes straight through, so a
 * new system type is not silently mangled.
 */
const BRAND_CASE: Record<string, string> = {
  thermaskirt: "ThermaSkirt",
  thermaloop: "ThermaLoop",
  "thermaloop underfloor": "ThermaLoop underfloor",
  "air source heat pump": "Air source heat pump",
  "ground source heat pump": "Ground source heat pump",
  "solar pv": "Solar PV",
  "ev charger": "EV charger",
};

export function systemLabel(s: SignOff): string {
  return BRAND_CASE[s.system.trim().toLowerCase()] ?? s.system;
}
