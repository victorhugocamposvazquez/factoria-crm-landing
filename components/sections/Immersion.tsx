"use client";

import { useRef, useState } from "react";
import { usePinnedProgress } from "@/lib/scrollProgress";
import FrameSequence from "@/components/FrameSequence";

const CAPTIONS = [
  "Primero miramos tu negocio desde fuera: cómo llega cada cliente.",
  "Entramos donde ocurre la venta y analizamos cómo trabaja tu equipo.",
  "Detectamos lo que os frena: procesos, hojas de cálculo, dobles registros.",
  "Y diseñamos el CRM a medida de lo que de verdad necesitáis.",
];

export default function Immersion() {
  const pinRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const smooth = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  const progress = usePinnedProgress(pinRef, 5.5, (p) => {
    const el = pinRef.current;
    if (!el) return;
    // Soft letterbox only mid-sequence; keep edges open to blend with navy.
    el.style.setProperty("--bar", p > 0.04 && p < 0.96 ? "4vh" : "0px");
    const next = p < 0.28 ? 0 : p < 0.55 ? 1 : p < 0.82 ? 2 : 3;
    setPhase((cur) => (cur === next ? cur : next));
    if (capRef.current) capRef.current.style.opacity = String(p > 0.02 ? 1 : 0);
    if (headRef.current) {
      const k = smooth(0.06, 0.26, p);
      const H = el.clientHeight;
      const mobile = window.innerWidth < 720;
      const s = 1 - (mobile ? 0.28 : 0.42) * k;
      const parkedTop = mobile ? 92 : 108;
      const naturalTop = (H - headRef.current.offsetHeight) / 2;
      headRef.current.style.transform = `translateY(${((parkedTop - naturalTop) * k).toFixed(1)}px) scale(${s.toFixed(3)})`;
    }
  });

  return (
    <section id="inmersion" aria-label="Nos inundamos de tu proyecto" className="bg-navy">
      <div ref={pinRef} className="letterbox relative h-screen w-full overflow-hidden bg-navy">
        <div className="absolute inset-0">
          <FrameSequence progress={progress} className="h-full w-full" />

          {/* Soft edge frame only — blends into page navy, no deep circular hole */}
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background: [
                "linear-gradient(to bottom, #111435 0%, rgba(17,20,53,.55) 4%, transparent 14%)",
                "linear-gradient(to top, #111435 0%, rgba(17,20,53,.65) 6%, transparent 18%)",
                "linear-gradient(to right, #111435 0%, rgba(17,20,53,.35) 3%, transparent 9%)",
                "linear-gradient(to left, #111435 0%, rgba(17,20,53,.35) 3%, transparent 9%)",
              ].join(", "),
            }}
          />

          {/* Light type veil */}
          <div
            className="pointer-events-none absolute inset-0 z-[2]"
            style={{
              background:
                "linear-gradient(180deg, rgba(17,20,53,.35) 0%, transparent 22%, transparent 62%, rgba(17,20,53,.55) 100%)",
            }}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <div ref={headRef} className="flex flex-col items-center will-change-transform" style={{ transformOrigin: "50% 0%" }}>
            <div className="mono">Nuestro método</div>
            <h2
              className="disp mt-4 text-[11vw] font-bold leading-[0.96] text-ink md:text-[7.5vw]"
              style={{ textShadow: "0 8px 60px rgba(17,20,53,.9), 0 2px 12px rgba(17,20,53,.8)" }}
            >
              Nos inundamos
              <br />
              <span className="font-light text-[#d7d9f2]">de tu proyecto.</span>
            </h2>
          </div>
        </div>

        <div
          ref={capRef}
          className="pointer-events-none absolute inset-x-4 bottom-[calc(10vh+44px)] z-10 grid place-items-center transition-opacity duration-500"
          style={{ opacity: 0 }}
        >
          {CAPTIONS.map((c, i) => (
            <p
              key={c}
              className="disp col-start-1 row-start-1 m-0 max-w-[34ch] text-balance text-center text-[19px] font-normal leading-[1.25] text-ink transition-all duration-500 md:text-[clamp(19px,2.4vw,30px)]"
              style={{
                opacity: phase === i ? 1 : 0,
                transform: `translateY(${phase === i ? 0 : 12}px)`,
                textShadow: "0 4px 30px rgba(17,20,53,.95), 0 1px 8px rgba(17,20,53,.9)",
              }}
            >
              {c}
            </p>
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-[10vh] left-6 z-10 flex items-center gap-4 md:left-10">
          <span className="mono">0{phase + 1} / 04</span>
          <span className="block h-px w-16 bg-white/20">
            <span className="block h-px bg-ink transition-[width] duration-500" style={{ width: `${((phase + 1) / 4) * 100}%` }} />
          </span>
        </div>
      </div>
    </section>
  );
}
