import { ServicePageTemplate } from "@/components/page/ServicePageTemplate";
import { serviceBySlug } from "@/content/services";
import { pageMeta } from "@/lib/seo";

const service = serviceBySlug("solar-pv")!;

export const metadata = pageMeta({
  rawTitle: service.seoTitle,
  description: service.seoDescription,
  path: "/solar-pv/",
});

export default function Page() {
  return <ServicePageTemplate service={service} />;
}
