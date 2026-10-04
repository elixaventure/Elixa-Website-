"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HEAT_SOURCE_OPTIONS } from "@/content/heatSources";

/**
 * The three heat sources, one at a time.
 *
 * Tabs rather than three stacked sections because the whole point is
 * comparison — you want to put them side by side in your head, and a page
 * you have to scroll two screens to compare does not let you.
 *
 * The tabs read the hash, so /heat-source#gas-boiler opens on the gas boiler.
 * That is what the navigation's sub-items link to, and what somebody can send
 * a friend.
 */
export function HeatSourceTabs() {
  const [active, setActive] = useState(HEAT_SOURCE_OPTIONS[0].id);

  // Honour the hash on arrival and on the back button, but never scroll —
  // the tabs are already at the top of the section somebody has just landed on.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace("#", "");
      if (HEAT_SOURCE_OPTIONS.some((o) => o.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const option = HEAT_SOURCE_OPTIONS.find((o) => o.id === active) ?? HEAT_SOURCE_OPTIONS[0];

  return (
    <div>
      {/* Full width on a phone, so each one is a proper target rather than
          three cramped words in a row. */}
      <div role="tablist" aria-label="Heat source" className="grid gap-3 sm:grid-cols-3">
        {HEAT_SOURCE_OPTIONS.map((o) => {
          const on = o.id === option.id;
          return (
            <button
              key={o.id}
              role="tab"
              aria-selected={on}
              onClick={() => {
                setActive(o.id);
                // Keeps the address bar honest and the back button useful,
                // without the jump that setting location.hash would cause.
                history.replaceState(null, "", `#${o.id}`);
              }}
              className={`flex min-h-[64px] items-center justify-between gap-3 border px-5 py-4 text-left font-techmono text-[12px] uppercase tracking-[0.14em] transition-colors ${
                on
                  ? "border-night-accent bg-night-accent/12 text-night-accent"
                  : "border-night-line text-night-muted hover:border-night-accent/60 hover:text-night-text"
              }`}
            >
              <span>{o.tab}</span>
              {o.lead && (
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[9px] tracking-[0.1em] ${
                    on ? "bg-night-accent text-night" : "bg-night-accent/15 text-night-accent"
                  }`}
                >
                  Our pick
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="v2-narrow max-w-[18ch] text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
            {option.name}
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-night-accent md:text-lg">
            {option.standfirst}
          </p>

          <div className="mt-8 border-l-2 border-night-accent pl-5">
            <p className="font-arch text-4xl font-semibold leading-none text-night-text md:text-5xl">
              {option.headline.value}
            </p>
            <p className="mt-2 font-techmono text-[11px] uppercase tracking-[0.18em] text-night-faint">
              {option.headline.label}
            </p>
          </div>

          {option.body.map((p) => (
            <p key={p.slice(0, 24)} className="mt-6 max-w-[62ch] text-base leading-relaxed text-night-muted">
              {p}
            </p>
          ))}

          {option.href && (
            <Link
              href={option.href}
              className="group mt-8 inline-flex items-center gap-3 border border-night-accent px-7 py-4 font-techmono text-xs uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
            >
              {option.hrefLabel}
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          )}
        </div>

        <div className="grid gap-8 self-start">
          <div className="border border-night-line p-6">
            <p className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-accent">
              Suits
            </p>
            <ul className="mt-4 grid gap-3">
              {option.suits.map((s) => (
                <li key={s} className="flex gap-3 text-sm leading-relaxed text-night-muted">
                  <span aria-hidden className="mt-[7px] h-1 w-3 shrink-0 bg-night-accent" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Every option carries these. A page where only the alternatives
              have drawbacks is an advert, and reads like one. */}
          <div className="border border-night-line p-6">
            <p className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">
              Worth knowing
            </p>
            <ul className="mt-4 grid gap-3">
              {option.considerations.map((c) => (
                <li key={c} className="flex gap-3 text-sm leading-relaxed text-night-muted">
                  <span aria-hidden className="mt-[7px] h-1 w-3 shrink-0 bg-night-line" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
