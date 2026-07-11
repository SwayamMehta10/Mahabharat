/**
 * Knowledge-base schema. Every fact carries a citation into the
 * K.M. Ganguli translation (public domain, 1883–96) at the parva level,
 * cross-checkable against the BORI critical edition.
 */

export type Allegiance = "pandava" | "kaurava" | "neutral" | "divine";

/**
 * One chapter of a character's journey through the epic, DARK-style:
 * the page scrolls chapter by chapter and the background painting
 * crossfades with each one. Keyed by parva for ordering AND spoiler
 * gating (a chapter is veiled until knownParva reaches it).
 */
export interface JourneyChapter {
  parva: number; // 1-18, the book this chapter belongs to
  title: string;
  /** Book-like narrative prose, one string per paragraph */
  text: string[];
  /** Asset id into journey-art.json; falls back to the primary portrait */
  image?: string;
  citations: string[]; // e.g. "Virata Parva §36"
}

export interface Character {
  id: string; // kebab-case slug
  name: string;
  deva: string; // Devanagari
  epithets: string[]; // e.g. "Gudakesha", "Radheya"
  allegiance: Allegiance;
  /** Divine father/aspect, if any: the luminous nodes above the tree */
  divineParent?: string;
  parents: string[]; // character ids (or plain names if outside the KB)
  spouses: string[];
  children: string[];
  weapons?: string[];
  /** War day (1–18) the character fell on, if they fell in the war */
  deathDay?: number;
  /** Parva (1–18) in which the character first appears */
  firstParva: number;
  bio: string;
  citations: string[]; // e.g. "Adi Parva §67", "Karna Parva §91"
  /** Spoiler tier: minimum knownParva before full reveal (else silhouette) */
  revealAtParva: number;
  /** Scrollable per-parva chapters; characters without one keep the bio page */
  journey?: JourneyChapter[];
}

export interface Parva {
  number: number;
  id: string;
  name: string;
  deva: string;
  meaning: string;
  /** One-breath summary for cards and navigation */
  summary: string;
  /** Full narrative synopsis, one string per paragraph */
  synopsis?: string[];
}

export interface WarDay {
  day: number;
  title: string;
  commanderKaurava: string;
  commanderPandava?: string;
  /** Scannable headline events (kept short; shown as the day's header) */
  events: string[];
  falls: string[]; // character ids of major deaths
  citations: string[];
  /** Book-like narrative of the day, one string per paragraph */
  narrative?: string[];
}

/**
 * A piece of art usable as a journey-chapter background. One asset can
 * serve chapters of several characters, so entries live in their own
 * manifest keyed by asset id (file: /art/journey/{assetId}.webp).
 * "unverified" marks material whose rights could not be confirmed
 * (e.g. television stills); validate-kb warns on every use.
 */
export interface JourneyArtEntry {
  title: string;
  artist: string;
  year: string;
  source: string; // where the file came from (URL)
  license: "public-domain" | "cc0" | "cc-by" | "unverified";
  /** CSS object-position focal hint */
  position: string;
}

/** A recorded audio layer blended over (or replacing) the synth bed. */
export interface AudioAsset {
  id: string; // file lives at /audio/{id}.mp3
  kind: "conch" | "tanpura" | "ambience" | "drum" | "sloka";
  /** Which soundscape scene the loop belongs to; one-shots omit this */
  scene?: "void" | "war" | "gita";
  gain: number; // 0..1 mix level against the synth bed
  loop: boolean;
  credit: {
    source: string; // human-readable origin, e.g. "Freesound"
    url: string;
    license: string; // e.g. "CC0"
    author?: string;
  };
}
