import { Container } from "@/components/ui/Container";
import { QuoteLauncher } from "@/components/quote/QuoteLauncher";
import { pageMeta } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata = pageMeta({
  title: "Get a Free Quote",
  description:
    "Get a free, no-obligation quote from Elixa Renewables Group for solar, battery storage, heat pumps, air conditioning, heating or EV charging.",
  path: "/quote/",
});

export default function QuotePage() {
  return (
    <section className="bg-cloud pb-24 pt-[calc(var(--nav-h)+3rem)]">
      <Container>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="kicker">Get a free quote</span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Tell us about your project.
          </h1>
          <p className="mt-4 text-navy/60">
            A few quick questions and an Elixa specialist will come back with honest advice and a
            no-obligation quote. Prefer to talk?{" "}
            <a href={site.phoneHref} className="font-semibold text-elixa-cyan">
              Call {site.phoneDisplay}
            </a>
            .
          </p>
        </div>
        <QuoteLauncher />
      </Container>
    </section>
  );
}
