import type { Character, Parva, WarDay } from "@/data/schema";
import charactersData from "@/data/characters.json";
import parvasData from "@/data/parvas.json";
import warDaysData from "@/data/war-days.json";
import artData from "@/data/art.json";

export interface ArtEntry {
  title: string;
  year: string;
  source: string;
  /** CSS object-position focal hint */
  position: string;
}

/** Public-domain Raja Ravi Varma paintings, keyed by character id. */
export const art = artData as Record<string, ArtEntry>;

export function getArt(id: string): (ArtEntry & { file: string; thumb: string }) | undefined {
  const a = art[id];
  if (!a) return undefined;
  return { ...a, file: `/art/${id}.webp`, thumb: `/art/${id}-thumb.webp` };
}

export const characters = charactersData as Character[];
export const parvas = parvasData as Parva[];
export const warDays = warDaysData as WarDay[];

export const charactersById = new Map(characters.map((c) => [c.id, c]));

export function getCharacter(id: string): Character | undefined {
  return charactersById.get(id);
}

export interface TreeEdge {
  from: string;
  to: string;
  kind: "parent" | "marriage";
}

/**
 * Edges derived from the KB itself - a parent link exists whenever a
 * character's `parents` mentions another KB id (this is what draws Karna's
 * long, terrible line from Kunti across the whole tree).
 */
export function buildTreeEdges(): TreeEdge[] {
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
  return edges;
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
