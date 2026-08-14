import { cn } from "@/lib/cn";

/**
 * Elixa flame mark + wordmark.
 *
 * ⚠️ PLACEHOLDER MARK: this SVG is an on-brand stand-in that matches the
 * Elixa green→blue flame and navy wordmark so the site looks correct
 * immediately. Before publication, replace the flame paths below with the
 * OFFICIAL supplied logo (drop the vector at /public/brand/elixa-logo.svg and
 * swap <FlameMark/> for an <img>/inline of that file). Do not distort the
 * official artwork.
 */

export function FlameMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 122" className={className} aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="elixaFlame" x1="0.15" y1="0" x2="0.55" y2="1">
          <stop offset="0" stopColor="#7ec63f" />
          <stop offset="0.5" stopColor="#35b1ab" />
          <stop offset="1" stopColor="#1D9ED9" />
        </linearGradient>
      </defs>
      {/* main flame body */}
      <path
        fill="url(#elixaFlame)"
        d="M58 4C40 26 28 46 30 68c1 12 9 20 8 34C22 92 12 66 20 42c1 14 12 15 12 6C31 34 40 16 58 4Z"
      />
      {/* second flame leaf */}
      <path
        fill="url(#elixaFlame)"
        d="M60 20c8 16 4 30-2 40 8-4 12-14 12-24 10 16 6 44-16 62-6 5-16 8-24 6 22-2 28-20 24-36-3-12-2-30 6-48Z"
      />
      {/* blue base curl */}
      <path
        fill="#1D9ED9"
        d="M40 62c-14 12-20 30-12 46 5 10 17 15 28 12-16-3-22-18-16-34 3-9 0-16 0-24Z"
        opacity="0.85"
      />
    </svg>
  );
}

export function Logo({
  className,
  theme = "light",
  showWordmark = true,
}: {
  className?: string;
  theme?: "light" | "dark";
  showWordmark?: boolean;
}) {
  const wordColor = theme === "dark" ? "text-white" : "text-navy";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <FlameMark className="h-8 w-auto" />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display text-[1.35rem] font-extrabold tracking-tightest", wordColor)}>
            Elixa
          </span>
          <span
            className={cn(
              "font-display text-[0.5rem] font-semibold uppercase tracking-[0.22em]",
              theme === "dark" ? "text-white/70" : "text-navy/60"
            )}
          >
            Renewables Group
          </span>
        </span>
      )}
    </span>
  );
}
