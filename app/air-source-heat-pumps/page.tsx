import { ServicePageTemplate } from "@/components/page/ServicePageTemplate";
import { serviceBySlug } from "@/content/services";
import { pageMeta } from "@/lib/seo";

const service = serviceBySlug("air-source-heat-pumps")!;

export const metadata = pageMeta({
  rawTitle: service.seoTitle,
  description: service.seoDescription,
  path: "/air-source-heat-pumps/",
});

export default function Page() {
  return <ServicePageTemplate service={service} />;
}
