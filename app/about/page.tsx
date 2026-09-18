import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { site } from "@/content/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "About | Elixa Renewables",
  description:
    "Elixa Renewables Group — whole-system low-carbon heating and home energy, designed from a survey rather than a brochure, installed and supported across the UK.",
};

const STEPS = [
  {
    n: "01",
    h: "Survey",
    b: "Room-by-room heat loss, roof and shading, supply headroom, where kit can physically and acoustically live. Free, and the foundation of everything that follows.",
  },
  {
    n: "02",
    h: "Design",
    b: "The whole system on paper before anything is ordered — sized from your numbers, priced with grants already applied, and explained in plain English.",
  },
  {
    n: "03",
    h: "Install",
    b: "Tidy work by people who care what the pipework looks like when the cupboard door shuts. Floors protected, mess taken away, neighbours considered.",
  },
  {
    n: "04",
    h: "Handover",
    b: "Commissioned against measured performance, apps set up on your phone, controls demonstrated — and we stay on the end of the phone afterwards.",
  },
];

const BELIEFS = [
  {
    h: "Systems, not boxes",
    b: "A heat pump is only as good as the emitters it feeds; solar is only as good as what happens to the surplus. We design the whole system together, because that's where the running costs are won.",
  },
  {
    h: "Honest numbers",
    b: "Every figure on this site is a manufacturer-published value, rounded conservatively — and every one gets refined by your survey before it's quoted. No league tables, no teaser prices.",
  },
  {
    h: "Work we'd show our mums",
    b: "The photos on our Projects page are our own installs, plant rooms and pipework included. If we wouldn't photograph it, we wouldn't fit it.",
  },
];

export default function AboutPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto grid max-w-[1500px] items-start gap-10 px-5 pb-16 pt-36 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:pb-20 md:pt-44">
          <div>
            <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
              About Elixa
            </p>
            <h1 className="v2-narrow mt-4 max-w-[16ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
              The whole system. One team.
            </h1>
            <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
              {site.name} designs, installs and supports low-carbon heating and home energy across
              the UK — heat pumps, solar, batteries, modern heating and EV charging, engineered as
              one system rather than sold as separate boxes.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                Request a Survey
              </Link>
              <Link
                href="/projects"
                className="border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
              >
                See our work
              </Link>
            </div>
          </div>
          <img
            src={`${BASE}/media/projects/cotswold-solar-heatpump.jpg`}
            alt="Elixa installer looking over a completed solar and heat pump installation on a stone cottage"
            className="aspect-[4/5] w-full border border-night-line object-cover"
          />
        </header>

        {/* what we believe */}
        <section className="border-t border-night-line">
          <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
            <h2 className="v2-narrow max-w-[16ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              What we stand on.
            </h2>
            <div className="mt-10 grid gap-x-16 gap-y-8 md:grid-cols-3">
              {BELIEFS.map((v) => (
                <div key={v.h}>
                  <h3 className="border-l-2 border-night-accent pl-4 text-base font-semibold text-night-text md:text-lg">
                    {v.h}
                  </h3>
                  <p className="mt-3 pl-4 text-sm leading-relaxed text-night-muted md:text-base">
                    {v.b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* how a job runs */}
        <section className="border-t border-night-line">
          <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
            <h2 className="v2-narrow max-w-[16ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              How a job runs.
            </h2>
            <div className="mt-10 grid gap-px overflow-hidden border border-night-line bg-night-line sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.n} className="bg-night p-6 md:p-8">
                  <span className="font-techmono text-sm text-night-accent">{s.n}</span>
                  <h3 className="mt-3 text-xl font-semibold text-night-text md:text-2xl">{s.h}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-night-muted">{s.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* proof strip */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[16ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Don't take our word for it.
            </h2>
            <div className="grid gap-6 text-sm leading-relaxed text-night-muted md:text-base">
              <p>
                Everything we claim on this site is either a manufacturer's published figure or a
                photograph of our own work. The Projects page shows the installs; the product pages
                show the honest numbers; the survey shows what's true for your home specifically.
              </p>
              <Link
                href="/projects"
                className="mt-2 inline-flex w-fit items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                See the installs <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
