import Link from "next/link";
import { site } from "@/content/site";
import { MagneticButton } from "@/components/ui/MagneticButton";

/**
 * Cinematic hero. Built as an aspirational graphic composition (navy gradient,
 * layered rooflines, energy lines) that reads as premium immediately.
 * ▶ Replace <HeroBackdrop/> with authorised photorealistic imagery of a modern
 *   UK property with integrated tech when Elixa supplies it.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-navy-900">
      <HeroBackdrop />

      <div className="container-x relative z-10 grid gap-12 pb-16 pt-[calc(var(--nav-h)+2rem)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-elixa-green/30 bg-elixa-green/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-elixa-green">
            <span className="h-1.5 w-1.5 animate-pulse-ring rounded-full bg-elixa-green" />
            Nationwide UK Installers
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.03] text-white sm:text-5xl lg:text-6xl">
            Powering a <span className="text-gradient">smarter, greener</span> future.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            Premium renewable energy, heating, cooling and low-carbon technology —
            expertly supplied and installed across the UK.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <MagneticButton href="/quote">Get a Free Quote</MagneticButton>
            <Link href="#solutions" className="btn-ghost btn-lg">
              Explore Our Solutions
            </Link>
          </div>

          <a
            href={site.phoneHref}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10">☎</span>
            {site.phoneDisplay}
          </a>
        </div>

        {/* Floating system cards */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto max-w-md">
            <FloatingCard className="ml-auto" title="Solar generation" value="Live" accent="green" delay="0s" />
            <FloatingCard className="mt-4 mr-8" title="Battery charge" value="Optimised" accent="cyan" delay=".2s" />
            <FloatingCard className="mt-4 ml-12" title="Climate control" value="Year-round" accent="green" delay=".4s" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-900 to-transparent" />
    </section>
  );
}

function FloatingCard({
  title,
  value,
  accent,
  className,
  delay,
}: {
  title: string;
  value: string;
  accent: "green" | "cyan";
  className?: string;
  delay: string;
}) {
  return (
    <div
      className={`animate-float rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md ${className ?? ""}`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">{title}</p>
          <p className="mt-1 font-display text-lg font-bold text-white">{value}</p>
        </div>
        <span
          className={`h-9 w-9 rounded-full ${
            accent === "green" ? "bg-elixa-green" : "bg-elixa-cyan"
          } opacity-80`}
        />
      </div>
    </div>
  );
}

function HeroBackdrop() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {/* base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_75%_10%,#1f4f8f_0%,#12294f_45%,#0b1830_100%)]" />
      {/* glow orbs */}
      <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-elixa-cyan/20 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-elixa-green/15 blur-3xl" />
      {/* fine grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.14]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* roofline silhouette */}
      <svg className="absolute inset-x-0 bottom-0 h-40 w-full" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none">
        <path d="M0 160V96l180-64 120 48 160-72 180 64 160-48 200 72 160-56 120 40v80Z" fill="#0b1830" opacity="0.7" />
      </svg>
    </div>
  );
}
