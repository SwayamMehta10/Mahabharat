import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FrameCanvas } from "../lib/FrameCanvas";
import { WIDTH, HEIGHT, COLOR } from "../config";
import { deva } from "../fonts";
import { toDevanagari } from "../type/DayCounter";
import { easeOut, clamp01 } from "../lib/field";

/**
 * The Kalachakra — an 18-spoke wheel of light that assembles out of embers and
 * turns slowly. Spokes ignite one by one; the rim carries the 18 parva numerals
 * in Devanagari. The "eighteen" motif as pure graphic.
 */
export const KalachakraWheel: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const rot = frame * 0.0016;
  const build = easeOut(clamp01(frame / 70));
  const R = Math.min(WIDTH, HEIGHT) * 0.34;

  const draw = React.useCallback(
    (ctx: CanvasRenderingContext2D, f: number, w: number, h: number) => {
      const cxx = w / 2, cyy = h / 2;
      const rr = Math.min(w, h) * 0.34;
      const rotv = f * 0.0016;
      const buildv = easeOut(clamp01(f / 70));
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      // hub glow
      const hub = ctx.createRadialGradient(cxx, cyy, 0, cxx, cyy, rr * 0.9);
      hub.addColorStop(0, `rgba(228,198,106,${0.16 * buildv})`);
      hub.addColorStop(1, "rgba(228,198,106,0)");
      ctx.fillStyle = hub;
      ctx.fillRect(0, 0, w, h);
      // 18 spokes, igniting in sequence
      for (let i = 0; i < 18; i++) {
        const lit = clamp01((buildv * 20 - i) / 2);
        if (lit <= 0) continue;
        const a = rotv + (i / 18) * Math.PI * 2;
        const x1 = cxx + Math.cos(a) * rr * 0.16;
        const y1 = cyy + Math.sin(a) * rr * 0.16;
        const x2 = cxx + Math.cos(a) * rr;
        const y2 = cyy + Math.sin(a) * rr;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(228,198,106,${0.5 * lit})`);
        grad.addColorStop(1, `rgba(201,164,55,${0.12 * lit})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      // two rims
      for (const [rad, alpha] of [[rr, 0.4], [rr * 0.16, 0.5]] as [number, number][]) {
        ctx.strokeStyle = `rgba(228,198,106,${alpha * buildv})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cxx, cyy, rad, 0, Math.PI * 2 * buildv);
        ctx.stroke();
      }
      ctx.restore();
    },
    []
  );

  // Devanagari numerals on the rim (DOM so the font renders crisply)
  const numeralOpacity = interpolate(build, [0.6, 1], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <FrameCanvas draw={draw} width={WIDTH} height={HEIGHT} />
      <AbsoluteFill>
        {Array.from({ length: 18 }, (_, i) => {
          const a = rot + (i / 18) * Math.PI * 2;
          const x = cx + Math.cos(a) * R * 1.1;
          const y = cy + Math.sin(a) * R * 1.1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "translate(-50%,-50%)",
                fontFamily: deva,
                fontSize: 22,
                color: COLOR.gold,
                opacity: numeralOpacity,
              }}
            >
              {toDevanagari(i + 1)}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
