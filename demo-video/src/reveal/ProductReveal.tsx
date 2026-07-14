import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Series,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLOR, ui } from "../fonts";
import { BrowserFrame } from "./BrowserFrame";
import { easeOut } from "../lib/field";

/** small feature label, bottom-left */
const Signpost: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const p = easeOut(interpolate(frame, [4, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div
      style={{
        position: "absolute",
        left: "7%",
        bottom: "9%",
        fontFamily: ui,
        fontSize: 24,
        letterSpacing: "0.28em",
        color: COLOR.bone,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [12, 0])}px)`,
        textShadow: "0 2px 20px rgba(0,0,0,0.8)",
      }}
    >
      {text}
    </div>
  );
};

const Clip: React.FC<{ src: string; trimBefore: number; scale?: number }> = ({ src, trimBefore, scale = 1.06 }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void, opacity: fadeIn }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo src={staticFile(src)} trimBefore={trimBefore} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Act 2 — "and there's a place to walk all of it." Opens with the real site
 * inside a browser frame (signals "website"), then a fast full-bleed montage of
 * the actual features. Uses the captured site clips; here the UI is desirable.
 */
export const ProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  // browser frame entrance for the first ~90 frames, then it hands to full-bleed
  const enter = easeOut(interpolate(frame, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <Series>
        <Series.Sequence durationInFrames={96}>
          <AbsoluteFill style={{ background: "radial-gradient(120% 120% at 50% 45%, #0c0f18, #05060a)" }}>
            <BrowserFrame scale={interpolate(enter, [0, 1], [0.92, 1])} opacity={enter}>
              <OffthreadVideo src={staticFile("clips/03-war.mp4")} trimBefore={120} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </BrowserFrame>
            <Signpost text="AN IMMERSIVE ATLAS OF THE WHOLE EPIC" />
          </AbsoluteFill>
        </Series.Sequence>

        <Series.Sequence durationInFrames={96}>
          <Clip src="clips/04-strategy.mp4" trimBefore={255} />
          <Signpost text="EVERY BATTLE FORMATION" />
        </Series.Sequence>

        <Series.Sequence durationInFrames={96}>
          <Clip src="clips/05-tree.mp4" trimBefore={60} />
          <Signpost text="THE WHOLE BLOODLINE" />
        </Series.Sequence>

        <Series.Sequence durationInFrames={96}>
          <Clip src="clips/06-karna.mp4" trimBefore={24} />
          <Signpost text="NINE LIVES, RETOLD" />
        </Series.Sequence>

        <Series.Sequence durationInFrames={96}>
          <Clip src="clips/01-gita.mp4" trimBefore={60} />
          <Signpost text="THE SONG OF THE LORD" />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
