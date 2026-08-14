import { Hero } from "@/components/home/Hero";
import { Accreditations } from "@/components/home/Accreditations";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { SmartHomeSection } from "@/components/home/SmartHomeSection";
import { EnergyFlow } from "@/components/home/EnergyFlow";
import { WhyElixa } from "@/components/home/WhyElixa";
import { Process } from "@/components/home/Process";
import { CalculatorSection } from "@/components/home/CalculatorSection";
import { GrantsTeaser } from "@/components/home/GrantsTeaser";
import { Reviews } from "@/components/home/Reviews";
import { CtaBanner } from "@/components/home/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo";
import { services } from "@/content/services";

export default function HomePage() {
  const topFaqs = services.flatMap((s) => s.faqs).slice(0, 6);
  return (
    <>
      <Hero />
      <Accreditations />
      <ServicesGrid />
      <SmartHomeSection />
      <EnergyFlow />
      <WhyElixa />
      <Process />
      <CalculatorSection />
      <GrantsTeaser />
      <Reviews />
      <CtaBanner />
      {faqSchema(topFaqs) && <JsonLd data={faqSchema(topFaqs)!} />}
    </>
  );
}
