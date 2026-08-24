"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Container } from "@/components/ui/Container";
import type { IconKey } from "@/content/services";

// R3F must stay client-only; keep it out of the static prerender.
const ProductViewer = dynamic(
  () => import("@/components/three/ProductViewer").then((m) => m.ProductViewer),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center">
        <span className="text-sm font-medium text-navy/40">Loading 3D preview…</span>
      </div>
    ),
  }
);

export function ProductShowcase({
  icon,
  name,
  glbUrl,
}: {
  icon: IconKey;
  name: string;
  /** Set once a real photoreal GLB exists in public/models. */
  glbUrl?: string;
}) {
  const [exploded, setExploded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-navy-900 py-20 sm:py-24">
      {/* ambient brand glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-elixa-gradient blur-[120px] opacity-20" />
      </div>

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-elixa-cyan">
            Explore the hardware
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            The {name}, in 3D
          </h2>
          <p className="mt-3 text-white/60">
            Drag to rotate · scroll to zoom · open the exploded view to see how it goes together.
          </p>
        </div>

        <div className="relative mx-auto mt-10 h-[420px] w-full max-w-4xl sm:h-[520px]">
          <ProductViewer icon={icon} glbUrl={glbUrl} exploded={exploded} />

          {/* controls */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 pb-1">
            <button
              type="button"
              onClick={() => setExploded((v) => !v)}
              aria-pressed={exploded}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <ExplodeIcon className="h-4 w-4" />
              {exploded ? "Assemble" : "Exploded view"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/35">
          Interactive 3D visualisation for illustration. Product appearance varies by manufacturer and model.
        </p>
      </Container>
    </section>
  );
}

function ExplodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
