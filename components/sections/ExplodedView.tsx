"use client";

/**
 * ExplodedView — factoríacrm (Arquitectura propietaria).
 * Tres capas reales (Data · Cognitive · UI) en despiece 3D con GSAP ScrollTrigger scrub.
 */

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function ExplodedView() {
  const triggerRef = useRef<HTMLElement>(null);
  const container3DRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const layerUIRef = useRef<HTMLDivElement>(null);
  const layerIARef = useRef<HTMLDivElement>(null);
  const layerDataRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    const container3D = container3DRef.current;
    const parallax = parallaxRef.current;
    const layerUI = layerUIRef.current;
    const layerIA = layerIARef.current;
    const layerData = layerDataRef.current;

    if (!trigger || !container3D || !parallax || !layerUI || !layerIA || !layerData) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(container3D, {
        rotateX: 28,
        rotateY: -20,
        rotateZ: 5,
        transformPerspective: 1600,
        transformStyle: "preserve-3d",
      });
      gsap.set(layerUI, { z: 180, opacity: 1, transformStyle: "preserve-3d" });
      gsap.set(layerIA, { z: 0, opacity: 0.9, transformStyle: "preserve-3d" });
      gsap.set(layerData, { z: -180, opacity: 0.75, transformStyle: "preserve-3d" });
      return;
    }

    gsap.set(container3D, {
      rotateX: 20,
      rotateY: -15,
      rotateZ: 4,
      transformPerspective: 1600,
      transformStyle: "preserve-3d",
    });
    gsap.set(parallax, { transformStyle: "preserve-3d" });

    // Estado inicial colapsado
    gsap.set(layerUI, { z: 0, opacity: 0.95, transformStyle: "preserve-3d" });
    gsap.set(layerIA, { z: -4, opacity: 0.6, transformStyle: "preserve-3d" });
    gsap.set(layerData, { z: -8, opacity: 0.4, transformStyle: "preserve-3d" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: "top top",
        end: "+=130vh",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    tl.to(container3D, { rotateX: 32, rotateY: -26, rotateZ: 6, ease: "none" }, 0)
      .to(layerUI, { z: 240, opacity: 1, ease: "power1.inOut" }, 0)
      .to(layerIA, { z: 0, opacity: 0.9, ease: "power1.inOut" }, 0)
      .to(layerData, { z: -240, opacity: 0.7, ease: "power1.inOut" }, 0);

    // Parallax en wrapper interno: no pelea con el scrub de container3D
    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      gsap.to(parallax, {
        rotateX: y * -10,
        rotateY: x * 12,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    ScrollTrigger.sort();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      id="arquitectura"
      ref={triggerRef}
      aria-label="Arquitectura propietaria"
      className="relative flex h-screen w-full select-none items-center justify-center overflow-hidden"
      style={{ background: "#111435" }}
    >
      <div className="wrap relative z-10 flex w-full flex-col items-center justify-between gap-10 md:flex-row md:gap-12 lg:gap-16">
        {/* Copy */}
        <div className="max-w-md pointer-events-none text-center md:text-left">
          <div className="mono eyebrow justify-center text-blue md:justify-start">Arquitectura propietaria</div>
          <h2 className="disp mt-4 text-[34px] font-medium tracking-tight text-ink md:text-[48px]">
            Un CRM diseñado
            <br />
            <span className="font-light text-[#c9cce8]">en capas exclusivas.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-muted md:text-[16px]">
            Tu software no es un bloque rígido. Se estructura en capas independientes de datos distribuidos,
            procesamiento predictivo e interfaz reactiva para garantizar velocidad de procesamiento infinita.
          </p>
          <div className="mt-8 hidden gap-8 md:flex">
            {[
              ["01", "Core data"],
              ["02", "Cognitive"],
              ["03", "Dashboard"],
            ].map(([n, label]) => (
              <div key={n} className="flex flex-col gap-1">
                <span className="mono text-muted">{n}</span>
                <span className="text-[13px] font-medium text-ink/85">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Escena 3D */}
        <div className="relative flex h-[340px] w-full max-w-[500px] items-center justify-center md:h-[400px]">
          <div ref={container3DRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
            <div ref={parallaxRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
              {/* LAYER_01 · Core_data */}
              <div
                ref={layerDataRef}
                className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0b0d24]/55 p-5 shadow-[0_20px_60px_rgba(5,6,26,.55)] backdrop-blur-md md:p-6"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="font-mono text-[11px] tracking-wider text-muted">Layer_01 · Core_data</span>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-lime/80" />
                </div>
                <div className="my-auto grid grid-cols-2 gap-2 font-mono text-[10px] text-[#a2a6c8]/90 md:text-[11px]">
                  {[
                    "id_lead: uuid",
                    "metadata_json",
                    "cluster_index",
                    "pipeline_stage",
                    "encryption_aes",
                    "isolated_db",
                  ].map((cell) => (
                    <div key={cell} className="rounded-lg border border-white/[0.07] bg-black/35 px-2 py-1.5">
                      {cell}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] font-medium text-muted md:text-[12px]">
                  Bases de datos aisladas y cifradas a medida en tu Supabase.
                </p>
              </div>

              {/* LAYER_02 · Cognitive LLM v4.5 */}
              <div
                ref={layerIARef}
                className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl border border-blue/25 bg-[#111435]/65 p-5 shadow-[0_24px_70px_rgba(52,73,255,.14)] backdrop-blur-xl md:p-6"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center justify-between border-b border-blue/15 pb-3">
                  <span className="font-mono text-[11px] tracking-wider text-[#8fa4ff]">Layer_02 · Cognitive LLM v4.5</span>
                  <span className="rounded-full border border-blue/30 bg-blue/20 px-2 py-0.5 font-mono text-[9px] text-[#b8c0ff]">
                    ACTIVE
                  </span>
                </div>
                <div className="my-auto flex h-20 w-full items-center justify-center opacity-70">
                  <svg className="h-full w-full fill-none" viewBox="0 0 400 100" aria-hidden>
                    <path d="M10,50 Q100,10 200,50 T390,50" stroke="#3449ff" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path
                      d="M10,50 Q100,90 200,50 T390,50"
                      stroke="#c1ff28"
                      strokeOpacity="0.35"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle cx="200" cy="50" r="4" fill="#8fa4ff" />
                    <circle cx="100" cy="30" r="2.5" fill="#c1ff28" fillOpacity="0.7" />
                    <circle cx="300" cy="70" r="2.5" fill="#3449ff" fillOpacity="0.8" />
                  </svg>
                </div>
                <p className="text-[11px] font-medium text-[#8fa4ff] md:text-[12px]">
                  Lógica predictiva e inteligencia integrada directamente en el core.
                </p>
              </div>

              {/* LAYER_03 · Dashboard UI */}
              <div
                ref={layerUIRef}
                className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl border border-white/12 bg-[#171b45]/55 p-5 shadow-[0_40px_80px_rgba(5,6,26,.7)] backdrop-blur-2xl md:p-6"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-lime/80" />
                  </div>
                  <span className="font-mono text-[10px] text-muted">://tuempresa.com / dashboard</span>
                </div>
                <div className="my-auto grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                    <span className="mb-1 block text-[10px] font-medium text-muted">Conversión</span>
                    <span className="disp text-[22px] text-ink md:text-[24px]">24.8%</span>
                  </div>
                  <div className="rounded-xl border border-lime/20 bg-lime/[0.06] p-3">
                    <span className="mb-1 block text-[10px] font-medium text-muted">Automatizaciones</span>
                    <span className="disp text-[22px] text-lime md:text-[24px]">99.9%</span>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-[#c9cce8] md:text-[12px]">
                  UI adaptada milimétricamente al flujo de tu equipo comercial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
