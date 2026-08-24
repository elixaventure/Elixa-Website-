/**
 * Floor-plan recognition relay.
 *
 * The website is a static export on GitHub Pages, so the RapidAPI key can
 * never live in the page. This Worker holds the key and forwards the
 * customer's plan image to the RasterScan "Floor Plan Digitalization" API,
 * returning the provider's JSON untouched.
 *
 * Secrets / vars (see wrangler.toml + README.md):
 *   RAPIDAPI_KEY     — secret, from your RapidAPI subscription
 *   RAPIDAPI_HOST    — var, the API's host on RapidAPI
 *   PLAN_PATH        — var, recognition endpoint path on that host
 *   ALLOWED_ORIGINS  — var, comma-separated origins allowed to call this relay
 */

const MAX_BYTES = 8 * 1024 * 1024;

function corsHeaders(req, env) {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.get("Origin") || "";
  const ok = allowed.length === 0 || allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok && origin ? origin : allowed[0] || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...extra },
  });
}

export default {
  async fetch(req, env) {
    const cors = corsHeaders(req, env);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (req.method !== "POST") return json({ error: "POST an image" }, 405, cors);
    if (!env.RAPIDAPI_KEY) return json({ error: "relay not configured" }, 503, cors);

    let file;
    try {
      const form = await req.formData();
      file = form.get("image");
    } catch {
      return json({ error: "multipart form with an 'image' file field required" }, 400, cors);
    }
    if (!(file instanceof File)) return json({ error: "'image' file field required" }, 400, cors);
    if (file.size > MAX_BYTES) return json({ error: "image too large (8 MB max)" }, 413, cors);

    const out = new FormData();
    out.append("image", file, file.name || "plan.jpg");

    const host = env.RAPIDAPI_HOST || "floor-plan-digitalization.p.rapidapi.com";
    const path = env.PLAN_PATH || "/plan_recognition";
    let upstream;
    try {
      upstream = await fetch(`https://${host}${path}`, {
        method: "POST",
        body: out,
        headers: {
          "X-RapidAPI-Key": env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": host,
        },
      });
    } catch (e) {
      return json({ error: "recognition service unreachable", detail: String(e) }, 502, cors);
    }

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json", ...cors },
    });
  },
};
