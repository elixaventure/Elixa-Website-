import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartHome3D } from "./smarthome/SmartHome3D";

export function SmartHomeSection() {
  return (
    <section className="relative overflow-hidden bg-cloud py-24 sm:py-28">
      <Container>
        <SectionHeading
          kicker="The Elixa smart-energy home"
          title="Explore the connected home."
          intro="Select a technology to see how it fits — from solar on the roof to climate control inside and charging on the drive."
        />
        <div className="mt-14">
          <SmartHome3D />
        </div>
      </Container>
    </section>
  );
}
