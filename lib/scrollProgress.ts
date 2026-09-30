"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Pins `pinRef` for `distance` viewport heights and exposes the scrub
 * progress (0..1) through a mutable ref that R3F's useFrame can read
 * every frame without re-rendering React.
 */
export function usePinnedProgress(
  pinRef: React.RefObject<HTMLElement | null>,
  distance = 4,
  onUpdate?: (p: number) => void,
) {
  const progress = useRef(0);

  useLayoutEffect(() => {
    const el = pinRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: () => `+=${distance * window.innerHeight}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        progress.current = self.progress;
        onUpdate?.(self.progress);
      },
    });
    // Pins are created by several components in mount order; sorting keeps
    // ScrollTrigger's pin spacers measured top-to-bottom.
    ScrollTrigger.sort();
    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinRef, distance]);

  return progress;
}

export const damp = (current: number, target: number, lambda: number, dt: number) =>
  gsap.utils.interpolate(current, target, 1 - Math.exp(-lambda * dt));
