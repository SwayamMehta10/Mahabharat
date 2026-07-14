import React from "react";
import { useCurrentFrame } from "remotion";
import { FrameCanvas } from "../lib/FrameCanvas";
import { WIDTH, HEIGHT, COLOR } from "../config";
import { hash2, easeIn, clamp01 } from "../lib/field";
import { drawGlow, glowSprite } from "../lib/glow";

const N = 420;
const GOLD = "228,198,106";
const VERM = "207,74,31";

/**
 * Two hosts rush from the wings and collide at center — the "war declared"
 * beat. Points converge with turbulence, then burst outward in a bright clash.
 */
export const ParticleArmies: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const local = useCurrentFrame();
  const draw = React.useCallback(
    (ctx: CanvasRenderingContext2D, frame: number, w: number, h: number) => {
      const p = clamp01(frame / durationInFrames);
      const converge = easeIn(clamp01(p / 0.72)); // meet ~72% in
      const clash = clamp01((p - 0.72) / 0.28);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const goldS = glowSprite(GOLD);
      const vermS = glowSprite(VERM);
      for (let side = 0; side < 2; side++) {
        const gold = side === 0;
        const dir = gold ? 1 : -1;
        for (let i = 0; i < N; i++) {
          const sy = hash2(i, side + 1) * 0.86 + 0.07;
          const startX = gold ? -0.1 - hash2(i, 7) * 0.25 : 1.1 + hash2(i, 7) * 0.25;
          const meetX = 0.5 - dir * (0.02 + hash2(i, 8) * 0.04);
          let x = startX + (meetX - startX) * converge;
          let y = sy;
          // turbulence
          x += Math.sin(frame * 0.05 + i) * 0.004;
          y += Math.cos(frame * 0.045 + i * 1.7) * 0.006;
          // clash burst: fling outward from center
          if (clash > 0) {
            const ang = hash2(i, 9) * Math.PI * 2;
            const burst = clash * clash * (0.12 + hash2(i, 10) * 0.22);
            x += Math.cos(ang) * burst;
            y += Math.sin(ang) * burst;
          }
          const bright = i % 7 === 0;
          const alpha = (bright ? 0.9 : 0.55) * (1 - clash * 0.5);
          drawGlow(ctx, gold ? goldS : vermS, x * w, y * h, bright ? 10 : 5, alpha);
        }
      }
      ctx.globalAlpha = 1;
      // clash flash at center
      if (clash > 0) {
        const flash = Math.sin(clash * Math.PI) * 0.5;
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.35);
        g.addColorStop(0, `rgba(255,236,180,${flash})`);
        g.addColorStop(1, "rgba(255,236,180,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();
    },
    [durationInFrames]
  );

  const fade = Math.min(1, local / 8, (durationInFrames - local) / 8);
  return <FrameCanvas draw={draw} width={WIDTH} height={HEIGHT} style={{ backgroundColor: COLOR.void, opacity: Math.max(0, fade) }} />;
};
