"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap, useGSAP } from "@/lib/gsap";
import CanvasBoundary from "@/components/CanvasBoundary";

const AuroraBackground = dynamic(() => import("@/components/scenes/AuroraBackground"), { ssr: false });

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero-line > span", { yPercent: 110, duration: 1.2, stagger: 0.12 }, 0.2)
        .from(".hero-fade", { y: 18, opacity: 0, duration: 1, stagger: 0.12 }, 0.7);

      // parallax + fade of the hero content while the page starts scrolling
      gsap.to(".hero-content", {
        y: 120,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-bg", {
        scale: 1.15,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="top" ref={root} className="relative flex h-screen min-h-[640px] max-h-[980px] items-center overflow-hidden">
      <div className="hero-bg absolute inset-0 will-change-transform">
        <CanvasBoundary><AuroraBackground /></CanvasBoundary>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(17,20,53,.15),rgba(17,20,53,.5)_70%,#111435)]" />

      <div className="hero-content wrap relative grid items-end gap-12 pt-24 md:grid-cols-[1.5fr_.7fr]">
        <div className="flex flex-col gap-6">
          <div className="mono eyebrow hero-fade text-muted">CRM a medida · Next.js · Supabase · Vercel</div>
          <h1 className="disp text-[44px] leading-[1.02] sm:text-[64px] lg:text-[80px]">
            <span className="hero-line block overflow-hidden"><span className="block">Tu CRM no debería</span></span>
            <span className="hero-line block overflow-hidden"><span className="block">obligarte a cambiar</span></span>
            <span className="hero-line block overflow-hidden"><span className="block font-light text-[#c9cce8]">cómo vendes.</span></span>
          </h1>
          <p className="hero-fade max-w-[600px] text-[17px] leading-relaxed text-[#c9cce8] md:text-[18px]">
            Diseñamos y fabricamos CRMs a medida para equipos comerciales: tu pipeline, tus etapas, tus reglas. Sin licencias por asiento y sin módulos que nunca vas a usar.
          </p>
          <div className="hero-fade flex flex-wrap gap-3.5">
            <a href="#contacto" className="btn btn-lime">
              Pedir una propuesta
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>
            <a href="#inmersion" className="btn btn-ghost">
              Ver cómo trabajamos
            </a>
          </div>
        </div>

        <div className="hero-fade hidden flex-col gap-4 self-end md:flex">
          <div className="h-px bg-white/15" />
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="disp text-[40px]">+20</div>
              <div className="mono">años construyendo software</div>
            </div>
            <div>
              <div className="disp text-[40px]">0 €</div>
              <div className="mono">por usuario y mes</div>
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-muted">
            Un producto de <a href="https://latency.es" className="text-ink">Latency</a>, estudio de desarrollo en A Coruña. El código y los datos son tuyos desde el primer día.
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted motion-safe:animate-bounce" aria-hidden="true">
        <svg width="20" height="30" viewBox="0 0 20 30" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="18" height="28" rx="9" />
          <path d="M10 7v6" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}
