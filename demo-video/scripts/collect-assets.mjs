/**
 * Copies the curated set of painting accents + audio the trailer needs from the
 * site into demo-video/public/, so Remotion's staticFile() can read them. The
 * copied assets are git-ignored (regenerable): run `node scripts/collect-assets.mjs`.
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdir, copyFile, access } from "node:fs/promises";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..", ".."); // repo root
const OUT = join(HERE, "..", "public");

// Painting accents (Act 1 emotional beats + a few montage flashes) + audio.
// Paths are relative to the site root and to demo-video/public.
const ART = [
  // heavy painting beats
  ["public/art/draupadi.webp", "art/draupadi.webp"], // the insult (PD, 1327x1800)
  ["public/art/journey/generated/krishna-charioteer.webp", "art/krishna-charioteer.webp"], // the Gita
  ["public/art/generated/karna-generated-portrait.webp", "art/karna.webp"], // the fall
  ["public/art/journey/bhishma-arrow-bed.webp", "art/bhishma-arrow-bed.webp"], // the fall (PD, 1600x1142)
  ["public/art/journey/generated/karna-final-wheel.webp", "art/karna-final-wheel.webp"], // the fall
  // montage battle flashes
  ["public/art/journey/generated/war-day-01.webp", "art/war-day-01.webp"],
  ["public/art/journey/generated/war-day-13.webp", "art/war-day-13.webp"], // chakravyuha
  ["public/art/journey/generated/war-day-17.webp", "art/war-day-17.webp"],
];

const AUDIO = [
  ["public/audio/track.mp3", "audio/track.mp3"], // user's cinematic track (56s)
  ["public/audio/conch.mp3", "audio/conch.mp3"],
  ["public/audio/tanpura.mp3", "audio/tanpura.mp3"],
];

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyAll(pairs) {
  for (const [from, to] of pairs) {
    const src = join(SITE, from);
    const dst = join(OUT, to);
    if (!(await exists(src))) {
      console.warn(`  ! missing: ${from}`);
      continue;
    }
    await mkdir(dirname(dst), { recursive: true });
    await copyFile(src, dst);
    console.log(`  ${from}  →  public/${to}`);
  }
}

console.log("Collecting trailer assets…");
await copyAll(ART);
await copyAll(AUDIO);
console.log("✓ done → public/art, public/audio");
