/**
 * Prose guard: the site must never ship an em dash (U+2014).
 * Scans every .ts/.tsx/.json file under src/ (code, comments, and content
 * alike) and fails loudly with file:line locations. En dashes (U+2013) are
 * allowed; they mark citation ranges like "Bhishma Parva §108–120".
 *
 * Runs as part of `npm run lint`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src");
const EXTENSIONS = new Set([".ts", ".tsx", ".json"]);

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (EXTENSIONS.has(p.slice(p.lastIndexOf(".")))) yield p;
  }
}

const offenses = [];
for (const file of walk(SRC)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes("—")) {
      offenses.push(`${relative(ROOT, file)}:${i + 1}: ${line.trim().slice(0, 90)}`);
    }
  });
}

if (offenses.length) {
  console.error(`check-prose: ${offenses.length} em dash(es) found. The epic does not pause that way.\n`);
  for (const o of offenses) console.error("  " + o);
  process.exit(1);
}
console.log("check-prose: clean. No em dashes in src/.");
