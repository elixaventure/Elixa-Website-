import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SavingsCalculator } from "@/components/calculator/SavingsCalculator";

export function CalculatorSection() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <SectionHeading
          kicker="Energy savings calculator"
          title="See what you could save."
          intro="A quick, indicative estimate to start the conversation — then we tailor it precisely to your property."
        />
        <div className="mt-14">
          <SavingsCalculator />
        </div>
      </Container>
    </section>
  );
}
