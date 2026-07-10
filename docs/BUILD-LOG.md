# Build Log — MAHABHARAT

The engineering narrative of this project, session by session: what was
decided, why, what broke, and how it was verified. Written to be readable in
a demo or interview — each entry favors *decisions and tradeoffs* over
changelogs.

---

## Session 1 — 2026-07-09 · Recon, foundation, and the narrative spine

### Phase 0: Reconnaissance (before any code)

**Dissected dark.netflix.io live with Playwright** — clicked through the cookie
gate, the spoiler selector, the family tree, and character pages while
inspecting the DOM and network. Findings that shaped everything after:

- Built by Monks + HAS.WORKS: **Vue + a single fullscreen WebGL canvas + GSAP**.
  Crucially, **zero 3D models** — the "3D feel" is 2D video/imagery pushed
  through displacement shaders over a smoke background. Craft, not geometry.
- **The spoiler gate is the signature UX**: you declare how far you've watched
  (on a triquetra symbol), and the site only reveals content up to that point.
- The DOM is a sea of per-word `<span>`s — SplitText-style staggered reveals.
- The family tree is **hand-composed**, not auto-laid-out: two mirrored worlds
  meeting at an ∞ symbol.
- Draggable UIs use GSAP Draggable (a drag-proxy element intercepts pointers).

Reference screenshots: `recon/dark-*.jpeg`.

**Research conclusions:**

- **Stack**: Next.js App Router + React Three Fiber + GSAP + Lenis — the
  standard award-site pairing in 2026. Bonus: GSAP's formerly-paid plugins
  (SplitText, Draggable, MorphSVG…) went free after the Webflow acquisition —
  the exact toolkit Dark was built with, now at zero cost.
- **Content**: K.M. Ganguli's complete translation (1883–96) is public domain;
  the BORI critical edition is the scholarly cross-check. Every KB fact
  carries a parva citation.
- **Art**: Raja Ravi Varma's Mahabharata paintings (70+ hi-res on Wikimedia
  Commons) are public domain — iconic, unmistakably Indian, zero legal risk.
  Decision (user-confirmed): classical paintings + shaders; **no AI faces, no
  generic avatars, no 3D character models**.

### The mapping (why this epic fits this format)

| DARK                    | MAHABHARAT                                                           |
| ----------------------- | -------------------------------------------------------------------- |
| Triquetra selector      | **Kalachakra** — the wheel of time, 18 segments for 18 parvas |
| Spoiler gate by episode | "How far do you know the tale?" by parva                             |
| Two mirrored worlds     | Kaurava wing (vermillion) vs Pandava wing (gold)                     |
| Event timeline          | The 18 days of Kurukshetra                                           |
| —                      | The Gita: the centerpiece Dark never had (planned set-piece)         |

### Architecture decisions

1. **One persistent WebGL canvas in the root layout.** Next.js only swaps
   `children` on navigation, so the GL context — and the smoke — survives
   every route change. Page transitions happen *inside* the shader; there is
   never a white flash. This is the single most load-bearing decision.
2. **Layer sandwich**: canvas at `z-0` → DOM UI at `z-10` → film grain +
   vignette overlays at `z-40/41` (pointer-events: none). Grain sits *above*
   the UI deliberately — DOM text reads as "filmed," not pasted on.
3. **The smoke** is Inigo Quilez's double domain warp:
   `fbm(p + 1.8·fbm(p + 1.6·fbm(p)))`. One fbm looks like static; nesting
   twice produces long muscular wisps that read as ink in water. Mouse
   position is lerped with mass (`lerp` by `1 − 0.001^dt`) so the smoke feels
   heavy, not cursor-glued.
4. **Fail-closed spoilers.** `knownParva` defaults to **0 (total silence)**
   with zustand-persist `skipHydration`; the stored value arrives via an
   explicit post-mount `rehydrate()`. Server HTML and client first paint
   always agree, and no render path can ever flash a fate. (Originally
   defaulted to 18 — see Bugs below for why that was wrong.)
5. **The knowledge base is data, not prose**: `characters.json` (39 entries
   with lineage links, epithets, arms, death days), `parvas.json` (18),
   `war-days.json` (18) — every entry cited (e.g. "Karna Parva §90–91").
   Character pages are `generateStaticParams` SSG; the tree and timeline
   derive their edges/sections from the same JSON. One source of truth.
6. **Hand-composed tree layout** (`tree-layout.ts`), not d3 auto-layout.
   Auto-layouts minimize edge crossings; here **Karna's edge crossing the
   entire canvas is the point** — Kunti's firstborn, placed between the two
   worlds, joined to her by a long gold dotted line.
