import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, display } from "../fonts";
import { easeOut } from "../lib/field";

/**
 * Kinetic line(s) of Cormorant, revealed word-by-word (rise + tracking ease),
 * held, then lifted away. Full-frame composition — anchored by `align`/`y`,
 * not a lower-third caption. Timed relative to its own Sequence.
 */
export const KineticText: React.FC<{
  lines: string[];
  inFrame?: number;
  holdFrames?: number;
  outFrame?: number;
  size?: number;
  align?: "center" | "left";
  y?: number; // 0..1 vertical anchor
  color?: string;
  italic?: boolean;
  weight?: number;
}> = ({
  lines,
  inFrame = 0,
  holdFrames = 60,
  outFrame,
  size = 56,
  align = "center",
  y = 0.5,
  color = COLOR.bone,
  italic = false,
  weight = 400,
}) => {
  const frame = useCurrentFrame();
  const out = outFrame ?? inFrame + holdFrames;
  const words = lines.map((l) => l.split(" "));
  const exit = interpolate(frame, [out - 16, out], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: align === "center" ? "center" : "flex-start",
        padding: "0 12%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: `${y * 100}%`,
          transform: "translateY(-50%)",
          textAlign: align,
          opacity: exit,
          width: align === "center" ? "100%" : "auto",
        }}
      >
        {words.map((lineWords, li) => (
          <div key={li} style={{ lineHeight: 1.22 }}>
            {lineWords.map((word, wi) => {
              const order = li * 6 + wi;
              const start = inFrame + order * 3;
              const p = easeOut(interpolate(frame, [start, start + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    fontFamily: display,
                    fontStyle: italic ? "italic" : "normal",
                    fontWeight: weight,
                    fontSize: size,
                    color,
                    letterSpacing: `${interpolate(p, [0, 1], [0.5, align === "center" ? 0.06 : 0.02])}em`,
                    opacity: p,
                    transform: `translateY(${interpolate(p, [0, 1], [22, 0])}px)`,
                    marginRight: "0.28em",
                    textShadow: "0 2px 34px rgba(0,0,0,0.75)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
