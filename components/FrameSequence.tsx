"use client";

import { useEffect, useRef } from "react";
import {
  IMMERSION_FRAME_COUNT,
  IMMERSION_FRAME_HEIGHT,
  IMMERSION_FRAME_WIDTH,
  immersionFrameIndex,
  immersionFrameSrc,
} from "@/lib/immersionFrames";

type Props = {
  progress: React.MutableRefObject<number>;
  className?: string;
};

/**
 * Lightweight Apple-style scrub: preloads WebP stills and paints the
 * frame that matches scroll progress onto a single canvas.
 */
export default function FrameSequence({ progress, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const drawnRef = useRef(-1);
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const frames: (HTMLImageElement | null)[] = Array(IMMERSION_FRAME_COUNT + 1).fill(null);
    framesRef.current = frames;

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (!cancelled) frames[i] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = immersionFrameSrc(i);
      });

    // First frame immediately, then the rest in parallel batches.
    void (async () => {
      await load(1);
      if (cancelled) return;
      readyRef.current = true;
      draw(1);

      const rest: Promise<void>[] = [];
      for (let i = 2; i <= IMMERSION_FRAME_COUNT; i++) rest.push(load(i));
      await Promise.all(rest);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (readyRef.current) {
        const idx = immersionFrameIndex(progress.current);
        if (idx !== drawnRef.current) draw(idx);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  function draw(index: number) {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // cover
    const scale = Math.max(w / IMMERSION_FRAME_WIDTH, h / IMMERSION_FRAME_HEIGHT);
    const dw = IMMERSION_FRAME_WIDTH * scale;
    const dh = IMMERSION_FRAME_HEIGHT * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.fillStyle = "#05061a";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);
    drawnRef.current = index;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={IMMERSION_FRAME_WIDTH}
      height={IMMERSION_FRAME_HEIGHT}
      aria-hidden
    />
  );
}