7. **Synthesized conch.** A shankha is acoustically near a pure tone, so the
   entry sound is three oscillators + lowpass + slow-attack envelope +
   growing vibrato in ~30 lines of Web Audio. Zero audio assets shipped.

### Bugs found by browser verification (and their fixes)

| Bug                                        | Root cause                                                                                                             | Fix                                                                                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| React hydration mismatch on the Kalachakra | SVG arc coordinates from`Math.cos/sin` differ between server and client in the ~13th decimal                         | Round path coordinates to 2 decimals so SSR and client emit byte-identical strings           |
| Tree nodes unclickable                     | `setPointerCapture` on the pan viewport retargets the pointer stream, so the `click` never reaches the node button | Don't capture; listen for move/up on`window`; treat as click only if total movement ≤ 6px |
| Flash-of-spoiler risk                      | Store defaulted to`knownParva: 18` (everything revealed) before hydration                                            | Fail-closed default`0` + `skipHydration` + explicit rehydrate after mount                |
| Lint:`setState` in effects (3×)         | Hydration-sync anti-pattern                                                                                            | `useSyncExternalStore` for media queries; store-as-single-source-of-truth for the wheel    |

### Verification method

Every feature is exercised in a real browser (Playwright MCP) before being
called done: navigate, interact (click segments, drag the tree, follow
relationship links), read the console (0 errors policy), and screenshot each
milestone into `recon/`. Both spoiler extremes tested (parva 0: total veil;
parva 18: everything). `tsc`, `eslint`, and `next build` (46 static pages)
all green.

---

## Session 2 — 2026-07-09 · The Eighteen Days

### `/war` — scroll-driven Kurukshetra timeline

- Full-viewport hero, then 18 day-sections alternating left/right across a
  **dotted spine that draws itself with scroll** (ScrollTrigger scrub on
  `scaleY`, `repeating-linear-gradient` for the dots).
- Each day: title ("The Bed of Arrows", "A Truth That Was a Lie"), Kaurava
  commander, events, and vermillion **fall chips** linking to `/who/[id]`.
  A giant Devanagari day-numeral is watermarked behind each section.
- Character pages now deep-link their "Falls" line to `/war#day-N`.

### The DOM→WebGL bridge (the interesting bit)

The smoke gains a `uWar` uniform: 0 = indigo night, 1 = ash and ember.
The bridge is deliberately **not React state** — at 60fps, `setState` per
scroll event would re-render constantly. Instead `src/lib/atmosphere.ts`
exports a plain mutable object; the war page writes `atmosphere.war = scrollProgress` in a ScrollTrigger callback, and the shader reads it every
frame through `MathUtils.damp` (which converts raw scroll into cinematic
easing for free). Cost: zero re-renders, ~1 multiply per frame.

### Spoiler gating as content architecture

`parvaOfWarDay(day)` encodes that the war *is* books 6–9 of the epic
(days 1–10 → Bhishma Parva, 11–15 → Drona, 16–17 → Karna, 18 → Shalya).
The same lookup that hides unearned days also documents which parva narrates
each one. A parva-0 visitor sees only the hero and *"The field waits. What
happens here is not yet yours to know."* — verified in a clean profile.

### Smooth scroll

Lenis synced to the GSAP ticker (`autoRaf: false`, `lagSmoothing(0)`),
mounted globally — gate pages fit the viewport so it's inert there.
Disabled entirely under `prefers-reduced-motion`.

---

## Session 3 — 2026-07-09 · The Gita: time stops, the form is revealed

The centerpiece. `/gita` (entered from day 1 of the war) is a five-act scroll:
the field → Arjuna's despair → the teaching → the Vishvarupa → time returns.

### Act mechanics

1. **Time literally stops.** The smoke shader no longer reads the wall clock —
   it accumulates its own time (`smokeTime += delta × timeScale`). A
   ScrollTrigger scrub over the despair passage drives
   `atmosphere.timeScale 1 → 0`, so as "the great bow Gandiva slips from his
   hand," the omnipresent smoke — moving on every page since the entry gate —
   drifts to a standstill. Even the CSS film grain pauses
   (`body.time-frozen`). The stillness is the effect; nothing flashy.
2. **The verses.** Six ślokas (2.47, 2.20, 4.7–8, 11.12, 11.32, 18.66) in
   `gita.json` — Devanagari, IAST transliteration, and original English
   renderings — presented as full-viewport cards.
