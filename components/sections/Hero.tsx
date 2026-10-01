"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap, useGSAP } from "@/lib/gsap";
import CanvasBoundary from "@/components/CanvasBoundary";

const ParticleSphere = dynamic(() => import("@/components/scenes/ParticleSphere"), { ssr: false });

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero-line > span", { yPercent: 110, duration: 1.2, stagger: 0.12 }, 0.2)
        .from(".hero-fade", { y: 18, opacity: 0, duration: 1, stagger: 0.12 }, 0.7);

      gsap.to(".hero-content", {
        y: 80,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "55% top", scrub: true },
      });
      // Lift the veil so particles gain presence while diving
      gsap.to(".hero-veil", {
        opacity: 0.05,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="top" ref={root} className="relative h-[180vh]" style={{ background: "#111336" }}>
      <div className="sticky top-0 h-[100svh] min-h-[640px] max-h-[980px] overflow-hidden">
        <div className="absolute inset-0">
          <CanvasBoundary>
            <ParticleSphere triggerRef={root} />
          </CanvasBoundary>
        </div>

        <div
          className="hero-veil pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 42%, transparent 0%, rgba(17,19,54,.18) 75%, rgba(17,19,54,.45) 100%), linear-gradient(180deg, rgba(17,19,54,.12) 0%, transparent 35%, rgba(17,20,53,.35) 82%, #111435 100%)",
          }}
        />

        <div className="hero-content wrap pointer-events-none relative z-[2] flex h-full items-end pb-16 pt-24 md:items-center md:pb-0">
          <div className="pointer-events-auto flex max-w-[720px] flex-col gap-6">
            <div className="mono eyebrow hero-fade text-muted">Software de mejora empresarial</div>
            <h1 className="disp text-[44px] leading-[1.02] font-light sm:text-[64px] lg:text-[80px]">
              <span className="hero-line block overflow-hidden">
                <span className="block text-[#c9cce8]">
                  El CRM que se adapta a <span className="font-bold text-ink">tu proyecto</span>
                </span>
              </span>
            </h1>
            <p className="hero-fade max-w-[600px] text-[17px] leading-relaxed text-[#c9cce8] md:text-[18px]">
              Una herramienta hecha para tu empresa: organiza clientes, equipos y procesos y automatiza tu día a día.
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
        </div>

        <div className="absolute bottom-6 left-1/2 z-[2] -translate-x-1/2 text-muted motion-safe:animate-bounce" aria-hidden="true">
          <svg width="20" height="30" viewBox="0 0 20 30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="18" height="28" rx="9" />
            <path d="M10 7v6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}
