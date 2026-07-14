import React, { useEffect, useRef } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  width: number,
  height: number
) => void;

/**
 * A canvas that redraws deterministically from the current frame. Each frame's
 * draw is gated with delayRender so the offline renderer captures a completed
 * canvas, never a stale or blank one. All procedural set-pieces (vyuha fields,
 * particle armies, embers, the kalachakra) draw through this.
 */
export const FrameCanvas: React.FC<{
  draw: DrawFn;
  width: number;
  height: number;
  style?: React.CSSProperties;
}> = ({ draw, width, height, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();

  useEffect(() => {
    const handle = delayRender(`canvas-${frame}`);
    const canvas = ref.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        draw(ctx, frame, width, height);
      }
    }
    continueRender(handle);
    // redraw whenever the frame changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, width, height]);

  return (
    <AbsoluteFill style={style}>
      <canvas ref={ref} width={width} height={height} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
