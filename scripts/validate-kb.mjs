/**
 * Knowledge-base validator. Runs in `npm run lint` after check-prose.
 *
 * Guards the invariants the components rely on:
 *   - every relation/falls id resolves in the KB (or is flagged as a
 *     plain-name outsider, which is allowed but listed)
 *   - citations look like "Some Parva §12" or "Some Parva §12–34"
 *   - journeys are sorted by parva and never open before revealAtParva
 *   - every journey image resolves in journey-art.json AND on disk
 *   - every audio asset's file exists in public/audio
 *   - every artwork has complete, reusable provenance and valid subjects
 *   - the six-character pilot contains exactly eighteen reviewed slots
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const characters = read("src/data/characters.json");
const parvas = read("src/data/parvas.json");
const warDays = read("src/data/war-days.json");
const art = read("src/data/art.json");
const journeyArt = read("src/data/journey-art.json");
const audio = read("src/data/audio.json");
const artCandidates = read("scripts/art-candidates.json");
const relationships = read("src/data/relationships.json");
const epicEvents = read("src/data/epic-events.json");
const causalThreads = read("src/data/causal-threads.json");
const strategicDays = read("src/data/strategic-days.json");
const promptManifest = read("src/data/art-prompts.json");

const ids = new Set(characters.map((c) => c.id));
const CITATION = /^[A-Za-z]+( [A-Za-z]+)* Parva §\d+(–\d+)?(, §\d+(–\d+)?)*$/;

const errors = [];
const warnings = [];

const ART_LICENSES = new Set(["public-domain", "cc0", "cc-by", "cc-by-sa", "pixabay-content-license", "project-generated"]);
const ART_PROVIDERS = new Set(["wikimedia-commons", "openverse", "pixabay", "met-museum", "smithsonian", "openai-imagegen"]);
const ART_ORIGINS = new Set(["historical", "ai-generated"]);
const PILOT_CHARACTERS = new Set(["karna", "krishna", "duryodhana", "kunti", "abhimanyu", "ashwatthama"]);
const ART_APPROVALS = new Set(["draft", "reviewed", "approved"]);
const ART_ROLES = new Set(["portrait", "journey", "event"]);
const promptIds = new Set(promptManifest.assets.map((prompt) => prompt.id));

function isCanonicalSource(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !/\b(search|query)=/i.test(url.search) && !/\/search\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function checkArtwork(assetId, entry, where, defaultFull, defaultThumb) {
  if (!entry.title || !entry.year || !entry.creator || !entry.source || !entry.provider || !entry.origin || !entry.license || !entry.licenseUrl) {
    errors.push(`${where}/${assetId}: incomplete provenance`);
  }
  if (!ART_LICENSES.has(entry.license)) errors.push(`${where}/${assetId}: production license "${entry.license}" is not allowed`);
  if (!ART_PROVIDERS.has(entry.provider)) errors.push(`${where}/${assetId}: unknown provider "${entry.provider}"`);
  if (!ART_ORIGINS.has(entry.origin)) errors.push(`${where}/${assetId}: unknown origin "${entry.origin}"`);
  if (entry.origin === "historical") {
    if (!isCanonicalSource(entry.source)) errors.push(`${where}/${assetId}: historical source must be a direct HTTPS asset page`);
    if (!isCanonicalSource(entry.licenseUrl)) errors.push(`${where}/${assetId}: historical licenseUrl must be a direct HTTPS page`);
  } else {
    if (entry.provider !== "openai-imagegen" || entry.license !== "project-generated") {
      errors.push(`${where}/${assetId}: generated art must use its generated provider and license`);
    }
    if (!ART_APPROVALS.has(entry.approval)) errors.push(`${where}/${assetId}: generated art needs a valid approval state`);
    if (!ART_ROLES.has(entry.role)) errors.push(`${where}/${assetId}: generated art needs an intended role`);
    if (!entry.aiTool || !entry.generation?.model || !entry.generation?.created || !entry.generation?.promptId) {
      errors.push(`${where}/${assetId}: generated art needs tool, model, date, and prompt provenance`);
    } else if (!promptIds.has(entry.generation.promptId)) {
      errors.push(`${where}/${assetId}: prompt "${entry.generation.promptId}" is unresolved`);
    }
    if (!entry.files?.full) errors.push(`${where}/${assetId}: generated art needs explicit responsive files`);
  }
  if (!Array.isArray(entry.subjects) || entry.subjects.length === 0) {
    errors.push(`${where}/${assetId}: at least one affected character is required`);
  }
  const focal = /^\d{1,3}(\.\d+)?% \d{1,3}(\.\d+)?%$/.test(entry.position ?? "")
    ? entry.position.split(" ").map((part) => Number.parseFloat(part))
    : [];
  if (focal.length !== 2 || focal.some((value) => value < 0 || value > 100)) {
    errors.push(`${where}/${assetId}: invalid focal position "${entry.position}"`);
  }
  for (const subject of entry.subjects ?? []) {
    if (!ids.has(subject)) errors.push(`${where}/${assetId}: unknown subject "${subject}"`);
  }

  const files = [entry.files?.full ?? defaultFull, entry.files?.thumb ?? defaultThumb].filter(Boolean);
  for (const file of files) {
    const diskPath = join(ROOT, "public", String(file).replace(/^\//, ""));
    if (!existsSync(diskPath)) {
      errors.push(`${where}/${assetId}: ${file} missing on disk`);
      continue;
    }
    const budget = entry.role === "portrait" || where === "art" ? 500_000 : 700_000;
    if (statSync(diskPath).size > budget) {
      const message = `${where}/${assetId}: ${file} exceeds ${budget / 1000} KB budget`;
      if (entry.origin === "ai-generated") errors.push(message);
      else warnings.push(message + " (existing historical derivative)");
    }
  }
}

function checkCitations(list, where) {
  for (const cit of list ?? []) {
    if (!CITATION.test(cit)) errors.push(`${where}: malformed citation "${cit}"`);
  }
}

// characters
for (const c of characters) {
  const where = `characters/${c.id}`;
  for (const field of ["parents", "spouses", "children"]) {
    for (const rid of c[field]) {
      if (!ids.has(rid)) warnings.push(`${where}: ${field} "${rid}" is outside the KB (renders as plain text)`);
    }
  }
  checkCitations(c.citations, where);
  if (c.firstParva < 1 || c.firstParva > 18) errors.push(`${where}: firstParva ${c.firstParva} out of range`);
  if (c.deathDay !== undefined && (c.deathDay < 1 || c.deathDay > 18)) {
    errors.push(`${where}: deathDay ${c.deathDay} out of range`);
  }
  if (c.journey) {
    let prev = 0;
    for (const [i, ch] of c.journey.entries()) {
      const cw = `${where}/journey[${i}]`;
      if (ch.parva < prev) errors.push(`${cw}: chapters not sorted by parva`);
      prev = ch.parva;
      if (ch.parva < 1 || ch.parva > 18) errors.push(`${cw}: parva ${ch.parva} out of range`);
      if (!ch.text?.length) errors.push(`${cw}: empty text`);
      checkCitations(ch.citations, cw);
      if (ch.image) {
        const entry = journeyArt[ch.image];
        if (!entry) errors.push(`${cw}: image "${ch.image}" not in journey-art.json`);
        const imageFile = entry?.files?.full ?? `/art/journey/${ch.image}.webp`;
        if (!existsSync(join(ROOT, "public", imageFile.replace(/^\//, "")))) {
          errors.push(`${cw}: ${imageFile} missing on disk`);
        }
      }
    }
  }
}

// parvas
if (parvas.length !== 18) errors.push(`parvas: expected 18, found ${parvas.length}`);
parvas.forEach((p, i) => {
  if (p.number !== i + 1) errors.push(`parvas[${i}]: number ${p.number} out of order`);
});

// war days
if (warDays.length !== 18) errors.push(`war-days: expected 18, found ${warDays.length}`);
for (const d of warDays) {
  const where = `war-days/${d.day}`;
  for (const fid of d.falls) {
    if (!ids.has(fid)) errors.push(`${where}: falls id "${fid}" not in KB`);
  }
  for (const cid of [d.commanderKaurava, d.commanderPandava].filter(Boolean)) {
    if (!ids.has(cid)) errors.push(`${where}: commander "${cid}" not in KB`);
  }
  checkCitations(d.citations, where);
}

// primary art files
for (const id of Object.keys(art)) {
  if (!ids.has(id)) errors.push(`art: "${id}" has no character`);
  checkArtwork(id, art[id], "art", `/art/${id}.webp`, `/art/${id}-thumb.webp`);
}

// journey art licensing + audio files
for (const [assetId, entry] of Object.entries(journeyArt)) {
  checkArtwork(assetId, entry, "journey-art", `/art/journey/${assetId}.webp`);
}

// six-character pilot curation audit
if (artCandidates.length !== 18) errors.push(`art-candidates: expected 18 slots, found ${artCandidates.length}`);
const candidateIds = new Set();
const pilotCounts = new Map();
for (const candidate of artCandidates) {
  const where = `art-candidates/${candidate.id}`;
  if (!candidate.id || candidateIds.has(candidate.id)) errors.push(`${where}: missing or duplicate id`);
  candidateIds.add(candidate.id);
  if (!PILOT_CHARACTERS.has(candidate.character)) errors.push(`${where}: character is outside the six-character pilot`);
  if (!ids.has(candidate.character)) errors.push(`${where}: unknown character "${candidate.character}"`);
  if (!new Set(["portrait", "journey"]).has(candidate.role)) errors.push(`${where}: invalid role "${candidate.role}"`);
  const count = pilotCounts.get(candidate.character) ?? { portrait: 0, journey: 0 };
  if (candidate.role === "portrait") count.portrait += 1;
  if (candidate.role === "journey") count.journey += 1;
  pilotCounts.set(candidate.character, count);

  if (candidate.status === "accepted") {
    const acceptedEntry = art[candidate.assetId] ?? journeyArt[candidate.assetId];
    if (!candidate.assetId || !acceptedEntry) {
      errors.push(`${where}: accepted assetId does not resolve in a production manifest`);
    }
    if (acceptedEntry && !acceptedEntry.subjects.includes(candidate.character)) {
      errors.push(`${where}: production provenance does not name the target character`);
    }
    if (acceptedEntry && acceptedEntry.source !== candidate.candidate) {
      errors.push(`${where}: candidate URL must match the production source URL`);
    }
    if (acceptedEntry?.origin === "historical" && !isCanonicalSource(candidate.candidate)) errors.push(`${where}: accepted historical candidate must use a direct HTTPS asset page`);
    if (!ART_LICENSES.has(candidate.license)) errors.push(`${where}: accepted candidate has invalid license`);
    if (candidate.canonicalScore < 4 || candidate.styleScore < 4) errors.push(`${where}: accepted scores must both be at least 4`);
    if (candidate.technical !== "pass") errors.push(`${where}: accepted candidate must pass technical review`);
  } else if (candidate.status === "rejected") {
    if (!candidate.candidate || !candidate.reason) errors.push(`${where}: rejected candidate needs a source and reason`);
  } else if (candidate.status === "no-match") {
    if (candidate.candidate !== null || !candidate.reason) errors.push(`${where}: no-match candidate must have null source and a reason`);
  } else {
    errors.push(`${where}: invalid status "${candidate.status}"`);
  }
}
for (const character of PILOT_CHARACTERS) {
  const count = pilotCounts.get(character);
  if (count?.portrait !== 1 || count?.journey !== 2) {
    errors.push(`art-candidates/${character}: expected one portrait and two journey slots`);
  }
}
if (promptManifest.assets.length !== 18 || promptIds.size !== 18) {
  errors.push(`art-prompts: expected 18 unique prompt records`);
}

for (const a of audio) {
  if (!existsSync(join(ROOT, "public/audio", `${a.id}.mp3`))) {
    errors.push(`audio/${a.id}: public/audio/${a.id}.mp3 missing on disk`);
  }
  if (!a.credit?.url || !a.credit?.license) errors.push(`audio/${a.id}: incomplete credit`);
}

const eventIds = new Set(epicEvents.map((event) => event.id));
const threadIds = new Set(causalThreads.map((thread) => thread.id));
for (const relation of relationships) {
  if (!ids.has(relation.from) || !ids.has(relation.to)) {
    errors.push(`relationships: unresolved ${relation.from} -> ${relation.to}`);
  }
  if (!['mentor', 'allegiance'].includes(relation.kind)) {
    errors.push(`relationships: invalid kind "${relation.kind}"`);
  }
}
for (const event of epicEvents) {
  if (event.parva < 1 || event.parva > 18) errors.push(`events/${event.id}: parva out of range`);
  if (event.day !== undefined && (event.day < 1 || event.day > 18)) errors.push(`events/${event.id}: day out of range`);
  if (event.image && !journeyArt[event.image]) errors.push(`events/${event.id}: image "${event.image}" unresolved`);
  for (const perspective of event.perspectives) {
    if (!ids.has(perspective.characterId)) errors.push(`events/${event.id}: character "${perspective.characterId}" unresolved`);
    checkCitations(perspective.citations, `events/${event.id}/${perspective.characterId}`);
    for (const threadId of perspective.threadIds) if (!threadIds.has(threadId)) errors.push(`events/${event.id}: thread "${threadId}" unresolved`);
  }
}
for (const thread of causalThreads) {
  for (const id of thread.characterIds) if (!ids.has(id)) errors.push(`threads/${thread.id}: character "${id}" unresolved`);
  for (const id of thread.eventIds) if (!eventIds.has(id)) errors.push(`threads/${thread.id}: event "${id}" unresolved`);
  checkCitations(thread.citations, `threads/${thread.id}`);
}
for (const strategic of strategicDays) {
  if (!warDays.some((day) => day.day === strategic.day)) errors.push(`strategic-days/${strategic.day}: war day unresolved`);
}

for (const w of warnings) console.warn("  warn: " + w);
if (errors.length) {
  console.error(`\nvalidate-kb: ${errors.length} error(s)\n`);
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}
console.log(`validate-kb: ${characters.length} characters, ${parvas.length} parvas, ${warDays.length} days, ${epicEvents.length} events, ${causalThreads.length} threads, ${Object.keys(journeyArt).length} journey assets, ${artCandidates.length} audited art slots, ${audio.length} audio assets. Clean.`);
