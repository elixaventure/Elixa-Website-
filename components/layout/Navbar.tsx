"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { primaryNav, site } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Only the homepage has a full-bleed dark hero the nav sits over transparently.
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Transparent (white text) only over the homepage hero at the top.
  const transparent = isHome && !scrolled && !open;
  const solid = !transparent;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-elixa",
        solid
          ? "border-b border-navy/10 bg-white/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="container-x flex h-[var(--nav-h)] items-center justify-between gap-4">
        <Link href="/" aria-label={`${site.name} home`} onClick={() => setOpen(false)}>
          <Logo theme={solid ? "light" : "dark"} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 xl:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full px-2.5 py-2 text-[0.82rem] font-semibold transition-colors",
                solid
                  ? "text-navy/80 hover:bg-navy/5 hover:text-navy"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={site.phoneHref}
            onClick={() => track("phone_click", { location: "navbar" })}
            className={cn(
              "hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors 2xl:inline-flex",
              solid ? "text-navy hover:bg-navy/5" : "text-white hover:bg-white/10"
            )}
          >
            <PhoneIcon className="h-4 w-4" />
            {site.phoneDisplay}
          </a>
          <Link href="/quote" className="hidden whitespace-nowrap btn-primary btn-md sm:inline-flex">
            Get a Free Quote
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full xl:hidden",
              solid ? "text-navy hover:bg-navy/5" : "text-white hover:bg-white/10"
            )}
          >
            <span className="relative block h-4 w-6">
              <span className={cn("absolute left-0 h-0.5 w-6 rounded bg-current transition-all", open ? "top-1.5 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 top-1.5 h-0.5 w-6 rounded bg-current transition-all", open && "opacity-0")} />
              <span className={cn("absolute left-0 h-0.5 w-6 rounded bg-current transition-all", open ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[var(--nav-h)] z-40 bg-navy-900/98 xl:hidden"
          >
            <div className="container-x flex h-[calc(100vh-var(--nav-h))] flex-col overflow-y-auto py-6">
              <div className="grid grid-cols-2 gap-2">
                {primaryNav.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 font-display text-base font-semibold text-white"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 grid gap-3">
                <Link href="/quote" onClick={() => setOpen(false)} className="btn-primary btn-lg w-full">
                  Get a Free Quote
                </Link>
                <a href={site.phoneHref} onClick={() => track("phone_click", { location: "mobile-menu" })} className="btn-ghost btn-lg w-full">
                  Call {site.phoneDisplay}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
