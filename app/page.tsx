import type { Metadata } from "next";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { HeroV2 } from "@/components/v2/Hero";
import { ExploreHome } from "@/components/v2/ExploreHome";
import { WhyElixa, Projects, Process, Grants, FinalCta } from "@/components/v2/Sections";
import { FooterV2 } from "@/components/v2/FooterV2";

export const metadata: Metadata = {
  title: "Elixa Renewables — Low-Carbon Heating, Designed Around Your Home",
  description:
    "Heat pumps, solar, modern heating systems and intelligent home energy solutions — designed, installed and supported by Elixa Renewables across the UK.",
};

export default function HomePage() {
  return (
    <SmoothScroll>
      {/* the document itself must be dark on this page — pinned sections and
          overscroll would otherwise flash the default white body through */}
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />
        <HeroV2 />
        <ExploreHome />
        <WhyElixa />
        <Projects />
        <Process />
        <Grants />
        <FinalCta />
        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
