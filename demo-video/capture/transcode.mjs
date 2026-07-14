/**
 * Transcode raw Playwright screencasts (VFR VP8 webm) into constant-frame-rate
 * 30fps H.264 mp4 clips that Remotion can trim frame-accurately.
 *
 *   node capture/transcode.mjs           # transcode every webm in raw/
 *   node capture/transcode.mjs 04-strategy
 *
 * CDP screencast webm is variable-frame-rate and sometimes lacks duration
 * metadata; feeding it straight into Remotion's trims is imprecise and slow. A
 * CFR CRF-14 intermediate makes every `trimBefore` frame deterministic.
 */

import ffmpegPath from "ffmpeg-static";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import { readdir, mkdir } from "node:fs/promises";

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(HERE, "raw");
const OUT_DIR = join(HERE, "..", "public", "clips");

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "inherit"] });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))
    );
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const selected = process.argv.slice(2);
  const all = (await readdir(RAW_DIR).catch(() => [])).filter((f) => f.endsWith(".webm"));
  const files = selected.length
    ? all.filter((f) => selected.includes(basename(f, ".webm")))
    : all;

  if (files.length === 0) {
    console.error("No matching .webm files in capture/raw/. Run npm run capture first.");
    process.exit(1);
  }

  for (const file of files) {
    const id = basename(file, ".webm");
    const src = join(RAW_DIR, file);
    const dst = join(OUT_DIR, `${id}.mp4`);
    console.log(`▶ ${id}.webm → clips/${id}.mp4`);
    await run([
      "-y",
      "-i", src,
      "-vf", "fps=30,scale=1920:1080:flags=lanczos",
      "-fps_mode", "cfr",
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "14",
      "-pix_fmt", "yuv420p",
      "-an",
      dst,
    ]);
  }

  console.log(`\n✓ transcode complete → public/clips/. Next: npm run studio`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
