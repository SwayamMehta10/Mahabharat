import type Lenis from "lenis";

/**
 * The live Lenis instance, exposed the same way the atmosphere channel is:
 * a plain mutable holder, no React. SmoothScroll fills it on mount; the
 * overlay menu stops and restarts it so wheel events over a modal scroll
 * the modal, not the page behind it. Null under prefers-reduced-motion,
 * where Lenis never exists and native scrolling needs no pausing.
 */
export const lenisRef: { current: Lenis | null } = { current: null };
