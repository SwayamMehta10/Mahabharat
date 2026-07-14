import React from "react";
import { useCurrentFrame } from "remotion";
import { FrameCanvas } from "../lib/FrameCanvas";
import { WIDTH, HEIGHT, COLOR } from "../config";
import { DAY_FORMATIONS, easeInOut, vyuhaPoint } from "../lib/field";
import { drawGlow, glowSprite } from "../lib/glow";

const PER_HOST = 280;
const GOLD = "201,164,55";
const VERM = "207,74,31";

/**
 * The two hosts as drifting point clouds, morphing through a sequence of war-day
 * formations. Points flow from one vyuha to the next (position lerp), so the
 * chakravyuha spiral, the needle, the makara jaws etc. transform into one
 * another — the war montage's backbone. Additive blending gives the ember glow.
 */
export const VyuhaField: React.FC<{
  days: number[];
  holdFrames?: number;
  morphFrames?: number;
  durationInFrames?: number;
  pointScale?: number;
}> = ({ days, holdFrames = 40, morphFrames = 24, durationInFrames = 120, pointScale = 1 }) => {
  const local = useCurrentFrame();

  const draw = React.useCallback(
    (ctx: CanvasRenderingContext2D, frame: number, w: number, h: number) => {
      const time = frame * 0.016;

      // which formation pair are we on, and the morph amount into the next
      const seg = holdFrames + morphFrames;
      const total = days.length * seg;
      const tt = days.length === 1 ? 0 : frame % total;
      const idx = days.length === 1 ? 0 : Math.floor(tt / seg);
      const within = tt - idx * seg;
      const morph = days.length === 1 ? 0 : easeInOut(Math.max(0, Math.min(1, (within - holdFrames) / morphFrames)));
      const fromDay = days[idx];
      const toDay = days[(idx + 1) % days.length];
      const [pfA, kfA] = DAY_FORMATIONS[fromDay];
      const [pfB, kfB] = DAY_FORMATIONS[toDay];

      // slow camera breathe/push
      const camScale = 1 + 0.06 * (frame / Math.max(1, durationInFrames)) +
        0.012 * Math.sin(time * 0.5);
      const cx = w / 2, cy = h / 2;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const R = Math.min(w, h) * 0.9 * camScale; // field radius in px
      const goldS = glowSprite(GOLD);
      const vermS = glowSprite(VERM);

      for (let i = 0; i < PER_HOST * 2; i++) {
        const pandava = i < PER_HOST;
        const j = pandava ? i : i - PER_HOST;
        const facing: 1 | -1 = pandava ? 1 : -1;
        const [ax, ay] = vyuhaPoint(pandava ? pfA : kfA, j, PER_HOST, time, facing);
        const [bx, by] = vyuhaPoint(pandava ? pfB : kfB, j, PER_HOST, time, facing);
        const nx = ax + (bx - ax) * morph;
        const ny = ay + (by - ay) * morph;
        const x = cx + (nx - 0.5) * R;
        const y = cy + (ny - 0.5) * R;

        const bright = i % 9 === 0;
        const rad = (bright ? 11 : 5) * pointScale;
        const alpha = bright ? 0.95 : 0.6;
        drawGlow(ctx, pandava ? goldS : vermS, x, y, rad, alpha);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    },
    [days, holdFrames, morphFrames, durationInFrames, pointScale]
  );

  return (
    <FrameCanvas
      draw={draw}
      width={WIDTH}
      height={HEIGHT}
      style={{ backgroundColor: COLOR.void, opacity: fadeEdges(local, durationInFrames) }}
    />
  );
};

/** gentle fade in/out at the field's own edges */
function fadeEdges(f: number, dur: number): number {
  const inF = Math.min(1, f / 14);
  const outF = Math.min(1, (dur - f) / 14);
  return Math.max(0, Math.min(inF, outF));
}
