import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => JSON.parse(readFileSync(join(ROOT, path), "utf8"));

function readTsExport(path, exportName) {
  const source = readFileSync(join(ROOT, path), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const moduleShim = { exports: {} };
  new Function("exports", "module", output)(moduleShim.exports, moduleShim);
  return moduleShim.exports[exportName];
}

const base = read("src/data/characters.json");
const additions = readTsExport("src/data/atlas-characters.ts", "atlasCharacters");
const expansions = readTsExport("src/data/journey-expansions.ts", "journeyExpansions");
const characters = [
  ...base.map((character) => ({ ...character, journey: character.journey ?? expansions[character.id] })),
  ...additions,
];
const buildAtlasScenePlan = readTsExport("src/data/atlas-scenes.ts", "buildAtlasScenePlan");
const atlasScenePlan = buildAtlasScenePlan(characters);
const plannedCharacters = atlasScenePlan.characters;
const art = {
  ...read("src/data/art.json"),
  ...readTsExport("src/data/atlas-art.ts", "atlasArt"),
};
const journeyArt = { ...read("src/data/journey-art.json"), ...atlasScenePlan.art };
const warDays = read("src/data/war-days.json");

const sceneTarget = (chapters) => chapters <= 3 ? 2 : chapters <= 6 ? 3 : 4;
const scenesByCharacter = new Map();
for (const [id, entry] of Object.entries(journeyArt)) {
  if (entry.role !== "journey" || entry.approval !== "approved" && entry.origin === "ai-generated") continue;
  for (const subject of entry.subjects ?? []) {
    const list = scenesByCharacter.get(subject) ?? [];
    list.push(id);
    scenesByCharacter.set(subject, list);
  }
}

const missingHeroes = characters.filter((character) => !art[character.id]).map((character) => ({
  id: character.id,
  name: character.name,
  deva: character.deva,
  epithets: character.epithets,
  allegiance: character.allegiance,
  weapons: character.weapons ?? [],
  bio: character.bio,
}));
const sceneGaps = plannedCharacters.map((character) => {
  const current = character.journey.filter((chapter) => chapter.image).map((chapter) => chapter.image);
  const target = sceneTarget(character.journey.length);
  return { id: character.id, name: character.name, chapters: character.journey.length, target, current, missing: Math.max(0, target - current.length), journey: character.journey };
}).filter((item) => item.missing > 0);
const war = warDays.map((day) => {
  const entry = journeyArt[day.art];
  const file = entry?.files?.full;
  const disk = file ? join(ROOT, "public", file.replace(/^\//, "")) : "";
  return { day: day.day, art: day.art, approved: entry?.approval === "approved", exists: Boolean(disk && existsSync(disk)), bytes: disk && existsSync(disk) ? statSync(disk).size : 0 };
});

const report = {
  characters: characters.length,
  heroes: { expected: characters.length, approved: Object.keys(art).length, missing: missingHeroes },
  journeys: { charactersWithGaps: sceneGaps.length, missingScenes: sceneGaps.reduce((sum, item) => sum + item.missing, 0), gaps: sceneGaps },
  war: { expected: 18, approved: war.filter((item) => item.approved && item.exists).length, items: war },
};

const heroBatchIndex = process.argv.indexOf("--hero-batch");
const sceneBatchIndex = process.argv.indexOf("--scene-batch");
const sceneMissingIndex = process.argv.indexOf("--missing-scenes");
if (heroBatchIndex >= 0) {
  const start = Number(process.argv[heroBatchIndex + 1] ?? 0);
  const count = Number(process.argv[heroBatchIndex + 2] ?? 10);
  console.log(JSON.stringify(missingHeroes.slice(start, start + count)));
} else if (sceneBatchIndex >= 0) {
  const start = Number(process.argv[sceneBatchIndex + 1] ?? 0);
  const count = Number(process.argv[sceneBatchIndex + 2] ?? 10);
  console.log(JSON.stringify(atlasScenePlan.jobs.slice(start, start + count).map((job) => ({
    ...job,
    heroFile: art[job.characterId]
      ? (art[job.characterId].files?.full ?? `/art/${job.characterId}.webp`)
      : `/art/generated/${job.characterId}-atlas-portrait.webp`,
  }))));
} else if (sceneMissingIndex >= 0) {
  const missing = atlasScenePlan.jobs.filter((job) => !existsSync(join(ROOT, "public", "art", "journey", "generated", `${job.assetId}.webp`)));
  console.log(JSON.stringify(missing.map((job) => ({
    ...job,
    heroFile: art[job.characterId]
      ? (art[job.characterId].files?.full ?? `/art/${job.characterId}.webp`)
      : `/art/generated/${job.characterId}-atlas-portrait.webp`,
  }))));
} else if (process.argv.includes("--json")) console.log(JSON.stringify(report));
else {
  console.log(`atlas audit: ${report.characters} characters`);
  console.log(`heroes: ${report.heroes.approved}/${report.heroes.expected} approved (${report.heroes.missing.length} missing)`);
  console.log(`journey scenes: ${report.journeys.missingScenes} missing across ${report.journeys.charactersWithGaps} characters`);
  console.log(`war tableaux: ${report.war.approved}/${report.war.expected} approved`);
}
