/**
 * Lead submission — the quote form posts the enquiry straight to an inbox,
 * so the visitor never leaves the page or opens their email app.
 *
 * Switch real delivery on with either (no code changes, just a repo variable):
 *
 *  - NEXT_PUBLIC_WEB3FORMS_KEY — a Web3Forms access key. The enquiry is
 *    emailed to the inbox that key was created for. File attachments need
 *    their Pro plan; on the free plan the lead still gets through (see the
 *    retry below), just without the file.
 *  - NEXT_PUBLIC_FORM_ENDPOINT — any form URL that accepts a POST (e.g. a
 *    Formspree form like https://formspree.io/f/xxxx, or your own handler).
 *
 * With neither set, callers fall back to opening the visitor's email client
 * (mailto) — which is the hand-off we are trying to avoid, so set one.
 *
 * Web3Forms access keys are public by design (they only name the destination
 * inbox), so shipping one in the client bundle is expected.
 *
 * NOTE on the env reads: GitHub Actions passes an *empty string* for a repo
 * variable that isn't set, not undefined, so `??` would keep that "" and
 * silently disable delivery even with a key present. Hence `||` and .trim().
 */

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const WEB3FORMS_KEY = (process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "").trim();
const CUSTOM_ENDPOINT = (process.env.NEXT_PUBLIC_FORM_ENDPOINT || "").trim();

export const FORM_ENDPOINT = CUSTOM_ENDPOINT || (WEB3FORMS_KEY ? WEB3FORMS_ENDPOINT : "");

const IS_WEB3FORMS = FORM_ENDPOINT.includes("web3forms.com");

/** Fields the destination needs on top of the visitor's answers. */
function withMeta(data: Record<string, unknown>): Record<string, unknown> {
  if (!IS_WEB3FORMS) return { ...data };
  return {
    ...data,
    access_key: WEB3FORMS_KEY,
    subject: `New enquiry from the Elixa website${data.name ? ` — ${data.name}` : ""}`,
    from_name: "Elixa Renewables website",
  };
}

async function postJson(payload: Record<string, unknown>): Promise<boolean> {
  const res = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

export async function submitLead(data: Record<string, unknown>, file?: File | null): Promise<boolean> {
  if (!FORM_ENDPOINT) return false;
  try {
    const payload = withMeta(data);

    if (!file) return await postJson(payload);

    // Attachment rides along with the lead where the plan allows it.
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v ?? "")));
    // Web3Forms only forwards files sent under its own "attachment" field name
    fd.append(IS_WEB3FORMS ? "attachment" : "floor_plan", file, file.name);
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: fd,
    });
    if (res.ok) return true;

    // The file was refused (e.g. attachments aren't on this plan, or it is
    // over the size limit). An enquiry with no plan attached still beats a
    // lost enquiry, so send it again as plain JSON and say the plan exists.
    return await postJson({
      ...payload,
      floor_plan: `Yes — "${file.name}" (not attached; we'll ask for it by email)`,
    });
  } catch {
    return false;
  }
}
