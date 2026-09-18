import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { AIRCON_RANGE, AIRCON_NOTE } from "@/content/airconRange";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Air Conditioning — The Range | Elixa Renewables",
  description:
    "The wall units we design with — Mitsubishi Electric, Daikin and Fujitsu — whisper-quiet air-to-air heat pumps that cool in summer and heat single rooms efficiently in winter.",
};

const FAQS = [
  {
    q: "Can it heat as well as cool?",
    a: "Yes — the same unit reverses to heat, very efficiently. Lofts, garden rooms and home offices often use it as their main heating.",
  },
  {
    q: "How noisy is it?",
    a: "The units in our range start around 19 dB(A) indoors on low fan speeds — quieter than a whisper. The outdoor unit is sited away from windows and boundaries as part of the design.",
  },
  {
    q: "Does it need planning permission?",
    a: "The indoor side, no. The outdoor unit is usually fine under permitted development, with placement rules we design to — flats and listed buildings need a closer look.",
  },
  {
    q: "How many rooms can one system do?",
    a: "One outdoor unit can run several indoor units (a multi-split), each with its own control — so bedrooms and living space can be zoned separately.",
  },
];

export default function AirConditioningPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto grid max-w-[1500px] items-start gap-10 px-5 pb-16 pt-36 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:pb-20 md:pt-44">
          <div>
            <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
              Air conditioning — the range
            </p>
            <h1 className="v2-narrow mt-4 max-w-[16ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
              Cool in July. Warm in January.
            </h1>
            <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
              Every unit here is an air-to-air heat pump — it moves heat rather than generating it,
              several kilowatt-hours of cooling or heating per kilowatt-hour of electricity. A
              dual-season system, not a summer luxury.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                Request a Survey
              </Link>
              <Link
                href="/#solutions"
                className="border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
              >
                Explore the Elixa home
              </Link>
            </div>
          </div>
          <img
            src={`${BASE}/media/pages/aircon-close.jpg`}
            alt="Slim wall-mounted air conditioning unit in a warmly lit bedroom, seen through the cutaway house"
            className="aspect-[4/5] w-full border border-night-line object-cover"
          />
        </header>

        {/* the range — editorial rows */}
        <section className="border-t border-night-line">
          {AIRCON_RANGE.map((m, i) => (
            <article key={m.id} className="border-b border-night-line">
              <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:py-16">
                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="font-techmono text-[11px] text-night-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                      {m.brand}
                    </p>
                  </div>
                  <h2 className="v2-narrow mt-3 text-night-text text-3xl font-semibold tracking-[-0.01em] md:text-5xl">
                    {m.model}
                  </h2>
                  <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-night-muted md:text-base">
                    {m.knownFor}
                  </p>
                  <p className="mt-5 max-w-[48ch] border-l-2 border-night-accent pl-4 text-sm leading-relaxed text-night-text/90">
                    {m.goodFit}
                  </p>
                </div>
                <dl className="grid content-start divide-y divide-night-line self-center border-y border-night-line">
                  {[
                    ["Efficiency", m.efficiency],
                    ["Indoor noise", m.noise],
                    ["Heating", m.heating],
                    ["Configuration", m.config],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-6 py-3.5">
                      <dt className="font-techmono text-[11px] uppercase tracking-[0.18em] text-night-faint">
                        {k}
                      </dt>
                      <dd className="max-w-[32ch] text-right text-sm font-medium text-night-text md:text-base">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
          <div className="mx-auto max-w-[1500px] px-5 py-10 md:px-10">
            <p className="max-w-[72ch] text-sm leading-relaxed text-night-faint">{AIRCON_NOTE}</p>
          </div>
        </section>

        {/* how the choice is actually made */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[14ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Designed room by room.
            </h2>
            <div className="grid gap-6 text-sm leading-relaxed text-night-muted md:text-base">
              <p>
                Cooling loads come first — glazing, aspect, occupancy — because an oversized unit
                short-cycles and an undersized one never catches up. Then the indoor unit goes
                where it works without dominating the room, and the outdoor unit where neighbours
                and noise say it should.
              </p>
              <p>
                Condensate routed properly, refrigerant runs kept short, commissioned and
                demonstrated before we leave. Reversed in winter, the same units become one of the
                cheapest ways to heat a single room — which is why lofts, garden rooms and offices
                run on them year-round.
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
