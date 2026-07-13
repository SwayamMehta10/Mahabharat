import Image from "next/image";
import Link from "next/link";
import type { ArtworkProvenance } from "@/data/schema";
import { art, artworkLicenseLabel, atlasScenePrompts, audioAssets, journeyArt } from "@/lib/kb";
import promptsData from "@/data/art-prompts.json";
import { atlasHeroPrompts } from "@/data/atlas-art";

export const metadata = {
  title: "Credits & Visual Method | MAHABHARAT",
  description: "Artwork sources, licenses, AI-origin disclosure, and the curation method used by the atlas.",
};

const PROVIDERS: Record<ArtworkProvenance["provider"], string> = {
  "wikimedia-commons": "Wikimedia Commons",
  openverse: "Openverse",
  pixabay: "Pixabay",
  "met-museum": "The Met Open Access",
  smithsonian: "Smithsonian Open Access",
  "openai-imagegen": "OpenAI image generation",
};

type CreditEntry = ArtworkProvenance & { title: string; year: string; position: string };

function CreditCard({ assetId, entry, image, role }: { assetId: string; entry: CreditEntry; image: string; role: string }) {
  const prompt = [...promptsData.assets, ...atlasHeroPrompts, ...atlasScenePrompts].find((item) => item.id === entry.generation?.promptId);
  return (
    <li id={assetId} className="grid gap-5 border-t border-dotted border-ash/25 py-7 sm:grid-cols-[8rem_1fr]">
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-soft">
        <Image
          src={image}
          alt=""
          fill
          sizes="128px"
          className="object-cover grayscale-[0.12] sepia-[0.08]"
          style={{ objectPosition: entry.position }}
        />
      </div>
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl text-bone">{entry.title}</h2>
          <span className="ui-label">{role}</span>
        </div>
        <p className="mt-2 font-display text-lg text-ash">
          {entry.creator}, {entry.year}
        </p>
        <p className="ui-label mt-2 !normal-case !text-ash/60">
          {PROVIDERS[entry.provider]} · {entry.origin === "ai-generated" ? "AI-generated" : "Historical artwork"}
          {entry.aiTool ? ` · ${entry.aiTool}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {entry.origin === "historical" ? (
            <>
              <a className="ui-label underline decoration-dotted underline-offset-4 hover:text-bone" href={entry.source} target="_blank" rel="noopener noreferrer">View source</a>
              <a className="ui-label underline decoration-dotted underline-offset-4 hover:text-bone" href={entry.licenseUrl} target="_blank" rel="noopener noreferrer">{artworkLicenseLabel(entry.license)}</a>
            </>
          ) : (
            <span className="ui-label">{entry.approval} · {entry.generation?.model} · {entry.generation?.created}</span>
          )}
        </div>
        {prompt && <p className="mt-4 text-sm leading-relaxed text-ash/75"><span className="text-gold/75">Prompt record:</span> {prompt.prompt}</p>}
      </div>
    </li>
  );
}

export default function CreditsPage() {
  const allEntries = [...Object.values(art), ...Object.values(journeyArt)];
  const aiCount = allEntries.filter((entry) => entry.origin === "ai-generated").length;
  const journeyEntries = Object.entries(journeyArt).filter(([id]) => !id.startsWith("war-day-"));
  const warEntries = Object.entries(journeyArt).filter(([id]) => id.startsWith("war-day-"));

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-6 py-28">
      <p className="font-deva text-gold/70">चित्रस्रोत</p>
      <h1 className="font-display mt-3 text-5xl font-light tracking-[0.14em] text-bone">CREDITS & VISUAL METHOD</h1>
      <p className="font-display mt-6 max-w-2xl text-xl leading-relaxed text-ash">
        Every production artwork links to its original asset page and reuse terms. AI origin is disclosed here, away from the immersive story pages.
      </p>

      <section className="mt-16 border border-dotted border-gold/30 p-6">
        <p className="ui-label !text-gold">AI-origin disclosure</p>
        <p className="font-display mt-3 text-lg leading-relaxed text-ash">
          {aiCount === 0
            ? "No production artwork in the current manifest is AI-generated. Curated AI artwork may be admitted later only when its source page supplies reusable terms and it passes the same accuracy and style review."
            : `${aiCount} production ${aiCount === 1 ? "artwork is" : "artworks are"} identified as AI-generated in the manifest below.`}
        </p>
      </section>

      <section className="mt-16">
        <h2 className="ui-label mb-4 !text-gold">Primary portraits</h2>
        <details open className="group border-t border-dotted border-ash/25">
          <summary className="ui-label cursor-pointer py-5 marker:text-gold">{Object.keys(art).length} character heroes</summary>
          <ul>{Object.entries(art).map(([id, entry]) => (
            <CreditCard key={id} assetId={`portrait-${id}`} entry={entry} image={entry.files?.thumb ?? `/art/${id}-thumb.webp`} role="Portrait" />
          ))}</ul>
        </details>
      </section>

      <section className="mt-16">
        <h2 className="ui-label mb-4 !text-gold">Journey scenes</h2>
        <details className="group border-t border-dotted border-ash/25">
          <summary className="ui-label cursor-pointer py-5 marker:text-gold">{journeyEntries.length} curated and generated scenes</summary>
          <ul>{journeyEntries.map(([id, entry]) => (
            <CreditCard key={id} assetId={id} entry={entry} image={entry.files?.thumb ?? entry.files?.full ?? `/art/journey/${id}.webp`} role={entry.role === "portrait" ? "Portrait study" : entry.role === "event" ? "Shared event" : "Journey scene"} />
          ))}</ul>
        </details>
      </section>

      <section className="mt-16">
        <h2 className="ui-label mb-4 !text-gold">The eighteen days</h2>
        <details className="group border-t border-dotted border-ash/25">
          <summary className="ui-label cursor-pointer py-5 marker:text-gold">18 battlefield tableaux</summary>
          <ul>{warEntries.map(([id, entry]) => (
            <CreditCard key={id} assetId={id} entry={entry} image={entry.files?.full ?? `/art/journey/${id}.webp`} role="War day" />
          ))}</ul>
        </details>
      </section>

      <section className="mt-16">
        <h2 className="ui-label mb-4 !text-gold">Recorded sound</h2>
        <details className="group border-t border-dotted border-ash/25">
          <summary className="ui-label cursor-pointer py-5 marker:text-gold">{audioAssets.length} CC0 field and instrument recordings</summary>
          <ul>{audioAssets.map((entry) => (
            <li key={entry.id} className="border-t border-dotted border-ash/25 py-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl capitalize text-bone">{entry.kind}</h3>
                <span className="ui-label">{entry.loop ? "Loop" : "One-shot"}</span>
              </div>
              <p className="font-display mt-2 text-lg text-ash">
                {entry.credit.author ?? entry.credit.source} · {entry.credit.license}
              </p>
              <a className="ui-label mt-3 inline-block underline decoration-dotted underline-offset-4 hover:text-bone" href={entry.credit.url} target="_blank" rel="noopener noreferrer">
                View source and license
              </a>
            </li>
          ))}</ul>
        </details>
      </section>

      <section className="mt-16 border-t border-dotted border-ash/25 pt-8">
        <h2 className="ui-label !text-gold">Curation methodology</h2>
        <p className="font-display mt-4 max-w-3xl text-lg leading-relaxed text-ash">
          Historical candidates are searched in Wikimedia Commons, license-filtered Openverse, Pixabay, and museum open-access collections. Generated work follows the disclosed visual bible: {promptsData.visualBible} Every image is reviewed as an independent asset, and only approved derivatives enter the production manifest. Unserved masters remain in the staging pipeline.
        </p>
      </section>

      <Link href="/" className="ui-label mt-16 inline-block transition-colors hover:text-bone">← Return to the atlas</Link>
    </main>
  );
}
