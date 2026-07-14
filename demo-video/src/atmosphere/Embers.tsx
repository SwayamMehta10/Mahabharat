import React from "react";
import { FrameCanvas } from "../lib/FrameCanvas";
import { hash2 } from "../lib/field";
import { drawGlow, glowSprite } from "../lib/glow";

/**
 * Drifting ember/spark particles, fully deterministic from the frame. Each
 * ember has a fixed seed → its path (rise or fall + noise sway), size and
 * flicker are reproducible. `fall` reverses gravity for the "ash" beats.
 */
export const Embers: React.FC<{
  width: number;
  height: number;
  count?: number;
  fall?: boolean;
  color?: string;
  intensity?: number;
}> = ({ width, height, count = 90, fall = false, color = "228,198,106", intensity = 1 }) => {
  const draw = React.useCallback(
    (ctx: CanvasRenderingContext2D, frame: number, w: number, h: number) => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const sprite = glowSprite(color);
      const dir = fall ? 1 : -1;
      for (let i = 0; i < count; i++) {
        const seedX = hash2(i, 1);
        const speed = 0.15 + hash2(i, 2) * 0.5;
        const size = 0.6 + hash2(i, 3) * 2.2;
        const sway = 30 + hash2(i, 4) * 90;
        const life = 220 + hash2(i, 5) * 260;
        const birth = hash2(i, 6) * life;
        const age = (frame + birth) % life;
        const p = age / life; // 0..1 along its travel
        const baseY = fall ? -0.1 + p * 1.2 : 1.1 - p * 1.2;
        const x = (seedX + Math.sin((age * 0.02 + i) * speed) * (sway / w)) * w;
        const y = baseY * h;
        const flick = 0.4 + 0.6 * Math.abs(Math.sin(age * 0.2 + i));
        const alpha = Math.sin(p * Math.PI) * flick * intensity; // fade in+out over life
        if (alpha <= 0) continue;
        void dir;
        drawGlow(ctx, sprite, x, y, size * 3.5, alpha);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    },
    [count, fall, color, intensity]
  );

  return <FrameCanvas draw={draw} width={width} height={height} />;
};
