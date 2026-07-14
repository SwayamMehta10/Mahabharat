import React, { useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { WIDTH, HEIGHT, COLOR } from "../config";
import { clamp01, easeInOut } from "../lib/field";

const imgCache = new Map<string, HTMLImageElement>();

/**
 * A painting brought alive: cover-fit with a focal point, a slow depth camera
 * push toward that focal, a graded/darkened surface (to sit in the void), and a
 * reveal fade. Deterministic — everything is a function of the frame. Used only
 * for the emotional painting accents; atmosphere/grade layers sit over it.
 */
export const CinematicPainting: React.FC<{
  src: string; // relative to public/, e.g. "art/draupadi.webp"
  focal?: [number, number]; // 0..1
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number; // extra horizontal drift (fraction)
  durationInFrames: number;
  reveal?: number; // fade in/out length
  grade?: string; // canvas filter
}> = ({
  src,
  focal = [0.5, 0.4],
  zoomFrom = 1.06,
  zoomTo = 1.16,
  panX = 0,
  durationInFrames,
  reveal = 16,
  grade = "saturate(0.9) brightness(0.86) contrast(1.06)",
}) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(imgCache.get(src) ?? null);
  const [handle] = useState(() => delayRender(`img-${src}`));

  useEffect(() => {
    const cached = imgCache.get(src);
    if (cached) {
      setImg(cached);
      continueRender(handle);
      return;
    }
    const image = new Image();
    image.onload = () => {
      imgCache.set(src, image);
      setImg(image);
      continueRender(handle);
    };
    image.onerror = (e) => cancelRender(e);
    image.src = staticFile(src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !img) return;
    const gate = delayRender(`paint-${frame}`);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      const t = clamp01(frame / durationInFrames);
      const zoom = interpolate(easeInOut(t), [0, 1], [zoomFrom, zoomTo]);
      const cover = Math.max(WIDTH / img.width, HEIGHT / img.height) * zoom;
      const dw = img.width * cover;
      const dh = img.height * cover;
      // anchor the focal point, drift a touch over the shot — but clamp so the
      // image always fully covers the frame (no void bleeding in at the edges)
      const fx = focal[0] + panX * (t - 0.5);
      const dx = Math.min(0, Math.max(WIDTH - dw, WIDTH / 2 - dw * fx));
      const dy = Math.min(0, Math.max(HEIGHT - dh, HEIGHT / 2 - dh * focal[1]));
      ctx.filter = grade;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.filter = "none";
    }
    continueRender(gate);
  }, [frame, img, durationInFrames, zoomFrom, zoomTo, panX, focal, grade]);

  const fade =
    Math.min(
      interpolate(frame, [0, reveal], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      interpolate(frame, [durationInFrames - reveal, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    );

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void, opacity: fade }}>
      <canvas ref={ref} width={WIDTH} height={HEIGHT} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
