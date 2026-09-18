import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { BATTERY_RANGE, BATTERY_NOTE } from "@/content/batteryRange";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Battery Storage — The Range | Elixa Renewables",
  description:
    "The home batteries we design with — Tesla, GivEnergy, Sigenergy, Fox ESS and myenergi — with honest capacity, power and warranty figures, sized from how you actually use electricity.",
};

const FAQS = [
  {
    q: "Will it run the house in a power cut?",
    a: "Only if the system is specified with backup capability — most standard setups shut down with the grid for safety. If backup matters to you, say so at survey and we design for it.",
  },
  {
    q: "Is it worth it without solar panels?",
    a: "It can be — charging cheap overnight on a time-of-use tariff and using it at peak still cuts bills. It's strongest paired with generation, though.",
  },
  {
    q: "How long does a battery last?",
    a: "Manufacturer warranties here run ten to twelve years, and the LFP cells they all use are built to keep the majority of their capacity through it.",
  },
  {
    q: "Where does it go?",
    a: "Garage, utility, understairs or an external enclosure — somewhere cool, ventilated and out of the way. It's a wall or floor unit about the size of a small suitcase.",
  },
];

export default function BatteryStoragePage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto grid max-w-[1500px] items-start gap-10 px-5 pb-16 pt-36 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:pb-20 md:pt-44">
          <div>
            <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
              Battery storage — the range
            </p>
            <h1 className="v2-narrow mt-4 max-w-[16ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
              Charge cheap. Spend at peak.
            </h1>
            <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
              A battery holds your solar generation — or cheap off-peak electricity — until the
              house actually needs it, so less of your power is ever bought at the day rate. These
              are the systems we design with, and what each is genuinely known for.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                Request a Survey
              </Link>
              <Link
                href="/solar-pv"
                className="border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
              >
                Pair with solar
              </Link>
            </div>
          </div>
          <img
            src={`${BASE}/media/pages/battery-close.jpg`}
            alt="Home battery storage unit mounted on a timber-clad wall beside the heat pump in an evening-lit garden"
            className="aspect-[4/5] w-full border border-night-line object-cover"
          />
        </header>

        {/* the range — editorial rows */}
        <section className="border-t border-night-line">
          {BATTERY_RANGE.map((m, i) => (
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
                    ["Usable capacity", m.capacity],
                    ["Output power", m.power],
                    ["Chemistry", m.chemistry],
                    ["Power-cut backup", m.backup],
                    ["Warranty", m.warranty],
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
            <p className="max-w-[72ch] text-sm leading-relaxed text-night-faint">{BATTERY_NOTE}</p>
          </div>
        </section>

        {/* how the choice is actually made */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[16ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Sized from your usage. Not a bundle.
            </h2>
            <div className="grid gap-6 text-sm leading-relaxed text-night-muted md:text-base">
              <p>
                The battery charges when electricity is cheap or free — from your roof, or
                overnight on an off-peak tariff — and discharges at peak times. The saving lives in
                that gap, which is why the right size comes from your evening load and your tariff,
                not from a standard package.
              </p>
              <p>
                Oversizing wastes money and undersizing wastes sun. We look at how your household
                actually uses electricity, choose AC or DC coupling to suit the system, install in
                a safe ventilated spot and set up the tariff scheduling before we leave.
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
