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
  }
}

export type ConversionEvent =
  | "quote_start"
  | "quote_step"
  | "quote_submit"
  | "calculator_complete"
  | "phone_click"
  | "email_click"
  | "cta_click"
  | "survey_booking";

export function track(event: ConversionEvent, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
