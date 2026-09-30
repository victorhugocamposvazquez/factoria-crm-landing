"use client";

import { useEffect, useRef } from "react";
import {
  IMMERSION_FRAME_COUNT,
  IMMERSION_FRAME_HEIGHT,
  IMMERSION_FRAME_WIDTH,
  immersionFrameSrc,
} from "@/lib/immersionFrames";
import { damp } from "@/lib/scrollProgress";

type Props = {
  progress: React.MutableRefObject<number>;
  className?: string;
};

function frameAt(frames: (HTMLImageElement | null)[], index: number) {
  const i = Math.min(IMMERSION_FRAME_COUNT, Math.max(1, index));
  let img = frames[i];
  if (img) return img;
  for (let d = 1; d < IMMERSION_FRAME_COUNT; d++) {
    img = frames[i - d] || frames[i + d];
    if (img) return img;
  }
  return null;
}

/**
 * Scroll-scrubbed WebP sequence with fractional crossfade between
 * neighboring frames so the motion stays fluid instead of stepping.
 */
export default function FrameSequence({ progress, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const readyRef = useRef(false);
  const smoothP = useRef(0);
  const lastTs = useRef(0);
  const lastDrawn = useRef(-1);

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
      paint(0);

      const order: number[] = [];
      for (let i = 2; i <= IMMERSION_FRAME_COUNT; i++) order.push(i);
      // Sequential order: scrub starts at the beginning, so load forward first.
      const concurrency = 10;
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
      const dt = Math.min(0.048, (ts - prev) / 1000);
      if (readyRef.current) {
        // Light damp: follows the scrub closely without sticky lag.
        smoothP.current = damp(smoothP.current, progress.current, 18, dt);
        paint(smoothP.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  function paint(p: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const t = Math.min(1, Math.max(0, p));
    const f = 1 + t * (IMMERSION_FRAME_COUNT - 1);
    // Skip microscopic redraws
    if (Math.abs(f - lastDrawn.current) < 0.01) return;
    lastDrawn.current = f;

    const i0 = Math.floor(f);
    const i1 = Math.min(IMMERSION_FRAME_COUNT, i0 + 1);
    const mix = f - i0;
    const a = frameAt(framesRef.current, i0);
    const b = mix > 0.001 ? frameAt(framesRef.current, i1) : null;
    if (!a) return;

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

    ctx.globalAlpha = 1;
    ctx.fillStyle = "#111435";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(a, dx, dy, dw, dh);
    if (b && mix > 0) {
      ctx.globalAlpha = mix;
      ctx.drawImage(b, dx, dy, dw, dh);
      ctx.globalAlpha = 1;
    }
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
