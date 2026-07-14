import React from "react";
import { FrameCanvas } from "../lib/FrameCanvas";
import { valueNoise } from "../lib/field";

let smokeOff: HTMLCanvasElement | null = null;

/**
 * Volumetric-ish smoke: sample fbm into a small offscreen buffer (cheap), then
 * upscale with smoothing so it reads as soft drifting fog. Tinted indigo/ash to
 * sit in the site's void. `drift` moves the field; `intensity` its opacity.
 */
export const Smoke: React.FC<{
  width: number;
  height: number;
  intensity?: number;
  tint?: [number, number, number];
  speed?: number;
}> = ({ width, height, intensity = 0.5, tint = [30, 38, 66], speed = 1 }) => {
  const draw = React.useCallback(
    (ctx: CanvasRenderingContext2D, frame: number, w: number, h: number) => {
      const NW = 96, NH = 54;
      const t = frame * 0.006 * speed;
      const buf = ctx.createImageData(NW, NH);
      for (let y = 0; y < NH; y++) {
        for (let x = 0; x < NW; x++) {
          const nx = x * 0.05;
          const ny = y * 0.05;
          let v = 0, a = 0.6, f = 1;
          for (let o = 0; o < 4; o++) {
            v += a * valueNoise(nx * f + t, ny * f - t * 0.6 + o * 10);
            f *= 2.0; a *= 0.5;
          }
          v = Math.max(0, Math.min(1, (v - 0.35) * 1.6));
          const i = (y * NW + x) * 4;
          buf.data[i] = tint[0];
          buf.data[i + 1] = tint[1];
          buf.data[i + 2] = tint[2];
          buf.data[i + 3] = v * 255 * intensity;
        }
      }
      // stage the small buffer, then upscale smoothly (reuse one offscreen)
      if (!smokeOff) {
        smokeOff = document.createElement("canvas");
        smokeOff.width = NW;
        smokeOff.height = NH;
      }
      smokeOff.getContext("2d")!.putImageData(buf, 0, 0);
      const off = smokeOff;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.filter = "blur(6px)";
      ctx.drawImage(off, 0, 0, w, h);
      ctx.restore();
    },
    [intensity, tint, speed]
  );

  return <FrameCanvas draw={draw} width={width} height={height} />;
};
