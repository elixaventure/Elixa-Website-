import { PhotoStrip } from "@/components/v2/Lightbox";
import { Stars } from "@/components/v2/Stars";
import { signOffMonth, systemLabel, signOffSlug, type SignOff } from "@/content/signoffs";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * One signed-off job, whole, on a card.
 *
 * There is deliberately nothing behind this. A sign-off is a review, some
 * photographs and a line or two about the work — that is the entire content,
 * and a page built around it would be a page whose unique text is one
 * sentence. The written-up depth lives in the case studies, which are
 * researched pieces rather than a sign-off form.
 *
 * So everything is here: the photographs open full size in place, the rating
 * is drawn, the customer's words are unedited, and nobody has to click
 * through to a page that would only repeat it.
 */
export function SignOffCard({ s }: { s: SignOff }) {
  const context = {
    system: systemLabel(s),
    credit: s.firstName ? `${s.firstName}, ${s.area}` : s.area,
    month: signOffMonth(s),
    comment: s.comment,
    rating: s.rating,
  };

  return (
    // The slug is an anchor, so a single job can still be linked to and
    // shared — which was the only part of a page per job worth keeping.
    <article id={signOffSlug(s)} className="scroll-mt-28 border border-night-line">
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
        <PhotoStrip photos={s.photos} context={context} />
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

        {/* Where the eye lands, rather than buried under the write-up. Absent
            entirely when the customer did not leave one — an empty row of
            outlines reads as nought out of five. */}
        {typeof s.rating === "number" && <Stars value={s.rating} className="mt-4" size={16} />}

        {/* The admin types this into a text box in TaskFlow, so the line
            breaks they put in are meant. */}
        <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-night-muted">
          {s.summary}
        </p>

        {/* A card led by a video would otherwise bury its stills. */}
        {s.video && s.photos?.length ? (
          <PhotoStrip photos={s.photos} variant="link" className="mt-4" context={context} />
        ) : null}

        {s.comment && (
          <blockquote className="mt-6 border-l-2 border-night-accent pl-4">
            <p className="text-base leading-relaxed text-night-text">&ldquo;{s.comment}&rdquo;</p>
            <footer className="mt-3 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-faint">
              {/* Anonymous is a choice the customer makes at sign-off, so it
                  has to read as deliberate rather than missing. No rating
                  repeated here — the stars above already carry it. */}
              {s.firstName ? `${s.firstName}, ${s.area}` : s.area}
            </footer>
          </blockquote>
        )}
      </div>
    </article>
  );
}
