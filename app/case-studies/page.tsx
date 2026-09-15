import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { CASE_STUDIES } from "@/content/caseStudies";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Case Studies | Elixa Renewables",
  description:
    "Elixa Renewables installation case studies — cascade heat pumps, R290 siting, full system design and honest specification, with the original documents to download.",
};

export default function CaseStudiesPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto max-w-[1500px] px-5 pb-14 pt-36 md:px-10 md:pb-16 md:pt-44">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            Case studies
          </p>
          <h1 className="v2-narrow mt-4 max-w-[16ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
            The thinking behind the installs.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            How real Elixa projects were designed and why — the brief, the constraints, the
            decisions and the numbers. Each one is available as the original document to download
            and keep. Prefer photographs? They live on the{" "}
            <Link href="/projects" className="text-night-accent transition-colors hover:text-night-text">
              projects page
            </Link>
            .
          </p>
        </header>

        {/* the studies */}
        <section className="border-t border-night-line">
          {CASE_STUDIES.map((cs, i) => (
            <article key={cs.slug} className="border-b border-night-line">
              <div
                className={`mx-auto grid max-w-[1500px] items-center gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:py-16 ${
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <Link href={`/case-studies/${cs.slug}`} className="group block overflow-hidden border border-night-line">
                  <img
                    src={`${BASE}${cs.cover.src}`}
                    alt={cs.cover.alt}
                    loading={i > 0 ? "lazy" : undefined}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </Link>
                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="font-techmono text-[11px] text-night-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                      {cs.kind} — {cs.tag}
                    </p>
                  </div>
                  <h2 className="v2-narrow mt-3 max-w-[18ch] text-night-text text-3xl font-semibold tracking-[-0.01em] md:text-5xl">
                    {cs.title}
                  </h2>
                  <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-night-muted md:text-base">
                    {cs.standfirst}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-4">
                    <Link
                      href={`/case-studies/${cs.slug}`}
                      className="inline-flex items-center gap-3 border border-night-accent px-7 py-4 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
                    >
                      Read it <span aria-hidden>→</span>
                    </Link>
                    <a
                      href={`${BASE}${cs.pdf}`}
                      download
                      className="inline-flex items-center gap-3 border border-night-text/25 px-7 py-4 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
                    >
                      PDF <span aria-hidden>↓</span>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* survey CTA */}
        <section>
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-8 px-5 py-14 md:px-10 md:py-20">
            <div>
              <h2 className="v2-narrow max-w-[20ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
                Want this level of thinking on your property?
              </h2>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-night-muted md:text-base">
                Every one of these projects started the same way — a free survey and a proper
                heat-loss calculation before anything was specified.
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
