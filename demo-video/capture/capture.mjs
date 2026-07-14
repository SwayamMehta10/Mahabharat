/**
 * Playwright capture driver for the Mahabharat demo video.
 *
 *   node capture/capture.mjs            # capture every scene
 *   node capture/capture.mjs 04-strategy 05-tree   # re-capture named scenes
 *
 * Records one raw .webm per scene into capture/raw/ via page.screencast
 * (Playwright 1.59+). Renders fully offscreen in NEW HEADLESS at a true
 * 1920x1080 viewport (GPU via ANGLE) so framing never depends on the physical
 * display — a headed window can't exceed the laptop's 1536x864 logical desktop,
 * which clips 1080p layouts. Set HEADED=1 to watch it render (only correct on a
 * true >=1080p display). Transcode to CFR mp4 afterwards with transcode.mjs.
 *
 * Point it at a running site with CAPTURE_BASE (default http://localhost:3000).
 * Capture against a production build (`next build && next start`), not
 * `next dev` — the dev indicator would appear in the footage.
 */

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdir } from "node:fs/promises";
import { scenes } from "./scenes.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(HERE, "raw");
const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3000";
const SIZE = { width: 1920, height: 1080 };

// Seed the persisted store so the whole site shows in "open" mode — every
// painting, vyuha, and family-tree node revealed. A fresh browser defaults to
// experienceMode:null / knownParva:0, which renders gated content as locked
// "?" placeholders. Matches the zustand-persist envelope the site rehydrates
// from (localStorage key "mahabharat-progress", version 2).
const SEED_PROGRESS = JSON.stringify({
  state: { soundOn: false, experienceMode: "open", knownParva: 18 },
  version: 2,
});

const selected = process.argv.slice(2);
const queue = selected.length
  ? scenes.filter((s) => selected.includes(s.id))
  : scenes;

if (selected.length && queue.length !== selected.length) {
  const found = new Set(queue.map((s) => s.id));
  const missing = selected.filter((id) => !found.has(id));
  console.error(`Unknown scene id(s): ${missing.join(", ")}`);
  process.exit(1);
}

async function main() {
  await mkdir(RAW_DIR, { recursive: true });

  const headed = process.env.HEADED === "1";
  const browser = await chromium.launch({
    channel: "chromium", // full browser → new-headless (not the old headless shell)
    headless: !headed,
    args: [
      "--hide-scrollbars",
      "--autoplay-policy=no-user-gesture-required",
      // GPU-accelerated WebGL offscreen on Intel Iris Xe
      "--use-angle=d3d11",
      "--ignore-gpu-blocklist",
      "--enable-gpu-rasterization",
    ],
  });
  const context = await browser.newContext({
    viewport: SIZE,
    deviceScaleFactor: 1,
    reducedMotion: "no-preference", // never emulate reduce — it disables Lenis
  });

  await context.addInitScript((progress) => {
    try {
      window.localStorage.setItem("mahabharat-progress", progress);
    } catch {
      /* storage may be unavailable on about:blank; ignore */
    }
    // hide scrollbars belt-and-suspenders (the launch flag misses some paths)
    const style = document.createElement("style");
    style.textContent =
      "::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}";
    (document.head ?? document.documentElement).appendChild(style);
  }, SEED_PROGRESS);

  const page = await context.newPage();
  // prime localStorage on a same-origin blank so the very first real nav
  // already sees "open" mode during its own mount
  await page.goto(BASE + "/favicon.ico").catch(() => {});

  for (const scene of queue) {
    const out = join(RAW_DIR, `${scene.id}.webm`);
    console.log(`\n▶ ${scene.id}  (${scene.url})`);

    if (scene.recordBeforeGoto) {
      await page.goto("about:blank");
      await page.screencast.start({ path: out, size: SIZE, quality: 90 });
      await page.goto(BASE + scene.url, { waitUntil: "domcontentloaded" });
      await holdActions(page, scene);
      await page.screencast.stop();
      console.log(`  saved ${scene.id}.webm`);
      continue;
    }

    await page.goto(BASE + scene.url, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForSelector("canvas", { timeout: 15000 }).catch(() => {
      console.warn("  (no <canvas> found — continuing anyway)");
    });
    await page.waitForTimeout(scene.settleMs);

    await page.screencast.start({ path: out, size: SIZE, quality: 90 });
    await holdActions(page, scene);
    await page.screencast.stop();
    console.log(`  saved ${scene.id}.webm`);
  }

  await context.close();
  await browser.close();
  console.log("\n✓ capture complete → capture/raw/. Next: npm run transcode");
}

/** Run the scene's actions, then hold the recording open for the full window. */
async function holdActions(page, scene) {
  const started = Date.now();
  await scene.actions(page);
  const elapsed = Date.now() - started;
  if (elapsed < scene.record) await page.waitForTimeout(scene.record - elapsed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
