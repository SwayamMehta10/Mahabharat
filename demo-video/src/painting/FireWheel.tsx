import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { COLOR } from "../config";
import { Vignette } from "../atmosphere/Effects";

/**
 * The Vishvarupa fire-wheel — the one reused capture (public/clips/01-gita.mp4).
 * Scaled up to crop the site's corner UI, regraded, and vignetted so it reads
 * as a pure procedural climax, not a screen recording. कालोऽस्मि is already in
 * the source footage at this point.
 */
export const FireWheel: React.FC<{ durationInFrames: number; trimBefore?: number }> = ({
  durationInFrames,
  trimBefore = 270,
}) => {
  const frame = useCurrentFrame();
  const fade = Math.min(1, frame / 16, (durationInFrames - frame) / 20);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void, opacity: Math.max(0, fade) }}>
      <AbsoluteFill style={{ transform: "scale(1.22)" }}>
        <OffthreadVideo
          src={staticFile("clips/01-gita.mp4")}
          trimBefore={trimBefore}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.08) saturate(1.1) brightness(1.04)" }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(60% 50% at 50% 48%, transparent 40%, rgba(9,11,18,0.5) 100%)" }} />
      <Vignette strength={0.9} />
    </AbsoluteFill>
  );
};
