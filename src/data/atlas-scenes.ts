import type { Character, JourneyArtEntry } from "@/data/schema";

export interface AtlasSceneJob {
  assetId: string;
  characterId: string;
  characterName: string;
  chapterIndex: number;
  chapterTitle: string;
  chapterText: string;
  parva: number;
  composition: "action-left" | "action-right";
}

const targetFor = (chapters: number) => chapters <= 3 ? 2 : chapters <= 6 ? 3 : 4;

function spreadIndexes(length: number, count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [Math.floor((length - 1) / 2)];
  return [...new Set(Array.from({ length: count }, (_, index) =>
    Math.round(index * (length - 1) / (count - 1)),
  ))];
}

/** Assigns deterministic signature-scene ids without overwriting curated art. */
export function buildAtlasScenePlan(input: Character[]) {
  const jobs: AtlasSceneJob[] = [];
  const art: Record<string, JourneyArtEntry> = {};
  const characters = input.map((character) => {
    const journey = character.journey ?? [];
    const target = targetFor(journey.length);
    const existing = journey.filter((chapter) => chapter.image).length;
    const needed = Math.max(0, target - existing);
    const unillustrated = journey.map((chapter, index) => chapter.image ? -1 : index).filter((index) => index >= 0);
    const relative = spreadIndexes(unillustrated.length, needed);
    const chosen = new Set(relative.map((index) => unillustrated[index]));
    let ordinal = 0;
    const withImages = journey.map((chapter, chapterIndex) => {
      if (!chosen.has(chapterIndex)) return chapter;
      ordinal += 1;
      const assetId = `${character.id}-atlas-scene-${String(ordinal).padStart(2, "0")}`;
      const composition = (jobs.length + ordinal) % 2 === 0 ? "action-left" : "action-right";
      jobs.push({
        assetId,
        characterId: character.id,
        characterName: character.name,
        chapterIndex,
        chapterTitle: chapter.title,
        chapterText: chapter.text.join(" "),
        parva: chapter.parva,
        composition,
      });
      art[assetId] = {
        title: `${character.name} · ${chapter.title}`,
        creator: "OpenAI image generation",
        year: "2026",
        source: `project://imagegen/${assetId}`,
        provider: "openai-imagegen",
        origin: "ai-generated",
        license: "project-generated",
        licenseUrl: "/credits",
        subjects: [character.id],
        aiTool: "OpenAI ImageGen",
        approval: "approved",
        role: "journey",
        generation: {
          promptId: assetId,
          model: "gpt-image-2",
          created: "2026-07-12",
          referencePolicy: "public-domain-references",
        },
        files: { full: `/art/journey/generated/${assetId}.webp` },
        position: composition === "action-left" ? "30% 45%" : "70% 45%",
      };
      return { ...chapter, image: assetId };
    });
    return { ...character, journey: withImages };
  });
  return { characters, art, jobs };
}
