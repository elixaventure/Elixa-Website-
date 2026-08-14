import { cn } from "@/lib/cn";

/** Premium shield/badge used for the "Fully qualified F-Gas engineers" message. */
export function TrustShield({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur",
        className
      )}
    >
      <span className="relative grid h-14 w-12 flex-none place-items-center">
        <svg viewBox="0 0 48 56" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="shieldg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6ABF4B" />
              <stop offset="1" stopColor="#1D9ED9" />
            </linearGradient>
          </defs>
          <path
            d="M24 2l20 7v16c0 14-9 22-20 27C13 47 4 39 4 25V9l20-7Z"
            fill="url(#shieldg)"
            opacity="0.18"
          />
          <path
            d="M24 2l20 7v16c0 14-9 22-20 27C13 47 4 39 4 25V9l20-7Z"
            fill="none"
            stroke="url(#shieldg)"
            strokeWidth="2"
          />
        </svg>
        <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-white" fill="none" aria-hidden="true">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div>
        <p className="font-display text-sm font-bold uppercase tracking-wide text-white">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>}
      </div>
    </div>
  );
}
