import Link from "next/link";
import Image from "next/image";
import { site, legalNav } from "@/content/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const COLS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: "Solutions",
    items: [
      { label: "Air Source Heat Pumps", href: "/air-source-heat-pumps" },
      { label: "Solar PV", href: "/solar-pv" },
      { label: "ThermaSkirt Heating", href: "/thermaskirt" },
      { label: "Underfloor Heating", href: "/underfloor-heating" },
      { label: "Battery Storage", href: "/battery-storage" },
      { label: "EV Charging", href: "/ev-charging" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Grants & Funding", href: "/grants-funding" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Quick Heat Pump Quote", href: "/quick-quote" },
      { label: "Request a Survey", href: "/quote" },
    ],
  },
];

export function FooterV2() {
  return (
    <footer className="border-t border-night-line bg-night">
      <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-x-6 gap-y-10 px-5 py-14 md:px-10 md:py-20 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr] lg:gap-12">
        <div className="col-span-2 lg:col-span-1">
          <Image src={`${BASE}/brand/elixa-logo-ondark-2.png`} alt={site.legalName} width={160} height={77} className="h-10 w-auto" />
          <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-night-muted">
            Low-carbon heating and home energy systems — designed, installed and supported across the UK.
          </p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">{c.title}</p>
            <ul className="mt-4 grid gap-2.5">
              {c.items.map((i) => (
                <li key={i.label}>
                  <Link href={i.href} className="text-sm text-night-muted transition-colors hover:text-night-text">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <p className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">Contact</p>
          <ul className="mt-4 grid gap-2.5 text-sm text-night-muted">
            <li>
              <a href={site.phoneHref} className="font-arch text-lg font-medium text-night-text hover:text-night-accent">
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={site.emailHref} className="hover:text-night-text">
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.url} className="hover:text-night-text">
                www.elixarenewables.co.uk
              </a>
            </li>
            <li className="pt-2 leading-relaxed text-night-faint">
              {site.address.line1}
              <br />
              {site.address.line2}
              <br />
              {site.address.city} {site.address.postcode}
            </li>
          </ul>
        </div>
      </div>
      {/* accreditations — a quiet line, not a badge wall */}
      <div className="border-t border-night-line">
        <ul className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-5 md:px-10">
          {site.accreditations.map((a) => (
            <li
              key={a}
              className="font-techmono text-[11px] uppercase tracking-[0.14em] text-night-faint"
            >
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-night-line">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-5 md:px-10">
          <p className="font-techmono text-[11px] uppercase tracking-[0.14em] text-night-faint">
            © {new Date().getFullYear()} {site.legalName}
          </p>
          {/* A UK business site needs its privacy and cookie policies
              reachable from every page; the v2 footer had no legal row at
              all. Driven from legalNav so it stays in one place. */}
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-techmono text-[11px] uppercase tracking-[0.14em] text-night-faint transition-colors hover:text-night-text"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="font-techmono text-[11px] uppercase tracking-[0.14em] text-night-faint">{site.areaServed}</p>
        </div>
      </div>
    </footer>
  );
}
