import { LegalPage } from "@/components/page/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Terms & Conditions", path: "/terms/" });

export default function Page() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="The terms on which Elixa Renewables Group provides this website and its services."
      path="/terms"
    >
      <p>By using this website you agree to these terms. Quotes are subject to survey and final specification.</p>
      <h2 className="text-xl font-bold text-navy">Services</h2>
      <p>All installations are carried out by appropriately qualified specialists and subject to a written agreement.</p>
      <h2 className="text-xl font-bold text-navy">Liability</h2>
      <p>Nothing in these terms limits liability where it would be unlawful to do so.</p>
    </LegalPage>
  );
}
