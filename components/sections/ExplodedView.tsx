"use client";

/**
 * ExplodedView — arquitectura del CRM en 3 capas (UI · IA · Data).
 * Scrub GSAP ScrollTrigger: la tarjeta unificada se “abre” en el eje Z.
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
      gsap.set(container3D, { rotateX: 22, rotateY: -16, rotateZ: 5, transformPerspective: 1500, transformStyle: "preserve-3d" });
      gsap.set(layerUI, { z: 160, opacity: 1, transformStyle: "preserve-3d" });
      gsap.set(layerIA, { z: 0, opacity: 0.9, transformStyle: "preserve-3d" });
      gsap.set(layerData, { z: -160, opacity: 0.7, transformStyle: "preserve-3d" });
      return;
    }

    gsap.set(container3D, {
      rotateX: 18,
      rotateY: -12,
      rotateZ: 4,
      transformPerspective: 1500,
      transformStyle: "preserve-3d",
    });
    gsap.set(parallax, { transformStyle: "preserve-3d" });
    gsap.set(layerUI, { z: 0, opacity: 0.92, transformStyle: "preserve-3d" });
    gsap.set(layerIA, { z: -5, opacity: 0.55, transformStyle: "preserve-3d" });
    gsap.set(layerData, { z: -10, opacity: 0.35, transformStyle: "preserve-3d" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: "top top",
        end: "+=150vh",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    tl.to(container3D, { rotateX: 28, rotateY: -22, rotateZ: 8, ease: "none" }, 0)
      .to(layerUI, { z: 220, opacity: 1, ease: "power1.inOut" }, 0)
      .to(layerIA, { z: 0, opacity: 0.9, ease: "power1.inOut" }, 0)
      .to(layerData, { z: -220, opacity: 0.72, ease: "power1.inOut" }, 0);

    // Mouse parallax on a nested wrapper so it never fights ScrollTrigger rotations
    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      gsap.to(parallax, {
        rotateX: y * -8,
        rotateY: x * 10,
        duration: 0.85,
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
      aria-label="Arquitectura del CRM en capas"
      className="relative h-screen w-full overflow-hidden select-none"
      style={{ background: "#111435" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-10">
        <div className="pointer-events-none mb-10 max-w-2xl text-center md:mb-14">
          <div className="mono eyebrow mx-auto justify-center text-blue">Arquitectura propietaria</div>
          <h2 className="disp mt-4 text-[32px] font-medium tracking-tight text-ink md:text-[48px]">
            Un CRM diseñado
            <br />
            <span className="font-light text-[#c9cce8]">en capas exclusivas.</span>
          </h2>
        </div>

        <div className="relative flex h-[300px] w-full max-w-[560px] items-center justify-center md:h-[360px]">
          <div ref={container3DRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
            <div ref={parallaxRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
              {/* CAPA 1 — DATA */}
              <div
                ref={layerDataRef}
                className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0b0d24]/55 p-5 shadow-[0_20px_60px_rgba(5,6,26,.55)] backdrop-blur-md md:p-6"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Layer_01 · Core_data</span>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-lime/70" />
                </div>

                <div className="my-auto grid grid-cols-3 gap-2 font-mono text-[10px] text-muted md:gap-3 md:text-[11px]">
                  {[
                    "id_lead: uuid",
                    "metadata_json",
                    "cluster_index",
                    "pipeline_stage",
                    "encryption_aes",
                    "isolated_db",
                  ].map((cell) => (
                    <div
                      key={cell}
                      className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-2 text-center text-[#a2a6c8]/90"
                    >
                      {cell}
                    </div>
                  ))}
                </div>

                <p className="text-[12px] font-medium text-muted">Bases de datos aisladas y cifradas a medida.</p>
              </div>

              {/* CAPA 2 — IA */}
              <div
                ref={layerIARef}
                className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl border border-blue/25 bg-[#171b45]/50 p-5 shadow-[0_24px_70px_rgba(52,73,255,.12)] backdrop-blur-xl md:p-6"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center justify-between border-b border-blue/15 pb-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8fa4ff]">Layer_02 · Cognitive</span>
                  <span className="rounded-full border border-blue/30 bg-blue/20 px-2 py-0.5 font-mono text-[10px] text-[#b8c0ff]">
                    LLM v4.5
                  </span>
                </div>

                <div className="my-auto flex h-24 w-full items-center justify-center opacity-80">
                  <svg className="h-full w-full fill-none" viewBox="0 0 400 100" aria-hidden>
                    <path d="M10,50 Q100,0 200,50 T390,50" stroke="#3449ff" strokeOpacity="0.45" strokeWidth="1.5" />
                    <path
                      d="M10,50 Q100,100 200,50 T390,50"
                      stroke="#c1ff28"
                      strokeOpacity="0.35"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <circle cx="200" cy="50" r="4.5" fill="#c1ff28" />
                    <circle cx="100" cy="25" r="3" fill="#3449ff" fillOpacity="0.7" />
                    <circle cx="300" cy="75" r="3" fill="#8fa4ff" fillOpacity="0.8" />
                    <circle cx="55" cy="58" r="2" fill="#f2f3ff" fillOpacity="0.35" />
                    <circle cx="340" cy="42" r="2" fill="#f2f3ff" fillOpacity="0.35" />
                  </svg>
                </div>

                <p className="text-[12px] font-medium text-[#8fa4ff]">Lógica predictiva integrada directamente en el core.</p>
              </div>

              {/* CAPA 3 — UI */}
              <div
                ref={layerUIRef}
                className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl border border-white/12 bg-[#111435]/70 p-5 shadow-[0_30px_90px_rgba(5,6,26,.65)] backdrop-blur-2xl md:p-6"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-lime/80" />
                  </div>
                  <span className="font-mono text-[10px] tracking-tight text-muted">app.tuempresa.com / dashboard</span>
                </div>

                <div className="my-auto flex flex-col gap-3">
                  <div className="h-2.5 w-1/3 rounded-md bg-white/12" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex h-[72px] flex-col justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                      <span className="text-[11px] font-medium text-muted">Conversión</span>
                      <span className="disp text-[22px] text-ink">24.8%</span>
                    </div>
                    <div className="flex h-[72px] flex-col justify-between rounded-xl border border-lime/25 bg-lime/[0.06] p-3">
                      <span className="text-[11px] font-medium text-muted">Automatizaciones</span>
                      <span className="disp text-[22px] text-lime">99.9%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full w-[68%] rounded-full bg-blue" />
                    </span>
                    <span className="font-mono text-[10px] text-muted">pipeline</span>
                  </div>
                </div>

                <p className="text-[12px] font-medium text-[#c9cce8]">UI adaptada milimétricamente al flujo de tu equipo.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none mt-10 flex gap-6 text-center md:mt-12">
          {[
            ["01", "Datos"],
            ["02", "Inteligencia"],
            ["03", "Interfaz"],
          ].map(([n, label]) => (
            <div key={n} className="flex flex-col items-center gap-1">
              <span className="mono text-muted">{n}</span>
              <span className="text-[13px] font-medium text-ink/80">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
