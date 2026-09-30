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
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_70%_60%_at_60%_40%,rgba(52,73,255,.22),transparent_60%),#0b0d24]">
        <div className="absolute inset-0">
          <CanvasBoundary><Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            camera={{ fov: 40, near: 10, far: 10000, position: [-130, 55, 460] }}
          >
            <DevicesScene progress={progress} />
          </Canvas></CanvasBoundary>
        </div>

        {/* copy panel */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 z-10 flex items-end md:items-center">
          <div className="wrap pb-10 md:pb-0">
            <div className="max-w-[420px] rounded-3xl border border-white/10 bg-navy/60 p-7 backdrop-blur-xl md:p-8">
              <div className="mono eyebrow text-muted">Un CRM, tres puestos de trabajo</div>
              <div className="relative mt-6 min-h-[190px]">
                {STOPS.map((s, i) => (
                  <div
                    key={s.t}
                    className="absolute inset-0 flex flex-col gap-3 transition-all duration-500"
                    style={{ opacity: stop === i ? 1 : 0, transform: `translateY(${stop === i ? 0 : 14}px)` }}
                  >
                    <h2 className="disp text-[38px] md:text-[44px]">{s.t}</h2>
                    <p className="text-[16px] leading-relaxed text-[#c9cce8] md:text-[17px]">{s.d}</p>
                    <div className="mono mt-1">{s.k}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2.5" aria-hidden="true">
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
