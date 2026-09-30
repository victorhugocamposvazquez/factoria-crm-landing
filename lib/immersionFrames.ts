/** Scroll-scrubbed immersion sequence (WebP stills from the cinematic MP4). */
export const IMMERSION_FRAME_COUNT = 121;
export const IMMERSION_FRAME_WIDTH = 1280;
export const IMMERSION_FRAME_HEIGHT = 668;

export function immersionFrameSrc(index: number) {
  const n = String(Math.min(IMMERSION_FRAME_COUNT, Math.max(1, index))).padStart(3, "0");
  return `/immersion/frame-${n}.webp`;
}

export function immersionFrameIndex(progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  return 1 + Math.round(t * (IMMERSION_FRAME_COUNT - 1));
}
