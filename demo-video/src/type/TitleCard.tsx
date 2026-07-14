import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, deva, display, ui } from "../fonts";

/**
 * Act 3 title + CTA, built in Remotion. The brand mark settles, a gold rule
 * draws across, the tagline rises, then the URL + "Walk the epic." resolve and
 * hold. Product-clean — no personal attribution.
 */
export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mark = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 44 });
  const rule = interpolate(frame, [26, 64], [0, 620], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tag = interpolate(frame, [50, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const url = interpolate(frame, [78, 104], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cta = interpolate(frame, [96, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(120% 120% at 50% 42%, #10131d 0%, #090b12 58%, #05060a 100%)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: deva,
            color: COLOR.gold,
            fontSize: 30,
            letterSpacing: "0.5em",
            opacity: mark * 0.85,
            marginBottom: 24,
            paddingLeft: "0.5em",
          }}
        >
          महाभारत
        </div>
        <div
          style={{
            fontFamily: display,
            color: COLOR.bone,
            fontSize: 104,
            fontWeight: 500,
            letterSpacing: "0.3em",
            paddingLeft: "0.3em",
            opacity: mark,
            transform: `translateY(${interpolate(mark, [0, 1], [22, 0])}px)`,
          }}
        >
          MAHABHARAT
        </div>
      </div>

      <div
        style={{
          width: rule,
          height: 1,
          background: `linear-gradient(to right, transparent, ${COLOR.gold}, transparent)`,
          margin: "32px 0",
        }}
      />

      <div
        style={{
          fontFamily: display,
          fontStyle: "italic",
          color: COLOR.ash,
          fontSize: 29,
          opacity: tag,
          transform: `translateY(${interpolate(tag, [0, 1], [12, 0])}px)`,
          marginBottom: 44,
        }}
      >
        Eighteen books. Eighteen armies. Eighteen days of war.
      </div>

      <div
        style={{
          fontFamily: ui,
          color: COLOR.goldBright,
          fontSize: 34,
          letterSpacing: "0.22em",
          fontWeight: 500,
          opacity: url,
          transform: `translateY(${interpolate(url, [0, 1], [12, 0])}px)`,
        }}
      >
        mahabharat-ten.vercel.app
      </div>

      <div
        style={{
          fontFamily: ui,
          color: COLOR.ash,
          fontSize: 17,
          letterSpacing: "0.42em",
          marginTop: 22,
          opacity: cta,
        }}
      >
        WALK THE EPIC
      </div>
    </AbsoluteFill>
  );
};
