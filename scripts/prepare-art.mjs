/**
 * Art pipeline: takes raw downloads (public-domain paintings, or manually
 * staged material) and emits web-optimized WebP.
 *
 * Portrait mode (default): public/art/{id}.webp (max 1400px) plus a
 * saliency-cropped thumb for tree nodes.
 * Journey mode (--journey): public/art/journey/{id}.webp, landscape-friendly
 * 1600px, no thumbs; these are the chapter backgrounds.
 *
 * Usage: node scripts/prepare-art.mjs <source-dir> [--journey]
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const journeyMode = args.includes("--journey");
const srcDir = args.find((a) => !a.startsWith("--"));
if (!srcDir) {
  console.error("usage: node scripts/prepare-art.mjs <source-dir> [--journey]");
  process.exit(1);
}

const outDir = journeyMode
  ? path.join(import.meta.dirname, "..", "public", "art", "journey")
  : path.join(import.meta.dirname, "..", "public", "art");
await mkdir(outDir, { recursive: true });

const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f));
for (const file of files) {
  const id = path.parse(file).name;
  const src = path.join(srcDir, file);

  if (journeyMode) {
    await sharp(src)
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(outDir, `${id}.webp`));
  } else {
    await sharp(src)
      .resize({ width: 1400, height: 1800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(outDir, `${id}.webp`));

    await sharp(src)
      .resize({ width: 280, height: 340, fit: "cover", position: "attention" })
      .webp({ quality: 72 })
      .toFile(path.join(outDir, `${id}-thumb.webp`));
  }

  console.log(`✓ ${id}`);
}
console.log(`\n${files.length} paintings → ${outDir}`);
