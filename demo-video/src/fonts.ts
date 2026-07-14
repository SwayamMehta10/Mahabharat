/**
 * The site's three typefaces, loaded through Remotion so renders block until
 * the glyphs are ready (no flash of fallback in a frame). Matches
 * src/app/layout.tsx on the site: Cormorant Garamond (display), Tiro
 * Devanagari Sanskrit (देवनागरी), Inter (UI labels).
 */

import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadTiro } from "@remotion/google-fonts/TiroDevanagariSanskrit";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const display = loadCormorant("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
}).fontFamily;

export const deva = loadTiro("normal", {
  weights: ["400"],
  subsets: ["devanagari"],
}).fontFamily;

export const ui = loadInter("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
}).fontFamily;

/** Site palette (globals.css). */
export const COLOR = {
  void: "#090b12",
  bone: "#ece7db",
  gold: "#c9a437",
  goldBright: "#e4c66a",
  ash: "#8c8577",
  vermillion: "#cf4a1f",
};
