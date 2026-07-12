/**
 * A tiny mutable channel between the DOM world and the WebGL world.
 * Pages write to it (on scroll, on events); the smoke shader reads it every
 * frame. No React state - nothing re-renders at 60fps.
 *
 * war:        0 = the night before (indigo) … 1 = day eighteen (ember and ash)
 * timeScale:  1 = the world flows … 0 = time stands still (the Gita moment)
 * vishvarupa: 0 = hidden … 1 = the cosmic form fully revealed
 * portrait:   the painting the current page wants rendered as a living
 *             texture (null = none); focal is the object-position in 0..1;
 *             exposure is a presentation-only brightness multiplier (1 =
 *             the standard grade); strength caps the crossfade reveal so
 *             a page can ask for the painting as atmosphere, not subject
 */
export const atmosphere = {
  war: 0,
  timeScale: 1,
  vishvarupa: 0,
  portrait: null as {
    url: string;
    focalX: number;
    focalY: number;
    exposure?: number;
    strength?: number;
  } | null,
};
