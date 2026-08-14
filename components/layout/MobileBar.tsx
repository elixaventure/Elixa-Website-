"use client";

import Link from "next/link";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";

/** Persistent bottom action bar on mobile: Call now | Get a quote. */
export function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/90 backdrop-blur-xl sm:hidden">
      <div className="grid grid-cols-2 gap-2 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <a
          href={site.phoneHref}
          onClick={() => track("phone_click", { location: "mobile-bar" })}
          className="btn-navy flex-col gap-0 py-2.5 text-sm"
        >
          <span className="text-[0.65rem] font-normal opacity-70">Call now</span>
          {site.phoneDisplay}
        </a>
        <Link
          href="/quote"
          onClick={() => track("cta_click", { location: "mobile-bar", label: "quote" })}
          className="btn-primary flex-col gap-0 py-2.5 text-sm"
        >
          <span className="text-[0.65rem] font-normal opacity-80">Free &amp; no-obligation</span>
          Get a Quote
        </Link>
      </div>
    </div>
  );
}
