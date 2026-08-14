import { LegalPage } from "@/components/page/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Cookie Policy", path: "/cookie-policy/" });

export default function Page() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="How and why Elixa Renewables Group uses cookies and similar technologies."
      path="/cookie-policy"
    >
      <p>Cookies help the site function and, with your consent, help us understand how it is used so we can improve it.</p>
      <h2 className="text-xl font-bold text-navy">Types of cookies</h2>
      <p>Essential cookies keep the site working. Analytics cookies (loaded only with consent) help us measure performance.</p>
      <h2 className="text-xl font-bold text-navy">Managing cookies</h2>
      <p>You can manage or withdraw consent at any time through your browser settings or our consent controls.</p>
    </LegalPage>
  );
}
