/**
 * Journey-art fetcher. Worklist-driven, license-verifying.
 *
 * Worklist (scripts/art-worklist.json):
 *   [{ "assetId": "arjuna-subhadra",
 *      "commonsTitle": "File:Arjuna and Subhadra by RRV.jpg",   // exact title, OR
 *      "search": "Arjuna Subhadra Ravi Varma" }]                // discovery mode
 *
 * For each item with a commonsTitle it queries the Wikimedia Commons API
 * (imageinfo + extmetadata), asserts the license is public domain / CC0
 * (anything else is skipped loudly; TV stills never enter this path, they
 * are staged manually with license "unverified"), downloads the original
 * into scripts/art-staging/journey/{assetId}.{ext}, and prints the block
 * to merge into src/data/journey-art.json.
 *
 * Items with only a "search" print candidate titles so a human can verify
 * the image actually depicts the intended scene before promoting it to
 * commonsTitle. Accuracy verification is deliberately manual.
 *
 * After fetching: node scripts/prepare-art.mjs scripts/art-staging/journey --journey
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://commons.wikimedia.org/w/api.php";
const OK_LICENSES = /public domain|pd-|cc0/i;
const UA = { headers: { "User-Agent": "mahabharat-guide/1.0 (art pipeline; public domain sourcing)" } };

const worklistPath = path.join(import.meta.dirname, "art-worklist.json");
const stagingDir = path.join(import.meta.dirname, "art-staging", "journey");
await mkdir(stagingDir, { recursive: true });

const worklist = JSON.parse(await readFile(worklistPath, "utf8"));
const manifest = {};

for (const item of worklist) {
  if (!item.commonsTitle && item.search) {
    const url = `${API}?action=query&generator=search&gsrsearch=${encodeURIComponent(item.search)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&format=json`;
    const res = await (await fetch(url, UA)).json();
    console.log(`\n? ${item.assetId}: candidates for "${item.search}"`);
    for (const page of Object.values(res.query?.pages ?? {})) {
      console.log(`    ${page.title}`);
    }
    console.log("  pick one, verify the scene by eye, set commonsTitle, re-run");
    continue;
  }

  const url = `${API}?action=query&titles=${encodeURIComponent(item.commonsTitle)}&prop=imageinfo&iiprop=url|extmetadata|size&format=json`;
  const res = await (await fetch(url, UA)).json();
  const page = Object.values(res.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) {
    console.error(`✗ ${item.assetId}: "${item.commonsTitle}" not found on Commons`);
    process.exitCode = 1;
    continue;
  }

  const meta = info.extmetadata ?? {};
  const licenseName = meta.LicenseShortName?.value ?? "";
  if (!OK_LICENSES.test(licenseName)) {
    console.error(`✗ ${item.assetId}: license "${licenseName}" is not PD/CC0, skipping (verify manually if intended)`);
    process.exitCode = 1;
    continue;
  }

  const ext = path.extname(new URL(info.url).pathname).toLowerCase() || ".jpg";
  const dest = path.join(stagingDir, `${item.assetId}${ext}`);
  const buf = Buffer.from(await (await fetch(info.url, UA)).arrayBuffer());
  await writeFile(dest, buf);

  const strip = (html) => (html ?? "").replace(/<[^>]+>/g, "").trim();
  manifest[item.assetId] = {
    title: item.title ?? strip(meta.ObjectName?.value) ?? item.assetId,
    artist: strip(meta.Artist?.value) || "unknown",
    year: strip(meta.DateTimeOriginal?.value) || "",
    source: `https://commons.wikimedia.org/wiki/${encodeURIComponent(item.commonsTitle.replaceAll(" ", "_"))}`,
    license: /cc0/i.test(licenseName) ? "cc0" : "public-domain",
    position: item.position ?? "50% 30%",
  };
  console.log(`✓ ${item.assetId} (${licenseName}, ${(buf.length / 1024 / 1024).toFixed(1)}MB) → ${dest}`);
}

if (Object.keys(manifest).length) {
  console.log("\nmerge into src/data/journey-art.json:\n");
  console.log(JSON.stringify(manifest, null, 2));
}
