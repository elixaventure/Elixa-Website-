import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/page/PageHero";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBanner } from "@/components/home/CtaBanner";
import { grants, grantsDisclaimer } from "@/content/site-content";
import { pageMeta, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = pageMeta({
  title: "Grants & Funding",
  description:
    "Grants, funding and finance may be available toward renewable energy and low-carbon heating, including the Boiler Upgrade Scheme. Check your eligibility with Elixa.",
  path: "/grants-funding/",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Grants & Funding", path: "/grants-funding" },
];

export default function GrantsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        kicker="Make the switch for less"
        title="Grants &amp; funding may be available."
        intro="Government, local-authority and finance options can reduce the cost of going low-carbon. We'll help you understand what applies to your property."
        breadcrumbs={crumbs}
      >
        <div className="mt-8">
          <Button href="/quote?intent=grants" variant="primary">
            Check Your Eligibility
          </Button>
        </div>
      </PageHero>

      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {grants.map((g, i) => (
              <Reveal key={g.name} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-navy/10 bg-white p-7 shadow-card">
                  <span className="inline-flex rounded-full bg-elixa-gradient-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
                    {g.status === "check" ? "Check eligibility" : "Available"}
                  </span>
                  <h2 className="mt-4 text-lg font-bold">{g.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-navy/65">{g.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-navy/10 bg-mist p-6 text-sm text-navy/60">
            <strong className="text-navy">Important:</strong> {grantsDisclaimer}
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
