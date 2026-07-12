/**
 * Knowledge-base schema. Every fact carries a citation into the
 * K.M. Ganguli translation (public domain, 1883–96) at the parva level,
 * cross-checkable against the BORI critical edition.
 */

export type Allegiance = "pandava" | "kaurava" | "neutral" | "divine";

export type ArtworkOrigin = "historical" | "ai-generated";
export type ArtworkProvider =
  | "wikimedia-commons"
  | "openverse"
  | "pixabay"
  | "met-museum"
  | "smithsonian"
  | "openai-imagegen";
export type ArtworkLicense =
  | "public-domain"
  | "cc0"
  | "cc-by"
  | "cc-by-sa"
  | "pixabay-content-license"
  | "unverified"
  | "project-generated";

export type ArtApproval = "draft" | "reviewed" | "approved";
export type ArtRole = "portrait" | "journey" | "event";

export interface ArtGeneration {
  promptId: string;
  model: string;
  created: string;
  referencePolicy: "text-only" | "public-domain-references";
}

export interface ArtFiles {
  full: string;
  thumb?: string;
}

/** Shared, machine-verifiable provenance for every production artwork. */
export interface ArtworkProvenance {
  creator: string;
  source: string;
  provider: ArtworkProvider;
  origin: ArtworkOrigin;
  license: ArtworkLicense;
  licenseUrl: string;
  /** Character ids visibly represented by the artwork. */
  subjects: string[];
  /** Generator name when the source identifies an AI-created work. */
  aiTool?: string;
  /** Required for generated work and intentionally absent from historical records. */
  approval?: ArtApproval;
  role?: ArtRole;
  generation?: ArtGeneration;
  /** Explicit runtime derivatives; generated masters never appear here. */
  files?: ArtFiles;
}

/** Primary character portrait and its index/tree thumbnail. */
export interface PrimaryArtEntry extends ArtworkProvenance {
  title: string;
  year: string;
  position: string;
}

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
  /** Guided-depth tier: minimum parva before full reveal (else silhouette) */
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

export type RelationshipKind = "parent" | "marriage" | "mentor" | "allegiance";

export interface EpicRelationship {
  from: string;
  to: string;
  kind: Exclude<RelationshipKind, "parent" | "marriage">;
  label: string;
}

export interface EventPerspective {
  characterId: string;
  heading: string;
  text: string;
  citations: string[];
  threadIds: string[];
}

export interface EpicEvent {
  id: string;
  title: string;
  deva: string;
  parva: number;
  day?: number;
  summary: string;
  image?: string;
  perspectives: EventPerspective[];
}

export interface CausalThread {
  id: string;
  title: string;
  kind: "vow" | "curse" | "boon" | "secret" | "debt";
  summary: string;
  parvas: number[];
  characterIds: string[];
  eventIds: string[];
  citations: string[];
}

export interface StrategicDay {
  day: number;
  formation: string;
  pattern: "lines" | "crescent" | "wheel" | "duel" | "encirclement";
  phases: string[];
  focus: string;
}

/**
 * A piece of art usable as a journey-chapter background. One asset can
 * serve chapters of several characters, so entries live in their own
 * manifest keyed by asset id (file: /art/journey/{assetId}.webp).
 * "unverified" is available to staging tools but rejected by production
 * validation, so television stills cannot enter the runtime manifest.
 */
export interface JourneyArtEntry extends ArtworkProvenance {
  title: string;
  year: string;
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
