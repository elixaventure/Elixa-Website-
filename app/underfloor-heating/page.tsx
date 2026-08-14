import { ServicePageTemplate } from "@/components/page/ServicePageTemplate";
import { serviceBySlug } from "@/content/services";
import { pageMeta } from "@/lib/seo";

const service = serviceBySlug("underfloor-heating")!;

export const metadata = pageMeta({
  rawTitle: service.seoTitle,
  description: service.seoDescription,
  path: "/underfloor-heating/",
});

export default function Page() {
  return <ServicePageTemplate service={service} />;
}
