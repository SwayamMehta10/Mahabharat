/**
 * The cut sheet for the cinematic trailer. 56s @ 30fps = 1680 frames, matching
 * the user's track.mp3 (56.1s). Beat markers are the source of truth for the
 * edit and are synced to the track's structure (see scripts/analyze-track.mjs).
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = 1680; // 56.0s

export const HAS_MUSIC = true;

// Site palette (globals.css)
export const COLOR = {
  void: "#090b12",
  abyss: "#0b0e17",
  bone: "#ece7db",
  gold: "#c9a437",
  goldBright: "#e4c66a",
  ash: "#8c8577",
  vermillion: "#cf4a1f",
};

/**
 * Beat boundaries in frames. Each beat runs [start, next.start). Kept as a flat
 * list so the edit reads top-to-bottom and re-times by editing numbers.
 */
export const BEAT = {
  coldOpen: 0, // Act 1 — the world
  wheelOfTime: 150, // 5s
  twoHouses: 330, // 11s
  insult: 480, // 16s
  warDeclared: 630, // 21s
  warMontage: 720, // 24s
  fireWheel: 900, // 30s
  reveal: 960, // Act 2 — the product reveal · 32s
  features: 1050, // 35s
  title: 1440, // Act 3 — title + CTA · 48s
  cta: 1590, // 53s
  end: DURATION, // 56s
} as const;

export type BeatName = keyof typeof BEAT;

/** Length of the beat starting at BEAT[name]. */
export function beatLen(name: Exclude<BeatName, "end">): number {
  const keys = Object.keys(BEAT) as BeatName[];
  const i = keys.indexOf(name);
  return BEAT[keys[i + 1]] - BEAT[name];
}
