/**
 * Cookie consent, kept in one place.
 *
 * UK PECR requires consent BEFORE a non-essential tracker is loaded, not
 * after. So nothing here flips a tracker into "anonymous mode" — the script
 * simply is not fetched until somebody has said yes, and is not fetched again
 * after they say no.
 *
 * The site's own cookie policy already promised two things that did not
 * exist: that analytics load "only with consent", and that there are
 * "consent controls" to change your mind. This is both of them.
 */

export type ConsentState = "granted" | "denied" | "unset";

const KEY = "elixa-cookie-consent";
const EVENT = "elixa-consent-change";

/**
 * Reads the stored choice.
 *
 * Returns "unset" on the server and whenever storage is unreadable — a
 * private window, blocked site data, a browser that throws on access. The
 * safe failure is to assume no consent and show the banner again, never to
 * assume yes.
 */
export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

export function setConsent(state: Exclude<ConsentState, "unset">) {
  try {
    window.localStorage.setItem(KEY, state);
    window.localStorage.setItem(`${KEY}-at`, new Date().toISOString());
  } catch {
    // Storage blocked. The choice still applies to this page view through
    // the event below; it simply will not be remembered, and the banner
    // comes back next time. Better than failing silently in the other
    // direction.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: state }));
}

/** Clears the choice so the banner returns — the "change your mind" path. */
export function resetConsent() {
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(`${KEY}-at`);
  } catch {
    /* nothing to clear */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: "unset" }));
}

export function onConsentChange(fn: (state: ConsentState) => void): () => void {
  const handler = () => fn(getConsent());
  window.addEventListener(EVENT, handler);
  // Another tab may have answered the banner; honour that here too.
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
