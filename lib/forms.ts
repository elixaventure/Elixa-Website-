/**
 * Lead submission. If NEXT_PUBLIC_FORM_ENDPOINT is set (e.g. a Formspree form
 * URL like https://formspree.io/f/xxxx, or your own handler), enquiries POST
 * there as JSON and land in a real inbox/CRM. If it's not set, callers fall
 * back to opening the visitor's email client (mailto). No backend required to
 * ship; just add the env var when ready.
 */

export const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";

export async function submitLead(data: Record<string, unknown>, file?: File | null): Promise<boolean> {
  if (!FORM_ENDPOINT) return false;
  try {
    let res: Response;
    if (file) {
      // multipart so the attachment (e.g. a floor plan) rides along with the lead
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? "")));
      fd.append("floor_plan", file, file.name);
      res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: fd });
    } else {
      res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
    }
    return res.ok;
  } catch {
    return false;
  }
}
