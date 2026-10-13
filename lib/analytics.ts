/**
 * Conversion-tracking helper. Pushes events to the GTM dataLayer (and GA4 via
 * gtag if present). Safe to call anywhere — no-ops on the server and when no
 * container/ID is configured. Wire a container via NEXT_PUBLIC_GTM_ID /
 * NEXT_PUBLIC_GA_ID and gate loading behind cookie consent.
 */

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type ConversionEvent =
  | "quote_start"
  | "quote_step"
  | "quote_submit"
  | "quick_quote_submit"
  // the optional extra step, opened by a visitor who knows their own system
  | "quick_quote_detail"
  // the advert calculator: opened, and a figure actually seen
  | "calculator_start"
  | "estimate_viewed"
  | "calculator_complete"
  | "phone_click"
  | "email_click"
  | "cta_click"
  | "survey_booking";

/**
 * The same events, in the names Meta's reporting understands.
 *
 * Lead, Contact and Schedule are Meta's own standard events, so they show
 * up in Ads Manager as conversions worth optimising towards rather than as
 * custom events somebody has to go looking for. The two calculator steps
 * have no standard equivalent and are sent as custom events.
 *
 * Anything not listed here stays out of Meta entirely. A pixel that
 * receives every internal event is one nobody can read.
 */
const META: Partial<Record<ConversionEvent, { name: string; standard: boolean }>> = {
  calculator_start: { name: "CalculatorStart", standard: false },
  estimate_viewed: { name: "EstimateViewed", standard: false },
  quick_quote_submit: { name: "Lead", standard: true },
  quote_submit: { name: "Lead", standard: true },
  survey_booking: { name: "Schedule", standard: true },
  phone_click: { name: "Contact", standard: true },
  email_click: { name: "Contact", standard: true },
};

export function track(event: ConversionEvent, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
  // Consent needs no check here, and that is the point: fbq only exists
  // once MetaPixel has loaded the script, and MetaPixel does not load it
  // until somebody has said yes. No consent, no fbq, nothing sent — so
  // there is no second gate to forget to update.
  const meta = META[event];
  if (meta && typeof window.fbq === "function") {
    window.fbq(meta.standard ? "track" : "trackCustom", meta.name, params);
  }
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
