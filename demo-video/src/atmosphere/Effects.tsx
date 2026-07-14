import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FrameCanvas } from "../lib/FrameCanvas";
import { hash2 } from "../lib/field";

/** Soft god-ray shafts sweeping slowly, additive gold. */
export const LightRays: React.FC<{ width: number; height: number; intensity?: number }> = ({
  width,
  height,
  intensity = 0.5,
}) => {
  const draw = React.useCallback(
    (ctx: CanvasRenderingContext2D, frame: number, w: number, h: number) => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const cx = w * 0.5;
      const cy = h * -0.1;
      for (let i = 0; i < 5; i++) {
        const baseAng = -Math.PI / 2 + (i - 2) * 0.16 + Math.sin(frame * 0.004 + i) * 0.03;
        const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(baseAng) * h * 1.5, cy + Math.sin(baseAng) * h * 1.5);
        grad.addColorStop(0, `rgba(228,198,106,${0.06 * intensity})`);
        grad.addColorStop(1, "rgba(228,198,106,0)");
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(baseAng + Math.PI / 2);
        ctx.fillStyle = grad;
        ctx.fillRect(-70, 0, 140, h * 1.6);
        ctx.restore();
      }
      ctx.restore();
    },
    [intensity]
  );
  return <FrameCanvas draw={draw} width={width} height={height} />;
};

/** Film grain + subtle gate weave, animated per frame. Reuses one offscreen
 *  buffer (per render page) to avoid per-frame canvas allocation. */
let grainOff: HTMLCanvasElement | null = null;
export const Grain: React.FC<{ width: number; height: number; intensity?: number }> = ({
  width,
  height,
  intensity = 0.06,
}) => {
  const draw = React.useCallback(
    (ctx: CanvasRenderingContext2D, frame: number, w: number, h: number) => {
      const NW = 288, NH = 162;
      if (!grainOff) {
        grainOff = document.createElement("canvas");
        grainOff.width = NW;
        grainOff.height = NH;
      }
      const octx = grainOff.getContext("2d")!;
      const img = octx.createImageData(NW, NH);
      const fx = frame * 17, fy = frame * 31;
      for (let i = 0; i < NW * NH; i++) {
        // compress toward mid-grey so `overlay` yields fine film grain, not noise
        const v = (0.38 + hash2((i % NW) + fx, ((i / NW) | 0) + fy) * 0.24) * 255;
        const o = i * 4;
        img.data[o] = img.data[o + 1] = img.data[o + 2] = v;
        img.data[o + 3] = 255;
      }
      octx.putImageData(img, 0, 0);
      ctx.save();
      ctx.globalAlpha = intensity;
      ctx.globalCompositeOperation = "overlay";
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(grainOff, 0, 0, w, h);
      ctx.restore();
    },
    [intensity]
  );
  return <FrameCanvas draw={draw} width={width} height={height} />;
};

/** Static cinematic vignette (pure CSS). */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.9 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(120% 100% at 50% 45%, transparent 45%, rgba(5,6,10,${strength}) 100%)`,
    }}
  />
);

/** Unifying grade: an indigo multiply floor + a warm-gold screen ceiling. */
export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.02);
  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(12,15,28,0.25), rgba(5,6,10,0.35))",
          mixBlendMode: "multiply",
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: `radial-gradient(80% 70% at 50% 40%, rgba(201,164,55,${0.05 + pulse * 0.03}), transparent 70%)`,
          mixBlendMode: "screen",
        }}
      />
    </>
  );
};
