import { getJourneyArt } from "@/lib/kb";
import type { atmosphere } from "@/lib/atmosphere";

/** How present the war and parva tableaux are: atmosphere behind the
 *  reading column, not the full-strength treatment the journeys use. */
export const TABLEAU_STRENGTH = 0.45;

/** Resolve an approved journey-art id into an atmosphere.portrait request. */
export function toPortraitRequest(
  artId: string,
  strength: number
): (typeof atmosphere)["portrait"] {
  const a = getJourneyArt(artId);
  if (!a) return null;
  const [fx, fy] = a.position.split(" ").map((p) => (parseFloat(p) || 50) / 100);
  return {
    url: a.file,
    focalX: fx ?? 0.5,
    focalY: fy ?? 0.3,
    exposure: a.exposure,
    strength,
  };
}
