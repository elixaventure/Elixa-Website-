import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { serviceSlugs } from "@/content/services";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/smart-energy-home",
    "/about",
    "/projects",
    "/grants-funding",
    "/calculator",
    "/quote",
    "/contact",
    ...serviceSlugs.map((s) => `/${s}`),
    "/privacy-policy",
    "/cookie-policy",
    "/terms",
  ];
  const now = new Date();
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/quote") ? 0.9 : 0.7,
  }));
}
