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
      className="relative flex h-screen w-full select-none items-center justify-center overflow-hidden bg-transparent"
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
        <div className="relative flex h-[380px] w-full max-w-[540px] items-center justify-center md:h-[460px]">
          <div ref={container3DRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
            <div ref={parallaxRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
              {/* LAYER_01 · Core_data */}
              <div
                ref={layerDataRef}
                className="absolute inset-0 flex h-full w-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0d24]/70 p-4 shadow-[0_20px_60px_rgba(5,6,26,.55)] backdrop-blur-md md:p-5"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <span className="font-mono text-[11px] tracking-wider text-muted">Layer_01 · Core_data</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-lime/80">supabase · live</span>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-lime/80" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["1.284", "cuentas"],
                    ["486", "oportunidades"],
                    ["38", "visitas hoy"],
                  ].map(([v, l]) => (
                    <div key={l} className="rounded-lg border border-white/[0.07] bg-black/35 px-2 py-2">
                      <div className="disp text-[16px] leading-none text-ink md:text-[18px]">{v}</div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">{l}</div>
                    </div>
                  ))}
                </div>

                <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden">
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-muted">Tablas · schema</div>
                  {[
                    ["accounts", "1.284 rows", "rls ✓"],
                    ["opportunities", "486 rows", "rls ✓"],
                    ["visits", "12.4k rows", "rls ✓"],
                    ["automations", "64 jobs", "queue"],
                  ].map(([t, n, s]) => (
                    <div
                      key={t}
                      className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 font-mono text-[10px]"
                    >
                      <span className="text-[#c9cce8]">{t}</span>
                      <span className="text-muted">{n}</span>
                      <span className={s.includes("✓") ? "text-lime/80" : "text-[#8fa4ff]"}>{s}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px] text-muted">
                  {["id_lead: uuid", "pipeline_stage", "encryption_aes"].map((c) => (
                    <div key={c} className="truncate rounded border border-white/[0.06] bg-black/30 px-1.5 py-1 text-center">
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* LAYER_02 · Cognitive LLM v4.5 */}
              <div
                ref={layerIARef}
                className="absolute inset-0 flex h-full w-full flex-col gap-3 overflow-hidden rounded-2xl border border-blue/25 bg-[#111435]/75 p-4 shadow-[0_24px_70px_rgba(52,73,255,.14)] backdrop-blur-xl md:p-5"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center justify-between border-b border-blue/15 pb-2.5">
                  <span className="font-mono text-[11px] tracking-wider text-[#8fa4ff]">Layer_02 · Cognitive LLM v4.5</span>
                  <span className="rounded-full border border-blue/30 bg-blue/20 px-2 py-0.5 font-mono text-[9px] text-[#b8c0ff]">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-blue/20 bg-blue/10 px-2.5 py-2">
                    <div className="font-mono text-[9px] text-[#8fa4ff]">Score predictivo</div>
                    <div className="disp mt-1 text-[20px] text-ink">87<span className="text-[12px] text-muted">/100</span></div>
                  </div>
                  <div className="rounded-lg border border-lime/20 bg-lime/[0.07] px-2.5 py-2">
                    <div className="font-mono text-[9px] text-muted">Next best action</div>
                    <div className="mt-1 text-[12px] font-semibold text-lime">Llamar · hoy 10:00</div>
                  </div>
                </div>

                <div className="h-14 w-full opacity-80">
                  <svg className="h-full w-full fill-none" viewBox="0 0 400 80" aria-hidden>
                    <path d="M8,50 Q70,18 140,42 T280,28 T392,48" stroke="#3449ff" strokeOpacity="0.55" strokeWidth="1.5" />
                    <path d="M8,55 Q90,62 160,38 T300,52 T392,36" stroke="#c1ff28" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="140" cy="42" r="3" fill="#8fa4ff" />
                    <circle cx="280" cy="28" r="3" fill="#c1ff28" />
                  </svg>
                </div>

                <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden">
                  {[
                    ["Priorizar Grupo Vilar", "prob. cierre 72%"],
                    ["Reasignar zona norte", "carga −18%"],
                    ["Recordatorio auto · 3 leads", "cola activa"],
                  ].map(([t, m]) => (
                    <div key={t} className="flex items-center justify-between rounded-md border border-blue/15 bg-blue/[0.07] px-2.5 py-1.5">
                      <span className="text-[11px] font-medium text-[#c9cce8]">{t}</span>
                      <span className="font-mono text-[9px] text-[#8fa4ff]">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LAYER_03 · Dashboard UI */}
              <div
                ref={layerUIRef}
                className="absolute inset-0 flex h-full w-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/12 bg-[#171b45]/70 p-4 shadow-[0_40px_80px_rgba(5,6,26,.7)] backdrop-blur-2xl md:p-5"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-white/20" />
                      <span className="h-2 w-2 rounded-full bg-white/20" />
                      <span className="h-2 w-2 rounded-full bg-lime/80" />
                    </div>
                    <span className="font-mono text-[10px] text-muted">://tuempresa.com / dashboard</span>
                  </div>
                  <span className="rounded-full bg-lime/15 px-2 py-0.5 font-mono text-[9px] text-lime">+ Nueva</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      ["24.8%", "Conversión", false],
                      ["99.9%", "Autos", true],
                      ["14 min", "Respuesta", false],
                      ["€186k", "Pipeline", false],
                    ] as const
                  ).map(([v, l, hot]) => (
                    <div
                      key={l}
                      className={`rounded-lg border p-2 ${hot ? "border-lime/25 bg-lime/[0.07]" : "border-white/[0.08] bg-white/[0.04]"}`}
                    >
                      <div className={`disp text-[14px] leading-none md:text-[15px] ${hot ? "text-lime" : "text-ink"}`}>{v}</div>
                      <div className="mt-1 font-mono text-[8px] uppercase tracking-wider text-muted">{l}</div>
                    </div>
                  ))}
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.5 overflow-hidden">
                  {[
                    { t: "Contacto", n: "4", cards: ["Talleres Mendoza", "Panadería Souto"] },
                    { t: "Presupuesto", n: "5", hot: true, cards: ["Grupo Vilar", "Óptica Coruña"] },
                    { t: "Firmado", n: "2", cards: ["Autos Bergantiños", "Náutica Sada"] },
                  ].map((col) => (
                    <div
                      key={col.t}
                      className={`flex flex-col gap-1 rounded-lg border p-1.5 ${col.hot ? "border-lime/30 bg-lime/[0.04]" : "border-white/[0.07] bg-white/[0.02]"}`}
                    >
                      <div className="flex items-center justify-between px-0.5">
                        <span className={`font-mono text-[8px] uppercase tracking-wider ${col.hot ? "text-lime" : "text-muted"}`}>{col.t}</span>
                        <span className="font-mono text-[8px] text-ink/70">{col.n}</span>
                      </div>
                      {col.cards.map((c) => (
                        <div key={c} className="rounded-md bg-[#1d2252]/90 px-1.5 py-1.5 text-[9px] font-medium leading-tight text-ink/90">
                          {c}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
