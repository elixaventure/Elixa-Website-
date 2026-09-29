import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMeta, signOffIndexSchema, reviewSchema, breadcrumbSchema } from "@/lib/seo";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { BackLink } from "@/components/v2/BackLink";
import {
  SIGNOFFS,
  signOffsByMonth,
  signOffSlug,
  signOffTitle,
  systemLabel,
  ratingSummary,
} from "@/content/signoffs";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = pageMeta({
  title: "Recently Completed Installations",
  description:
    "Every job we have finished and been signed off on, newest first — the work, the photographs and what the customer said about it.",
  path: "/completed/",
});

/**
 * The full archive, by month.
 *
 * Nothing ages out. Five jobs a month compounds into a hundred and fifty
 * pages in two and a half years, each one naming a system and a town that
 * somebody types into Google before they ring anybody. Capping the list
 * would throw exactly that away to save a scroll.
 *
 * The homepage shows three and /projects shows six; this is where the rest
 * live, grouped by month so the page stays legible as it grows and so the
 * most recent month reads as recent.
 */
export default function CompletedPage() {
  const months = signOffsByMonth();
  const summary = ratingSummary();
  const total = SIGNOFFS.length;

  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />
        <JsonLd
          data={
            [
              signOffIndexSchema(
                SIGNOFFS.map((s) => ({ slug: signOffSlug(s), title: signOffTitle(s) })),
              ),
              reviewSchema(summary, SIGNOFFS),
              breadcrumbSchema([
                { name: "Home", path: "/" },
                { name: "Recently Completed", path: "/completed" },
              ]),
            ].filter(Boolean) as object[]
          }
        />

        <header className="mx-auto max-w-[1500px] px-5 pb-10 pt-36 md:px-10 md:pb-14 md:pt-44">
          <div className="mb-6">
            <BackLink href="/projects" label="Projects" />
          </div>
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            Recently completed
          </p>
          <h1 className="v2-narrow mt-4 max-w-[16ch] text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-night-text md:text-7xl">
            Every job, as it was signed off.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            {total
              ? "Photographs taken on the day the work was finished, and whatever the customer chose to say about it. Nothing here is written by a marketing department."
              : "The jobs we finish appear here as they are signed off, with the photographs taken on the day and whatever the customer chose to say about the work."}
          </p>
          {summary && (
            <p className="mt-5 font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">
              {summary.average} out of 5 · {summary.count}{" "}
              {summary.count === 1 ? "review" : "reviews"} · {total}{" "}
              {total === 1 ? "job" : "jobs"}
            </p>
          )}
        </header>

        {months.length ? (
          months.map(({ month, items }) => (
            <section key={month} className="border-t border-night-line">
              <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16">
                <h2 className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
                  {month}
                </h2>

                <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((s) => {
                    const slug = signOffSlug(s);
                    return (
                      <Link
                        key={s.id}
                        href={`/completed/${slug}`}
                        className="group block border border-night-line transition-colors hover:border-night-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-night-accent"
                      >
                        {s.photos?.length ? (
                          <img
                            src={`${BASE}${s.photos[0].src}`}
                            alt={s.photos[0].alt}
                            loading="lazy"
                            className="aspect-[4/3] w-full object-cover"
                          />
                        ) : null}
                        <div className="p-6">
                          <p className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-accent">
                            {systemLabel(s)}
                          </p>
                          <h3 className="v2-narrow mt-3 text-xl font-semibold leading-tight text-night-text">
                            {signOffTitle(s)}
                          </h3>
                          {/* Two lines is enough to know whether to open it;
                              the whole thing is on the page behind. */}
                          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-night-muted">
                            {s.summary}
                          </p>
                          <p className="mt-5 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-accent">
                            Read about this job{" "}
                            <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">
                              →
                            </span>
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          ))
        ) : (
          <section className="border-t border-night-line">
            <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
              {/* No invented placeholder jobs, and no "coming soon" either —
                  just the honest state and somewhere useful to go next. */}
              <p className="max-w-[52ch] text-base leading-relaxed text-night-muted">
                Nothing has been published here yet. Our written-up{" "}
                <Link href="/case-studies" className="text-night-accent underline">
                  case studies
                </Link>{" "}
                cover the same work in more depth in the meantime.
              </p>
            </div>
          </section>
        )}

        <section className="border-t border-night-line">
          <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
            <h2 className="v2-narrow max-w-[20ch] text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
              Yours could be the next one on here.
            </h2>
            <Link
              href="/quote"
              className="mt-8 inline-flex items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
            >
              Book your free survey <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
