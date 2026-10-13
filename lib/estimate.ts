/**
 * The heat pump estimate, worked out away from the browser.
 *
 * This site is a static export, so anything it calculates it also
 * publishes — put the price list in the bundle and it is readable by
 * anyone, competitors included. So the sum happens in a Supabase
 * function (taskflowai: supabase/functions/heat-pump-estimate) that
 * reads the same prices the office quotes from. This file only asks the
 * question and carries the answer back.
 *
 * Unset, unreachable, or answering "I can't price this one" all land in
 * the same place: null, and the page falls back to asking the visitor
 * for their details so a person can price it. That fallback is the
 * behaviour the site has today, so nothing here can make it worse.
 */

export const ESTIMATE_URL = process.env.NEXT_PUBLIC_ESTIMATE_URL ?? "";
const SITE_KEY = process.env.NEXT_PUBLIC_ESTIMATE_SITE_KEY ?? "";

export interface Estimate {
  kind: "firm" | "range";
  beforeGrant: { from: number; to: number };
  grant: { label: string; amount: number } | null;
  total: { from: number; to: number };
  vat: string;
  assumptions: string[];
  disclaimer: string;
  excludes: string[];
}

export interface EstimateAsk {
  bedrooms?: string;
  property?: string;
  /** The two ends of the distance band the visitor picked, in metres. */
  metresMin?: number;
  metresMax?: number;
  grant?: boolean;
}

/**
 * The site asks how far the heat pump is from the cylinder in bands,
 * because that is a question somebody can answer standing in their
 * hallway. The band's own two ends go across — not a number invented
 * from the middle of it.
 *
 * "Over 10 metres" has no upper end by definition, so none is sent and
 * the function uses whatever ceiling the business configured.
 */
const BANDS: Record<string, { metresMin?: number; metresMax?: number }> = {
  under5: { metresMin: 0, metresMax: 5 },
  "5to10": { metresMin: 5, metresMax: 10 },
  over10: { metresMin: 10 },
};

export function bandToMetres(answer: string | undefined) {
  return (answer && BANDS[answer]) || {};
}

export async function fetchEstimate(ask: EstimateAsk, signal?: AbortSignal): Promise<Estimate | null> {
  if (!ESTIMATE_URL) return null;
  try {
    const res = await fetch(ESTIMATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: SITE_KEY, ...ask }),
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    // "unavailable" is a normal answer, not a failure — it means the
    // business has not published a figure for this job, and the page
    // should do what it does when there is no figure at all.
    if (!data?.ok || data.kind === "unavailable") return null;
    if (data.kind !== "firm" && data.kind !== "range") return null;
    // Anything that would put a nonsense number on screen is treated as
    // no answer. A static site cannot fix a bad response at runtime, so
    // the only safe reading of one is to stop using it.
    const n = (v: unknown) => (typeof v === "number" && isFinite(v) && v >= 0 ? v : null);
    const from = n(data?.total?.from), to = n(data?.total?.to);
    if (from == null || to == null || to < from || from === 0) return null;
    return data as Estimate;
  } catch {
    // Offline, blocked, timed out, CORS. The visitor gets the callback.
    return null;
  }
}
