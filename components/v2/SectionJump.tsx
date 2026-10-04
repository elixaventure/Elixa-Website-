"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Jump links across the top of the homepage.
 *
 * The page is long because it has a lot to say, and most of it is worth
 * saying — but somebody who came to see finished work should not have to
 * scroll past the whole pitch to find it. So: a row of destinations, and the
 * one you are currently in is marked, so the row doubles as a position
 * indicator on a page where it is otherwise easy to lose your place.
 *
 * Sticky under the header rather than fixed to the bottom. A phone screen is
 * small enough already, and a bar over the content is a bar you resent.
 */
const LINKS = [
  { id: "solutions", label: "Systems" },
  { id: "recent", label: "Recent work" },
  { id: "why", label: "Why Elixa" },
  { id: "case-studies", label: "Case studies" },
  { id: "process", label: "Process" },
  { id: "grants", label: "Grants" },
];

export function SectionJump() {
  const [active, setActive] = useState<string | null>(null);
  const [present, setPresent] = useState<string[]>([]);
  const rail = useRef<HTMLDivElement>(null);

  // #recent does not exist until a job has been published, and a link to
  // nothing is worse than no link. So the row is built from what is actually
  // on the page rather than from the list above.
  useEffect(() => {
    setPresent(LINKS.filter((l) => document.getElementById(l.id)).map((l) => l.id));
  }, []);

  useEffect(() => {
    if (!present.length) return;
    const nodes = present
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));

    // The section covering the band just below the header is the one you are
    // reading. rootMargin does the work so no scroll maths is needed.
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [present]);

  // Six chips do not fit a phone, so the row scrolls sideways — which means
  // the chip telling you where you are can be off the edge. Bring it back.
  // block: "nearest" so this never moves the page itself, only the rail.
  useEffect(() => {
    if (!active || !rail.current) return;
    const chip = rail.current.querySelector<HTMLElement>(`a[href="#${active}"]`);
    chip?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  const items = LINKS.filter((l) => present.includes(l.id));
  if (items.length < 3) return null;

  return (
    <nav
      aria-label="Jump to a section"
      className="sticky top-[var(--v2-nav-h)] z-40 border-y border-night-line bg-night/90 backdrop-blur-md"
    >
      {/* Scrolls sideways on a phone rather than wrapping to two rows and
          eating the screen it is meant to save. */}
      <div
        ref={rail}
        className="mx-auto flex max-w-[1500px] gap-1.5 overflow-x-auto px-3 py-2.5 [scrollbar-width:none] md:justify-center md:px-10 [&::-webkit-scrollbar]:hidden">
        {items.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            aria-current={active === l.id ? "true" : undefined}
            /* Every chip keeps the same geometry whatever its state. Growing
               the active one would reflow its neighbours on each section
               change, and on a rail that also scrolls itself to centre the
               active chip, that reads as a twitch. The pill does the work. */
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-techmono text-[12px] uppercase tracking-[0.16em] transition-colors duration-300 ${
              active === l.id
                ? "bg-night-accent/15 text-night-accent ring-1 ring-inset ring-night-accent/45"
                : "text-night-faint hover:text-night-text"
            }`}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
