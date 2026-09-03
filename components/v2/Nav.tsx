"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const MENU = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Heat Pumps", href: "/air-source-heat-pumps" },
  { label: "Solar", href: "/solar-pv" },
  { label: "Heating", href: "/thermaskirt" },
  { label: "Projects", href: "/projects" },
  { label: "Grants", href: "/grants-funding" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function NavV2() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        solid || open ? "border-b border-night-line bg-night/90 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="flex items-center" aria-label="Elixa Renewables — home">
          <Image src={`${BASE}/brand/elixa-logo-ondark.png`} alt="Elixa Renewables Group" width={150} height={42} priority className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {MENU.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className="font-techmono text-[11px] uppercase tracking-[0.14em] text-night-muted transition-colors hover:text-night-text"
            >
              {m.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/quote"
            className="hidden border border-night-text/25 px-4 py-2 font-techmono text-[11px] uppercase tracking-[0.14em] text-night-text transition-colors hover:border-night-accent hover:text-night-accent sm:block"
          >
            Request a Survey
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span className={cn("h-px w-6 bg-night-text transition-transform", open && "translate-y-[3px] rotate-45")} />
            <span className={cn("h-px w-6 bg-night-text transition-transform", open && "-translate-y-[3px] -rotate-45")} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-night-line bg-night px-6 py-6 lg:hidden" aria-label="Mobile">
          <div className="grid gap-4">
            {MENU.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                onClick={() => setOpen(false)}
                className="font-arch text-xl font-medium text-night-text"
              >
                {m.label}
              </Link>
            ))}
            <Link href="/quote" onClick={() => setOpen(false)} className="mt-2 border border-night-accent px-4 py-3 text-center font-techmono text-xs uppercase tracking-[0.14em] text-night-accent">
              Request a Survey
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
