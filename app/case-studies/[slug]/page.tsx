import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { CASE_STUDIES } from "@/content/caseStudies";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cs = CASE_STUDIES.find((c) => c.slug === params.slug);
  if (!cs) return {};
  return {
    title: `${cs.title} | Case Studies | Elixa Renewables`,
    description: cs.standfirst,
  };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const cs = CASE_STUDIES.find((c) => c.slug === params.slug)!;

  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto max-w-[1500px] px-5 pb-12 pt-36 md:px-10 md:pb-16 md:pt-44">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            {cs.kind}
          </p>
          <h1 className="v2-narrow mt-4 max-w-[18ch] text-night-text text-4xl font-semibold leading-[1.02] tracking-[-0.02em] md:text-7xl">
            {cs.title}
          </h1>
          <p className="mt-5 font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">
            {cs.subtitle}
          </p>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            {cs.standfirst}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={`${BASE}${cs.pdf}`}
              download
              className="inline-flex items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
            >
              Download the PDF <span aria-hidden>↓</span>
            </a>
            <Link
              href="/quote"
              className="inline-flex items-center gap-3 border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
            >
              Book the free survey
            </Link>
          </div>
        </header>

        {/* spec strip */}
        <div className="border-y border-night-line">
          <dl className="mx-auto grid max-w-[1500px] grid-cols-2 gap-px overflow-hidden bg-night-line md:grid-cols-4">
            {cs.specs.map(([k, v]) => (
              <div key={k} className="bg-night px-5 py-5 md:px-10 md:py-6">
                <dt className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">{k}</dt>
                <dd className="mt-2 text-sm font-medium text-night-text md:text-base">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* cover */}
        <img
          src={`${BASE}${cs.cover.src}`}
          alt={cs.cover.alt}
          className="max-h-[72vh] w-full border-b border-night-line object-cover"
        />

        {/* sections */}
        {cs.sections.map((s, si) => (
          <section key={s.kicker} className={si > 0 ? "border-t border-night-line" : ""}>
            <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:px-10 md:py-20">
              <div>
                <p className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                  {s.kicker}
                </p>
                <h2 className="v2-narrow mt-3 max-w-[20ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
                  {s.heading}
                </h2>
                {s.pull && (
                  <p className="mt-8 border-l-2 border-night-accent pl-5 text-base leading-relaxed text-night-text md:text-lg">
                    {s.pull}
                  </p>
                )}
              </div>
              <div>
                {s.paras && (
                  <div className="grid gap-5 text-sm leading-relaxed text-night-muted md:text-base">
                    {s.paras.map((p, i) => (
                      <p key={i}>
                        {p.lead && <strong className="font-medium text-night-text">{p.lead} </strong>}
                        {p.text}
                      </p>
                    ))}
                  </div>
                )}
                {s.points && (
                  <div className={s.paras ? "mt-8" : ""}>
                    {s.points.map((pt, i) => (
                      <div
                        key={pt.t}
                        className="grid grid-cols-[3rem_1fr] gap-4 border-t border-night-line py-6 last:border-b md:py-7"
                      >
                        <span className="font-techmono text-sm text-night-faint">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="text-lg font-medium text-night-text md:text-xl">{pt.t}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-night-muted md:text-base">{pt.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {s.table && (
                  <div className="mt-10">
                    <h3 className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                      {s.table.title}
                    </h3>
                    <dl className="mt-4 border-t border-night-line">
                      {s.table.rows.map(([k, v]) => (
                        <div
                          key={k}
                          className="grid gap-1 border-b border-night-line py-3.5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-6"
                        >
                          <dt className="font-techmono text-[11px] uppercase tracking-[0.16em] text-night-faint md:pt-0.5">
                            {k}
                          </dt>
                          <dd className="text-sm leading-relaxed text-night-text md:text-base">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 text-xs leading-relaxed text-night-faint">{s.table.note}</p>
                  </div>
                )}
                {s.photo && (
                  <figure className="mt-10">
                    <img
                      src={`${BASE}${s.photo.src}`}
                      alt={s.photo.alt}
                      loading="lazy"
                      className="w-full border border-night-line object-cover"
                    />
                    {s.photo.caption && (
                      <figcaption className="mt-3 text-sm leading-relaxed text-night-muted">
                        {s.photo.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* stats */}
        {cs.stats && (
          <section className="border-t border-night-line bg-night-deep">
            <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
              <p className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                Typical performance for a system of this type
              </p>
              <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-16">
                {cs.stats.items.map((st) => (
                  <div key={st.v}>
                    <p className="v2-narrow text-4xl font-semibold tracking-[-0.02em] text-night-text md:text-6xl">
                      {st.v}
                    </p>
                    <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-night-muted">{st.l}</p>
                  </div>
                ))}
              </div>
              <p className="mt-10 max-w-[90ch] text-xs leading-relaxed text-night-faint">{cs.stats.note}</p>
            </div>
          </section>
        )}

        {/* closing */}
        <section className="border-t border-night-line">
          <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
            <p className="max-w-[64ch] border-l-2 border-night-accent pl-5 text-base leading-relaxed text-night-text md:text-lg">
              {cs.closing.pull}
            </p>
            <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
              <div>
                <h2 className="v2-narrow max-w-[22ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
                  {cs.closing.heading}
                </h2>
                <p className="mt-4 max-w-[56ch] text-sm leading-relaxed text-night-muted md:text-base">
                  {cs.closing.text}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
                >
                  Book the free survey <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center gap-3 border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
                >
                  All case studies
                </Link>
              </div>
            </div>
          </div>
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
