import { LegalPage } from "@/components/page/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Privacy Policy", path: "/privacy-policy/" });

export default function Page() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="How Elixa Renewables Group collects, uses and protects your personal data."
      path="/privacy-policy"
    >
      <p>We are committed to protecting your privacy and handling your data in line with UK GDPR and the Data Protection Act 2018.</p>
      <h2 className="text-xl font-bold text-navy">Information we collect</h2>
      <p>Details you provide via our quote and contact forms — such as your name, contact details, postcode and project requirements.</p>
      <h2 className="text-xl font-bold text-navy">How we use it</h2>
      <p>To respond to your enquiry, prepare quotes, deliver services and, where you have consented, to keep you informed.</p>
      <h2 className="text-xl font-bold text-navy">Your rights</h2>
      <p>You may request access to, correction of, or deletion of your data at any time by contacting us.</p>
    </LegalPage>
  );
}
