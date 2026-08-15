import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartEnergyHome } from "./smartenergy/SmartEnergyHome";

export function SmartHomeSection() {
  return (
    <section className="relative overflow-hidden bg-cloud py-24 sm:py-28">
      <Container>
        <SectionHeading
          kicker="The Elixa smart-energy home"
          title="Build your smarter home."
          intro="Add technologies and watch a conventional home become greener, smarter and more energy-independent — with live energy flowing from the sun to your rooms, battery and car."
        />
        <div className="mt-14">
          <SmartEnergyHome />
        </div>
      </Container>
    </section>
  );
}
