/**
 * Art pipeline: takes the raw Wikimedia downloads (public-domain Raja Ravi
 * Varma paintings) and emits web-optimized WebP into public/art/ —
 * a full-size portrait (max 1400px) and a small thumb for tree nodes.
 *
 * Usage: node scripts/prepare-art.mjs <source-dir>
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const srcDir = process.argv[2];
if (!srcDir) {
  console.error("usage: node scripts/prepare-art.mjs <source-dir>");
  process.exit(1);
}

const outDir = path.join(import.meta.dirname, "..", "public", "art");
await mkdir(outDir, { recursive: true });

const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png)$/i.test(f));
for (const file of files) {
  const id = path.parse(file).name;
  const src = path.join(srcDir, file);

  await sharp(src)
    .resize({ width: 1400, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(outDir, `${id}.webp`));

  await sharp(src)
    .resize({ width: 280, height: 340, fit: "cover", position: "attention" })
    .webp({ quality: 72 })
    .toFile(path.join(outDir, `${id}-thumb.webp`));

  console.log(`✓ ${id}`);
}
console.log(`\n${files.length} paintings → ${outDir}`);
