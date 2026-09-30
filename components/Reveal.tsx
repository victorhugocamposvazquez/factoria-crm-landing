"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Reveals its `[data-rv]` descendants with a soft stagger the first time they scroll into view. */
export default function Reveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-rv]");
      if (!items.length) return;
      gsap.set(items, { y: 32, autoAlpha: 0 });
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", stagger: 0.08 }),
      });
    },
    { scope: root },
  );
  return (
    <section ref={root} id={id} className={className}>
      {children}
    </section>
  );
}
