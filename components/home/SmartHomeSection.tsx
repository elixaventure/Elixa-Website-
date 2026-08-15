import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CutawayHouse } from "./smarthome/CutawayHouse";

export function SmartHomeSection() {
  return (
    <section className="relative overflow-hidden bg-cloud py-24 sm:py-28">
      <Container>
        <SectionHeading
          kicker="The Elixa smart-energy home"
          title="See inside the connected home."
          intro="Tap a technology to look inside the house and watch the delivery in action — electricity from the roof, heat through the floors, cool air to the rooms and charge to the car."
        />
        <div className="mt-14">
          <CutawayHouse />
        </div>
      </Container>
    </section>
  );
}
