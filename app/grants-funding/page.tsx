import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { grantsDisclaimer } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Heat Pump Grants & Funding",
  description:
    "The Boiler Upgrade Scheme, 0% VAT on energy-saving installs and the Smart Export Guarantee — what each is worth, who qualifies, and how we handle the paperwork for you.",
};

const SCHEMES = [
  {
    id: "bus",
    name: "Boiler Upgrade Scheme",
    eyebrow: "Government grant",
    blurb:
      "The headline one — a government grant toward an air source heat pump when it replaces a fossil-fuel system, in England and Wales. Coming off oil or LPG? The grant steps up to £9,000.",
    detail:
      "You don't apply for it: we do, as your MCS-certified route requires, and the grant comes straight off your quote. Homes off the mains gas grid replacing an oil or LPG system get the uplifted £9,000 rate (applications to 31 March 2027); everyone else gets £7,500. Eligibility is mostly about the property — a fossil-fuel system being replaced and a valid EPC — and we confirm it at the survey before anything is promised.",
    facts: [
      ["Worth", "£7,500 — £9,000 off oil or LPG"],
      ["Where", "England and Wales"],
      ["Applies to", "Air source heat pump installs"],
      ["How it's claimed", "By us, on your behalf — off the quote"],
    ],
  },
  {
    id: "vat",
    name: "0% VAT on energy-saving installs",
    eyebrow: "Tax relief",
    blurb:
      "Solar panels, home batteries, heat pumps and heating controls currently carry zero VAT when professionally installed — a straight 20% saving against the old rate.",
    detail:
      "Nothing to claim and no forms — the zero rate simply appears on your invoice. It covers the equipment and the installation labour together, and standalone battery installs qualify too, not just batteries fitted with solar.",
    facts: [
      ["Worth", "20% off vs. standard VAT"],
      ["Where", "Across the UK"],
      ["Applies to", "Solar, batteries, heat pumps, controls"],
      ["How it's claimed", "Automatic — zero-rated on the invoice"],
    ],
  },
  {
    id: "seg",
    name: "Smart Export Guarantee",
    eyebrow: "Ongoing payments",
    blurb:
      "Not a grant but real money every month — your electricity supplier pays you for every unit of solar generation you export to the grid.",
    detail:
      "We set the system up export-ready — metering, DNO notification, the paperwork suppliers ask for — and rates vary a lot between suppliers, so choosing the right export tariff matters as much as the panels. Pair it with a battery and you export the surplus, not the power you could have used.",
    facts: [
      ["Worth", "Per-kWh payments for exported solar"],
      ["Where", "Across Great Britain"],
      ["Applies to", "Solar PV installs (MCS certified)"],
      ["How it's claimed", "Through your electricity supplier"],
    ],
  },
  {
    id: "other",
    name: "Other schemes & finance",
    eyebrow: "Case by case",
    blurb:
      "Local-authority schemes and income-linked support come and go, and vary by postcode and circumstances — some households qualify for substantially more help.",
    detail:
      "Rather than promise what we can't guarantee, we check what applies to your property and circumstances at the survey and tell you straight. Where a grant doesn't fit, finance options can spread the cost — and phasing the work (solar now, battery later) is often the honest answer.",
    facts: [
      ["Worth", "Varies by scheme and household"],
      ["Where", "Postcode and circumstance dependent"],
      ["Applies to", "Checked case by case at survey"],
      ["How it's claimed", "We flag what fits — no false promises"],
    ],
  },
];

const FAQS = [
  {
    q: "Do I have to apply for the heat pump grant myself?",
    a: "No — the Boiler Upgrade Scheme is claimed by the installer. We handle the application and the grant is deducted from your quote, so the price you see already includes it where your home qualifies.",
  },
  {
    q: "Can I combine the grant with the 0% VAT?",
    a: "Yes — they stack. A qualifying heat pump install gets the grant — £7,500, or £9,000 when replacing oil or LPG off the gas grid — and is zero-rated for VAT on top.",
  },
  {
    q: "Does the grant cover underfloor heating or ThermaSkirt?",
    a: "The grant is attached to the heat pump itself. Emitters like underfloor or ThermaSkirt are part of the overall system design and quote — which the grant then reduces.",
  },
  {
    q: "What if my home isn't eligible?",
    a: "The survey tells you early, before any commitment. From there it's honest options: 0% VAT still applies, finance can spread the cost, and phasing the work often gets you there a step at a time.",
  },
];

export default function GrantsPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto max-w-[1500px] px-5 pb-14 pt-36 md:px-10 md:pb-16 md:pt-44">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            Grants &amp; funding
          </p>
          <h1 className="v2-narrow mt-4 max-w-[18ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
            The switch costs less than you think.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            Between the government's heat pump grant, zero VAT on installs and getting paid for the
            solar you export, the numbers have changed. Here's what each scheme is genuinely worth —
            and the paperwork is ours to deal with, not yours.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/quote"
              className="border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
            >
              Check what you qualify for
            </Link>
          </div>
        </header>

        {/* the schemes — editorial rows */}
        <section className="border-t border-night-line">
          {SCHEMES.map((s, i) => (
            <article key={s.id} className="border-b border-night-line">
              <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:py-16">
                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="font-techmono text-[11px] text-night-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                      {s.eyebrow}
                    </p>
                  </div>
                  <h2 className="v2-narrow mt-3 max-w-[18ch] text-night-text text-3xl font-semibold tracking-[-0.01em] md:text-5xl">
                    {s.name}
                  </h2>
                  <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-night-muted md:text-base">
                    {s.blurb}
                  </p>
                  <p className="mt-5 max-w-[48ch] border-l-2 border-night-accent pl-4 text-sm leading-relaxed text-night-text/90">
                    {s.detail}
                  </p>
                </div>
                <dl className="grid content-start divide-y divide-night-line self-center border-y border-night-line">
                  {s.facts.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-6 py-3.5">
                      <dt className="font-techmono text-[11px] uppercase tracking-[0.18em] text-night-faint">
                        {k}
                      </dt>
                      <dd className="max-w-[30ch] text-right text-sm font-medium text-night-text md:text-base">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
          <div className="mx-auto max-w-[1500px] px-5 py-10 md:px-10">
            <p className="max-w-[72ch] text-sm leading-relaxed text-night-faint">{grantsDisclaimer}</p>
          </div>
        </section>

        {/* we do the paperwork */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[14ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              We do the paperwork.
            </h2>
            <div className="grid gap-6 text-sm leading-relaxed text-night-muted md:text-base">
              <p>
                Grant applications, VAT zero-rating, export registration, DNO notifications — every
                scheme comes with forms, and every form is ours. Your quote arrives with the grant
                already applied where your home qualifies, so the number you see is the number you
                pay.
              </p>
              <p>
                And where something doesn't apply, we say so at the survey — before you've committed
                to anything. No teaser prices, no "subject to funding" surprises after the fact.
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
