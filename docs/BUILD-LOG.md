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

## Session 9 — 2026-07-10 · Performance, an easter egg, and first deploy

### three.js off the critical path

The biggest chunk we ship is the GL stack — **~231 kB gzipped**, and it sat
in the shared render-blocking bundle, so even a text-only route like
`/parvas` waited on it before painting. Fix: `CanvasRoot` now mounts through
`next/dynamic({ ssr: false })` via a thin `CanvasRootLazy` wrapper. Verified
the win structurally — `grep` of the biggest chunk against `/parvas` static
HTML returns **0 references** (three.js is now an async chunk, not
render-blocking). The smoke's existing fade-from-black (`uIntensity` ramps
0→1) absorbs its slightly later arrival, so it reads as cinematography, not
pop-in. Prod numbers on the home route: **LCP 544 ms, DCL 422 ms**.

### The Karna easter egg

Type `karna` anywhere outside an input and the river gives up its secret —
a full-screen overlay: *"Before the five, there was a sixth. Kunti's
firstborn, son of the Sun — set adrift on the river before dawn."* A 5-char
rolling keybuffer (`KarnaSecret.tsx`), guarded against firing inside form
fields, links to `/who/karna`, dismiss on click or Escape. The reader has
known since Adi Parva §67; the brothers never did. Verified live in the
production build.

### First deploy — and a gotcha worth remembering

Deployed to Vercel (`vercel deploy --yes`). Two things bit:
1. **Project name**: the directory is `Mahabharat` (capital M), and Vercel
   project names must be lowercase — auto-derivation 400'd. Fixed with
   `--name mahabharat`.
2. **Deployment Protection**: new Vercel projects ship with the SSO auth
   wall ON. The deploy is `READY` and the app is perfect, but the URL 302s
   to `vercel.com/sso-api` for anyone who isn't the account owner. For a
   demo/interview site this must be turned OFF: Project → Settings →
   Deployment Protection → Vercel Authentication → Disabled. (A build being
   `READY` and a URL being *publicly viewable* are two different things.)

Live (owner-only until protection is disabled):
`mahabharat-a17kntxoi-swayams-projects-09869114.vercel.app`

---

## Session 10 — 2026-07-10 · Public, and readable

The site went public (user disabled Deployment Protection; repo now on
GitHub → Vercel auto-deploys **mahabharat-ten.vercel.app**), and the first
round of real-user feedback arrived — from the user browsing their own
deploy. All four items fixed and shipped:

1. **"Text too small to read easily."** Cormorant's small x-height strikes
   again, this time site-wide: `ui-label` 0.7→0.75rem, war-day events
   base→lg, saga/parva meanings →lg, parva summaries →xl, tree/who card
   names up two notches. Tree labels got *tighter* tracking (0.28→0.13em)
   so DHRITARASHTRA fits its card — bigger type sometimes needs narrower
   letterspacing.
2. **Chakra icon overlapping the tree legend** (and the menu glyph striking
   through THE KURU LINE): the tree's HUD was `top-0` under the fixed
   chrome. Now `pt-16` — HUD starts below the chrome bar. Two fixed layers
   need a contract about who owns the top strip.
