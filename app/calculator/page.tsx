import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/page/PageHero";
import { SavingsCalculator } from "@/components/calculator/SavingsCalculator";
import { pageMeta, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = pageMeta({
  title: "Energy Savings Calculator",
  description:
    "Estimate your potential savings from solar, battery storage, heat pumps, air conditioning and EV charging with the Elixa energy savings calculator.",
  path: "/calculator/",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Savings Calculator", path: "/calculator" },
];

export default function CalculatorPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        kicker="Energy savings calculator"
        title="See what you could save."
        intro="Answer a few quick questions for an indicative estimate — then we'll tailor it precisely to your property."
        breadcrumbs={crumbs}
      />
      <section className="py-16 sm:py-20">
        <Container>
          <SavingsCalculator />
        </Container>
      </section>
    </>
  );
}
