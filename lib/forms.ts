/**
 * Lead submission. If NEXT_PUBLIC_FORM_ENDPOINT is set (e.g. a Formspree form
 * URL like https://formspree.io/f/xxxx, or your own handler), enquiries POST
 * there as JSON and land in a real inbox/CRM. If it's not set, callers fall
 * back to opening the visitor's email client (mailto). No backend required to
 * ship; just add the env var when ready.
 */

export const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";

export async function submitLead(data: Record<string, unknown>): Promise<boolean> {
  if (!FORM_ENDPOINT) return false;
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}
