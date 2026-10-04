import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMeta, breadcrumbSchema } from "@/lib/seo";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { HeatSourceTabs } from "@/components/v2/HeatSourceTabs";

export const metadata = pageMeta({
  title: "Heat Source — Heat Pumps, Electric and Gas Boilers",
  description:
    "The three ways to heat a home, compared honestly: air source heat pumps, electric boilers and gas boilers. What each suits, what each costs you, and which we would fit.",
  path: "/heat-source/",
});

/**
 * What makes the heat, as against what delivers it.
 *
 * The navigation said "Heat Pumps", which is what we lead with but not all
 * we fit. Somebody who needs a boiler and sees only heat pumps assumes we
 * cannot help them and rings somebody else. This page keeps the heat pump
 * first and strongest while being straight about the alternatives — which,
 * for most homes, argues the heat pump better than hiding them would.
 */
export default function HeatSourcePage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />
        <JsonLd
          data={[
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Heat Source", path: "/heat-source" },
            ]),
          ]}
        />

        <header className="mx-auto max-w-[1500px] px-5 pb-10 pt-36 md:px-10 md:pb-14 md:pt-44">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            Heat source
          </p>
          <h1 className="v2-narrow mt-4 max-w-[16ch] text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-night-text md:text-7xl">
            What makes the heat.
          </h1>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-night-muted md:text-lg">
            Three ways to heat a home, and we fit all of them. We lead with heat pumps because for
            most homes they are the right answer and the grant money is behind them — but the right
            answer for your home is the one the survey points at, not the one we would prefer to
            sell.
          </p>
        </header>

        <section className="border-t border-night-line">
          <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
            <HeatSourceTabs />
          </div>
        </section>

        {/* The heat source is only half the system, and the half people
            think about. Sending them to the emitters from here is the most
            useful link on the page. */}
        <section className="border-t border-night-line">
          <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
            <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
              The other half
            </p>
            <h2 className="v2-narrow mt-4 max-w-[22ch] text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
              What delivers it matters just as much.
            </h2>
            <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-night-muted">
              A heat pump feeding the wrong emitters runs hot and costs more than it should. The
              emitters set the flow temperature, and the flow temperature sets the efficiency — so
              we design both together rather than one after the other.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {[
                { href: "/thermaskirt", label: "ThermaSkirt" },
                { href: "/underfloor-heating", label: "Underfloor heating" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-3 border border-night-line px-7 py-4 font-techmono text-xs uppercase tracking-[0.16em] text-night-muted transition-colors hover:border-night-accent hover:text-night-text"
                >
                  {l.label} <span aria-hidden>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-night-line">
          <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[20ch] text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
              Not sure which you need?
            </h2>
            <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted">
              That is what the survey is for. A room-by-room heat-loss calculation tells us what
              your home actually needs, and the answer comes back with the numbers behind it.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="inline-flex items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                Book your free survey <span aria-hidden>→</span>
              </Link>
              <Link
                href="/grants-funding"
                className="inline-flex items-center gap-3 border border-night-line px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-muted transition-colors hover:border-night-accent hover:text-night-text"
              >
                Grants &amp; funding
              </Link>
            </div>
          </div>
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
