"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export interface Photo {
  src: string;
  alt: string;
}

/**
 * What the photograph is of, beyond the photograph.
 *
 * Full screen, a picture of a threshold strip means very little on its own.
 * Read underneath the system, the town and the customer's own words it means
 * something, and that is the whole point of the section.
 */
export interface PhotoContext {
  system: string;
  /** "Sarah, Manchester", or just the town where they stayed anonymous */
  credit: string;
  month: string;
  comment?: string;
  rating?: number;
}

/**
 * The cover photograph on a sign-off card, and the full-size viewer behind it.
 *
 * A single 4:3 crop of an installation is not much use to somebody deciding
 * whether to spend five figures — they want to look properly, and at all of
 * the photographs, not just the first. So the cover is a button, the rest of
 * the set is reachable from it, and the count is on the cover so nobody has
 * to guess there is more behind it.
 */
export function PhotoStrip({
  photos,
  className = "",
  variant = "cover",
  context,
}: {
  photos: Photo[];
  className?: string;
  /** "link" is for cards already led by a video, so the stills stay reachable. */
  variant?: "cover" | "link";
  context?: PhotoContext;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  if (!photos.length) return null;

  const cover = photos[0];

  if (variant === "link") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpenAt(0)}
          className={`inline-flex items-center gap-2 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-accent transition-colors hover:text-night-text focus:outline-none focus-visible:ring-2 focus-visible:ring-night-accent ${className}`}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          View {photos.length} {photos.length === 1 ? "photograph" : "photographs"}
        </button>
        <Lightbox photos={photos} openAt={openAt} onClose={() => setOpenAt(null)} context={context} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenAt(0)}
        aria-label={`View ${photos.length === 1 ? "photograph" : `all ${photos.length} photographs`} — ${cover.alt}`}
        className={`group relative block w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-night-accent focus-visible:ring-offset-2 focus-visible:ring-offset-night ${className}`}
      >
        <img
          src={`${BASE}${cover.src}`}
          alt={cover.alt}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Reads as a photograph you can open rather than decoration.
            Always visible on touch, where there is no hover to discover it. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent opacity-80 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 font-techmono text-[10px] uppercase tracking-[0.18em] text-night-text"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          {photos.length > 1 ? `${photos.length} photos` : "View"}
        </span>
      </button>

      <Lightbox photos={photos} openAt={openAt} onClose={() => setOpenAt(null)} context={context} />
    </>
  );
}

/**
 * Full-size photograph viewer.
 *
 * Portalled to the body so no card's `overflow: hidden` can clip it, and
 * `data-lenis-prevent` keeps the smooth-scroll library from moving the page
 * underneath while somebody swipes through the photographs.
 */
export function Lightbox({
  photos,
  openAt,
  onClose,
  context,
}: {
  photos: Photo[];
  openAt: number | null;
  onClose: () => void;
  context?: PhotoContext;
}) {
  const [mounted, setMounted] = useState(false);
  const [i, setI] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  const open = openAt !== null;
  useEffect(() => {
    if (openAt !== null) setI(openAt);
  }, [openAt]);

  const step = useCallback(
    (by: number) => setI((n) => (n + by + photos.length) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;

    restoreFocus.current = document.activeElement as HTMLElement | null;
    dialog.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && photos.length > 1) {
        step(1);
      } else if (e.key === "ArrowLeft" && photos.length > 1) {
        step(-1);
      } else if (e.key === "Tab") {
        // Keep tabbing inside the dialog — a modal you can tab out of
        // leaves keyboard users operating a page they cannot see.
        const focusable = dialog.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      restoreFocus.current?.focus?.();
    };
  }, [open, onClose, step, photos.length]);

  // Fetch the neighbours so moving through the set does not blank the screen.
  useEffect(() => {
    if (!open || photos.length < 2) return;
    for (const n of [i + 1, i - 1]) {
      const p = photos[(n + photos.length) % photos.length];
      const img = new Image();
      img.src = `${BASE}${p.src}`;
    }
  }, [open, i, photos]);

  if (!mounted || !open) return null;

  const photo = photos[i];
  const many = photos.length > 1;

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph ${i + 1} of ${photos.length}`}
      tabIndex={-1}
      data-lenis-prevent
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || !many) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#07090D] focus:outline-none"
      style={{ animation: "elixaFadeIn 180ms ease-out" }}
    >
      <div className="flex items-center justify-between px-5 py-4 md:px-8">
        <p className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">
          {many ? `${i + 1} / ${photos.length}` : "Photograph"}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-3 flex h-12 w-12 items-center justify-center text-night-muted transition-colors hover:text-night-text focus:outline-none focus-visible:ring-2 focus-visible:ring-night-accent"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 md:px-6">
        {many && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous photograph"
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-night/70 text-night-text backdrop-blur-sm transition-colors hover:bg-night-accent hover:text-night focus:outline-none focus-visible:ring-2 focus-visible:ring-night-accent md:left-4"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        )}

        {/* Clicking the photograph itself must not close the viewer — people
            tap the image to look closer, not to leave. Sized to the picture
            rather than stretched to fill the row, so the dark space beside a
            portrait photo belongs to the backdrop and a tap there does close
            it, which is what everyone expects of it. */}
        <img
          src={`${BASE}${photo.src}`}
          alt={photo.alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full object-contain"
        />

        {many && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next photograph"
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-night/70 text-night-text backdrop-blur-sm transition-colors hover:bg-night-accent hover:text-night focus:outline-none focus-visible:ring-2 focus-visible:ring-night-accent md:right-4"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className="mx-auto w-full max-w-[70ch] px-6 py-5 text-center md:py-6">
        <p className="text-sm leading-relaxed text-night-muted">{photo.alt}</p>

        {context && (
          <p className="mt-3 font-techmono text-[10px] uppercase tracking-[0.18em] text-night-faint">
            {[context.system, context.credit, context.month].filter(Boolean).join(" · ")}
            {typeof context.rating === "number" && ` · ${context.rating}/5`}
          </p>
        )}

        {context?.comment && (
          <p className="mt-4 border-t border-night-line pt-4 text-sm leading-relaxed text-night-text">
            &ldquo;{context.comment}&rdquo;
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
