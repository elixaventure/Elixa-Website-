import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { processSteps } from "@/content/site-content";

export function Process() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <SectionHeading
          kicker="How Elixa works"
          title="From first call to full comfort."
          intro="A clear, managed journey — one accountable team from survey to handover and beyond."
        />

        <div className="relative mt-16">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-elixa-green/40 via-elixa-teal/40 to-elixa-cyan/40 lg:block" />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <Reveal as="li" key={step.no} delay={i * 0.08} className="relative">
                <span className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl border border-navy/10 bg-white font-display text-xl font-extrabold text-transparent shadow-card [-webkit-text-stroke:1.5px_#1D9ED9]">
                  {step.no}
                </span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/60">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
