import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { HEAT_PUMP_RANGE, RANGE_NOTE } from "@/content/heatPumpRange";

export const metadata: Metadata = {
  title: "Air Source Heat Pumps — The Range | Elixa Renewables",
  description:
    "The heat pumps we design with — Vaillant, Mitsubishi, Daikin, Samsung and Grant — with honest efficiency figures, and why the survey chooses the unit, not a league table.",
};

export default function HeatPumpsPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto max-w-[1500px] px-5 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            Heat pumps — the range
          </p>
          <h1 className="v2-narrow mt-4 max-w-[16ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
            Five pumps. One right answer per home.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            These are the manufacturers we design with, what each is genuinely known for, and the
            numbers that matter. The one your home gets is chosen by the heat-loss survey — output,
            flow temperature and siting — never by brand loyalty.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/quote"
              className="border border-night-accent px-7 py-3.5 font-techmono text-xs uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
            >
              Request a Survey
            </Link>
            <Link
              href="/#solutions"
              className="border border-night-text/25 px-7 py-3.5 font-techmono text-xs uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
            >
              Explore the Elixa home
            </Link>
          </div>
        </header>

        {/* the range — editorial rows */}
        <section className="border-t border-night-line">
          {HEAT_PUMP_RANGE.map((m, i) => (
            <article key={m.id} className="border-b border-night-line">
              <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:py-16">
                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="font-techmono text-[11px] text-night-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-techmono text-[10px] uppercase tracking-[0.24em] text-night-accent">
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
                    ["Refrigerant", m.refrigerant],
                    ["Output sizes", m.sizes],
                    ["Max flow temp", m.maxFlow],
                    ["Seasonal efficiency", m.scop],
                    ["Noise", m.sound],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-6 py-3.5">
                      <dt className="font-techmono text-[10px] uppercase tracking-[0.18em] text-night-faint">
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
            <p className="max-w-[72ch] text-sm leading-relaxed text-night-faint">{RANGE_NOTE}</p>
          </div>
        </section>

        {/* how the choice is actually made */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[14ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              The survey picks the pump.
            </h2>
            <div className="grid gap-6 text-sm leading-relaxed text-night-muted md:text-base">
              <p>
                The biggest driver of your running cost isn't the badge on the unit — it's whether
                the pump is sized to your home's measured heat loss and fed by emitters running at
                the lowest workable flow temperature. A correctly sized mid-range pump beats a
                poorly sized premium one, every winter.
              </p>
              <p>
                So we survey first: room-by-room heat loss, existing emitters, hot-water demand,
                where the unit can physically and acoustically live. The design lands on a shortlist
                from the range above, priced with the £7,500 Boiler Upgrade Scheme already applied
                where your home qualifies.
              </p>
              <Link
                href="/quote"
                className="mt-2 inline-flex w-fit items-center gap-3 border border-night-accent px-7 py-3.5 font-techmono text-xs uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                Book the free survey <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
