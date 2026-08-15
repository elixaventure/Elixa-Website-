import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { TrustShield } from "@/components/ui/TrustShield";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { PageHero } from "./PageHero";
import { ProductShowcase } from "./ProductShowcase";
import { Faqs } from "./Faqs";
import { CtaBanner } from "@/components/home/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { serviceSchema, faqSchema, breadcrumbSchema } from "@/lib/seo";
import { serviceBySlug, type Service } from "@/content/services";
import { site } from "@/content/site";

export function ServicePageTemplate({ service }: { service: Service }) {
  const related = service.integrations
    .map((slug) => serviceBySlug(slug))
    .filter(Boolean) as Service[];

  const crumbs = [
    { name: "Home", path: "/" },
    { name: service.name, path: `/${service.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          serviceSchema({ name: service.name, description: service.seoDescription, slug: service.slug }),
          breadcrumbSchema(crumbs),
          ...(faqSchema(service.faqs) ? [faqSchema(service.faqs)!] : []),
        ]}
      />

      <PageHero kicker={service.name} title={service.headline} intro={service.subhead} breadcrumbs={crumbs}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href={`/quote?service=${service.slug}`} variant="primary">
            {service.ctaLabel}
          </Button>
          {service.slug === "air-conditioning" && (
            <a href={site.phoneHref} className="btn-ghost btn-lg">
              Speak to an F-Gas Engineer
            </a>
          )}
        </div>

        {service.slug === "air-conditioning" && (
          <div className="mt-10 grid gap-4 sm:max-w-xl sm:grid-cols-1">
            <TrustShield
              title="Fully qualified F-Gas engineers"
              subtitle="All refrigerant work carried out correctly, safely and to standard."
            />
          </div>
        )}
      </PageHero>

      {/* Intro + AC year-round message */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            {service.intro.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p className={`text-navy/75 ${i === 0 ? "text-xl leading-relaxed" : "mt-4 text-lg leading-relaxed"}`}>
                  {p}
                </p>
              </Reveal>
            ))}

            {service.slug === "air-conditioning" && (
              <div className="mt-8 rounded-3xl border border-navy/10 bg-elixa-gradient-soft p-6">
                <p className="font-display text-lg font-bold text-navy">One system. Year-round comfort.</p>
                <p className="mt-2 text-navy/70">
                  A modern heat-pump air conditioner cools in summer and heats in winter — complete
                  climate control from a single, efficient unit. <strong>Cooling + heating.</strong>
                </p>
              </div>
            )}
          </div>

          {/* Capabilities */}
          <div className="rounded-4xl border border-navy/10 bg-white p-7 shadow-card">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-elixa-gradient text-white">
              <ServiceIcon name={service.icon} className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-lg font-bold">What we cover</h2>
            <ul className="mt-4 grid gap-2.5">
              {service.capabilities.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-navy/75">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 flex-none text-elixa-green" fill="none">
                    <path d="M4 10l4 4 8-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Interactive 3D product studio */}
      <ProductShowcase icon={service.icon} name={service.name} />

      {/* Highlights */}
      <section className="bg-cloud py-20 sm:py-24">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {service.highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-navy/10 bg-white p-7 shadow-card">
                  <span className="font-display text-sm font-bold text-elixa-cyan">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-bold">{h.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy/65">{h.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Works with */}
      {related.length > 0 && (
        <section className="py-20 sm:py-24">
          <Container>
            <h2 className="text-2xl font-bold">Works beautifully with</h2>
            <p className="mt-2 text-navy/60">Elixa technologies are designed to work as one system.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/${r.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-navy/10 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-elixa-cyan/40"
                >
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-elixa-gradient-soft text-navy">
                    <ServiceIcon name={r.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-display text-sm font-semibold text-navy">{r.name}</span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <Faqs faqs={service.faqs} />
      <CtaBanner />
    </>
  );
}