3. **The Vishvarupa** (`VishvarupaParticles.tsx`): ~16,000 particles in the
   persistent canvas, custom vertex/fragment shaders, additive blending.
   A 350vh sticky section scrubs `atmosphere.vishvarupa 0 → 1`; particles
   emerge staggered (inner rings first, per-particle seed delays,
   easeOutQuart in the vertex shader). At p≈0.55 verse 11.12 dissolves and
   **कालोऽस्मि** ("I am Time") fades in over the wheel.
   Design note: the form deliberately has **its own clock** — when the world
   is frozen, it is the only thing in the universe still moving.

### Iterations caught by looking at it (recon/gita-vishvarupa-v1→v3.jpeg)

- **v1**: 16k additive particles as a filled disc saturated into a white
  sun-blob that swallowed the text. Physically obvious in hindsight —
  additive blending sums; density at the center is maximal.
- **v2**: restructured as an **annulus — the wheel of time** — dense fire rim,
  hollow dark center, a 300-particle bindu at the heart. Sizes and alphas cut
  (~60%). Now reads as an eclipse-eye of fire, and it's thematically truer:
  the Kalachakra again, not a sun.
- **v3**: verse text still fought the bright band → a soft radial dark scrim
  behind the text block (invisible against the void, decisive against the
  fire) — the film-subtitle trick.
- **v4** (user feedback): the IAST transliteration line was set at `text-sm`
  in low-contrast ash — genuinely hard to read. Typographic lesson:
  **Cormorant Garamond has a very small x-height**, so 14px in it reads like
  ~11px in a workhorse face. Whole verse hierarchy bumped one step
  (Devanagari 3xl gold · IAST xl full-ash · English 3xl bone).

Verified: freeze class toggles at the right scroll depth, eruption scrubs
with the descent, 0 console errors, `next build` green (47 static pages).

### Kalachakra usability pass (user feedback)

First-visit problem: the interactive segment ring sat **between two decorative
dotted circles**, and at parva 1 only a single faint gold sliver hinted that
anything was selectable. Fixes (recon/chakra-v2-parva1.jpeg):

- Removed the outer decorative ring — the control is now the outermost,
  dominant circle; one small faint inner ring remains for depth.
- **Numerals 1–18 around the rim** (clickable, same hover/selected states as
  the arcs) — the wheel now reads as a clock-face dial instantly.
- Unselected segments brightened (bone/25 → /40) so the full dial is visible.
- The entrance stagger sweeps arcs then numerals around the circle — the
  motion itself teaches "this is a dial," no tutorial text needed.

UX lesson recorded: an affordance that depends on one lit segment fails at
the boundary state (nothing selected yet) — design controls for their
*emptiest* state, not their fullest.

---

## Session 4 — 2026-07-09 · The paintings arrive

The "no generic content" mandate, delivered: real Raja Ravi Varma paintings
(public domain — he died in 1906) now carry the character pages and the tree.

### Sourcing (scripted, reproducible)

- Queried the **Wikimedia Commons API** for
  `Category:Depiction_of_scenes_from_the_Mahabharata_by_Raja_Ravi_Varma`
  (70 files) and curated 12 that map onto KB characters — e.g. *Bheeshma's
  Oath* → bhishma, *Draupadi Vastraharan* → draupadi, *Sri Krishna as Envoy*
  → krishna, *Kiratarjuniya* → arjuna, *Ganga and Shantanu* → ganga.
- Gotcha: `upload.wikimedia.org` **rate-limits burst downloads** — 8 of 12
  came back as HTML error stubs on the first pass. Always check payload
  sizes; retried with 4s spacing and a contactable User-Agent.
