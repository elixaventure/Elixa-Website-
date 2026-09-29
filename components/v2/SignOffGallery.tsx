"use client";

import { useState } from "react";

/**
 * The photographs from one sign-off, with the installer's own description
 * of each.
 *
 * The card used to show photos[0] and nothing else, so a job published with
 * four photographs showed one — and the descriptions, which the admin is
 * required to write before the job can be published at all, were used only
 * as alt text. Both are worth more than that: the extra photographs are the
 * evidence of the work, and the descriptions say what a visitor is actually
 * looking at, which a close-up of a mitre or a threshold badly needs.
 *
 * The shape is declared here rather than imported from content/signoffs so
 * this client component never pulls in a module that reads the filesystem at
 * import time.
 */
export interface GalleryPhoto {
  src: string;
  alt: string;
}

export function SignOffGallery({
  photos,
  base = "",
}: {
  photos: GalleryPhoto[];
  base?: string;
}) {
  const [active, setActive] = useState(0);
  if (!photos.length) return null;

  // A published entry can carry a stale index only if this list shrinks
  // under it, which it cannot mid-render — but clamp anyway rather than
  // render an undefined src.
  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div>
      <img
        src={`${base}${current.src}`}
        alt={current.alt}
        loading="lazy"
        className="aspect-[4/3] w-full object-cover"
      />

      {/* The description, shown rather than hidden in alt text. */}
      {current.alt && (
        <p className="border-t border-night-line px-4 py-3 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-faint">
          {current.alt}
        </p>
      )}

      {photos.length > 1 && (
        <div className="flex gap-2 border-t border-night-line p-4">
          {photos.map((p, i) => {
            const selected = i === active;
            return (
              <button
                key={p.src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={p.alt || `Photograph ${i + 1}`}
                aria-current={selected ? "true" : undefined}
                className={`relative h-14 w-14 shrink-0 overflow-hidden border transition-opacity ${
                  selected
                    ? "border-night-accent"
                    : "border-night-line opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={`${base}${p.src}`}
                  // Empty: the button's aria-label already names it, and a
                  // second copy makes a screen reader say it twice.
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
