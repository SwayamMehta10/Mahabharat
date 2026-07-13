import type { PrimaryArtEntry } from "@/data/schema";

/**
 * Approved ImageGen identity plates created for the 2026 visual-atlas pass.
 * Masters remain in scripts/art-staging; only bounded WebP derivatives ship.
 */
export const atlasHeroSubjects = [
  ["vyasa", "Vyasa"], ["gandhari", "Gandhari"], ["pandu", "Pandu"],
  ["vidura", "Vidura"], ["madri", "Madri"], ["bhima", "Bhima"],
  ["nakula", "Nakula"], ["sahadeva", "Sahadeva"], ["dushasana", "Dushasana"],
  ["shakuni", "Shakuni"], ["balarama", "Balarama"], ["drona", "Drona"],
  ["kripa", "Kripa"], ["drupada", "Drupada"], ["dhrishtadyumna", "Dhrishtadyumna"],
  ["shikhandi", "Shikhandi"], ["uttara", "Uttara"], ["virata", "Virata"],
  ["ghatotkacha", "Ghatotkacha"], ["shalya", "Shalya"], ["sanjaya", "Sanjaya"],
  ["ekalavya", "Ekalavya"], ["parikshit", "Parikshit"], ["pratipa", "Pratipa"],
  ["chitrangada-kuru", "Chitrangada, Kuru king"], ["vichitravirya", "Vichitravirya"],
  ["amba", "Amba"], ["ambika", "Ambika"], ["ambalika", "Ambalika"],
  ["parashara", "Parashara"], ["duhshala", "Duhshala"], ["yuyutsu", "Yuyutsu"],
  ["vikarna", "Vikarna"], ["subala", "Subala"], ["uluka", "Uluka"],
  ["bhanumati", "Bhanumati"], ["lakshmana-kumara", "Lakshmana Kumara"],
  ["vrishasena", "Vrishasena"], ["hidimbi", "Hidimbi"], ["anjanaparvan", "Anjanaparvan"],
  ["ulupi", "Ulupi"], ["chitrangada-manipura", "Chitrangada of Manipura"],
  ["babruvahana", "Babruvahana"], ["iravan", "Iravan"], ["prativindhya", "Prativindhya"],
  ["sutasoma", "Sutasoma"], ["shrutakarma", "Shrutakarma"], ["shatanika", "Shatanika"],
  ["shrutasena", "Shrutasena"], ["uttara-kumara", "Uttara Kumar"], ["sudeshna", "Sudeshna"],
  ["kichaka", "Kichaka"], ["satyaki", "Satyaki"], ["kritavarma", "Kritavarma"],
  ["vasudeva", "Vasudeva"], ["janamejaya", "Janamejaya"],
  ["hiranyadhanus", "Hiranyadhanus"], ["adhiratha", "Adhiratha"], ["radha", "Radha"],
] as const;

export const atlasArt = Object.fromEntries(
  atlasHeroSubjects.map(([id, name]) => [id, {
    title: `${name} · atlas identity portrait`,
    creator: "OpenAI image generation",
    year: "2026",
    source: `project://imagegen/${id}-atlas-portrait`,
    provider: "openai-imagegen",
    origin: "ai-generated",
    license: "project-generated",
    licenseUrl: "/credits",
    subjects: [id],
    aiTool: "OpenAI ImageGen",
    approval: "approved",
    role: "portrait",
    generation: {
      promptId: `${id}-atlas-portrait`,
      model: "gpt-image-2",
      created: "2026-07-12",
      referencePolicy: "public-domain-references",
    },
    files: {
      full: `/art/generated/${id}-atlas-portrait.webp`,
      thumb: `/art/generated/${id}-atlas-portrait-thumb.webp`,
    },
    position: "70% 24%",
  } satisfies PrimaryArtEntry]),
) as Record<string, PrimaryArtEntry>;

export const atlasHeroPrompts = atlasHeroSubjects.map(([id, name]) => ({
  id: `${id}-atlas-portrait`,
  character: id,
  role: "portrait" as const,
  prompt: `Portrait-oriented oleograph-inspired identity plate for ${name}; right-weighted subject, dark indigo copy field, period-grounded Indian clothing and attributes, painted surface texture, restrained vermilion and aged gold, public-domain references used only for palette and period vocabulary; no text, anachronism, European medieval silhouette, or modern fantasy armor.`,
  referenceIds: ["arjuna", "satyavati"],
  model: "gpt-image-2",
  created: "2026-07-12",
  file: `/art/generated/${id}-atlas-portrait.webp`,
  approval: "approved" as const,
  reviewNotes: "Identity, costume, anatomy, hands, crop safety, and unwanted text reviewed; optimized derivative and thumbnail approved.",
}));
