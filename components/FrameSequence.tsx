"use client";

import { useEffect, useRef } from "react";
import {
  IMMERSION_FRAME_COUNT,
  IMMERSION_FRAME_HEIGHT,
  IMMERSION_FRAME_WIDTH,
  immersionFrameIndex,
  immersionFrameSrc,
} from "@/lib/immersionFrames";
import { damp } from "@/lib/scrollProgress";

type Props = {
  progress: React.MutableRefObject<number>;
  className?: string;
};

/**
 * Scroll-scrubbed WebP sequence. Progress is damped so wheel steps
 * never show as hard frame jumps.
 */
export default function FrameSequence({ progress, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const drawnRef = useRef(-1);
  const readyRef = useRef(false);
  const smoothP = useRef(0);
  const lastTs = useRef(0);

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

    void (async () => {
      await load(1);
      if (cancelled) return;
      readyRef.current = true;
      draw(1);

      // Preferential load: mid + end first (visible soon), then fill gaps.
      const order: number[] = [];
      for (let i = 2; i <= IMMERSION_FRAME_COUNT; i++) order.push(i);
      order.sort((a, b) => {
        const da = Math.min(a - 1, IMMERSION_FRAME_COUNT - a);
        const db = Math.min(b - 1, IMMERSION_FRAME_COUNT - b);
        return da - db;
      });
      const concurrency = 8;
      for (let i = 0; i < order.length; i += concurrency) {
        if (cancelled) return;
        await Promise.all(order.slice(i, i + concurrency).map(load));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = (ts: number) => {
      const prev = lastTs.current || ts;
      lastTs.current = ts;
      const dt = Math.min(0.05, (ts - prev) / 1000);
      if (readyRef.current) {
        smoothP.current = damp(smoothP.current, progress.current, 10, dt);
        const idx = immersionFrameIndex(smoothP.current);
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
    // Prefer exact frame; fall back to nearest loaded neighbour so scrub never blanks.
    let img = framesRef.current[index];
    if (!img) {
      for (let d = 1; d < IMMERSION_FRAME_COUNT; d++) {
        img = framesRef.current[index - d] || framesRef.current[index + d];
        if (img) break;
      }
    }
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
    const scale = Math.max(w / IMMERSION_FRAME_WIDTH, h / IMMERSION_FRAME_HEIGHT);
    const dw = IMMERSION_FRAME_WIDTH * scale;
    const dh = IMMERSION_FRAME_HEIGHT * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.fillStyle = "#0b0d24";
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
