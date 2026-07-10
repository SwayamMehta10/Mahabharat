# MAHABHARAT — An Immersive Epic Experience

A cinematic, WebGL-driven guide to the Mahabharat, modeled on the craft of
[Netflix's DARK official guide](https://dark.netflix.io/en) — living smoke,
spoiler-aware storytelling, a pan-and-zoom dynasty tree, and a knowledge base
where every fact carries a citation into the source text.

> Eighteen books. Eighteen armies. Eighteen days of war.

## The experience

| Route | What it is |
|---|---|
| `/` | Entry gate — WebGL ink-smoke void, synthesized conch (Web Audio, zero assets), staggered type |
| `/saga` | **The Kalachakra gate** — an interactive wheel of 18 parvas; you declare how far you know the story, and the entire site reveals only up to that point |
| `/family-tree` | **The Kuru Line** — drag/zoom node graph; Kaurava wing in vermillion, Pandava wing in gold, Karna alone between the worlds, joined to Kunti by a line that crosses the whole tree |
| `/who/[id]` | 39 statically generated character pages — epithets, relationships, arms, divine parentage, and fates veiled behind the spoiler wheel |
| `/war` | **The Eighteen Days** — a scroll-driven descent through Kurukshetra; the smoke itself bruises from indigo to ash and ember as the war deepens |
| `/gita` | **The Song of the Lord** — time freezes mid-battlefield (the ever-moving smoke stops), six ślokas in Devanagari + IAST + English, and the Vishvarupa: a 16,000-particle wheel of fire, the only thing that moves in a frozen world |
| `/who` | Character index grouped by allegiance — paintings, epithets, and `?` cards beyond your wheel |
| `/parvas` | The eighteen books, summaries veiled beyond your wheel |
| — | Global overlay menu with **spoiler-aware search** (characters, parvas, war days) on every page |

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · TypeScript · Tailwind v4
- **React Three Fiber + three.js** — one persistent fullscreen canvas in the root layout (survives every route change; page transitions happen *inside* the shader, never a flash)
- **Custom GLSL** — domain-warped fbm smoke (iq's q/r technique), mouse-reactive, war-mood uniform
- **GSAP + ScrollTrigger + Lenis** — the scroll-story engine
- **Zustand (persist)** — spoiler progress, fail-closed: the default is *total silence*, so no render path can ever flash a spoiler
- **Synthesized soundscape** — zero audio assets: the conch, the breathing void-drone, the war drums, and the Gita's tanpura cycle are all Web Audio oscillator work, rooted on Sa = A1 and crossfaded by route
- **Content**: hand-curated JSON knowledge base (`src/data/`) — 39 characters, 18 parvas, 18 war days — every entry cited to the public-domain K.M. Ganguli translation (1883–96), cross-checkable against the BORI critical edition

## Art direction

No AI faces. No stock avatars. No 3D character models. Character pages and
tree nodes carry real **Raja Ravi Varma paintings** (public domain, sourced
from Wikimedia Commons via a scripted pipeline — `scripts/prepare-art.mjs`),
graded through a dark cinematic treatment so they emerge from the void rather
than sit in frames; each carries its attribution. On character pages the
paintings render as **live WebGL textures** — breathing fbm displacement,
slow Ken Burns, mouse parallax, per-pixel grade — with a CSS-graded fallback
under `prefers-reduced-motion`. Palette: near-black
indigo, burnished gold, vermillion, ash. Type: Cormorant Garamond ·
Tiro Devanagari Sanskrit · tracked-out Inter.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 46 static pages
```

## Documentation

The full engineering narrative — recon, architecture decisions, tradeoffs,
bugs and their fixes, verification method — lives in
[`docs/BUILD-LOG.md`](docs/BUILD-LOG.md). Screenshots of both the reference
site and each build milestone are in [`recon/`](recon/).
