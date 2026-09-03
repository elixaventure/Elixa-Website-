"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArtHeatPump, ArtSolar, ArtUnderfloor } from "./art";
import { site } from "@/content/site";

const rise = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

/* ------------------------------------------------------------- WHY ELIXA --- */

const PRINCIPLES = [
  {
    n: "A",
    t: "System design first",
    d: "Every proposal starts from the property — heat loss, fabric, flow temperatures — never from a box on a shelf.",
  },
  {
    n: "B",
    t: "Correctly sized, every time",
    d: "Oversized plant short-cycles; undersized plant struggles. We size from the numbers, and we show you the numbers.",
  },
  {
    n: "C",
    t: "Low-temperature by design",
    d: "Emitters chosen so the system runs cool — the quiet discipline behind real heat-pump efficiency.",
  },
  {
    n: "D",
    t: "Professional installation",
    d: "Qualified engineers, tidy first-fix, commissioning that's measured rather than assumed.",
  },
  {
    n: "E",
    t: "Support that stays",
    d: "Monitoring, servicing and a straight answer on the phone — for the life of the system.",
  },
];

export function WhyElixa() {
  return (
    <section className="border-t border-night-line bg-night-deep">
      <div className="mx-auto grid max-w-[1500px] gap-14 px-5 py-24 md:px-10 md:py-36 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">Why Elixa</p>
          <motion.h2 {...rise} className="v2-narrow mt-4 font-arch text-5xl font-semibold leading-[1.0] tracking-[-0.02em] text-night-text md:text-7xl">
            Systems,
            <br />
            not appliances.
          </motion.h2>
          <motion.p {...rise} className="mt-6 max-w-[44ch] leading-relaxed text-night-muted">
            A heat pump is only as good as the system around it. Elixa engineers the whole thing — heat
            source, emitters, controls and the fabric they serve — as one design.
          </motion.p>
        </div>
        <div>
          {PRINCIPLES.map((p, i) => (
            <motion.div
              {...rise}
              transition={{ ...rise.transition, delay: i * 0.05 }}
              key={p.n}
              className="grid grid-cols-[3rem_1fr] gap-4 border-t border-night-line py-7 last:border-b md:py-9"
            >
              <span className="font-techmono text-sm text-night-faint">{p.n}</span>
              <div>
                <h3 className="font-arch text-xl font-medium text-night-text md:text-2xl">{p.t}</h3>
                <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-night-muted md:text-base">{p.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- PROJECTS --- */

const STUDIES = [
  {
    tag: "SYSTEM STUDY — RETROFIT",
    t: "Three-bed semi, full electrification",
    d: "Air source heat pump with ThermaSkirt perimeter heating throughout — 40 °C design flow, no radiators on the walls.",
    Art: ArtHeatPump,
    span: "lg:col-span-7",
  },
  {
    tag: "SYSTEM STUDY — GENERATION",
    t: "Victorian terrace, solar + battery",
    d: "String design across two roof aspects with battery storage sized to the household's evening load.",
    Art: ArtSolar,
    span: "lg:col-span-5",
  },
  {
    tag: "SYSTEM STUDY — NEW BUILD",
    t: "Bungalow, underfloor throughout",
    d: "Wet underfloor at 35 °C flow, zoned by manifold — the lowest-temperature system we design.",
    Art: ArtUnderfloor,
    span: "lg:col-span-12",
  },
];

export function Projects() {
  return (
    <section className="border-t border-night-line bg-night">
      <div className="mx-auto max-w-[1500px] px-5 py-24 md:px-10 md:py-36">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">Projects</p>
            <h2 className="v2-narrow mt-4 max-w-[16ch] font-arch text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-night-text md:text-6xl">
              Built around real homes.
            </h2>
          </div>
          <p className="max-w-[38ch] text-sm leading-relaxed text-night-faint">
            Representative system designs shown as engineering studies — installation photography from
            completed Elixa projects is added here as it is signed off.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          {STUDIES.map((s, i) => (
            <motion.article
              key={s.t}
              initial={{ opacity: 0, clipPath: "inset(0 0 24% 0)" , y: 30}}
              whileInView={{ opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative overflow-hidden border border-night-line bg-night-surface ${s.span}`}
            >
              <div className="flex items-center justify-between px-6 pt-6">
                <span className="font-techmono text-[10px] uppercase tracking-[0.16em] text-night-faint">{s.tag}</span>
                <span className="h-px w-16 bg-night-line" />
              </div>
              <div className="mx-auto h-[300px] max-w-[420px] px-8 py-6 text-night-muted transition-transform duration-700 ease-out group-hover:scale-[1.03] md:h-[340px]">
                <s.Art />
              </div>
              <div className="border-t border-night-line px-6 py-6">
                <h3 className="font-arch text-xl font-medium text-night-text md:text-2xl">{s.t}</h3>
                <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-night-muted">{s.d}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- HOW IT WORKS --- */

const STEPS = [
  { t: "Survey", d: "A proper heat-loss survey of the property — fabric, rooms, existing system." },
  { t: "Design", d: "The full system on paper: heat source, emitters, flow temperatures, controls." },
  { t: "Installation", d: "Qualified engineers, planned first and second fix, respectful of your home." },
  { t: "Commissioning", d: "Measured performance at handover — not assumed. You see it working." },
  { t: "Support", d: "Servicing, monitoring and advice for the life of the system." },
];

export function Process() {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 55%", scrub: true },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="border-t border-night-line bg-night-deep">
      <div className="mx-auto max-w-[1500px] px-5 py-24 md:px-10 md:py-36">
        <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">How it works</p>
        <h2 className="v2-narrow mt-4 max-w-[18ch] font-arch text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-night-text md:text-6xl">
          One line, start to finish.
        </h2>

        <div ref={root} className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute left-[7px] top-0 h-full w-px bg-night-line md:left-1/2" />
          <div ref={line} className="absolute left-[7px] top-0 h-full w-px bg-night-accent md:left-1/2" />
          {STEPS.map((s, i) => (
            <div
              key={s.t}
              className={`relative grid gap-2 py-8 pl-10 md:w-1/2 md:py-10 ${
                i % 2 ? "md:ml-auto md:pl-14" : "md:ml-0 md:pl-0 md:pr-14 md:text-right"
              }`}
            >
              <span
                className={`absolute top-9 h-[15px] w-[15px] rounded-full border border-night-accent bg-night-deep md:top-11 ${
                  i % 2 ? "left-0 md:-left-[7.5px]" : "left-0 md:left-auto md:-right-[7.5px]"
                }`}
              />
              <span className="font-techmono text-[11px] text-night-faint">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-arch text-2xl font-medium text-night-text">{s.t}</h3>
              <p className={`text-sm leading-relaxed text-night-muted ${i % 2 ? "" : "md:ml-auto"} max-w-[40ch]`}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- GRANTS --- */

export function Grants() {
  return (
    <section className="border-t border-night-line bg-night">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 py-24 md:px-10 md:py-36 lg:grid-cols-2">
        <div>
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">Grants & funding</p>
          <motion.p {...rise} className="v2-narrow mt-5 font-arch text-[5.5rem] font-semibold leading-none tracking-[-0.03em] text-night-text md:text-[8rem]">
            £7,500
          </motion.p>
          <p className="mt-3 max-w-[40ch] text-lg text-night-muted">
            Boiler Upgrade Scheme grant towards an air source heat pump for eligible homes in England
            and Wales.
          </p>
        </div>
        <div className="grid gap-0 border-t border-night-line">
          {[
            ["0% VAT", "on qualifying energy-saving materials, including heat pumps and solar, until 2027."],
            ["We handle it", "Elixa checks eligibility and applies for the grant as part of your quote — the price you see is after funding."],
            ["No pressure", "The survey and design come first. Funding is applied to a system that's right, not the other way round."],
          ].map(([t, d]) => (
            <div key={t} className="grid grid-cols-[9rem_1fr] items-start gap-4 border-b border-night-line py-7">
              <span className="font-arch text-xl font-medium text-night-accent">{t}</span>
              <p className="text-sm leading-relaxed text-night-muted">{d}</p>
            </div>
          ))}
          <Link href="/grants-funding" className="mt-6 inline-flex w-fit items-center gap-2 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-text hover:text-night-accent">
            About the schemes <span className="h-px w-8 bg-current" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- FINAL CTA --- */

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-night-line bg-night-deep">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_90%_at_50%_120%,rgba(62,197,180,0.14),transparent_60%)]" />
      <div className="relative mx-auto flex min-h-[70svh] max-w-[1500px] flex-col items-start justify-center px-5 py-28 md:px-10">
        <motion.h2 {...rise} className="v2-narrow max-w-[16ch] font-arch text-5xl font-semibold leading-[1.0] tracking-[-0.02em] text-night-text md:text-8xl">
          Ready to rethink how your home is heated?
        </motion.h2>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/quote"
            className="group relative overflow-hidden border border-night-accent px-8 py-4 font-techmono text-xs uppercase tracking-[0.16em] text-night-accent transition-colors hover:text-night"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-night-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
            <span className="relative">Request a Survey</span>
          </Link>
          <a
            href={site.phoneHref}
            className="border border-night-text/25 px-8 py-4 font-techmono text-xs uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
          >
            Speak to Elixa
          </a>
        </div>
        <p className="mt-8 font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">
          {site.phoneDisplay} · {site.email}
        </p>
      </div>
    </section>
  );
}
