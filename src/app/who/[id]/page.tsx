import Link from "next/link";
import { notFound } from "next/navigation";
import { characters, charactersById, parvas, warDays, getArt } from "@/lib/kb";
import SpoilerGuard from "@/components/ui/SpoilerGuard";
import PortraitDirector from "@/components/who/PortraitDirector";

export function generateStaticParams() {
  return characters.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = charactersById.get(id);
  return {
    title: c ? `${c.name} | MAHABHARAT` : "MAHABHARAT",
    description: c?.bio,
  };
}

function RelationList({ label, ids }: { label: string; ids: string[] }) {
  if (!ids.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="ui-label">{label}</span>
      <p className="font-display text-lg text-bone/90">
        {ids.map((rid, i) => {
          const rel = charactersById.get(rid);
          return (
            <span key={rid}>
              {i > 0 && <span className="text-ash/60"> · </span>}
              {rel ? (
                <Link
                  href={`/who/${rel.id}`}
                  className="underline decoration-gold/40 decoration-dotted underline-offset-4 transition-colors hover:text-gold-bright hover:decoration-gold-bright"
                >
                  {rel.name}
                </Link>
              ) : (
                <span className="text-bone/60">{rid}</span>
              )}
            </span>
          );
        })}
      </p>
    </div>
  );
}

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = charactersById.get(id);
  if (!c) notFound();

  const firstParva = parvas[c.firstParva - 1];
  const fallDay = c.deathDay ? warDays[c.deathDay - 1] : undefined;
  const painting = getArt(c.id);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {painting ? (
        /* the painting, graded into the void: rendered live in the WebGL
           canvas (breathing displacement + parallax); the DOM <img> below is
           the reduced-motion fallback with the same grade in CSS */
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <PortraitDirector url={painting.file} position={painting.position} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={painting.file}
            alt=""
            className="absolute inset-y-0 right-0 hidden h-full w-full object-cover motion-reduce:block sm:w-3/5"
            style={{
              objectPosition: painting.position,
              filter: "grayscale(0.15) sepia(0.10) contrast(1.04) brightness(0.80) saturate(0.92)",
            }}
          />
          {/* full-width fade, no container edge: the painting simply emerges */}
          <div className="absolute inset-0 bg-gradient-to-r from-void from-22% via-void/55 via-52% to-void/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/45" />
          <div className="absolute inset-0 bg-indigo-deep/12 mix-blend-multiply" />
        </div>
      ) : (
        /* no painting yet - the Devanagari watermark stands in */
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 select-none font-deva text-[26rem] leading-none text-indigo-deep/60"
        >
          {c.deva.charAt(0)}
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-6 py-24">
        <div>
          <p className="ui-label mb-4">
            First appears · {firstParva.name}
          </p>
          <h1 className="font-display text-5xl font-light text-bone sm:text-6xl" style={{ letterSpacing: "0.18em" }}>
            {c.name.toUpperCase()}
          </h1>
          <p className="font-deva mt-3 text-2xl text-gold/80">{c.deva}</p>
          {c.epithets.length > 0 && (
            <p className="font-display mt-2 text-lg italic text-ash">
              {c.epithets.join(" · ")}
            </p>
          )}
        </div>

        <p className="font-display max-w-xl text-xl leading-relaxed text-bone/90">
          {c.bio}
        </p>

        <div className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
          <RelationList label="Parents" ids={c.parents} />
          <RelationList label="Consorts" ids={c.spouses} />
          <RelationList label="Children" ids={c.children} />
          {c.weapons && c.weapons.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="ui-label">Arms</span>
              <p className="font-display text-lg text-bone/90">{c.weapons.join(" · ")}</p>
            </div>
          )}
          {c.divineParent && (
            <div className="flex flex-col gap-1.5">
              <span className="ui-label">Of the gods</span>
              <p className="font-display text-lg text-gold-bright/90">{c.divineParent}</p>
            </div>
          )}
          {fallDay && (
            <div className="flex flex-col gap-1.5">
              <span className="ui-label">Falls</span>
              <p className="font-display text-lg text-vermillion/90">
                <SpoilerGuard revealAtParva={5 + Math.ceil(c.deathDay! / 4)}>
                  <Link
                    href={`/war#day-${c.deathDay}`}
                    className="transition-colors hover:text-vermillion"
                  >
                    Day {c.deathDay} · {fallDay.title}
                  </Link>
                </SpoilerGuard>
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-6 border-t border-dotted border-ash/25 pt-6">
          <div className="flex max-w-md flex-col gap-1.5">
            <p className="ui-label !normal-case">
              {c.citations.join(" · ")} · K.M. Ganguli tr.
            </p>
            {painting && (
              <p className="ui-label !normal-case !text-ash/70">
                <a
                  href={painting.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 transition-colors hover:text-bone"
                >
                  &ldquo;{painting.title}&rdquo;
                </a>{" "}
                · Raja Ravi Varma, {painting.year} · public domain
              </p>
            )}
          </div>
          <Link
            href="/family-tree"
            className="ui-label shrink-0 transition-colors hover:text-bone"
          >
            ← The Kuru Line
          </Link>
        </div>
      </div>
    </div>
  );
}
