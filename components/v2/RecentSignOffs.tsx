import Link from "next/link";
import {
  recentSignOffs,
  signOffMonth,
  ratingSummary,
  signOffSlug,
  systemLabel,
  SIGNOFFS,
  type SignOff,
} from "@/content/signoffs";
import { PhotoStrip } from "@/components/v2/Lightbox";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Jobs signed off in TaskFlow and approved for publishing by an admin.
 *
 * Renders nothing at all while there are none — no empty state, no "coming
 * soon", no placeholder cards. A section promising customer feedback that
 * shows none reads worse than no section.
 */
/** What the viewer shows under the photograph, so it is not context-free. */
function contextFor(s: SignOff) {
  return {
    system: systemLabel(s),
    credit: s.firstName ? `${s.firstName}, ${s.area}` : s.area,
    month: signOffMonth(s),
    comment: s.comment,
    rating: s.rating,
  };
}

export function RecentSignOffs({ limit = 6 }: { limit?: number }) {
  const items = recentSignOffs(limit);
  if (!items.length) return null;

  const summary = ratingSummary();

  return (
    <section id="recent" className="border-t border-night-line">
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
              Recently completed
            </p>
            <h2 className="v2-narrow mt-4 max-w-[20ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Straight from the last sign-off.
            </h2>
          </div>
          {summary && (
            <p className="font-techmono text-[11px] uppercase tracking-[0.18em] text-night-faint">
              {summary.average} out of 5 · {summary.count}{" "}
              {summary.count === 1 ? "review" : "reviews"}
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <article key={s.id} className="border border-night-line">
              {s.video ? (
                <video
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  poster={s.video.poster ? `${BASE}${s.video.poster}` : undefined}
                  className="aspect-[4/3] w-full bg-night-deep object-cover"
                >
                  <source src={`${BASE}${s.video.src}`} type="video/mp4" />
                </video>
              ) : s.photos?.length ? (
                <PhotoStrip photos={s.photos} context={contextFor(s)} />
              ) : null}

              <div className="p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-accent">
                    {systemLabel(s)}
                  </p>
                  <p className="font-techmono text-[11px] uppercase tracking-[0.16em] text-night-faint">
                    {signOffMonth(s)}
                  </p>
                </div>

                {/* The admin types this into a text box in TaskFlow, so the line
                    breaks they put in are meant. */}
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-night-muted">
                  {s.summary}
                </p>

                {/* A card led by a video would otherwise bury its stills. */}
                {s.video && s.photos?.length ? (
                  <PhotoStrip photos={s.photos} variant="link" className="mt-4" context={contextFor(s)} />
                ) : null}

                <Link
                  href={`/completed/${signOffSlug(s)}`}
                  className="group mt-5 inline-flex items-center gap-2 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-accent transition-colors hover:text-night-text"
                >
                  Read about this job{" "}
                  <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                {s.comment && (
                  <blockquote className="mt-6 border-l-2 border-night-accent pl-4">
                    <p className="text-base leading-relaxed text-night-text">
                      &ldquo;{s.comment}&rdquo;
                    </p>
                    <footer className="mt-3 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-faint">
                      {/* Anonymous is a choice the customer makes at sign-off,
                          so it has to read as deliberate rather than missing. */}
                      {s.firstName ? `${s.firstName}, ${s.area}` : s.area}
                      {typeof s.rating === "number" && ` · ${s.rating}/5`}
                    </footer>
                  </blockquote>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/quote"
            className="inline-flex items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
          >
            Book your free survey <span aria-hidden>→</span>
          </Link>
          {/* Only worth offering once there is more behind it than is shown. */}
          {SIGNOFFS.length > items.length && (
            <Link
              href="/completed"
              className="inline-flex items-center gap-3 border border-night-line px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-muted transition-colors hover:border-night-accent hover:text-night-text"
            >
              All {SIGNOFFS.length} completed jobs
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
