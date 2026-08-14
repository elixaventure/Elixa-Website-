import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { services } from "@/content/services";

export function ServicesGrid() {
  return (
    <section id="solutions" className="py-24 sm:py-28">
      <Container>
        <SectionHeading
          kicker="Our solutions"
          title="Energy solutions for the modern home & business."
          intro="From generating your own power to heating, cooling and charging — one expert partner for the whole system."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 0.06}>
              <Link
                href={`/${s.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-navy/10 bg-white p-7 shadow-card transition-all duration-300 ease-elixa hover:-translate-y-1 hover:border-elixa-cyan/40 hover:shadow-elevated"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-elixa-gradient-soft text-navy transition-colors group-hover:bg-elixa-gradient group-hover:text-white">
                  <ServiceIcon name={s.icon} className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-xl font-bold">{s.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy/60">{s.summary}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-elixa-cyan">
                  Learn more
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-elixa-gradient opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-10" />
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
