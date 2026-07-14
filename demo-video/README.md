# Mahabharat — cinematic trailer

A ~56s, 1080p cinematic launch video for the site. It is **not** a screen
recording: it's a motion-graphics film built in Remotion — living particle
formations, a self-drawing dynasty, an animated Kalachakra, painting accents
brought alive with depth and grade, drifting embers and smoke, kinetic
Devanagari — that then reveals the real, interactive website and ends on the URL.

Three acts: **the world** (cinematic, procedural), **the product reveal** (the
real site inside a browser frame → full-bleed feature montage), **title + CTA**.

## Quick start

```bash
npm install
node scripts/collect-assets.mjs     # copy paintings + audio from the site into public/
npm run studio                      # scrub / tune the cut (src/config.ts beat markers)
npm run render                      # → out/mahabharat-trailer.mp4
```

Act 2 reuses the real-site clips in `public/clips/` — regenerate those with the
capture pipeline (`npm run footage`, see "Capture" below) if they're missing.

## How it works

Everything is a **pure function of the frame** (deterministic), drawn through
`lib/FrameCanvas.tsx` (a delayRender-gated canvas) so the offline renderer never
captures a stale frame.

### Procedural set-pieces (`src/procedural/`)
- `VyuhaField` — the two hosts as drifting point clouds, morphing through war-day
  formations (chakravyuha, needle, makara…). Ports `vyuhaPoint()` from the site's
  `SanjayaEye.tsx` verbatim (`lib/field.ts`). Drives the war montage.
- `ParticleArmies` — two hosts rush and clash (the "war declared" beat).
- `KalachakraWheel` — an 18-spoke wheel of light with the parva numerals.
- `LineageThreads` — the dynasty drawing itself into gold vs vermillion houses.

### Atmosphere (`src/atmosphere/`)
`Smoke` (fbm fog), `Embers`, `LightRays`, `Grain`, `Vignette`, `Grade` — layered
over every shot via `Atmosphere.tsx` to tie particles, paintings, and real
footage into one graded film.

### Painting accents (`src/painting/`)
- `CinematicPainting` — a painting brought alive: cover-fit to a focal point, a
  slow depth camera push, an in-canvas grade, reveal fade. Used only at the
  emotional beats (Draupadi, Krishna, Karna, Bhishma).
- `FireWheel` — the one reused capture (`clips/01-gita.mp4`), scaled to crop the
  UI + regraded, as the Vishvarupa climax.

### Type (`src/type/`)
`KineticText`, `DevanagariBloom` (ink-bloom धर्म/काल/अष्टादश), `DayCounter`
(१→१८), `TitleCard`. Fonts mirror the site (Cormorant, Tiro Devanagari, Inter).

### Product reveal (`src/reveal/`)
`ProductReveal` composes the captured site clips into a feature montage;
`BrowserFrame` wraps the opening in browser chrome (address bar = the URL) so it
unmistakably reads as an interactive website.

### The edit (`src/`)
`Trailer.tsx` places the beats against the frame markers in `config.ts`
(`BEAT`). `Soundtrack.tsx` plays the user's `public/audio/track.mp3`, to whose
structure the cut is timed.

## Capture pipeline (`capture/`) — for the Act 2 clips

Playwright drives the real site (new-headless, true 1920×1080, `localStorage`
seeded to "open" mode) and records one webm per scene; `transcode.mjs` makes
CFR-30 mp4s in `public/clips/`. Run `CAPTURE_BASE=https://mahabharat-ten.vercel.app
npm run footage`. (Full details: `capture/scenes.mjs`.)

## Audio

The cut is timed to `public/audio/track.mp3` (a ~56s cinematic track). Replace
that file and re-time the `BEAT` markers in `src/config.ts` to fit a different
track. `HAS_MUSIC` in config gates it.

## Regenerating

Copied art/audio (`public/art`, `public/audio/track.mp3`), captured clips
(`public/clips`), raw captures, and `out/` are git-ignored. Regenerate art/audio
with `node scripts/collect-assets.mjs` and clips with `npm run footage`. The
source of truth is `src/` + `config.ts`.
