/**
 * Per-scene capture specs for the Mahabharat demo video.
 *
 * Each scene records 2-3s longer than the storyboard needs; the exact in/out
 * points are trimmed later in Remotion (src/config.ts), so capture timing
 * never has to be frame-perfect.
 *
 * `actions(page)` runs at the START of the record window. The driver holds the
 * recording open for at least `record` ms regardless of how long actions take,
 * so a scene that just wants to film an ambient animation leaves actions empty.
 */

/**
 * Drive Lenis smooth-scroll with real wheel events. `window.scrollTo` would
 * bypass Lenis's lerp and fight ScrollTrigger; dispatching wheel through the
 * mouse lets the site's own easing (lerp 0.12) smooth the discrete steps into
 * continuous cinematic motion.
 */
export function wheelScroll({ steps, delta, intervalMs }) {
  return async (page) => {
    await page.mouse.move(960, 540);
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, delta);
      await page.waitForTimeout(intervalMs);
    }
  };
}

/** Select a war day in Sanjaya's Eye, redrawing that morning's vyuha. */
export async function clickDay(page, day) {
  await page
    .locator('nav[aria-label="Choose a strategic war day"] button', {
      hasText: new RegExp(`^${day}$`),
    })
    .click();
}

/** Press-drag across the pan/zoom canvas (family tree uses pointer events). */
export async function drag(page, { from, to, steps = 40, stepMs = 16 }) {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    await page.mouse.move(
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t
    );
    await page.waitForTimeout(stepMs);
  }
  await page.mouse.up();
}

export const scenes = [
  {
    id: "01-gita",
    url: "/gita",
    settleMs: 4500, // shader freeze + title settle
    record: 15000,
    // The Vishvarupa "wheel of fire" lives in a 350vh scrubbed section that
    // starts ~6300px down and peaks (dense wheel + कालोऽस्मि) near ~8400px.
    // Two phases: glide through the intro slokas, then ease into the reveal
    // and hold on the burning wheel.
    actions: async (page) => {
      await page.mouse.move(960, 540);
      await page.waitForTimeout(2500); // hold the title
      await wheelScroll({ steps: 18, delta: 300, intervalMs: 90 })(page); // glide to the reveal
      await wheelScroll({ steps: 22, delta: 150, intervalMs: 150 })(page); // ease into the fire
      // the record tail holds on the wheel while Lenis settles
    },
  },
  {
    id: "02-entry",
    url: "/",
    recordBeforeGoto: true, // the word-reveal intro starts ~0.6s after load
    settleMs: 0,
    record: 8000,
    actions: async () => {
      /* the entry gate's staggered WordReveal runs on load */
    },
  },
  {
    id: "03-war",
    url: "/war",
    settleMs: 4000,
    record: 13000,
    // gentle descent — each wheel tick is small and spaced so Lenis (lerp 0.12)
    // eases between them; races past every day if the deltas are too big
    actions: wheelScroll({ steps: 72, delta: 135, intervalMs: 150 }),
  },
  {
    id: "04-strategy",
    url: "/war/strategy",
    settleMs: 4500, // let the first vyuha's particles settle
    record: 13000,
    // click through morning formations so the two particle hosts redraw into
    // new vyuhas; end on Day 13's chakravyuha — the needle piercing the wheel
    actions: async (page) => {
      await page.mouse.move(960, 540);
      await page.mouse.wheel(0, 260); // lift the diagram to center frame
      await page.waitForTimeout(1600); // hold Day 1 (Two oceans close)
      for (const [day, hold] of [[6, 2400], [8, 2200], [13, 4200]]) {
        await clickDay(page, day);
        await page.waitForTimeout(hold);
      }
    },
  },
  {
    id: "05-tree",
    url: "/family-tree",
    settleMs: 4500, // node stagger-in finishes ~2.5s after mount
    record: 9000,
    actions: async (page) => {
      // wander right-to-left across the lineage
      await drag(page, { from: [1400, 560], to: [560, 560], steps: 48, stepMs: 15 });
      await page.waitForTimeout(500);
      // ease down toward the younger generations
      await drag(page, { from: [960, 820], to: [960, 360], steps: 34, stepMs: 16 });
      await page.waitForTimeout(400);
      // draw near
      await page.mouse.move(960, 540);
      await page.mouse.wheel(0, -240);
      await page.waitForTimeout(200);
      await page.mouse.wheel(0, -240);
    },
  },
  {
    id: "06-karna",
    url: "/who/karna",
    settleMs: 5000, // portrait dissolve-in
    record: 9000,
    // stay on the full-bleed portrait — the journey turns to prose almost
    // immediately, so hold the hero and let a slow mouse drift parallax the
    // WebGL plane and animate the shader veil
    actions: async (page) => {
      await page.mouse.move(720, 380);
      await page.waitForTimeout(700);
      await page.mouse.move(1220, 700, { steps: 90 }); // slow parallax sweep
      await page.waitForTimeout(700);
      await page.mouse.move(700, 560, { steps: 80 });
      await page.waitForTimeout(500);
      await page.mouse.move(1000, 420, { steps: 60 });
    },
  },
  {
    id: "07-secret",
    url: "/saga",
    settleMs: 4000,
    record: 7000,
    actions: async (page) => {
      await page.waitForTimeout(1000);
      await page.keyboard.type("karna", { delay: 200 });
    },
  },
];
