import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact | Elixa Renewables",
  description:
    "Talk to Elixa Renewables — call, email or book a free survey for heat pumps, solar, batteries, heating and EV charging across the UK.",
};

export default function ContactPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto max-w-[1500px] px-5 pb-14 pt-36 md:px-10 md:pb-16 md:pt-44">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            Contact
          </p>
          <h1 className="v2-narrow mt-4 max-w-[16ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
            Talk to a person.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            Question about a system, a grant, or whether your home suits a heat pump? Call or email
            and you'll get a straight answer — or book the free survey and we'll come and see for
            ourselves.
          </p>
        </header>

        {/* the ways in */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-px overflow-hidden border-b border-night-line bg-night-line md:grid-cols-3">
            <a href={site.phoneHref} className="group bg-night p-8 transition-colors hover:bg-night-deep md:p-12">
              <p className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                Call us
              </p>
              <p className="v2-narrow mt-4 text-3xl font-semibold text-night-text transition-colors group-hover:text-night-accent md:text-4xl">
                {site.phoneDisplay}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-night-muted">
                The quickest way — straight through to someone who can actually answer.
              </p>
            </a>
            <a href={site.emailHref} className="group bg-night p-8 transition-colors hover:bg-night-deep md:p-12">
              <p className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                Email us
              </p>
              <p className="v2-narrow mt-4 break-all text-2xl font-semibold text-night-text transition-colors group-hover:text-night-accent md:text-3xl">
                {site.email}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-night-muted">
                Plans, photos and questions welcome — the more detail, the better the answer.
              </p>
            </a>
            <div className="bg-night p-8 md:p-12">
              <p className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                Find us
              </p>
              <p className="mt-4 text-base leading-relaxed text-night-text md:text-lg">
                {site.legalName}
                <br />
                {site.address.line1}
                <br />
                {site.address.line2}
                <br />
                {site.address.city} {site.address.postcode}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-night-muted">
                Installing {site.areaServed.toLowerCase() === "united kingdom" ? "nationwide across the UK" : site.areaServed}.
              </p>
            </div>
          </div>
        </section>

        {/* survey CTA */}
        <section>
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-8 px-5 py-14 md:px-10 md:py-20">
            <div>
              <h2 className="v2-narrow max-w-[18ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
                Rather we just came and looked?
              </h2>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-night-muted md:text-base">
                The free survey is where every good answer starts — heat loss, roof, supply and
                siting, measured rather than guessed.
              </p>
            </div>
            <Link
              href="/quote"
              className="inline-flex items-center gap-3 border border-night-accent px-9 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
            >
              Book the free survey <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
