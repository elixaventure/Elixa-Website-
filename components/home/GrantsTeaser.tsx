import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { grants, grantsDisclaimer } from "@/content/site-content";

export function GrantsTeaser() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <div className="overflow-hidden rounded-4xl bg-navy-900 text-white shadow-floating">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="kicker !text-elixa-green">Make the switch for less</span>
              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Grants &amp; funding may be available.
              </h2>
              <p className="mt-4 max-w-lg text-white/70">
                Government, local-authority and finance options can reduce the cost of going
                low-carbon. Eligibility depends on your property, technology and circumstances —
                we&apos;ll help you check what applies.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/quote?intent=grants" variant="primary">
                  Check Your Eligibility
                </Button>
                <Button href="/grants-funding" variant="ghost">
                  Grants &amp; Funding
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {grants.map((g) => (
                <Reveal key={g.name}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-display text-base font-bold text-white">{g.name}</h3>
                    <p className="mt-1.5 text-sm text-white/65">{g.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <p className="border-t border-white/10 px-8 py-4 text-xs text-white/45 sm:px-12">
            {grantsDisclaimer}
          </p>
        </div>
      </Container>
    </section>
  );
}
