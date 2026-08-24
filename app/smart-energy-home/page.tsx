import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/page/PageHero";
import { SmartEnergyHome } from "@/components/home/smartenergy/SmartEnergyHome";
import { CtaBanner } from "@/components/home/CtaBanner";
import { pageMeta, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = pageMeta({
  title: "Build Your Smart Energy Home",
  description:
    "Explore the Elixa Smart Energy Home: add solar, battery, heat pumps, air conditioning, heating and EV charging and watch live energy flow through an interactive 3D house.",
  path: "/smart-energy-home/",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Smart Energy Home", path: "/smart-energy-home" },
];

export default function SmartEnergyHomePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        kicker="Interactive experience"
        title="Build your smarter home."
        intro="Add Elixa technologies and watch a conventional home become greener, smarter and more energy-independent — with live, illustrative energy flows from the sun to your rooms, battery and car."
        breadcrumbs={crumbs}
      />
      <section className="py-14 sm:py-16">
        <Container>
          <SmartEnergyHome />
        </Container>
      </section>
      <CtaBanner />
    </>
  );
}
