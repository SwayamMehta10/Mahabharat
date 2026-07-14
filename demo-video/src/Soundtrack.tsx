import React from "react";
import { Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import { HAS_MUSIC } from "./config";

/**
 * The user's cinematic track (public/audio/track.mp3, 56s), fading up at the top
 * and out under the closing card. The cut is timed to this track's structure.
 */
export const Soundtrack: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  if (!HAS_MUSIC) return null;
  return (
    <Audio
      src={staticFile("audio/track.mp3")}
      volume={(f) =>
        interpolate(
          f,
          [0, fps * 0.8, durationInFrames - fps * 2, durationInFrames],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      }
    />
  );
};
