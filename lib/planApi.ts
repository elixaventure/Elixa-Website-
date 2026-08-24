/**
 * Client for the hosted floor-plan recognition relay (RasterScan behind our
 * Cloudflare Worker — see workers/plan-api/). The site is a static export, so
 * the API key lives in the Worker, never in the page.
 *
 * Completely inert unless NEXT_PUBLIC_PLAN_API_URL is set at build time: with
 * the variable unset the classical in-browser extractor remains the only
 * path, so shipping this file changes nothing until the Worker is deployed.
 */

const API_URL = process.env.NEXT_PUBLIC_PLAN_API_URL || "";

export function planApiConfigured(): boolean {
  return API_URL.length > 0;
}

/**
 * Send the rasterised plan to the recognition service. Returns the parsed
 * JSON response, or null on any failure — callers always keep the classical
 * extraction as the fallback, so errors here must never break the journey.
 */
export async function recognisePlan(preview: Blob, timeoutMs = 30000): Promise<unknown | null> {
  if (!API_URL) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const fd = new FormData();
    fd.append("image", preview, "plan.jpg");
    const res = await fetch(API_URL, { method: "POST", body: fd, signal: ctrl.signal });
    if (!res.ok) {
      console.warn("[elixa] plan api HTTP", res.status);
      return null;
    }
    const json = (await res.json()) as unknown;
    // keep the first ~2KB visible so the adapter can be tuned against the
    // provider's real schema from any browser console
    try {
      console.info("[elixa] plan api response:", JSON.stringify(json).slice(0, 2048));
    } catch {
      /* non-serialisable — ignore */
    }
    return json;
  } catch (e) {
    console.warn("[elixa] plan api failed", e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
