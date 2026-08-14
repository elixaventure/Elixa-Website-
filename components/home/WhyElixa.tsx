import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { whyElixa } from "@/content/site-content";

export function WhyElixa() {
  return (
    <section className="bg-mist py-24 sm:py-28">
      <Container>
        <SectionHeading
          kicker="Why choose Elixa"
          title="Premium engineering. Honest advice."
          intro="A single, accountable partner for renewable energy, heating and cooling — delivered to a standard you can trust."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyElixa.map((p, i) => (
            <Reveal key={p.title} delay={(i % 4) * 0.05}>
              <div className="h-full rounded-3xl border border-navy/10 bg-white p-6 shadow-card">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-elixa-gradient text-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-4 text-base font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/60">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
