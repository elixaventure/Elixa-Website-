"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Full-screen cinematic hero. The <video> plays when the media files exist
 * (public/media/hero.webm / hero.mp4 + hero-poster.jpg); until then a slow
 * contour-line canvas gives the same dark architectural atmosphere, and it
 * always sits behind the video as the loading/fallback state.
 */
export function HeroV2() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // contour backdrop
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      c.width = c.clientWidth * Math.min(devicePixelRatio, 1.6);
      c.height = c.clientHeight * Math.min(devicePixelRatio, 1.6);
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const { width: w, height: h } = c;
      ctx.clearRect(0, 0, w, h);
      const lines = 14;
      for (let i = 0; i < lines; i++) {
        const yBase = (h / (lines + 3)) * (i + 2.4);
        const amp = h * 0.045 * (1 + Math.sin(i * 1.7) * 0.4);
        ctx.beginPath();
        for (let x = 0; x <= w; x += 10) {
          const y =
            yBase +
            Math.sin(x / (w * 0.24) + t * 0.00022 * (i % 3 === 0 ? 1.4 : 1) + i * 1.1) * amp +
            Math.sin(x / (w * 0.07) + t * 0.00013 + i * 2.3) * amp * 0.3;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const accent = i === 9;
        ctx.strokeStyle = accent ? "rgba(62,197,180,0.16)" : `rgba(150,175,195,${0.05 + (i % 4) * 0.012})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (!reduced) {
        t += 16;
        raf = requestAnimationFrame(draw);
      }
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // video: show only if the file actually exists
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const onCan = () => {
      v.style.opacity = "1";
      v.play().catch(() => {});
    };
    v.addEventListener("canplay", onCan);
    return () => v.removeEventListener("canplay", onCan);
  }, []);

  // cinematic scroll transition out of the hero
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(media.current, {
        scale: 1.1,
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(copy.current, {
        yPercent: -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "70% top", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-night">
      <div ref={media} className="absolute inset-0 will-change-transform">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        <video
          ref={video}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          poster={`${BASE}/media/hero-poster.jpg`}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000"
        >
          <source src={`${BASE}/media/hero.webm`} type="video/webm" />
          <source src={`${BASE}/media/hero.mp4`} type="video/mp4" />
        </video>
        {/* cinematic shading: navy wash, readability gradient, vignette */}
        <div className="absolute inset-0 bg-[#0B1016]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-night/55" />
        <div className="absolute inset-0 [background:radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgba(4,6,9,0.65)_100%)]" />
      </div>

      <div ref={copy} className="relative z-10 mx-auto flex h-full max-w-[1500px] flex-col justify-end px-5 pb-24 pt-28 md:px-10 md:pb-28">
        <p className="mb-6 font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
          Elixa Renewables — Low-carbon systems
        </p>
        <h1 className="v2-narrow max-w-[17ch] font-arch text-[12vw] font-semibold leading-[0.98] tracking-[-0.02em] text-night-text sm:text-[8vw] lg:text-[6.2rem]" style={{ textWrap: "balance" }}>
          Low-carbon heating. Designed around your home.
        </h1>
        <p className="mt-7 max-w-[52ch] text-base leading-relaxed text-night-muted md:text-lg">
          Heat pumps, solar, modern heating systems and intelligent home energy solutions — designed,
          installed and supported by Elixa Renewables.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/#solutions"
            className="group relative overflow-hidden border border-night-accent px-7 py-3.5 font-techmono text-xs uppercase tracking-[0.16em] text-night-accent transition-colors hover:text-night"
          >
            <span className="absolute inset-0 -z-0 origin-left scale-x-0 bg-night-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
            <span className="relative z-10">Explore Our Solutions</span>
          </Link>
          <Link
            href="/quote"
            className="border border-night-text/25 px-7 py-3.5 font-techmono text-xs uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
          >
            Request a Survey
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-6 z-10 hidden flex-col items-center gap-3 pb-8 md:flex md:right-10">
        <span className="font-techmono text-[10px] uppercase tracking-[0.3em] text-night-faint [writing-mode:vertical-rl]">Scroll</span>
        <span className="h-16 w-px bg-gradient-to-b from-night-faint to-transparent" />
      </div>
    </section>
  );
}
