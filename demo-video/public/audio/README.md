# Music track

The demo renders fine with no audio. To score it:

1. Drop a **CC0 / royalty-free dark-ambient** track here named exactly `music.mp3`.
   Good sources: [Pixabay Music](https://pixabay.com/music/), [Free Music Archive](https://freemusicarchive.org/) (CC0 filter). Look for cinematic / cematic / "epic ambient" ~45s or longer — the track is trimmed to the video length automatically.
2. Set `HAS_MUSIC = true` in [`../../src/config.ts`](../../src/config.ts).
3. Re-check the fade in/out in `npm run studio`, then `npm run render`.

The track fades up over the first second and ducks out under the closing URL card
(see `src/components/Soundtrack.tsx`). X autoplays muted, so the on-screen
captions carry the story regardless of sound.

`music.mp3` is git-ignored so licensed audio never gets committed.
