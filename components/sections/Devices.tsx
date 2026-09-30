"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { usePinnedProgress } from "@/lib/scrollProgress";
import CanvasBoundary from "@/components/CanvasBoundary";

const DevicesScene = dynamic(() => import("@/components/scenes/DevicesScene"), { ssr: false });

const STOPS = [
  { k: "Portátil · vista de dirección", t: "En el despacho", d: "Dirección ve el pipeline completo, los informes del mes y quién está tocando cada cuenta. Sin exportar nada." },
  { k: "Tablet · vista de zona", t: "En la furgoneta", d: "El jefe de zona reparte la ruta del día, reasigna visitas y firma contratos con el cliente delante." },
  { k: "Móvil · vista de campo", t: "En la puerta del cliente", d: "El comercial registra la visita en veinte segundos, sin cobertura si hace falta. Se sincroniza sola al volver al coche." },
];

export default function Devices() {
  const pinRef = useRef<HTMLDivElement>(null);
  const [stop, setStop] = useState(0);
  const progress = usePinnedProgress(pinRef, 4, (p) => {
    const next = p < 0.31 ? 0 : p < 0.73 ? 1 : 2;
    setStop((cur) => (cur === next ? cur : next));
  });

  return (
    <section id="dispositivos" aria-label="Un CRM, tres puestos de trabajo">
      <div
        ref={pinRef}
        className="relative h-[100svh] w-full overflow-hidden bg-[radial-gradient(ellipse_70%_60%_at_60%_40%,rgba(52,73,255,.22),transparent_60%),#0b0d24]"
      >
        {/* Full-bleed canvas — devices fill the viewport and sit behind the copy */}
        <div className="absolute inset-0">
          <CanvasBoundary>
            <Canvas
              dpr={[1, 1.6]}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              camera={{ fov: 42, near: 10, far: 10000, position: [-130, 55, 460] }}
              style={{ width: "100%", height: "100%" }}
            >
              <DevicesScene progress={progress} />
            </Canvas>
          </CanvasBoundary>
        </div>

        {/* Soft bottom veil so type stays readable while the device peeks through */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[48%] md:hidden"
          style={{
            background:
              "linear-gradient(to top, rgba(11,13,36,.92) 0%, rgba(11,13,36,.55) 42%, transparent 100%)",
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-auto z-10 flex items-end md:inset-0 md:items-center">
          <div className="wrap w-full pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-2 md:pb-0 md:pt-0">
            <div className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-navy/45 p-5 backdrop-blur-md md:bg-navy/60 md:p-8 md:backdrop-blur-xl">
              <div className="mono eyebrow text-muted">Un CRM, tres puestos de trabajo</div>
              <div className="relative mt-4 min-h-[148px] md:mt-6 md:min-h-[190px]">
                {STOPS.map((s, i) => (
                  <div
                    key={s.t}
                    className="absolute inset-0 flex flex-col gap-2 transition-all duration-500 md:gap-3"
                    style={{ opacity: stop === i ? 1 : 0, transform: `translateY(${stop === i ? 0 : 14}px)` }}
                  >
                    <h2 className="disp text-[28px] leading-[1.05] md:text-[44px]">{s.t}</h2>
                    <p className="text-[15px] leading-relaxed text-[#c9cce8] md:text-[17px]">{s.d}</p>
                    <div className="mono mt-0.5 md:mt-1">{s.k}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2.5 md:mt-6" aria-hidden="true">
                {STOPS.map((_, i) => (
                  <span key={i} className={`h-2 rounded-full transition-all duration-400 ${stop === i ? "w-8 bg-ink" : "w-2 bg-white/20"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
