import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { UNDERFLOOR_SYSTEMS, UNDERFLOOR_NOTE } from "@/content/underfloorSystems";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Underfloor Heating — The Systems | Elixa Renewables",
  description:
    "Screeded, low-profile overlay, between-joist and electric underfloor heating — honest outputs, build-up heights and which method suits which floor, designed room by room.",
};

const FAQS = [
  {
    q: "Can it be retrofitted without digging up floors?",
    a: "Often, yes — low-profile overlay systems add only around 20 mm on top of the existing floor, and between-joist systems add nothing at all. The survey tells you what your rooms can take.",
  },
  {
    q: "Does it work under carpet or wood?",
    a: "Engineered wood, yes. Carpet works within limits — underlay and carpet together need to stay reasonably thin or they blanket the heat. Tile and stone perform best of all.",
  },
  {
    q: "Is it slow to warm up?",
    a: "Screeded systems are steady rather than instant — designed to hold rooms at temperature efficiently instead of blasting on and off. Overlay and electric systems respond in minutes, and the controls handle the schedules either way.",
  },
  {
    q: "Do I need a heat pump for it?",
    a: "No — it runs from a boiler too. But its 35 °C flow temperature is exactly where heat pumps excel, so the pairing is where the running-cost savings live.",
  },
];

export default function UnderfloorHeatingPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto grid max-w-[1500px] items-center gap-10 px-5 pb-16 pt-36 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:pb-20 md:pt-44">
          <div>
            <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
              Underfloor heating — the systems
            </p>
            <h1 className="v2-narrow mt-4 max-w-[16ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
              The floor is the radiator.
            </h1>
            <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
              Warm water across the whole floor — invisible, gentle and even, at just 35 °C flow.
              Four ways to build it, chosen by what your floors are made of and how much height you
              can give up. The one your rooms get comes from the survey, not a catalogue.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                Request a Survey
              </Link>
              <Link
                href="/thermaskirt"
                className="border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
              >
                Or heat from the skirting
              </Link>
            </div>
          </div>
          <img
            src={`${BASE}/media/pages/underfloor-close.jpg`}
            alt="Cutaway view of a living room floor with underfloor heating pipe loops glowing warm"
            className="aspect-[4/5] w-full border border-night-line object-cover"
          />
        </header>

        {/* the systems — editorial rows */}
        <section className="border-t border-night-line">
          {UNDERFLOOR_SYSTEMS.map((s, i) => (
            <article key={s.id} className="border-b border-night-line">
              <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:py-16">
                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="font-techmono text-[11px] text-night-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                      Method
                    </p>
                  </div>
                  <h2 className="v2-narrow mt-3 text-night-text text-3xl font-semibold tracking-[-0.01em] md:text-5xl">
                    {s.name}
                  </h2>
                  <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-night-muted md:text-base">
                    {s.knownFor}
                  </p>
                  <p className="mt-5 max-w-[48ch] border-l-2 border-night-accent pl-4 text-sm leading-relaxed text-night-text/90">
                    {s.goodFit}
                  </p>
                </div>
                <dl className="grid content-start divide-y divide-night-line self-center border-y border-night-line">
                  {[
                    ["Build-up", s.buildUp],
                    ["Pipework / element", s.pipe],
                    ["Typical output", s.output],
                    ["Response", s.response],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-6 py-3.5">
                      <dt className="font-techmono text-[11px] uppercase tracking-[0.18em] text-night-faint">
                        {k}
                      </dt>
                      <dd className="text-right text-sm font-medium text-night-text md:text-base">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
          <div className="mx-auto max-w-[1500px] px-5 py-10 md:px-10">
            <p className="max-w-[72ch] text-sm leading-relaxed text-night-faint">{UNDERFLOOR_NOTE}</p>
          </div>
        </section>

        {/* why heat pumps love it */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[14ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              The floor picks the system.
            </h2>
            <div className="grid gap-6 text-sm leading-relaxed text-night-muted md:text-base">
              <p>
                Because the whole floor is the emitter, water at just 35 °C heats the room — the
                lowest flow temperature of any heating system, and the reason a heat pump feeding
                underfloor reaches its best efficiency, around SCOP 4.2. Nothing on the walls,
                nothing to see: just even warmth from below.
              </p>
              <p>
                So we survey the floors first — construction, coverings, height headroom — then
                design the pipe layout and manifold zoning room by room. Every loop is
                pressure-tested and balanced before the floor goes down, because after that,
                there are no second chances.
              </p>
              <Link
                href="/quote"
                className="mt-2 inline-flex w-fit items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                Book the free survey <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16 md:px-10 md:py-20">
            <h2 className="v2-narrow max-w-[12ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Common questions.
            </h2>
            <div className="divide-y divide-night-line border-y border-night-line">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 text-base font-medium text-night-text [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      aria-hidden
                      className="font-techmono text-sm text-night-faint transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[64ch] pr-6 text-sm leading-relaxed text-night-muted md:text-base">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
