"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const TEXT: [string, boolean][] = [
  ["Los CRM genéricos nacen para vender licencias.", false],
  ["El tuyo nace para vender lo que tú vendes.", true],
  ["Cada campo, cada etapa, cada automatización existe porque tu equipo la necesita.", false],
  ["Y ninguna más.", true],
];

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.fromTo(
        ".mw",
        { color: "rgba(242,243,255,.14)" },
        {
          color: (i, el) => ((el as HTMLElement).dataset.k ? "#ffffff" : "#a2a6c8"),
          stagger: 0.6,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 45%", scrub: 0.6 },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-transparent py-40 md:py-56">
      {/* Soft handoff into immersion — no hard cut */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(17,20,53,.55))" }}
        aria-hidden
      />
      <div className="mono absolute left-6 top-8 md:left-10">
        <div className="wrap !px-0" />
      </div>
      <div className="wrap relative grid gap-10 md:grid-cols-[220px_1fr]">
        <div className="mono eyebrow hidden self-start md:sticky md:top-32 md:inline-flex">Manifiesto</div>
        <p className="disp max-w-[980px] text-[30px] leading-[1.18] font-normal md:text-[52px]">
          {TEXT.map(([sentence, k]) =>
            sentence.split(" ").map((w, i) => (
              <span key={sentence + i} className={`mw mr-[.26em] inline-block ${k ? "font-medium" : "font-light"}`} data-k={k ? "1" : undefined}>
                {w}
              </span>
            )),
          )}
        </p>
      </div>
    </section>
  );
}
