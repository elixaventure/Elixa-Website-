"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

/**
 * Persistent bottom navigation on phones.
 *
 * Below lg — every phone and most tablets — every link on this site was
 * behind the hamburger, so getting anywhere meant knowing to open a menu
 * first. That is how a site starts to feel like a maze even when every page
 * on it is good.
 *
 * Four destinations by what somebody actually came for: what we fit, proof
 * we fit it, whether the government pays for some of it, and how to reach a
 * human. Quoting already lives permanently in the header, so it is not
 * repeated here.
 *
 * Bottom rather than top because a thumb reaches the bottom of a phone and
 * does not reach the top, and because the top is spoken for by the header
 * and, on the homepage, the section rail.
 */
const TABS = [
  {
    // "Home", not "Systems". A tab in a bar like this says which page you are
    // on, and this one lights for the whole homepage — calling it Systems
    // while somebody is reading the Grants section is a small lie, and Home
    // is the anchor people look for when they feel lost anyway.
    href: "/",
    label: "Home",
    match: (p: string) => p === "/",
    icon: (
      <>
        <path d="M3 10.5 12 4l9 6.5" />
        <path d="M5.5 9.8V20h13V9.8" />
      </>
    ),
  },
  {
    href: "/projects",
    label: "Projects",
    match: (p: string) => p.startsWith("/projects") || p.startsWith("/completed") || p.startsWith("/case-studies"),
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <path d="m3 15 5-4 4 3 3-2.5 6 4.5" />
        <circle cx="8.5" cy="9.5" r="1.4" />
      </>
    ),
  },
  {
    href: "/grants-funding",
    label: "Grants",
    match: (p: string) => p.startsWith("/grants"),
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M14.5 9.2a3 3 0 0 0-4.8 1.6c-.3 1.6 1 2.4 2.4 2.7 1.4.3 2.6 1 2.3 2.5a3 3 0 0 1-4.8 1.4" />
        <path d="M12 6.4v11.2" />
      </>
    ),
  },
  {
    href: "/contact",
    label: "Contact",
    match: (p: string) => p.startsWith("/contact"),
    // An envelope, not a handset — the Call button beside it is the handset,
    // and two identical icons side by side is a coin toss rather than a choice.
    icon: (
      <>
        <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
        <path d="m3.5 7 8.5 6 8.5-6" />
      </>
    ),
  },
];

export function MobileNavV2() {
  const pathname = usePathname();
  const path = pathname?.replace(/\/$/, "") || "/";

  return (
    <>
      {/* Reserves the space the fixed bar sits over, so the footer and the
          last CTA on every page stay reachable rather than tucked under it. */}
      <div aria-hidden className="h-[68px] lg:hidden" />

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-night-line bg-night/95 backdrop-blur-md lg:hidden"
      >
        <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
          {TABS.map((t) => {
            const on = t.match(path);
            return (
              <Link
                key={t.label}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-[64px] flex-col items-center justify-center gap-1.5 px-1 transition-colors ${
                  on ? "text-night-accent" : "text-night-faint"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="21"
                  height="21"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {t.icon}
                </svg>
                <span className="font-techmono text-[9px] uppercase tracking-[0.1em]">{t.label}</span>
              </Link>
            );
          })}

          {/* The one action worth a thumb of its own. A heating company on a
              phone is a phone call more often than it is a form. */}
          <a
            href={site.phoneHref}
            className="flex min-h-[64px] flex-col items-center justify-center gap-1.5 bg-night-accent px-1 text-night"
          >
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.5 4.5h-3v3a13 13 0 0 0 12 12h3v-3l-4-1.5-2 2a13.5 13.5 0 0 1-6.5-6.5l2-2Z" />
            </svg>
            <span className="font-techmono text-[9px] uppercase tracking-[0.1em]">Call</span>
          </a>
        </div>
      </nav>
    </>
  );
}