3. **Scroll indication on every page** (like Dark's): a global `ScrollCue`
   in the chrome — a gold drop falling down a dotted line, bottom-center.
   Appears only when the page actually scrolls (checked after content
   settles), fades on first scroll, remounts per route via `key={pathname}`
   (derived-state again — no setState-in-effect). Replaced the per-page
   "Descend" labels. Verified: opacity 1 on /war → 0 after scrolling;
   stays 0 on non-scrolling /saga.
4. **Easter-egg hint**: the menu footer now whispers *"Some names, typed
   into the dark, answer back."*

Also this session: killed all stray dev servers; `.vercel` gitignored.

## Session 11 - The Complete Guide push (2026-07-11)

The site graduates from overview to guide. Five commits:

1. **Visibility pass + em dash purge** (`5307341`): portrait grade
   0.62 -> 0.80 in the GLSL and CSS twins, softer void gradients; family
   tree cards 150x118 at 0.78 initial zoom, edge strokes at 45-50%
   opacity counter-scaled against camera zoom (they were sub-pixel at
   0.62). All ~130 em dashes in src/ rewritten; `scripts/check-prose.mjs`
   fails lint if one ever returns.
2. **KB schema for depth** (`6178800`): JourneyChapter, WarDay.narrative,
   Parva.synopsis, JourneyArtEntry (license-tracked), AudioAsset;
   `scripts/validate-kb.mjs` in lint (id resolution, citation format,
   journey ordering, on-disk asset checks).
3. **The Eighteen Days in full** (`9d3b0fb`): 141 narrative paragraphs
   across all 18 days, written from the Ganguli sections each day cites;
   WarTimeline renders them as a book-measure column under the events.
4. **The Eighteen Parvas in full** (`e1c7510`): 100 synopsis paragraphs,
   Adi through Svargarohana; ParvaIndex shows them indented under each
   known parva.
5. **DARK-style journeys** (`6430a53` + `e7434c7`): CharacterJourney
   scrolls a life parva by parva, ScrollTrigger writing
   atmosphere.portrait per chapter (PortraitPlane crossfades), Devanagari
   rail scrubber, per-chapter spoiler gating. Arjuna (9 chapters),
   Bhishma (6), Draupadi (7) authored. fetch-art.mjs verifies PD/CC0 via
   the Commons API before download (discovery mode lists candidates for
   scene verification by eye); three verified paintings now crossfade
   inside the journeys.

Decisions taken with the user: journeys for ALL characters eventually,
near-book prose depth, TV stills permitted case-by-case (pipeline flags
them `unverified` so exposure stays auditable; none used yet).

## Session 12 - Two plans converge (2026-07-11)

A different agent (Codex) implemented two approved plans directly into
the working tree while the full-bleed portrait work was in flight. This
session reviewed, hardened, and landed all of it as three commits.

1. **Art system + data foundation** (`a128bff`): every artwork now
   carries machine-verified provenance (creator, source, provider,
   origin, license + URL, subjects); generated work additionally needs
   prompt records and an approval state, and getArt/getJourneyArt refuse
   anything not approved. Six-character AI pilot: 4 portraits (Karna,
   Kunti, Abhimanyu, Ashwatthama) + 12 journey scenes, each reviewed by
   eye against canon before keeping its approval (Karna's kavacha, the
   owl omen, the gem at dawn all check out). /credits centralizes
   disclosure. New event/thread/strategic-day/relationship data, cited.
2. **Dual-path experience mode + full-bleed portraits** (`0a67e2f`):
   the Kalachakra now offers Experience the Telling (guided) or Open the
   Epic; persist schema v2 migrates old visitors (full wheel -> open).
   StoryDepthGuard replaces SpoilerGuard, same fail-closed hydration.
   The portrait plane spans the whole viewport with a shader-side veil
   (uFadeX smoothstep) dissolving its left edge under the text column;
   answers "why is the painting only half the screen?" for good.
3. **Signature experiences** (`5b971cb`): Drishti (Karna's final duel
   through five pairs of eyes), the Web of Vows (nine causal threads),
   Sanjaya's Eye (five war days as procedural canvas formations).
   Review caught that none of the three gated by narrative depth; a
   guided visitor at parva 1 could read Kunti's secret from the menu.
   All three now veil exactly like the journeys do, verified headless
   at depth 0 and in open mode (localStorage v0 -> v2 migration too).

Verification: tsc, eslint, validate-kb (now a provenance engine),
check-prose, production build (53 static pages), and a headless-browser
pass over every new route in both modes with zero console errors.

Then the pilot six got their journeys (`cae5c75`): 39 chapters, 151
paragraphs in the established voice, each chapter cited to the Ganguli
sections it retells, with the 12 approved generated scenes attached
exactly where the plans reserved them. Nine of 39 characters now scroll
parva by parva. Verified in the browser: Karna's rail runs Adi to Stri,
the tournament-crown and final-wheel scenes crossfade, credits carry
the project-generated disclosure inline.

## Session 13 - The design-remediation pass (2026-07-12)

The user browsed the live deploy and came back with five screenshots:
portraits too dark and seemingly partial, Sanjaya's dots unexplained,
/war a punishing scroll, Ashwatthama's page near-black, and a menu you
couldn't scroll. One session, five fixes, five commits. (The five
product backlog items below were *not* part of this session; a parallel
workstream expanded the KB to 75 characters while this ran.)

