"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The photographs from one sign-off.
 *
 * The card used to show photos[0] and nothing else, so a job published with
 * four photographs showed one — and the descriptions, which the admin must
 * write before a job can be published at all, were used only as alt text
 * where nobody sees them.
 *
 * On the card: the first photograph, its description, a thumbnail row, and a
 * count badge so it is obvious there is more behind it. Tapping any of them
 * opens the viewer at that photograph.
 *
 * In the viewer: the photograph at full width with the description under it,
 * and the job's own details beside it — system, area, the customer's first
 * name where they gave one, and their comment. A photograph of a threshold
 * means little on its own; read next to "Lovley team and very hardworking"
 * it means something.
 *
 * The shape is declared here rather than imported from content/signoffs so
 * this client component never pulls in a module that reads the filesystem at
 * import time.
 */
export interface GalleryPhoto {
  src: string;
  alt: string;
}

export interface GalleryDetails {
  system: string;
  area: string;
  firstName: string;
  month: string;
  comment?: string;
  rating?: number;
}

export function SignOffGallery({
  photos,
  details,
  base = "",
}: {
  photos: GalleryPhoto[];
  details: GalleryDetails;
  base?: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const touchX = useRef<number | null>(null);

  const count = photos.length;
  const go = useCallback(
    (delta: number) => setActive((i) => (i + delta + count) % count),
    [count],
  );

  // Arrow keys and Escape while the viewer is open, and no scrolling the page
  // underneath it. Both undone on close, including when the component
  // unmounts mid-view.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, go]);

  if (!count) return null;
  const current = photos[Math.min(active, count - 1)];

  const openAt = (i: number) => {
    setActive(i);
    setOpen(true);
  };

  const credit = details.firstName
    ? `${details.firstName}, ${details.area}`
    : details.area;

  return (
    <div>
      {/* ── on the card ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => openAt(active)}
        aria-label={`Open ${count} photograph${count === 1 ? "" : "s"} of this job`}
        className="group relative block w-full cursor-zoom-in"
      >
        <img
          src={`${base}${current.src}`}
          alt={current.alt}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
        <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 bg-night/80 px-3 py-2 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-text backdrop-blur-sm transition-colors group-hover:bg-night-accent group-hover:text-night">
          <span aria-hidden>⛶</span>
          {count} photo{count === 1 ? "" : "s"}
        </span>
      </button>

      {current.alt && (
        <p className="border-t border-night-line px-4 py-3 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-faint">
          {current.alt}
        </p>
      )}

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto border-t border-night-line p-4">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => openAt(i)}
              aria-label={p.alt || `Photograph ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className={`h-14 w-14 shrink-0 overflow-hidden border transition-opacity ${
                i === active
                  ? "border-night-accent"
                  : "border-night-line opacity-60 hover:opacity-100"
              }`}
            >
              {/* Empty alt: the button's aria-label already names it, and a
                  second copy makes a screen reader say it twice. */}
              <img
                src={`${base}${p.src}`}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── the viewer ──────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${details.system} in ${details.area} — photograph ${active + 1} of ${count}`}
          onClick={() => setOpen(false)}
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const from = touchX.current;
            touchX.current = null;
            const to = e.changedTouches[0]?.clientX;
            // 50px so a tap or a vertical scroll is never read as a swipe.
            if (from == null || to == null || Math.abs(to - from) < 50) return;
            go(to < from ? 1 : -1);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/95 p-4 backdrop-blur-sm md:p-8"
        >
          {/* Stops a click inside the panel closing it. */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full w-full max-w-[1100px] flex-col overflow-y-auto border border-night-line bg-night"
          >
            <div className="flex items-center justify-between border-b border-night-line px-4 py-3">
              <p className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-accent">
                {details.system} · {details.area}
              </p>
              <div className="flex items-center gap-4">
                <p className="font-techmono text-[11px] uppercase tracking-[0.16em] text-night-faint">
                  {active + 1}/{count}
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="font-techmono text-lg leading-none text-night-faint transition-colors hover:text-night-text"
                >
                  <span aria-hidden>✕</span>
                </button>
              </div>
            </div>

            <div className="relative bg-night-deep">
              <img
                src={`${base}${current.src}`}
                alt={current.alt}
                className="max-h-[60vh] w-full object-contain"
              />
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous photograph"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-night/70 px-3 py-4 font-techmono text-night-text transition-colors hover:bg-night-accent hover:text-night"
                  >
                    <span aria-hidden>‹</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next photograph"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-night/70 px-3 py-4 font-techmono text-night-text transition-colors hover:bg-night-accent hover:text-night"
                  >
                    <span aria-hidden>›</span>
                  </button>
                </>
              )}
            </div>

            {current.alt && (
              <p className="border-t border-night-line px-4 py-3 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-faint">
                {current.alt}
              </p>
            )}

            {count > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-night-line p-4">
                {photos.map((p, i) => (
                  <button
                    key={p.src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={p.alt || `Photograph ${i + 1}`}
                    aria-current={i === active ? "true" : undefined}
                    className={`h-16 w-16 shrink-0 overflow-hidden border transition-opacity ${
                      i === active
                        ? "border-night-accent"
                        : "border-night-line opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`${base}${p.src}`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {details.comment && (
              <blockquote className="border-t border-night-line px-4 py-5">
                <p className="text-base leading-relaxed text-night-text">
                  &ldquo;{details.comment}&rdquo;
                </p>
                <footer className="mt-3 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-faint">
                  {/* Anonymous is a choice the customer makes at sign-off, so
                      it has to read as deliberate rather than missing. */}
                  {credit} · {details.month}
                  {typeof details.rating === "number" && ` · ${details.rating}/5`}
                </footer>
              </blockquote>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
