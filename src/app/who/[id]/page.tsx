import Link from "next/link";
import { notFound } from "next/navigation";
import {
  artworkLicenseLabel,
  characters,
  charactersById,
  parvas,
  warDays,
  getArt,
  getJourney,
  getJourneyArt,
  getEventsForCharacter,
} from "@/lib/kb";
import StoryDepthGuard from "@/components/ui/StoryDepthGuard";
import PortraitDirector from "@/components/who/PortraitDirector";
import CharacterJourney, { type JourneyImage } from "@/components/who/CharacterJourney";

/** CSS object-position string ("50% 20%") to 0..1 focal coordinates. */
function toImage(
  file: string,
  position: string,
  credit?: {
    exposure?: number;
    title?: string;
    creator?: string;
    year?: string;
    source?: string;
    licenseLabel?: string;
    licenseUrl?: string;
  }
): JourneyImage {
  const [fx, fy] = position.split(" ").map((p) => (parseFloat(p) || 50) / 100);
  return { url: file, focalX: fx ?? 0.5, focalY: fy ?? 0.3, ...credit };
}

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

  // the journey, if authored: chapters + their paintings, focal-parsed
  // server-side so the client component receives plain serializable props
  const journey = getJourney(c.id);
  const sharedEvents = getEventsForCharacter(c.id);
  const hasJourney = journey.length > 0;
  const defaultImage = painting
    ? toImage(painting.file, painting.position, {
        exposure: painting.exposure,
        title: painting.title,
        creator: painting.creator,
        year: painting.year,
        source: painting.source,
        licenseLabel: artworkLicenseLabel(painting.license),
        licenseUrl: painting.licenseUrl,
      })
    : undefined;
  const journeyImages = journey.map((ch) => {
    if (!ch.image) return undefined;
    const a = getJourneyArt(ch.image);
    if (!a) return undefined;
    return toImage(a.file, a.position, {
      exposure: a.exposure,
      title: a.title,
      creator: a.creator,
      year: a.year,
      source: a.source,
      licenseLabel: artworkLicenseLabel(a.license),
      licenseUrl: a.licenseUrl,
    });
  });

  return (
    <div className="relative overflow-hidden">
      {painting ? (
        /* the painting, graded into the void: rendered live in the WebGL
           canvas (breathing displacement + parallax); the DOM <img> below is
           the reduced-motion fallback with the same grade in CSS.
           On journey pages CharacterJourney owns the portrait channel, so
           the director only mounts for bio-only pages. */
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {!hasJourney && (
            <PortraitDirector
              url={painting.file}
              position={painting.position}
              exposure={painting.exposure}
            />
          )}
          {!hasJourney && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={painting.file}
              alt=""
              className="absolute inset-0 hidden h-full w-full object-cover motion-reduce:block"
              style={{
                objectPosition: painting.position,
                filter: `grayscale(0.05) sepia(0.08) contrast(1.04) brightness(${(1.08 * (painting.exposure ?? 1)).toFixed(2)}) saturate(0.98)`,
              }}
            />
          )}
          <div className="ink-wash" />
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

      <div className="painting-readable relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col justify-center gap-10 px-6 py-24">
        <div>
          <Link
            href="/who"
            className="ui-label mb-6 block w-fit transition-colors hover:text-bone focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gold/70"
          >
            ← All the figures of the epic
          </Link>
          <p className="ui-label mb-4">
            First appears · {firstParva.name}
          </p>
          <h1 className="font-display text-[clamp(2rem,7.5vw,3.75rem)] font-light text-bone" style={{ letterSpacing: "0.18em" }}>
            {c.name.toUpperCase()}
          </h1>
          <p className="font-deva mt-3 text-2xl text-gold/80">{c.deva}</p>
          {c.epithets.length > 0 && (
            <p className="font-display mt-2 text-lg italic text-ash">
              {c.epithets.join(" · ")}
            </p>
          )}
        </div>

        <p className="font-display max-w-2xl text-xl leading-relaxed text-bone/90">
          {c.bio}
        </p>

        <div className="grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
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
                <StoryDepthGuard revealAtParva={5 + Math.ceil(c.deathDay! / 4)}>
                  <Link
                    href={`/war#day-${c.deathDay}`}
                    className="transition-colors hover:text-vermillion"
                  >
                    Day {c.deathDay} · {fallDay.title}
                  </Link>
                </StoryDepthGuard>
              </p>
            </div>
          )}
        </div>

        {sharedEvents.length > 0 && (
          <div className="max-w-2xl border-l border-gold/35 pl-5">
            <span className="ui-label !text-gold-dim">Drishti · shared moments</span>
            {sharedEvents.map((event) => (
              <p key={event.id} className="font-display mt-2 text-xl text-bone">
                <StoryDepthGuard revealAtParva={event.parva}>
                  <Link href={`/drishti/${event.id}`} className="underline decoration-dotted underline-offset-4 transition-colors hover:text-gold-bright">
                    {event.title} · enter another point of view →
                  </Link>
                </StoryDepthGuard>
              </p>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-end justify-between gap-6 border-t border-dotted border-ash/25 pt-6">
          <div className="flex max-w-md flex-col gap-1.5">
            <p className="ui-label !normal-case">
              {c.citations.join(" · ")} · K.M. Ganguli tr.
            </p>
            {painting?.origin === "historical" && (
              <p className="ui-label !normal-case !text-ash/70">
                <a
                  href={painting.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 transition-colors hover:text-bone"
                >
                  &ldquo;{painting.title}&rdquo;
                </a>{" "}
                · {painting.creator}, {painting.year} ·{" "}
                <a
                  href={painting.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 transition-colors hover:text-bone"
                >
                  {artworkLicenseLabel(painting.license)}
                </a>
              </p>
            )}
          </div>
          <Link
            href="/family-tree"
            className="ui-label shrink-0 transition-colors hover:text-bone [text-shadow:0_1px_10px_rgba(9,11,18,0.95),0_0_3px_rgba(9,11,18,0.9)]"
          >
            ← The Kuru Line
          </Link>
        </div>

        {hasJourney && (
          <p className="ui-label mt-6 self-center !text-gold-dim">
            The journey · scroll
          </p>
        )}
      </div>

      {hasJourney && (
        <div className="relative z-10">
          <CharacterJourney
            chapters={journey}
            images={journeyImages}
            defaultImage={defaultImage}
          />
        </div>
      )}
    </div>
  );
}