1. **Exposure, not brightness** (`08f233e`): the shader grade rises
   0.80 → 0.90 and gains a per-artwork `exposure` multiplier threaded
   art.json → `atmosphere.portrait` → a `uExposure` uniform. The subtle
   part: uReveal-matched uniforms update **per-frame from the channel**,
   not in the texture-swap callback, so presentation changes land even
   when the URL doesn't change — but only while the shown texture is the
   wanted one, so an outgoing painting never retints mid-crossfade.
   Ashwatthama's intrinsically dark generated portrait gets 1.35 and
   finally reads. The three-layer DOM veil became a localized text
   scrim (`from-void from-8% via-void/70 via-50% to-transparent`);
   first attempt over-lightened and bright oils like *Bheeshma's Oath*
   washed the labels out — brightening images and keeping 4.5:1 text
   are the same knob turned opposite ways, so the scrim carries
   legibility and the shader veil (`uFadeX` 0.45 → **0.34**) stops
   hiding the painting. Wider measures, fluid-clamp headings
   (ASHWATTHAMA clipped at 390px — session 8's lesson, new victim),
   and a back link to /who on every character page.
2. **Sanjaya's Eye legend** (`078937f`): gold = Pandava host,
   vermillion = Kaurava host, one line saying the points draw the day's
   battle array, the same facts in the canvas aria-label (allegiance
   never rides on color alone), and the day's Ganguli citations under
   the phases.
3. **The menu scrolls** (`1cdef89`): body `overflow: hidden` never
   stopped Lenis because Lenis doesn't scroll natively — it eats wheel
   events and writes scroll positions every frame. The instance now
   lives in a `lib/lenis.ts` singleton (the atmosphere pattern); the
   menu calls `stop()`/`start()` and the overlay carries
   `data-lenis-prevent` so its own list scrolls natively.
4. **/war compacted** (`c52e43b`): the real length culprit was
   `min-h-[55vh]` on every day, not just the 141 always-open
   paragraphs. Sections are content-sized now, chronicles fold behind
   "Read the day in full +" (the /parvas accordion), and the page went
   from ~30 viewports to ~13. A Devanagari day rail tracks the active
   day; the biggest catch: **native smooth `scrollIntoView` silently
   loses to Lenis** (it rewrites scroll every frame), which had been
   quietly breaking the journey rail on character pages too — both now
   jump through `lenis.scrollTo`. Details toggles refresh ScrollTrigger
   inside rAF so the spine scrub survives height changes; `/war#day-N`
   cold loads replay the hash jump after the fail-closed store lets the
   days render.
5. **The paintings enter the war** (`838603f`): `WarDay.art` and
   `Parva.art` reference approved journey art, crossfaded through the
   existing portrait channel at `strength: 0.45` — a reveal *ceiling*
   added to the channel rather than a flipped veil, because /war text
   alternates sides and the shader only dissolves the left edge; at
   half strength the tableaux read as atmosphere under either column.
   Hold-until-next-anchor semantics (the charioteer carries days 1–9,
   the arrow bed 10–12; /parvas fades to smoke after Sauptika) avoid
   fade-to-black churn on unillustrated entries. Anchor maps are built
   from spoiler-visible entries only — verified in the network log:
   guided depth 3 requests exactly one painting. Reduced motion gets
   inline tableaux, the journey-chapter pattern. /parvas also gained
   the rail, watermark numerals, and a wider synopsis measure.

Verified per fix in a real browser (Playwright): before/after
screenshots at matched viewports, both experience modes, network-log
spoiler checks, reduced-motion fallbacks, mobile at 390px. tsc, eslint,
check-prose, validate-kb (now also range-checking `exposure` and
resolving art anchors), and a production build all green.

## Backlog

1. Journeys for the remaining ~30 characters (next tier: Bhima,
   Yudhishthira, Draupadi's kin, Drona, Gandhari, Shakuni); source
   per-chapter art via scripts/fetch-art.mjs discovery mode.
2. Broaden the KB toward ~75 characters (Vichitravirya, Amba, Hidimbi,
   Ghatotkacha line, Satyaki, Yuyutsu, Uttara, Ekalavya kin, ...) via
   Sorensen's Index / Dowson (both PD, archive.org).
3. Recorded audio layers: SampleBank on the existing AudioContext,
   Freesound CC0 conch (sound 439477) + tanpura loops, synth stays the
   fallback; audio.json schema already shipped.
4. More Drishti events (the dice hall, the night raid) and strategic
   days; the data contracts are validated and waiting.
5. Custom domain, if the project earns one.

## Session 14 - The full visual atlas (2026-07-13)

The approved backlog became a complete production atlas: exactly 75
characters, a cited journey for every character, 75 approved hero artworks,
and the chapter-length scene rule enforced across the whole knowledge base.
The final runtime inventory is 150 generated journey scenes plus 17 preserved
curated journey paintings, with two scenes for 1-3 chapters, three for 4-6,
and four for journeys of seven chapters or more.

The ImageGen contract is now data, not an informal convention. Every generated
asset carries its role, subjects, final prompt, model, date, output files,
review notes, and approval state. Historical public-domain art remains the
first choice; generation fills canonical gaps without replacing strong
paintings. Character scenes use the accepted hero as their identity reference
so complexion, age, costume vocabulary, weapons, and heraldry stay coherent.
Masters remained staging artifacts; only optimized WebP derivatives entered
`public/`. Hero files stay under 500 KB, scene and war files under 700 KB, and
every generated hero has a thumbnail.

Review was deliberately fail-closed. Ambalika's first portrait read as male
and Parashara's first portrait read as a warrior, so both were rejected and
regenerated with targeted corrections. Four potentially unsafe or misleading
scenes were reframed symbolically: Ganga's seven sons as lotus lamps and Vasu
constellations, Satyavati and Parashara as a mist-bound ferry encounter,
Karna's divine armor as an intact exchange on cloth, and the infant Parikshit
as a healthy child receiving Krishna's blessing. Runtime lookup still rejects
unapproved work.

The Eighteen Days now has 18 unique wide tableaux, one cited composition per
day, registered as `war-day-01` through `war-day-18`. Desktop connects the
active day to the existing portrait atmosphere at restrained strength;
reduced-motion and mobile layouts render the same work inline. The art map is
built only from spoiler-visible days, and both war and character journeys warm
only the active and next texture. Route cleanup clears the portrait channel so
images cannot leak between experiences.

The remaining knowledge backlog landed with the art: the balanced 36-person
roster expansion, journeys for the original characters that lacked them, dice
hall and night-raid Drishti events with five cited perspectives each, causal
thread links, and all 18 cited Sanjaya strategy days. Credits now groups 75
heroes, journey scenes, and war tableaux into collapsible provenance sections;
the character index lazy-loads and asynchronously decodes thumbnails.

Recorded-audio plumbing also landed as a `SampleBank` on the existing
AudioContext. It preloads and decodes optional conch and tanpura recordings,
while the existing synthesis remains the complete fetch/decode/runtime
fallback. Two selected strict-CC0 Freesound recordings ship as their public
high-quality MP3 derivatives: RoofDog's `Conch.wav` and luckylittleraven's
`Tanpura Slap Drone C sharp.wav`. Their author, source page, and CC0 1.0 terms
are recorded in `audio.json` and surfaced on `/credits`.

The programmatic audit reports 75/75 approved heroes, zero missing journey
scenes, 18/18 war tableaux, no duplicate prompt IDs, no generated size
violations, and no unapproved runtime references. `npx tsc --noEmit`, lint,
prose checks, KB validation, and the production build all pass. Next.js emitted
exactly 91 static pages: 75 character routes, three Drishti routes, and the
remaining atlas surfaces. A real-browser pass is still pending because neither
a local Playwright binary nor an in-app browser connection was available in
this environment. The custom domain remains explicitly deferred.

### Remaining external verification

1. Run the visual/browser matrix once Playwright or the in-app browser is
   locally available.

## Session 15 - The vyuhas become real (2026-07-13)

Sanjaya's Eye had been describing eighteen mornings with five abstract
patterns: eight days shared one static grid, five shared one crescent, and
both hosts always drew the same shape. Day 3 was titled "Eagle against
crescent" while rendering two crescents. The day chronicles on /war already
named the true arrays with citations, so the diagram was contradicting text
one click away.

The strategic schema now gives each host its own named vyuha per day:
`StrategicDay.hosts.{pandava,kaurava}` carries a `Vyuha` shape id, an English
name, and its Devanagari. Seventeen procedural generators replaced the five
patterns in `SanjayaEye.tsx`: a parametric bird serves the crane, eagle, and
hawk (they differ in beak and wing, not in kind); the vajra tapers and kinks
toward its point; the makara opens two jaws; the chakravyuha is a turning
spiral that day 13's gold needle pierces; day 14 nests the cart, the lotus,
and the needle in index thirds; day 15 dissolves both hosts into drifting
night clusters. Every shape is authored in local coordinates with a `facing`
mirror, so beaks, horns, and needle points always aim at the opposing host,
and a slow per-point drift keeps every array alive (the old grid ignored
time entirely). The legend names both vyuhas in English and Devanagari, and
the canvas aria-label describes both arrays.

All eighteen assignments come from the war-day narratives and their Ganguli
citations; where the text names no counter-array the label stays honest
("The counter-line", pankti). `validate-kb` now rejects unknown vyuha ids
and missing host names. Verified in a real browser this time: all 18 days
clicked through Playwright with zero console errors, and days 1, 3, 5, 13,
14, and 15 screenshot-confirmed as distinct facing formations.

### The cinematic pass (committed alongside)

A parallel session lifted the site out of the crush: the void palette rose
from #05060a to #090b12, the portrait shader now runs at 1.08 exposure with
most of its desaturation and indigo wash removed, tableaux climbed from 0.45
to 0.78 strength, and the vignette thinned. Legibility moved from global
dimming to local ink: an `.ink-wash` gradient sits only behind reading
columns, `.reading-ink` puts a blurred wash behind each alternating war-day
block, and `painting-readable`/`cinematic-control` add text shadows to type
that floats over paint. Reviewed in a real browser across desktop and mobile
widths on /who, /who/karna, /war, /war/strategy, /parvas, /drishti, and
/family-tree; the one fix the review demanded was a stronger mobile
`.reading-ink` wash, where day text sits centered over the brightest part of
the paintings. One environment lesson: a stale Turbopack persistent cache
(.next/dev) can serve a globals.css chunk that silently lacks newly added
rules; when styles are missing that exist on disk, clear the dev cache
before debugging the CSS itself.

---

## Session 16 - A trailer of the real thing (2026-07-13)

### The decision: capture the site, don't re-create it

The goal was a "banger" ~45s demo video for X. The tempting path — rebuild the
smoke shader, the particle wheel, and the vyuha arrays inside Remotion as
motion graphics — was rejected. The whole pitch of this site is that the
motion is *live*: a GLSL smoke canvas, 16,000 scrubbed particles, Lenis-eased
scroll. A trailer *about* those effects would be weaker than a trailer *of*
them. So the pipeline captures the actual deployed site and only adds the
editorial layer — captions, cuts, a closing card — in Remotion. Everything
lives in an isolated `demo-video/` package so the site's dependency tree is
never touched.

### Capturing a 1080p site on an 864p desktop

First captures looked wrong — content sat off-center, clipped. The cause was
physical: the laptop's logical desktop is 1536×864 (a 1080p panel at 125%
scaling), so a *headed* Chromium window can never actually be 1920×1080. The
browser emulates the larger viewport but only shows a clipped corner, and
headed GPU compositing of an off-window region is unreliable. The fix was to
render fully offscreen in **new-headless** (`channel: "chromium"`, GPU via
ANGLE d3d11) at a true 1920×1080 — framing then stops depending on the display
at all. `page.screencast` (Playwright 1.59+) records one webm per scene.

Two other capture lessons. **Seed the store**: a fresh browser defaults to
`experienceMode: null`, which renders the family tree and vyuhas as locked "?"
placeholders — an `addInitScript` writing the "open" envelope to the
`mahabharat-progress` localStorage key reveals the whole atlas. **Never
`scrollTo`**: Lenis owns the scroll, so the driver sends real `mouse.wheel`
ticks and lets the site's own lerp(0.12) turn discrete steps into cinematic
glide; the first pass raced through all 18 war days because the deltas were
too large. Network latency to the deployed site also made scripted clicks land
later than nominal, which shifted the chakravyuha several seconds into the
strategy clip — caught by extracting frames and re-aligning the caption rather
than trusting the timing math.

### The composite

Screencast webm is variable-frame-rate, so every clip is transcoded to CFR
30fps H.264 (`ffmpeg-static`) before Remotion — frame-accurate trims depend on
it. The cut is a `TransitionSeries` of eight shots driven by a single
`config.ts` cut sheet (clip, trimBefore, duration, cut/fade, captions), opening
on the wheel of fire as the hook and closing on a Remotion-drawn URL card.
Captions use the site's own three faces via `@remotion/google-fonts` over a
gradient scrim, so they read for muted autoplay (X's default) without
competing with the site's own typography. Result: 42s, 1080p, ~29 MB — well
inside X's limits. Verified the way everything else here is: by rendering and
eyeballing extracted frames at every scene and transition, not by trusting the
timeline. Music is left as a drop-in (`public/audio/music.mp3` + a
`HAS_MUSIC` flag) so a licensed track never gets committed.

---

## Session 17 - The trailer becomes a film (2026-07-13)

### The verdict on session 16: "it just looks like a screen recording"

The captioned screen-capture cut was competent but not cinema. Every shot
carried the site's chrome (the menu glyph, the corner chakra, "SCROLL" hints,
nav tabs) and the captions sat in a lower-third scrim — the grammar of a
tutorial, not a trailer. The one shot that sang was the full-frame fire-wheel,
because it was pure imagery with no UI. That was the whole lesson: rebuild it as
a **motion-graphics film**, ~70% procedural, zero browser UI in the cinematic
act.

The pivot exploited an asset the earlier plan undervalued: the repo already
holds a stylistically-consistent library of ~337 painterly images (all 18
war-day tableaux, event scenes, the whole cast) plus the site's own smoke and
particle shaders. So the trailer needed no external AI video — it could be
composed in Remotion from what the project already generates.

### Everything is a function of the frame

The site's `SanjayaEye` and `VishvarupaParticles` animate with
`requestAnimationFrame` — wall-clock, non-deterministic, useless to a frame
renderer. The rebuild ports the exact formation math (`vyuhaPoint`) into
`lib/field.ts` as a pure function of a frame-derived time, drawn through a
`delayRender`-gated canvas so the offline renderer never captures a half-drawn
frame. The same discipline drives the ember fields, the clash of particle
armies, the self-drawing dynasty, and the 18-spoke Kalachakra. The site's
breathing-painting grade (`PortraitPlane.tsx`) is reproduced as a 2D
camera-push-plus-grade for the four painting accents (Draupadi, Krishna, Karna,
Bhishma), which are the *only* source images in the cinematic act.

### The film has three acts, and the middle one shows the product

A pure art-film would have failed the actual brief — this is a **launch video
for a website someone built**. So the cut is deliberately three acts: Act 1 is
the cinematic procedural world; Act 2 is a product reveal that opens the real
site inside a minimal browser frame (address bar and all) before going
full-bleed through a feature montage — here the UI that was poison in Act 1 is
exactly what signals "this is an interactive site you can visit"; Act 3 is the
title and URL. The 56s runtime is set by the user's supplied track, and the
beat markers were placed against an FFmpeg RMS-envelope analysis of that track
(it builds to a loud finale rather than dropping, so the title reveal lands on
the loudest bars).

### The render nearly didn't finish

First full render crawled — each frame slower than the last — and died at frame
631 on a 30s-per-frame timeout. The cause was canvas `shadowBlur`: gaussian-
blurring 560 + 840 + 90 glowing particles every frame is murderously expensive
and leaks. Replacing it with pre-rendered radial-gradient **glow sprites**
(`lib/glow.ts`) drawn additively cut per-frame cost dramatically and removed the
hang; reusing one offscreen buffer for grain/smoke instead of allocating a
canvas per frame stopped the memory growth. Lesson banked: on a software-canvas
headless render, `shadowBlur` at scale is a non-starter — bake the glow once.

Verified the way everything here is: render, then read back extracted frames at
every beat and transition — cold open धर्म, the Kalachakra, the lineage split,
the chakravyuha pierced, the browser-frame reveal, the title — confirming no
browser UI in Act 1, real motion (not flat Ken Burns), and legible type
throughout. The screen-capture pipeline from session 16 survives only as the
source of the Act 2 clips and the one reused fire-wheel.

## Session 18 - Two small cuts that stop the gate lying (2026-07-15)

### The Kalachakra was overwriting the visitor's place

Two bugs surfaced from real clicking on `/saga`. First, choosing **Open the
Epic** and then switching back to **Experience the Telling** snapped the wheel
to "Parva 18 of 18." The cause was in the store: selecting open mode
force-wrote `knownParva = 18`, so the return to guided read that 18 as the
visitor's position. But that write was never needed. Every gated surface
already unlocks through `selectAccessibleParva`, which returns 18 for open mode
regardless of `knownParva`. So the fix was to stop touching `knownParva` in
open mode at all and let it stand as the true guided position. Now open and
guided are genuinely independent: the unlock reach is derived, the remembered
place is preserved, and toggling between the modes no longer destroys progress.

Second, a missing affordance rather than a bug: in open mode, reaching for a
single book (any parva under 18) reads as a request for the telling, not for
the full-atlas view. `choose()` now flips the mode to guided and lands the
position on that parva when the visitor clicks below 18; clicking the 18th
segment still keeps "all eighteen books." The card state follows automatically
because the mode itself changes.

### The ink-wash was a bar, not a wash

The reading scrim behind the left parva column carried a 90deg linear gradient
that darkened the left edge with the blue-tinted void (`#090b12`) and faded out
mid-column. On the centered painting pages that hard left edge floated inside a
full-bleed painting on wide screens, reading as a vertical bar cutting the
image. The `.ink-wash` class is shared by five surfaces, so this was the same
seam everywhere. The fix drops the linear band entirely (desktop and mobile
overrides both) and keeps only the soft left-biased radial glow; legibility
still rides on that glow plus the existing `.painting-readable` text-shadows.
The paintings now read cleanly across the full width.

Removing the band did cost some contrast where text sits over the bright sky
and water, so the `/parvas` copy that was painted in the dim `ash` grey (the
intro line, each book's meaning) or low-opacity bone (the Devanagari, the
character chips, the synopsis) was lifted toward warm-white `bone` at high
opacity. The lesson: over a busy painting, legibility is carried by contrast,
not colour alone - the dark text-shadow halo was already there, so the fix was
just to stop painting the text grey and let the halo work. The one place a
brighter colour was not enough was the full-parva synopsis, a long passage that
runs across the bright water: it borrows the existing `.reading-ink` scrim (a
soft, blurred, localized darkening built for the war timeline) so the block gets
its own backdrop only when expanded, keeping the painting clean by default. The
vermillion vow chips, red-on-orange and inherently low-contrast, got a faint
`void` fill rather than more halo (a stronger text-shadow lost the specificity
fight with `.painting-readable .ui-label` anyway); the dark pill makes the red
pop and reads as a distinct thread-chip category.

Verified by driving `/saga` through the open-then-guided toggles (no 18 snap),
the sub-18 auto-switch, a fresh-visitor start at Parva 1, and confirming
`/parvas` still unlocks all books in open mode while the bluish bar is gone.
