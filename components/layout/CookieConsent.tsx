"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent, onConsentChange, type ConsentState } from "@/lib/consent";

/**
 * The consent banner the cookie policy already promised.
 *
 * Accept and Reject carry equal weight — same size, same prominence. A
 * "reject" hidden behind a link or greyed into the background is the pattern
 * the ICO has repeatedly called out, and it is not worth the risk for the
 * handful of extra yeses it buys.
 *
 * Nothing is tracked until a choice is made. Dismissing by any route other
 * than the two buttons leaves the state unset, so the banner returns rather
 * than quietly counting silence as agreement.
 */
export function CookieConsent() {
  const [state, setState] = useState<ConsentState>("unset");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(getConsent());
    setReady(true);
    return onConsentChange(setState);
  }, []);

  // Rendering nothing until mounted keeps the server and client markup the
  // same — the stored choice only exists in the browser.
  if (!ready || state !== "unset") return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      /* Above the mobile navigation bar on phones, which is fixed to the
         bottom at 68px and z-40. */
      className="fixed inset-x-0 bottom-[68px] z-50 border-t border-night-line bg-night/97 backdrop-blur-md lg:bottom-0"
    >
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-10">
        <p className="max-w-[72ch] text-sm leading-relaxed text-night-muted">
          We use cookies that are needed to run the site, and — only if you agree — others that
          tell us how it is used and let us measure our advertising. You can change your mind at
          any time.{" "}
          <Link href="/cookie-policy" className="text-night-accent underline underline-offset-4">
            Cookie policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setConsent("denied")}
            className="min-h-[48px] flex-1 border border-night-line px-6 font-techmono text-xs uppercase tracking-[0.14em] text-night-muted transition-colors hover:border-night-text hover:text-night-text md:flex-none"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => setConsent("granted")}
            className="min-h-[48px] flex-1 border border-night-accent bg-night-accent px-6 font-techmono text-xs uppercase tracking-[0.14em] text-night transition-opacity hover:opacity-90 md:flex-none"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
