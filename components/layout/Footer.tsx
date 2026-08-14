import Link from "next/link";
import { footerNav, legalNav, site } from "@/content/site";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white/70">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo theme="dark" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {site.tagline} Premium renewable energy, heating and cooling — supplied and installed nationwide.
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <a href={site.phoneHref} className="block font-semibold text-white hover:text-elixa-green">
              {site.phoneDisplay}
            </a>
            <a href={site.emailHref} className="block hover:text-white">
              {site.email}
            </a>
            <address className="not-italic text-white/60">
              {site.address.line1}
              <br />
              {site.address.line2}, {site.address.city}, {site.address.postcode}
            </address>
          </div>
        </div>

        {footerNav.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Ready to start?
          </h3>
          <p className="mt-4 text-sm">
            Speak to an energy specialist about your project.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/quote" className="btn-primary btn-md">
              Get a Free Quote
            </Link>
            <a href={site.phoneHref} className="btn-outline btn-md !border-white/20 !bg-white/5 !text-white hover:!border-elixa-cyan">
              Call {site.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
