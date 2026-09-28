"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

/**
 * Back navigation for inner pages.
 *
 * Most people reach the product pages from the cutaway diagram, which sits
 * halfway down the homepage. Without this, getting back there means going to
 * the homepage and scrolling to find their place again — the nav's "Home"
 * lands them at the top.
 *
 * It renders as a real link to `href`, so it works with JavaScript off,
 * survives middle-click and open-in-new-tab, and gives someone who arrived
 * cold from a search result somewhere sensible to go. When the visitor
 * genuinely came from elsewhere on this site, it steps back through history
 * instead, which restores their scroll position — the thing a plain link
 * cannot do.
 */
export function BackLink({ href, label }: { href: string; label: string }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Leave modified clicks alone — those are "open it over there" gestures.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    try {
      const ref = document.referrer;
      if (ref && new URL(ref).origin === window.location.origin) {
        e.preventDefault();
        window.history.back();
      }
    } catch {
      /* unparseable referrer — let the link do its job */
    }
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className="group inline-flex items-center gap-2.5 font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint transition-colors hover:text-night-accent"
    >
      <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">
        ←
      </span>
      {label}
    </Link>
  );
}
