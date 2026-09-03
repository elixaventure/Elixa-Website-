import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";

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
      { label: "Grants & Funding", href: "/grants-funding" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Request a Survey", href: "/quote" },
    ],
  },
];

export function FooterV2() {
  return (
    <footer className="border-t border-night-line bg-night">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-16 md:px-10 md:py-20 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div>
          <Image src={`${BASE}/brand/elixa-logo-ondark.png`} alt={site.legalName} width={160} height={44} className="h-10 w-auto" />
          <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-night-muted">
            Low-carbon heating and home energy systems — designed, installed and supported across the UK.
          </p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="font-techmono text-[10px] uppercase tracking-[0.2em] text-night-faint">{c.title}</p>
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
          <p className="font-techmono text-[10px] uppercase tracking-[0.2em] text-night-faint">Contact</p>
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
      <div className="border-t border-night-line">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-5 md:px-10">
          <p className="font-techmono text-[10px] uppercase tracking-[0.14em] text-night-faint">
            © {new Date().getFullYear()} {site.legalName}
          </p>
          <p className="font-techmono text-[10px] uppercase tracking-[0.14em] text-night-faint">{site.areaServed}</p>
        </div>
      </div>
    </footer>
  );
}
