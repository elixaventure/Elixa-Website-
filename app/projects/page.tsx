import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/page/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectsGallery } from "@/components/projects/ProjectsGallery";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { CtaBanner } from "@/components/home/CtaBanner";
import { pageMeta, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = pageMeta({
  title: "Projects & Case Studies",
  description:
    "Recent Elixa Renewables Group installations — solar, battery, heat pumps, air conditioning, heating and EV charging across residential and commercial projects.",
  path: "/projects/",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
];

export default function ProjectsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        kicker="Recent installations"
        title="Work we're proud of."
        intro="A selection of Elixa projects across the UK. Filter by technology to see how we deliver complete, integrated systems."
        breadcrumbs={crumbs}
      />

      <section className="py-16 sm:py-20">
        <Container>
          <ProjectsGallery />
        </Container>
      </section>

      <section className="bg-mist py-20 sm:py-24">
        <Container>
          <SectionHeading
            kicker="Before & after"
            title="See the transformation."
            intro="Drag the handle to compare. Interactive sliders are ready for genuine project photography."
          />
          <div className="mx-auto mt-12 max-w-4xl">
            <BeforeAfter beforeLabel="Before" afterLabel="After — Elixa install" />
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
