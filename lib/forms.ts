/**
 * Lead submission. Two ways to switch real delivery on (no code changes):
 *
 *  - NEXT_PUBLIC_WEB3FORMS_KEY — a Web3Forms access key. Enquiries (and the
 *    floor-plan attachment) are emailed straight to the inbox the key was
 *    created for. Attachments need the Web3Forms Pro plan.
 *  - NEXT_PUBLIC_FORM_ENDPOINT — any form URL that accepts a POST (e.g. a
 *    Formspree form like https://formspree.io/f/xxxx, or your own handler).
 *
 * If neither is set, callers fall back to opening the visitor's email client
 * (mailto). Web3Forms access keys are public-by-design (they only identify
 * the destination inbox), so exposing one client-side is fine.
 */

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export const FORM_ENDPOINT =
  process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? (WEB3FORMS_KEY ? WEB3FORMS_ENDPOINT : "");

const IS_WEB3FORMS = FORM_ENDPOINT.includes("web3forms.com");

export async function submitLead(data: Record<string, unknown>, file?: File | null): Promise<boolean> {
  if (!FORM_ENDPOINT) return false;
  try {
    const payload: Record<string, unknown> = { ...data };
    if (IS_WEB3FORMS) {
      payload.access_key = WEB3FORMS_KEY;
      payload.subject = `New enquiry from the Elixa website${data.name ? ` — ${data.name}` : ""}`;
      payload.from_name = "Elixa Renewables website";
    }
    let res: Response;
    if (file) {
      // multipart so the attachment (e.g. a floor plan) rides along with the lead
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v ?? "")));
      // Web3Forms only forwards files sent under its "attachment" field name
      fd.append(IS_WEB3FORMS ? "attachment" : "floor_plan", file, file.name);
      res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: fd });
    } else {
      res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
    }
    return res.ok;
  } catch {
    return false;
  }
}
