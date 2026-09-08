import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { SOLAR_RANGE, SOLAR_RANGE_NOTE } from "@/content/solarRange";

export const metadata: Metadata = {
  title: "Solar PV — The Panel Range | Elixa Renewables",
  description:
    "The solar panels we design with — Aiko, LONGi, REC, Trina and JA Solar — with honest output, efficiency and warranty figures, designed per roof aspect from the survey.",
};

export default function SolarPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto max-w-[1500px] px-5 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            Solar PV — the range
          </p>
          <h1 className="v2-narrow mt-4 max-w-[16ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
            Panels chosen by roof, not by brochure.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            These are the panel makers we design with, what each is genuinely known for, and the
            numbers that matter — output, efficiency and how long the performance is guaranteed.
            Your array is designed per roof aspect from the survey and shading assessment.
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
          {SOLAR_RANGE.map((m, i) => (
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
                    ["Module power", m.power],
                    ["Efficiency", m.efficiency],
                    ["Product warranty", m.productWarranty],
                    ["Performance guarantee", m.performanceWarranty],
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
            <p className="max-w-[72ch] text-sm leading-relaxed text-night-faint">
              {SOLAR_RANGE_NOTE}
            </p>
          </div>
        </section>

        {/* the system around the panels */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[14ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              The panel is half the system.
            </h2>
            <div className="grid gap-6 text-sm leading-relaxed text-night-muted md:text-base">
              <p>
                Generation is decided as much by the design as the module: strings laid out per roof
                aspect so a shaded corner never drags down a sunny one, an inverter sized for the
                array — hybrid-ready if a battery is on the cards — and export set up under the
                Smart Export Guarantee so surplus earns instead of vanishing.
              </p>
              <p>
                We handle the DNO notification and paperwork, and qualifying residential
                installations carry 0% VAT until 2027. Pair the array with a battery, a heat pump
                or an EV charger and your own generation does the heavy lifting before the grid is
                touched.
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
