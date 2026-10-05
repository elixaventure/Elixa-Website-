import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ClassicChrome } from "@/components/layout/ClassicChrome";
import { Footer } from "@/components/layout/Footer";
import { V2Chrome } from "@/components/layout/V2Chrome";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { MetaPixel } from "@/components/layout/MetaPixel";
import { MobileNavV2 } from "@/components/v2/MobileNavV2";
import { MobileBar } from "@/components/layout/MobileBar";
import { Analytics } from "@/components/layout/Analytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, localBusinessSchema, websiteSchema } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "solar panel installation",
    "battery storage",
    "air source heat pump installation",
    "air conditioning installation",
    "F-Gas engineers",
    "ThermaSkirt",
    "underfloor heating",
    "EV charger installation",
    "renewable energy installers UK",
  ],
  authors: [{ name: site.legalName }],
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.png`, type: "image/png", sizes: "256x256" }],
    apple: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.png` }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1A3A6B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <JsonLd data={[organizationSchema(), localBusinessSchema(), websiteSchema()]} />
        <Analytics />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <ClassicChrome>
          <Navbar />
        </ClassicChrome>
        <main id="main" className="pb-16 sm:pb-0">
          {children}
        </main>
        <ClassicChrome>
          <Footer />
          <MobileBar />
        </ClassicChrome>
        <V2Chrome>
          <MobileNavV2 />
        </V2Chrome>
        {/* Both on every page, classic and v2. The banner shows until a
            choice is made; the pixel loads only once that choice is yes. */}
        <CookieConsent />
        <MetaPixel />
      </body>
    </html>
  );
}
