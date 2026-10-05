"use client";

import { resetConsent } from "@/lib/consent";

/**
 * "Cookie settings" — the control the cookie policy says exists.
 *
 * Clearing the stored choice brings the banner back, which is the simplest
 * honest way to let somebody change their mind: they answer it again. It
 * also means withdrawing consent is exactly as easy as giving it, which is
 * what UK GDPR asks for.
 */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={resetConsent} className={className}>
      Cookie settings
    </button>
  );
}
