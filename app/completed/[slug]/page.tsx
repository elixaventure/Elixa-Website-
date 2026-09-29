import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { signOffSchema, breadcrumbSchema } from "@/lib/seo";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { BackLink } from "@/components/v2/BackLink";
import { PhotoStrip } from "@/components/v2/Lightbox";
import { Stars } from "@/components/v2/Stars";
import {
  SIGNOFFS,
  findSignOff,
  signOffSlug,
  signOffTitle,
  signOffMonth,
  systemLabel,
} from "@/content/signoffs";

export function generateStaticParams() {
  return SIGNOFFS.map((s) => ({ slug: signOffSlug(s) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = findSignOff(params.slug);
  if (!s) return {};
  return {
    title: `${signOffTitle(s)} | Recently Completed | Elixa Renewables`,
    description: s.summary.replace(/\s+/g, " ").slice(0, 155),
  };
}

/**
 * One completed job, in full.
 *
 * The card in the feed is a glance; this is where somebody reads about the
 * work — every photograph rather than the cover, the whole summary rather
 * than a crop, and the customer's own words. It is also a page per job that
 * names a system and a town, which is exactly what somebody types into
 * Google before they ring anybody.
 */
export default function CompletedJobPage({ params }: { params: { slug: string } }) {
  const s = findSignOff(params.slug)!;
  const title = signOffTitle(s);
  const month = signOffMonth(s);
  const credit = s.firstName ? `${s.firstName}, ${s.area}` : s.area;
  const context = {
    system: systemLabel(s),
    credit,
    month,
    comment: s.comment,
    rating: s.rating,
  };

  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />
        <JsonLd
          data={[
            signOffSchema({ ...s, system: systemLabel(s), slug: params.slug, title }),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Recently Completed", path: "/completed" },
              { name: title, path: `/completed/${params.slug}` },
            ]),
          ]}
        />

        <header className="mx-auto max-w-[1500px] px-5 pb-12 pt-36 md:px-10 md:pb-16 md:pt-44">
          <div className="mb-6">
            <BackLink href="/completed" label="All completed work" />
          </div>
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            {systemLabel(s)}
          </p>
          <h1 className="v2-narrow mt-4 max-w-[18ch] text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-night-text md:text-7xl">
            {title}
          </h1>
          <p className="mt-5 font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">
            Signed off {month}
          </p>
          {/* The admin types this into a text box in TaskFlow, so the line
              breaks they put in are meant. */}
          <p className="mt-6 max-w-[58ch] whitespace-pre-line text-base leading-relaxed text-night-muted md:text-lg">
            {s.summary}
          </p>
        </header>

        {s.photos?.length ? (
          <section className="mx-auto max-w-[1500px] px-5 pb-4 md:px-10">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {s.photos.map((p, i) => (
                <figure key={p.src} className="border border-night-line">
                  {/* Each photograph opens the viewer at itself, rather than
                      always at the first — clicking the third and being shown
                      the first is a small betrayal people notice. */}
                  <PhotoStrip photos={s.photos!} openAtIndex={i} showCount={false} context={context} />
                  <figcaption className="border-t border-night-line px-4 py-3 font-techmono text-[10px] uppercase tracking-[0.18em] text-night-faint">
                    {p.alt}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {s.comment && (
          <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
            <blockquote className="max-w-[60ch] border-l-2 border-night-accent pl-6">
              <p className="text-xl leading-relaxed text-night-text md:text-2xl">
                &ldquo;{s.comment}&rdquo;
              </p>
              <footer className="mt-5 flex flex-wrap items-center gap-3">
                {typeof s.rating === "number" && <Stars value={s.rating} size={16} />}
                <span className="font-techmono text-[11px] uppercase tracking-[0.18em] text-night-faint">
                  {credit}
                </span>
              </footer>
            </blockquote>
          </section>
        )}

        <section className="border-t border-night-line">
          <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[20ch] text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
              Want the same for your home?
            </h2>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="inline-flex items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                Book your free survey <span aria-hidden>→</span>
              </Link>
              <Link
                href="/completed"
                className="inline-flex items-center gap-3 border border-night-line px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-muted transition-colors hover:border-night-accent hover:text-night-text"
              >
                More completed work
              </Link>
            </div>
          </div>
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
