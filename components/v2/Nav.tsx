"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

type MenuItem = {
  label: string;
  href: string;
  /** when present, the item opens rather than simply navigating */
  children?: { label: string; href: string; note?: string }[];
};

/**
 * Four pages existed but could not be reached from here: air conditioning,
 * battery storage, EV charging and underfloor heating. A page nobody can
 * find is a page that does not exist.
 *
 * Grouping the related ones keeps the row to ten items so it still fits a
 * laptop. "Home" came out to make room — the logo is the home link on every
 * site ever built, and it already carries the aria-label to say so.
 *
 * "Heat Source" rather than "Heat Pumps".
 *
 * We lead with heat pumps, but we fit boilers too, and somebody who needs
 * one and sees only heat pumps assumes we cannot help and rings elsewhere.
 * Naming the category and putting the options under it keeps the renewable
 * first without pretending it is the only thing we do.
 */
const MENU: MenuItem[] = [
  { label: "Solutions", href: "/#solutions" },
  {
    label: "Heat Source",
    href: "/heat-source",
    children: [
      { label: "Air source heat pumps", href: "/air-source-heat-pumps", note: "Our pick" },
      { label: "Electric boilers", href: "/heat-source#electric-boiler" },
      { label: "Gas boilers", href: "/heat-source#gas-boiler" },
      { label: "Compare all three", href: "/heat-source" },
    ],
  },
  {
    // The emitters — what delivers the heat, as against what makes it.
    label: "Heating",
    href: "/thermaskirt",
    children: [
      { label: "ThermaSkirt", href: "/thermaskirt" },
      { label: "Underfloor heating", href: "/underfloor-heating" },
    ],
  },
  { label: "Air Conditioning", href: "/air-conditioning" },
  {
    label: "Solar",
    href: "/solar-pv",
    children: [
      { label: "Solar PV", href: "/solar-pv" },
      { label: "Battery storage", href: "/battery-storage" },
      { label: "EV charging", href: "/ev-charging" },
    ],
  },
  {
    // Three kinds of proof, all answering the same question, so one item.
    // This also surfaces /completed, which was only reachable from a button
    // on the homepage.
    label: "Our Work",
    href: "/projects",
    children: [
      { label: "Recently completed", href: "/completed" },
      { label: "Install photos", href: "/projects" },
      { label: "Case studies", href: "/case-studies" },
    ],
  },
  { label: "Grants", href: "/grants-funding" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function NavV2() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        solid || open ? "border-b border-night-line bg-night/90 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[var(--v2-nav-h)] max-w-[1500px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="flex items-center" aria-label="Elixa Renewables — home">
          <Image src={`${BASE}/brand/elixa-logo-ondark-2.png`} alt="Elixa Renewables Group" width={150} height={72} priority className="h-[50px] w-auto" />
        </Link>

        <nav className="hidden items-center gap-4 xl:flex 2xl:gap-6" aria-label="Primary">
          {MENU.map((m) =>
            m.children ? (
              // Hover opens it, focus-within keeps it open for the keyboard,
              // and the label is still a real link so it works either way.
              <div key={m.label} className="group relative">
                <Link
                  href={m.href}
                  className="flex items-center gap-1.5 py-2 font-techmono text-xs uppercase tracking-[0.14em] text-night-muted transition-colors group-hover:text-night-text group-focus-within:text-night-text"
                >
                  {m.label}
                  <svg aria-hidden viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4" className="transition-transform group-hover:rotate-180">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Link>
                <div className="invisible absolute left-1/2 top-full w-[260px] -translate-x-1/2 pt-3 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="border border-night-line bg-night/95 p-2 backdrop-blur-md">
                    {m.children.map((c) => (
                      <Link
                        key={c.label}
                        href={c.href}
                        className="flex items-center justify-between gap-3 px-4 py-3 font-techmono text-[11px] uppercase tracking-[0.12em] text-night-muted transition-colors hover:bg-night-accent/10 hover:text-night-accent"
                      >
                        {c.label}
                        {c.note && (
                          <span className="shrink-0 rounded-full bg-night-accent/15 px-2 py-0.5 text-[9px] text-night-accent">
                            {c.note}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={m.label}
                href={m.href}
                className="py-2 font-techmono text-xs uppercase tracking-[0.14em] text-night-muted transition-colors hover:text-night-text"
              >
                {m.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Present on every page, at the very top, on phones too — a short
              label below sm so it still fits beside the logo and the burger.
              The full enquiry form stays reachable from the menu and footer. */}
          <Link
            href="/quick-quote"
            className="border border-night-accent bg-night-accent px-4 py-2.5 font-techmono text-xs uppercase tracking-[0.14em] text-night transition-opacity hover:opacity-90 sm:px-5"
          >
            <span className="sm:hidden">Quote</span>
            <span className="hidden sm:inline">Quick Quote</span>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
            className="flex h-12 w-12 flex-col items-center justify-center gap-[6px] xl:hidden"
          >
            <span className={cn("h-[2px] w-7 bg-night-text transition-transform", open && "translate-y-[4px] rotate-45")} />
            <span className={cn("h-[2px] w-7 bg-night-text transition-transform", open && "-translate-y-[4px] -rotate-45")} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-night-line bg-night px-6 py-6 xl:hidden" aria-label="Mobile">
          <div className="grid gap-4">
            {MENU.map((m) =>
              m.children ? (
                // Shown open rather than behind an accordion. There is one
                // group, and burying three options under an extra tap on the
                // device where taps cost the most defeats the point of
                // widening the category in the first place.
                <div key={m.label} className="border-l-2 border-night-accent pl-4">
                  <Link
                    href={m.href}
                    onClick={() => setOpen(false)}
                    className="block py-1.5 font-arch text-2xl font-medium text-night-text"
                  >
                    {m.label}
                  </Link>
                  <div className="mt-3 grid gap-2">
                    {m.children
                      .filter((c) => c.href !== m.href)
                      .map((c) => (
                        <Link
                          key={c.label}
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="flex min-h-[52px] items-center justify-between gap-3 border border-night-line px-4 py-3 font-techmono text-[11px] uppercase tracking-[0.12em] text-night-muted"
                        >
                          <span>{c.label}</span>
                          {c.note ? (
                            <span className="shrink-0 rounded-full bg-night-accent/15 px-2 py-1 text-[9px] text-night-accent">
                              {c.note}
                            </span>
                          ) : (
                            <span aria-hidden className="text-night-accent">&rarr;</span>
                          )}
                        </Link>
                      ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={m.label}
                  href={m.href}
                  onClick={() => setOpen(false)}
                  className="py-1.5 font-arch text-2xl font-medium text-night-text"
                >
                  {m.label}
                </Link>
              ),
            )}
            <Link
              href="/quick-quote"
              onClick={() => setOpen(false)}
              className="mt-2 border border-night-accent bg-night-accent px-4 py-4 text-center font-techmono text-sm uppercase tracking-[0.14em] text-night"
            >
              Quick Heat Pump Quote
            </Link>
            <Link
              href="/quote"
              onClick={() => setOpen(false)}
              className="border border-night-accent px-4 py-4 text-center font-techmono text-sm uppercase tracking-[0.14em] text-night-accent"
            >
              Request a Survey
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
