import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, deva } from "../fonts";
import { easeOut } from "../lib/field";

/**
 * A single Devanagari word that blooms in like ink resolving out of the void —
 * blur → sharp, scale settle, gold glow — then dissolves. Used for धर्म / काल /
 * अष्टादश / कालोऽस्मि accents.
 */
export const DevanagariBloom: React.FC<{
  text: string;
  inFrame?: number;
  outFrame?: number;
  size?: number;
  color?: string;
  y?: number;
}> = ({ text, inFrame = 0, outFrame = 90, size = 150, color = COLOR.goldBright, y = 0.5 }) => {
  const frame = useCurrentFrame();
  const p = easeOut(interpolate(frame, [inFrame, inFrame + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const exit = interpolate(frame, [outFrame - 22, outFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blur = interpolate(p, [0, 1], [26, 0]);
  const scale = interpolate(p, [0, 1], [0.86, 1]);
  const opacity = Math.min(p, exit);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: `${y * 100}%`,
          transform: `translateY(-50%) scale(${scale})`,
          fontFamily: deva,
          fontSize: size,
          color,
          opacity,
          filter: `blur(${blur}px)`,
          textShadow: `0 0 ${40 * p}px rgba(228,198,106,${0.5 * p}), 0 0 8px rgba(0,0,0,0.6)`,
          paddingLeft: "0.1em",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
