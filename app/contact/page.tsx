import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/page/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { pageMeta, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";

export const metadata = pageMeta({
  title: "Contact",
  description:
    "Contact Elixa Renewables Group — call 07833 387 653 or email info@elixarenewables.co.uk for solar, battery, heat pumps, air conditioning, heating and EV charging.",
  path: "/contact/",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        kicker="Get in touch"
        title="Speak to an energy specialist."
        intro="Tell us about your home or business and we'll come back with honest advice and a free, no-obligation quote."
        breadcrumbs={crumbs}
      />

      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-bold">Contact details</h2>
            <ul className="mt-6 space-y-5">
              <ContactItem label="Phone" value={site.phoneDisplay} href={site.phoneHref} icon="☎" />
              <ContactItem label="Email" value={site.email} href={site.emailHref} icon="✉" />
              <ContactItem
                label="Address"
                value={`${site.address.line1}, ${site.address.line2}, ${site.address.city}, ${site.address.postcode}`}
                icon="⌂"
              />
            </ul>
            <div className="mt-8 rounded-3xl border border-navy/10 bg-mist p-6">
              <p className="font-display font-bold text-navy">Prefer a quick quote?</p>
              <p className="mt-1 text-sm text-navy/60">
                Use our guided quote journey for a faster, tailored response.
              </p>
              <a href="/quote" className="btn-outline btn-md mt-4">
                Start a quote →
              </a>
            </div>
          </div>

          <ContactForm />
        </Container>
      </section>
    </>
  );
}

function ContactItem({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string;
  href?: string;
  icon: string;
}) {
  const inner = (
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-elixa-gradient-soft text-lg text-navy">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-navy/45">{label}</p>
        <p className="mt-0.5 font-semibold text-navy">{value}</p>
      </div>
    </div>
  );
  return <li>{href ? <a href={href} className="block hover:opacity-80">{inner}</a> : inner}</li>;
}
