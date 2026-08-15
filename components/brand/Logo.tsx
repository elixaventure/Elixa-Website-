import { cn } from "@/lib/cn";

/**
 * Official Elixa Renewables Group full logo (flame + wordmark).
 * - light surfaces  → full colour logo (navy wordmark)
 * - dark surfaces   → colour flame + white wordmark (public/brand/elixa-logo-ondark.png)
 * Source files live in public/brand/. Base-path aware for sub-path hosting.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function Logo({
  className,
  theme = "light",
}: {
  className?: string;
  theme?: "light" | "dark";
}) {
  const src = theme === "dark" ? "elixa-logo-ondark.png" : "elixa-logo.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${BASE}/brand/${src}`}
      alt="Elixa Renewables Group"
      className={cn("h-9 w-auto shrink-0 sm:h-10", className)}
      width={264}
      height={125}
      style={{ maxWidth: "none" }}
    />
  );
}
