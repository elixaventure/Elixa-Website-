import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-elixa-gradient py-20">
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,rgba(255,255,255,.25),transparent_60%)]" />
      <Container className="relative text-center">
        <h2 className="mx-auto max-w-3xl text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
          Ready to power a smarter, greener future?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/90">
          Speak to an Elixa energy specialist about your home or business — honest advice and a
          free, no-obligation quote.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/quote" variant="navy" className="!bg-navy-900 hover:!bg-navy-800">
            Get a Free Quote
          </Button>
          <a href={site.phoneHref} className="btn btn-lg bg-white text-navy hover:-translate-y-0.5">
            Call {site.phoneDisplay}
          </a>
        </div>
      </Container>
    </section>
  );
}
