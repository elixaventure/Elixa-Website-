import { cn } from "@/lib/cn";

/**
 * Official Elixa Renewables Group logo lockup: the supplied flame mark
 * (public/brand/elixa-flame.png) + wordmark. On light surfaces the wordmark is
 * navy; on dark surfaces (hero, footer) it's white so it stays legible.
 * The full official logo lives at public/brand/elixa-logo.png.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function Logo({
  className,
  theme = "light",
  showWordmark = true,
}: {
  className?: string;
  theme?: "light" | "dark";
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE}/brand/elixa-flame.png`}
        alt=""
        aria-hidden="true"
        className="h-9 w-auto"
        width={44}
        height={80}
      />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.4rem] font-extrabold leading-none tracking-tightest",
              theme === "dark" ? "text-white" : "text-navy"
            )}
          >
            Elixa
          </span>
          <span
            className={cn(
              "mt-0.5 font-display text-[0.5rem] font-bold uppercase tracking-[0.2em]",
              theme === "dark" ? "text-white/70" : "text-navy/65"
            )}
          >
            Renewables Group
          </span>
        </span>
      )}
    </span>
  );
}
