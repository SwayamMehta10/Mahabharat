/**
 * Knowledge-base schema. Every fact carries a citation into the
 * K.M. Ganguli translation (public domain, 1883–96) at the parva level,
 * cross-checkable against the BORI critical edition.
 */

export type Allegiance = "pandava" | "kaurava" | "neutral" | "divine";

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
}

export interface Parva {
  number: number;
  id: string;
  name: string;
  deva: string;
  meaning: string;
  summary: string;
}

export interface WarDay {
  day: number;
  title: string;
  commanderKaurava: string;
  commanderPandava?: string;
  events: string[];
  falls: string[]; // character ids of major deaths
  citations: string[];
}
