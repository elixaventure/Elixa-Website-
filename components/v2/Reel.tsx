"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArtHeatPump, ArtSolar, ArtSkirt, ArtUnderfloor, ArtBattery, ArtEv, ArtBoiler } from "./art";

/**
 * "Technology for the Modern Home" — a pinned cinematic reel that travels
 * horizontally as the page scrolls. Panels vary in width and composition on
 * purpose (editorial rhythm, not a card grid). Below lg it degrades to a
 * native swipe reel with scroll-snap.
 */

const PANELS = [
  {
    n: "01",
    title: "Air Source Heat Pumps",
    line: "Whole-house heating drawn from the outside air.",
    spec: "SCOP ≈ 4.0 · 40 °C FLOW DESIGN",
    href: "/air-source-heat-pumps",
    Art: ArtHeatPump,
    w: "w-[78vw] sm:w-[420px] lg:w-[30vw]",
    tone: "bg-night-surface",
  },
  {
    n: "02",
    title: "Solar PV",
    line: "Generation designed around the roof, not bolted on.",
    spec: "PER-ROOF STRING DESIGN · EXPORT READY",
    href: "/solar-pv",
    Art: ArtSolar,
    w: "w-[82vw] sm:w-[480px] lg:w-[36vw]",
    tone: "bg-night-deep",
  },
  {
    n: "03",
    title: "ThermaSkirt Heating",
    line: "The skirting board becomes the radiator.",
    spec: "PERIMETER EMITTER · LOW-TEMP",
    href: "/thermaskirt",
    Art: ArtSkirt,
    w: "w-[74vw] sm:w-[400px] lg:w-[27vw]",
    tone: "bg-night-surface",
  },
  {
    n: "04",
    title: "Underfloor Heating",
    line: "Invisible warmth across the whole floor.",
    spec: "35 °C FLOW · ZONED MANIFOLDS",
    href: "/underfloor-heating",
    Art: ArtUnderfloor,
    w: "w-[82vw] sm:w-[480px] lg:w-[34vw]",
    tone: "bg-night-deep",
  },
  {
    n: "05",
    title: "Battery Storage",
    line: "Hold your energy until your home needs it.",
    spec: "AC/DC COUPLED · SMART TARIFF READY",
    href: "/battery-storage",
    Art: ArtBattery,
    w: "w-[74vw] sm:w-[400px] lg:w-[26vw]",
    tone: "bg-night-surface",
  },
  {
    n: "06",
    title: "EV Charging",
    line: "Charge from your own generation, not just the grid.",
    spec: "7.4 kW · SOLAR-AWARE CHARGING",
    href: "/ev-charging",
    Art: ArtEv,
    w: "w-[78vw] sm:w-[440px] lg:w-[31vw]",
    tone: "bg-night-deep",
  },
  {
    n: "07",
    title: "Electric Boilers",
    line: "Compact all-electric heat where a pump won't fit.",
    spec: "COMBUSTION-FREE · COMPACT",
    href: "/underfloor-heating",
    Art: ArtBoiler,
    w: "w-[74vw] sm:w-[400px] lg:w-[26vw]",
    tone: "bg-night-surface",
  },
];

export function ReelV2() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const t = track.current!;
      const dist = t.scrollWidth - window.innerWidth;
      // only unclip the track while the pin owns horizontal travel — as a
      // plain flow element it must stay a swipe reel or the page grows a
      // horizontal scrollbar
      t.style.overflow = "visible";
      gsap.to(t, {
        x: -dist,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${dist}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => {
      if (track.current) track.current.style.overflow = "";
      mm.revert();
    };
  }, []);

  return (
    <section id="solutions" className="relative border-t border-night-line bg-night">
      <div ref={root} className="flex min-h-[100svh] flex-col justify-center overflow-hidden py-16 lg:py-0">
        <div className="mx-auto w-full max-w-[1500px] px-5 md:px-10">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">Solutions</p>
          <h2 className="v2-narrow mt-3 max-w-[16ch] font-arch text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-night-text md:text-6xl">
            Technology for the modern home.
          </h2>
          <p className="mt-4 max-w-[52ch] text-night-muted">
            From low-carbon heating to intelligent energy generation, we design complete systems around
            the property.
          </p>
        </div>

        <div
          ref={track}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 will-change-transform [scrollbar-width:none] md:px-10 lg:pr-[16vw]"
        >
          {PANELS.map((p) => (
            <Link
              key={p.n}
              href={p.href}
              className={`group relative flex ${p.w} flex-none snap-start flex-col border border-night-line ${p.tone} transition-colors duration-300 hover:border-night-text/25`}
            >
              <div className="flex items-baseline justify-between gap-5 px-6 pt-6">
                <span className="font-techmono text-[11px] text-night-faint">{p.n}</span>
                <span className="text-right font-techmono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-night-faint">
                  {p.spec}
                </span>
              </div>
              <div className="h-[34vh] min-h-[220px] px-8 py-6 text-night-muted transition-transform duration-500 ease-out group-hover:-translate-y-1 lg:h-[40vh]">
                <p.Art />
              </div>
              <div className="mt-auto border-t border-night-line px-6 py-5">
                <h3 className="font-arch text-2xl font-medium tracking-[-0.01em] text-night-text">{p.title}</h3>
                <p className="mt-1.5 text-sm text-night-muted">{p.line}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-accent">
                  Explore
                  <span className="inline-block h-px w-6 bg-night-accent transition-all duration-300 group-hover:w-10" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
