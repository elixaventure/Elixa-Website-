import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/page/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { WhyElixa } from "@/components/home/WhyElixa";
import { Process } from "@/components/home/Process";
import { CtaBanner } from "@/components/home/CtaBanner";
import { pageMeta, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";

export const metadata = pageMeta({
  title: "About Elixa",
  description:
    "Elixa Renewables Group is a nationwide UK renewable energy, heating and cooling company delivering premium, low-carbon solutions for homes and businesses.",
  path: "/about/",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        kicker="About Elixa"
        title="A premium partner for the UK's energy transition."
        intro={`${site.legalName} designs and installs renewable energy, heating and cooling systems nationwide — combining proper engineering with honest advice.`}
        breadcrumbs={crumbs}
      />

      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal>
              <h2 className="text-3xl font-extrabold sm:text-4xl">Clean energy, done properly.</h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-5 text-lg leading-relaxed text-navy/70">
                We exist to make the switch to low-carbon technology straightforward, premium and
                genuinely worthwhile. Solar, storage, heat pumps, air conditioning, heating and EV
                charging — designed to work together as one intelligent system.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-lg leading-relaxed text-navy/70">
                From the first survey to final commissioning and beyond, one accountable Elixa team
                manages your project — with the engineering rigour and aftercare a serious energy
                investment deserves.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { k: "Nationwide", v: "UK-wide installations" },
                { k: "End-to-end", v: "Survey to support" },
                { k: "Qualified", v: "F-Gas engineers" },
                { k: "Integrated", v: "One connected system" },
              ].map((s) => (
                <div key={s.k} className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card">
                  <p className="font-display text-xl font-extrabold text-navy">{s.k}</p>
                  <p className="mt-1 text-sm text-navy/60">{s.v}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <WhyElixa />
      <Process />
      <CtaBanner />
    </>
  );
}
