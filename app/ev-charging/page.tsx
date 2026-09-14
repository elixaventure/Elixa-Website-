import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { EV_CHARGER_RANGE, EV_NOTE } from "@/content/evChargerRange";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "EV Charging — The Range | Elixa Renewables",
  description:
    "The home EV chargers we install — zappi, Ohme, Hypervolt and Andersen — solar-aware, tariff-smart 7.4 kW units, with the supply check and dedicated circuit done properly.",
};

const FAQS = [
  {
    q: "Is 7.4 kW fast enough?",
    a: "For home use, yes — plugged in overnight it covers even a near-empty large battery. Faster chargers need a three-phase supply most homes don't have.",
  },
  {
    q: "Tethered or untethered?",
    a: "Tethered (built-in cable) is more convenient day to day; untethered (socket only) is tidier and works with any cable. We fit either.",
  },
  {
    q: "Can it charge from my solar panels?",
    a: "Yes — a solar-aware charger watches your export and tops the car up with surplus generation first, grid second. It's the zappi's party trick, and others do it too.",
  },
  {
    q: "Does my fuse board need upgrading?",
    a: "Sometimes older boards need a small upgrade for the dedicated circuit — we confirm that at the supply check before quoting, so there are no surprises.",
  },
];

export default function EvChargingPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto grid max-w-[1500px] items-center gap-10 px-5 pb-16 pt-36 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:pb-20 md:pt-44">
          <div>
            <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
              EV charging — the range
            </p>
            <h1 className="v2-narrow mt-4 max-w-[16ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
              Fill the car from your roof.
            </h1>
            <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
              Every charger here is a 7.4 kW smart unit — roughly 25–30 miles of range per hour.
              The differences that matter are what they're clever about: your solar, your tariff,
              or the way they look on the front of your house.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="border border-night-accent px-7 py-4 font-techmono text-[13px] uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                Request a Survey
              </Link>
              <Link
                href="/solar-pv"
                className="border border-night-text/25 px-7 py-4 font-techmono text-[13px] uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
              >
                Add solar to the mix
              </Link>
            </div>
          </div>
          <img
            src={`${BASE}/media/pages/ev-close.jpg`}
            alt="Electric car on a block-paved driveway beside a wall-mounted home EV charger at dusk"
            className="aspect-[4/5] w-full border border-night-line object-cover"
          />
        </header>

        {/* the range — editorial rows */}
        <section className="border-t border-night-line">
          {EV_CHARGER_RANGE.map((m, i) => (
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
                    ["Power", m.power],
                    ["Cable", m.cable],
                    ["Solar", m.solar],
                    ["Stand-out", m.standout],
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
            <p className="max-w-[72ch] text-sm leading-relaxed text-night-faint">{EV_NOTE}</p>
          </div>
        </section>

        {/* how the choice is actually made */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[16ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Charger, circuit, setup — done properly.
            </h2>
            <div className="grid gap-6 text-sm leading-relaxed text-night-muted md:text-base">
              <p>
                The charger is the visible part. Underneath it we check your supply has the
                headroom, run a dedicated protected circuit, and fit the unit where the cable
                actually reaches your parking spot — not just where the wall was convenient.
              </p>
              <p>
                Then the part most installers skip: the setup. Solar priority if you have panels,
                off-peak scheduling if you have a smart tariff, and the app on your phone working
                before we leave. If you have solar or plan it, the charger choice changes — which
                is exactly the kind of thing the survey is for.
              </p>
              <Link
                href="/quote"
                className="mt-2 inline-flex w-fit items-center gap-3 border border-night-accent px-7 py-4 font-techmono text-[13px] uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
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