- `scripts/prepare-art.mjs` (sharp): originals → `public/art/{id}.webp`
  (≤1400px, q80) + `{id}-thumb.webp` (280px, `position: "attention"` —
  sharp's saliency crop finds the faces for tree thumbnails). ~2MB total
  for 24 files.
- `art.json` manifest: title, year, Commons source URL, and a CSS
  `object-position` focal hint per painting. Every page shows attribution:
  *"Sri Krishna as Envoy" · Raja Ravi Varma, 1906 · public domain.*

### The treatment (why it doesn't look like a museum scan)

A 19th-century oleograph dropped raw onto a black site looks like clip-art.
The grade: `grayscale(.25) sepia(.14) contrast(1.06) brightness(.62)`, an
indigo multiply wash, and a **full-bleed two-axis gradient into the void** —
the painting *emerges from the darkness* behind the text instead of sitting
in a box. The global film grain (already above the UI) does the rest.

Iteration: the first version put the gradient inside a 60%-width container,
which left a faint vertical seam at the container's left edge. Fix: image
stays 60%-wide but the gradient overlay spans the **full viewport** with
color-stops (`from-void from-35% via-60%`) — no edge can exist if there is
no edge.

Tree nodes with a painting show the saliency-cropped thumb (graded darker,
name over a bottom fade); the rest keep their Devanagari monograms.

Verified on /who/krishna, /who/draupadi, /family-tree; build green (47 pages).

---

## Session 5 — 2026-07-09 · The guide becomes navigable

Until now the site was a chain of set-pieces linked end-to-end. This session
added the connective tissue: global chrome, an overlay menu with search, and
the two index pages (`/who`, `/parvas`).

### The chrome (`SiteChrome.tsx`, mounted in the root layout)

- Fixed header on every page except the entry gate (which keeps its own quiet
  brand): a two-line menu glyph left, a dotted mini-Kalachakra right that
  links to `/saga` — the spoiler dial is always one tap away, like Dark's
  ever-present triquetra.
- Full-screen overlay menu: search first, then six primary destinations with
  right-aligned hints, and a status line — *"Knowing parva N of 18 · every
  fact cited to the Ganguli translation."* The spoiler state is worn like a
  badge, not buried in settings.

### Search is spoiler-aware

Client-side substring search across characters (name + Devanagari +
epithets), parvas, and war days — but the index itself respects the wheel:
characters and days beyond `knownParva` are not merely unlinked, they are
**absent from results**, and the empty state says so: *"Nothing by that
name — or the wheel forbids it."* A spoiler-safe site must not leak through
its search box.

### A React lint rule earns its keep (again)

"Close the menu on navigation" via `useEffect(() => setOpen(false),
[pathname])` trips `react-hooks/set-state-in-effect`. The idiomatic fix is
**derived state**: store `openedAt` (the pathname where the menu was opened)
and compute `open = openedAt === pathname` — navigation closes the menu by
definition, no effect, no extra render. Third time this rule has pushed the
code somewhere better; it's a good rule.

### Index pages

- `/who`: character grid grouped by allegiance (Pandava gold / Kaurava
  vermillion / divine / between-the-worlds), painting thumbs with hover
  scale, monograms elsewhere, `?` cards beyond the wheel.
- `/parvas`: the eighteen books with gold Devanagari numerals; summaries
  beyond the wheel are veiled with an inline invitation to turn it.
- Detail: the browser's default **blue × on `type="search"`** inputs had to
  be appearance-stripped — one stock-UI pixel breaks a fully art-directed
  frame.

Verified: menu open/search "karna" → character + parva results → deep-link
to `/parvas#parva-8` (menu closes itself via derived state). Build green,
**49 static pages**.

---

## Session 6 — 2026-07-09 · The site learns to hum

The soundscape is **synthesized, not sampled** — extending the conch's
zero-asset philosophy to the whole sound design (`src/lib/soundscape.ts`,
~250 lines of Web Audio, no files, no licensing questions).

### Three scenes, one tonic

Everything is rooted on **Sa = A1 (55 Hz)** so scenes crossfade musically:

- **void** (default) — two detuned sawtooth pairs on Sa and Pa through a
  lowpass whose cutoff is swept by a 0.045 Hz LFO: a drone that *inhales*.
  Under it, bandpassed noise sways at 0.07 Hz — wind over the field.
- **war** (`/war`) — the drone dropped an octave and darkened, plus sparse
  irregular drum strikes every 3–7s: membrane physics in two lines (a sine
  that falls from 82 Hz to ~37 Hz while its gain dies exponentially).
- **gita** (`/gita`) — a tanpura approximation: sawtooth plucks cycling
  Pa–Sa–Sa–Sa(low) every 950ms through a resonant bandpass whose center
  *sweeps down* over each 3s ring — a crude but recognizable jvari. Each
  pluck rings into the next, so four notes become a shimmer.

### Engineering notes

- **Autoplay policy as design**: the engine cannot exist before a user
  gesture — so the site is silent until touched, "by law and by design."
  A `pendingScene` field remembers what the route wanted before init.
- **Nothing clicks**: every transition is a `linearRampToValueAtTime`;
  scenes crossfade over 2–3s and old oscillators are stopped only after
  their fade completes.
- Route → scene mapping lives in a provider; the menu gained a global
  Sound On/Off toggle; the store flag ramps the master gain.
- Verified via a `window.__soundscape` debug handle: context `running`
  after gesture, scene follows route (war → void → gita), master gain
  ramps 1 → 0.000 on disable. Build green (49 pages).

---

## Session 7 — 2026-07-10 · The paintings begin to breathe

The portraits graduated from CSS-filtered `<img>` tags to **live textures in
the persistent WebGL canvas** (`PortraitPlane.tsx`) — the final piece of the
"Dark trick" (their character pages use treated video; ours now treat
140-year-old paintings the same way).

### How a server page talks to a shader

Character pages are static SSG — they can't touch the canvas. The bridge is
a 20-line client component (`PortraitDirector`) that writes
`{url, focalX, focalY}` into the same mutable `atmosphere` channel the war
timeline uses. The plane polls it per-frame; **route transitions become
crossfades for free**: reveal damps to 0, texture swaps at the bottom,
damps back to 1. Textures are cached in a Map so back-navigation is instant.

### What the shader does that CSS can't

- **Cover-fit + focal point** reimplemented in GLSL (sample a sub-rect
  anchored at the manifest's `object-position`), because the plane replaces
  `object-fit: cover`.
- **The paint breathes**: sub-pixel fbm displacement (±0.6% UV) at 1/20th
  speed — imperceptible as motion, unmistakable as *life*.
- **Ken Burns around the focal point** (2.5% scale over ~57s) and **mouse
  parallax with mass** (the painting leans away from the cursor).
- The full cinematic grade per-pixel: desaturate → warm lean → darken →
  indigo wash *in the shadows only* — which preserves midtone detail the
  flat CSS `brightness()` filter was crushing. Visibly richer.

### Composition unchanged, layers cooperating

The DOM gradients and text stay exactly where they were (z-10); the plane
renders behind them in the canvas (z-0), sized to the same "right 60%"
region the gradients were designed for. The old CSS-graded `<img>` remains
as the `motion-reduce:` fallback — same grade, no motion, no GL.

Verified: Krishna → Bhishma crossfade swaps paintings cleanly, fresh-profile
spoiler veil intact, 0 console errors, build green (49 pages).

---

## Session 8 — 2026-07-10 · Design review: audit → fix → verify

Ran the full /design-review workflow. First: **v1 finally committed to git**
(71 files, 12,611 insertions) so each fix could land as its own atomic,
revertable commit. Then four findings, four fixes, all verified live.

### The best catch came from a broken tool

The headless audit browser's first screenshot was **pure black** — its
backgrounded tab throttles `requestAnimationFrame`, freezing GSAP mid-tween.
Annoying tool artifact… and a genuine HIGH finding hiding underneath: the
markup shipped content *hidden* (`opacity-0` classes, translate masks),
becoming visible only when animation ran. Crawlers, link previews, and any
failed script load saw a black page.

**Fix (FINDING-001):** a pre-hydration inline script stamps
`html[data-js]`; all animation initial-states are now CSS-gated on that
attribute (`html[data-js] .anim-hidden { opacity: 0 }`). No JS → full
content. JS → identical cinematic entrance. Plus `suppressHydrationWarning`
on `<html>` for the expected attribute delta (the theme-script pattern).
Lesson: **author content visible; let running JS hide it** — never the
reverse.

### The typography trap (FINDING-002)

Tracked single-word display headings can't wrap: KURUKSHETRA at 0.3em
tracking measured 384px against a 342px mobile container → horizontal
scroll. Same math doomed MAHABHARAT (0.45em) and THE EIGHTEEN PARVAS.
Fixed with fluid `clamp()` font sizes (e.g. `text-[clamp(1.6rem,7vw,3.75rem)]`);
re-measured 292px @ 375px viewport, zero overflow.

### Touch targets (FINDINGS-003/004)

- Sound toggles were 86×17px → `p-3 -m-3` (bigger hit area, identical look).
- The Kalachakra's *arcs* had generous 34px hit strokes but the *numerals*
  were bare 11px text → invisible 44px hit circles behind each numeral,
  click-through re-verified.

### What passed

Trunk test (menu + ever-present chakra icon + parva badge), reduced-motion
fallbacks (real ones), spoiler integrity incl. search, 3-font discipline,
**AI-slop score: A** — no gradient-purple, no icon-circle grids, nothing
generic. Design score B+ → A− after fixes. Full report:
`~/.gstack/projects/Mahabharat/designs/design-audit-20260709/`.

---

## Backlog (agreed order)

1. Recorded layers later if wanted (real conch, whispered ślokas) — the
   synth bed makes them optional rather than blocking.
2. Performance/bundle pass (Lighthouse, shader budget on low-end); easter eggs.
3. Vercel deploy.
