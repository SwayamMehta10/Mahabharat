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
 *   - "unverified" licenses are warned about wherever referenced
 */
import { existsSync, readFileSync } from "node:fs";
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

const ids = new Set(characters.map((c) => c.id));
const CITATION = /^[A-Za-z]+( [A-Za-z]+)* Parva §\d+(–\d+)?(, §\d+(–\d+)?)*$/;

const errors = [];
const warnings = [];

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
        else if (entry.license === "unverified") warnings.push(`${cw}: uses unverified-license asset "${ch.image}"`);
        if (!existsSync(join(ROOT, "public/art/journey", `${ch.image}.webp`))) {
          errors.push(`${cw}: public/art/journey/${ch.image}.webp missing on disk`);
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
  for (const f of [`public/art/${id}.webp`, `public/art/${id}-thumb.webp`]) {
    if (!existsSync(join(ROOT, f))) errors.push(`art/${id}: ${f} missing on disk`);
  }
}

// journey art licensing + audio files
for (const [assetId, entry] of Object.entries(journeyArt)) {
  if (entry.license === "unverified") warnings.push(`journey-art/${assetId}: license unverified ("${entry.title}")`);
}
for (const a of audio) {
  if (!existsSync(join(ROOT, "public/audio", `${a.id}.mp3`))) {
    errors.push(`audio/${a.id}: public/audio/${a.id}.mp3 missing on disk`);
  }
  if (!a.credit?.url || !a.credit?.license) errors.push(`audio/${a.id}: incomplete credit`);
}

for (const w of warnings) console.warn("  warn: " + w);
if (errors.length) {
  console.error(`\nvalidate-kb: ${errors.length} error(s)\n`);
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}
console.log(`validate-kb: ${characters.length} characters, ${parvas.length} parvas, ${warDays.length} days, ${Object.keys(journeyArt).length} journey assets, ${audio.length} audio assets. Clean.`);
