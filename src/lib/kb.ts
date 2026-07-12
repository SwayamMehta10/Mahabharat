import type {
  ArtworkLicense,
  AudioAsset,
  CausalThread,
  Character,
  EpicEvent,
  EpicRelationship,
  JourneyArtEntry,
  JourneyChapter,
  Parva,
  PrimaryArtEntry,
  RelationshipKind,
  StrategicDay,
  WarDay,
} from "@/data/schema";
import charactersData from "@/data/characters.json";
import parvasData from "@/data/parvas.json";
import warDaysData from "@/data/war-days.json";
import artData from "@/data/art.json";
import journeyArtData from "@/data/journey-art.json";
import audioData from "@/data/audio.json";
import relationshipsData from "@/data/relationships.json";
import epicEventsData from "@/data/epic-events.json";
import causalThreadsData from "@/data/causal-threads.json";
import strategicDaysData from "@/data/strategic-days.json";

/** Curated primary portraits, keyed by character id. */
export const art = artData as Record<string, PrimaryArtEntry>;

export function getArt(id: string): (PrimaryArtEntry & { file: string; thumb: string }) | undefined {
  const a = art[id];
  if (!a || (a.origin === "ai-generated" && a.approval !== "approved")) return undefined;
  return {
    ...a,
    file: a.files?.full ?? `/art/${id}.webp`,
    thumb: a.files?.thumb ?? `/art/${id}-thumb.webp`,
  };
}

/** Journey-chapter backgrounds, keyed by asset id (shared across characters). */
export const journeyArt = journeyArtData as Record<string, JourneyArtEntry>;

export function getJourneyArt(assetId: string): (JourneyArtEntry & { file: string }) | undefined {
  const a = journeyArt[assetId];
  if (!a || (a.origin === "ai-generated" && a.approval !== "approved")) return undefined;
  return { ...a, file: a.files?.full ?? `/art/journey/${assetId}.webp` };
}

const ART_LICENSE_LABELS: Record<ArtworkLicense, string> = {
  "public-domain": "public domain",
  cc0: "CC0",
  "cc-by": "CC BY",
  "cc-by-sa": "CC BY-SA",
  "pixabay-content-license": "Pixabay Content License",
  unverified: "unverified",
  "project-generated": "project-generated artwork",
};

export function artworkLicenseLabel(license: ArtworkLicense): string {
  return ART_LICENSE_LABELS[license];
}

/** Recorded audio layers; the synth bed remains the fallback for each. */
export const audioAssets = audioData as AudioAsset[];

export const characters = charactersData as Character[];
export const parvas = parvasData as Parva[];
export const warDays = warDaysData as WarDay[];
export const relationships = relationshipsData as EpicRelationship[];
export const epicEvents = epicEventsData as EpicEvent[];
export const causalThreads = causalThreadsData as CausalThread[];
export const strategicDays = strategicDaysData as StrategicDay[];

export const charactersById = new Map(characters.map((c) => [c.id, c]));

export function getCharacter(id: string): Character | undefined {
  return charactersById.get(id);
}

/** A character's journey chapters, sorted by parva (empty if none authored). */
export function getJourney(id: string): JourneyChapter[] {
  const c = charactersById.get(id);
  if (!c?.journey) return [];
  return [...c.journey].sort((a, b) => a.parva - b.parva);
}

export interface TreeEdge {
  from: string;
  to: string;
  kind: RelationshipKind;
  label?: string;
}

/**
 * Edges derived from the KB itself - a parent link exists whenever a
 * character's `parents` mentions another KB id (this is what draws Karna's
 * long, terrible line from Kunti across the whole tree).
 */
export function buildTreeEdges(kind?: RelationshipKind): TreeEdge[] {
  const edges: TreeEdge[] = [];
  const seenMarriage = new Set<string>();

  for (const c of characters) {
    for (const p of c.parents) {
      if (charactersById.has(p)) {
        edges.push({ from: p, to: c.id, kind: "parent" });
      }
    }
    for (const s of c.spouses) {
      if (charactersById.has(s)) {
        const key = [c.id, s].sort().join("|");
        if (!seenMarriage.has(key)) {
          seenMarriage.add(key);
          edges.push({ from: c.id, to: s, kind: "marriage" });
        }
      }
    }
  }
  edges.push(...relationships);
  return kind ? edges.filter((edge) => edge.kind === kind) : edges;
}

export function getEventsForCharacter(characterId: string): EpicEvent[] {
  return epicEvents.filter((event) =>
    event.perspectives.some((perspective) => perspective.characterId === characterId)
  );
}

export function getThreadsForParva(parva: number): CausalThread[] {
  return causalThreads.filter((thread) => thread.parvas.includes(parva));
}

/** Which parva (book) narrates a given day of the war. */
export function parvaOfWarDay(day: number): number {
  if (day <= 10) return 6; // Bhishma Parva
  if (day <= 15) return 7; // Drona Parva
  if (day <= 17) return 8; // Karna Parva
  return 9; // Shalya Parva
}

const DEVA_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toDevanagariNumeral(n: number): string {
  return String(n)
    .split("")
    .map((d) => DEVA_DIGITS[Number(d)] ?? d)
    .join("");
}
