import Link from "next/link";
import { recentSignOffs, ratingSummary, SIGNOFFS } from "@/content/signoffs";
import { SignOffCard } from "@/components/v2/SignOffCard";
import { Stars } from "@/components/v2/Stars";

/**
 * Jobs signed off in TaskFlow and approved for publishing by an admin.
 *
 * Renders nothing at all while there are none — no empty state, no "coming
 * soon", no placeholder cards. A section promising customer feedback that
 * shows none reads worse than no section.
 */
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
            <h2 className="v2-narrow mt-4 max-w-[20ch] text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
              Straight from the last sign-off.
            </h2>
          </div>
          {summary && (
            <div className="flex items-center gap-3">
              <Stars value={summary.average} count={summary.count} size={18} />
              <span className="font-techmono text-[11px] uppercase tracking-[0.18em] text-night-text">
                {summary.average} out of 5
              </span>
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <SignOffCard key={s.id} s={s} />
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
