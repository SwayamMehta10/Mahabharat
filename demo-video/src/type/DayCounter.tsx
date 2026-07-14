import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, deva, ui } from "../fonts";

const DEVA_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
export const toDevanagari = (n: number): string =>
  String(n).split("").map((d) => DEVA_DIGITS[Number(d)]).join("");

/**
 * The war-day marker: a large Devanagari numeral with a small Latin "DAY N",
 * flashing in each time the day changes. Sits low-corner over the vyuha field.
 */
export const DayCounter: React.FC<{ day: number; inFrame?: number; holdFrames?: number }> = ({
  day,
  inFrame = 0,
  holdFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [inFrame, inFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(frame, [inFrame + holdFrames - 8, inFrame + holdFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = Math.min(p, exit);

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 0 8% 8%" }}>
      <div style={{ opacity, transform: `translateY(${interpolate(p, [0, 1], [16, 0])}px)` }}>
        <div style={{ fontFamily: ui, color: COLOR.vermillion, fontSize: 20, letterSpacing: "0.4em" }}>
          DAY {day}
        </div>
        <div style={{ fontFamily: deva, color: COLOR.goldBright, fontSize: 96, lineHeight: 1, textShadow: "0 0 30px rgba(228,198,106,0.4)" }}>
          {toDevanagari(day)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
