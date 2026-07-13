# MAHABHARAT — An Immersive Epic Experience

A cinematic, WebGL-driven guide to the Mahabharat, modeled on the craft of
[Netflix's DARK official guide](https://dark.netflix.io/en) — living smoke,
narrative-depth storytelling, a pan-and-zoom dynasty tree, and a knowledge base
where every fact carries a citation into the source text.

> Eighteen books. Eighteen armies. Eighteen days of war.

## The experience

| Route | What it is |
|---|---|
| `/` | Entry gate — WebGL ink-smoke void, synthesized conch (Web Audio, zero assets), staggered type |
| `/saga` | **The Kalachakra gate** — choose your path: *Experience the Telling* (guided, the site reveals parva by parva) or *Open the Epic* (all eighteen books at once); the wheel of 18 parvas measures your depth |
| `/family-tree` | **The Kuru Line** — drag/zoom node graph; Kaurava wing in vermillion, Pandava wing in gold, Karna alone between the worlds, joined to Kunti by a line that crosses the whole tree |
| `/who/[id]` | 39 statically generated character pages — full-bleed portraits dissolving into the void (shader-side veil, no hard edges), epithets, relationships, arms, divine parentage, and guided-depth fates; nine characters (Arjuna, Bhishma, Draupadi, Karna, Krishna, Duryodhana, Kunti, Abhimanyu, Ashwatthama) carry **DARK-style journeys**: their lives scroll parva by parva while the background painting crossfades per chapter, with a Devanagari chapter rail |
| `/war` | **The Eighteen Days** — a scroll-driven descent through Kurukshetra; the smoke bruises from indigo to ash as the war deepens, five days carry full-bleed painting tableaux that hold until the next turning point, a fixed Devanagari day rail jumps to any morning, and every day's full chronicle (141 paragraphs, cited to Ganguli) folds open behind *Read the day in full* |
| `/gita` | **The Song of the Lord** — time freezes mid-battlefield (the ever-moving smoke stops), six ślokas in Devanagari + IAST + English, and the Vishvarupa: a 16,000-particle wheel of fire, the only thing that moves in a frozen world |
| `/who` | Character index grouped by allegiance — paintings, epithets, and `?` cards beyond your wheel |
| `/parvas` | The eighteen books, each with a full multi-paragraph synopsis, veiled beyond your wheel — with a jump rail, watermark numerals, and painting tableaux at eight of the books' turning points |
| `/drishti/[id]` | **Drishti — one event, many truths**: Karna's final duel retold through five pairs of eyes (Karna, Arjuna, Krishna, Shalya, Kunti), each perspective swapping the portrait, citations, and the causal threads it pulls on |
| `/threads` | **The Web of Vows** — nine vows, curses, secrets, and debts mapped to the characters, events, and parvas they bind; each thread veiled until its last consequence is within your depth |
| `/war/strategy` | **Sanjaya's Eye** — each war morning drawn as two opposing named vyuhas (the crane's beak, Garuda's wings, the makara's jaws, the turning chakravyuha, day 14's cart-lotus-needle) facing each other in moving points, with both formations named in English and Devanagari beside the prose chronicle and the day's citations |
| `/credits` | Every artwork's provenance — creator, source link, license, and AI-origin disclosure for the six-character generated pilot, kept off the immersive pages |
| — | Global overlay menu with **narrative-depth-aware search** (characters, weapons, kin, vows, events, parvas, war days) on every page |

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · TypeScript · Tailwind v4
- **React Three Fiber + three.js** — one persistent fullscreen canvas in the root layout (survives every route change; page transitions happen *inside* the shader, never a flash)
- **Custom GLSL** — domain-warped fbm smoke (iq's q/r technique), mouse-reactive, war-mood uniform
- **GSAP + ScrollTrigger + Lenis** — the scroll-story engine
- **Zustand (persist)** — guided/open experience mode and fail-closed narrative depth
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
