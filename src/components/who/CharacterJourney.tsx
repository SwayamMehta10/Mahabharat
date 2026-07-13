"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { JourneyChapter } from "@/data/schema";
import { parvas, toDevanagariNumeral } from "@/lib/kb";
import { selectAccessibleParva, useEpicStore } from "@/lib/store";
import { atmosphere } from "@/lib/atmosphere";
import { lenisRef } from "@/lib/lenis";
import { preloadPortrait } from "@/components/canvas/PortraitPlane";

/**
 * The DARK-style journey: a character's life told chapter by chapter,
 * one chapter per parva, the background painting crossfading as the
 * reader scrolls (the PortraitPlane already knows how to fade out,
 * swap and fade back in whenever atmosphere.portrait changes).
 *
 * This component owns the portrait channel for its lifetime; journey
 * pages therefore do not mount a PortraitDirector.
 */

export interface JourneyImage {
  url: string;
  focalX: number;
  focalY: number;
  /** presentation-only exposure multiplier from the manifest (default 1) */
  exposure?: number;
  /** credit line data for the footer of the chapter */
  title?: string;
  creator?: string;
  year?: string;
  source?: string;
  licenseLabel?: string;
  licenseUrl?: string;
}

interface CharacterJourneyProps {
  chapters: JourneyChapter[];
  /** journey-art file per chapter index (undefined = fall back to default) */
  images: (JourneyImage | undefined)[];
  /** the character's primary portrait, if any */
  defaultImage?: JourneyImage;
}

export default function CharacterJourney({ chapters, images, defaultImage }: CharacterJourneyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const knownParva = useEpicStore(selectAccessibleParva);
  const [active, setActive] = useState(0);

  const visible = chapters.filter((ch) => ch.parva <= knownParva);
  const gatedCount = chapters.length - visible.length;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    // Warm only the opening pair. Gated chapters are never requested, and
    // later chapters warm just-in-time as the reading line reaches them.
    if (defaultImage) preloadPortrait(defaultImage.url);
    if (visible[0] && images[0]) preloadPortrait(images[0].url);

    const setPortrait = (img: JourneyImage | undefined, idx = -1) => {
      const want = img ?? defaultImage;
      if (want) preloadPortrait(want.url);
      if (idx >= 0 && idx + 1 < visible.length && images[idx + 1]) {
        preloadPortrait(images[idx + 1]!.url);
      }
      atmosphere.portrait = want
        ? { url: want.url, focalX: want.focalX, focalY: want.focalY, exposure: want.exposure }
        : null;
    };
    setPortrait(undefined);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((el) => {
        const idx = Number(el.dataset.chapter);
        gsap.fromTo(
          el.querySelector("[data-chapter-body]"),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 72%" },
          }
        );
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onEnter: () => {
            setActive(idx);
            setPortrait(images[idx], idx);
          },
          onEnterBack: () => {
            setActive(idx);
            setPortrait(images[idx], idx);
          },
        });
      });
      // scrolling back above the first chapter returns the hero portrait
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "top 60%",
        onEnterBack: () => {
          setActive(-1);
          setPortrait(undefined);
        },
      });
    }, root);

    return () => {
      ctx.revert();
      atmosphere.portrait = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knownParva]);

  const scrollToChapter = (idx: number) => {
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-chapter="${idx}"]`);
    if (!el) return;
    // native smooth scrolling loses to Lenis; route the jump through it
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(el);
    else el.scrollIntoView({ block: "start" });
  };

  if (chapters.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      {/* the rail: one dot per chapter, DARK's timeline scrubber */}
      {visible.length > 1 && (
        <nav
          aria-label="Journey chapters"
          className="cinematic-control fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex"
        >
          {visible.map((ch, i) => (
            <button
              key={i}
              onClick={() => scrollToChapter(i)}
              aria-label={`Chapter ${i + 1}: ${ch.title}`}
              className="group flex cursor-pointer items-center gap-2"
            >
              <span
                className={`font-deva text-[0.6rem] leading-none transition-colors ${
                  active === i ? "text-gold" : "text-ash/40 group-hover:text-ash"
                }`}
              >
                {toDevanagariNumeral(ch.parva)}
              </span>
              <span
                className={`block h-1.5 w-1.5 rounded-full transition-all ${
                  active === i
                    ? "scale-125 bg-gold"
                    : "bg-bone/30 group-hover:bg-bone/60"
                }`}
              />
            </button>
          ))}
        </nav>
      )}

      {visible.map((ch, i) => {
        const parva = parvas[ch.parva - 1];
        const img = images[i];
        return (
          <section
            key={i}
            data-chapter={i}
            className="painting-readable relative flex min-h-dvh flex-col justify-center px-6 py-24"
          >
            <div aria-hidden className="ink-wash" />
            <div data-chapter-body className="relative z-10 mx-auto w-full max-w-3xl">
              <p className="ui-label mb-4 !text-gold-dim">
                {parva.name} · <span className="font-deva">{toDevanagariNumeral(ch.parva)}</span>
              </p>
              <h2 className="font-display mb-8 text-3xl font-light italic text-bone sm:text-4xl">
                {ch.title}
              </h2>
              {img && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={img.url}
                  alt=""
                  loading="lazy"
                  className="mb-8 hidden max-h-72 w-full rounded-sm object-cover motion-reduce:block"
                  style={{
                    objectPosition: `${img.focalX * 100}% ${img.focalY * 100}%`,
                    filter: `grayscale(0.05) sepia(0.08) contrast(1.04) brightness(${(1.08 * (img.exposure ?? 1)).toFixed(2)}) saturate(0.98)`,
                  }}
                />
              )}
              <div className="flex max-w-2xl flex-col gap-5">
                {ch.text.map((para, j) => (
                  <p key={j} className="font-display text-lg leading-relaxed text-bone/80">
                    {para}
                  </p>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-1.5 border-t border-dotted border-ash/25 pt-5">
                <p className="ui-label !normal-case !text-ash/60">
                  {ch.citations.join(" · ")} · K.M. Ganguli tr.
                </p>
                {img?.title && (
                  <p className="ui-label !normal-case !text-ash/50">
                    {img.source ? (
                      <a
                        href={img.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-dotted underline-offset-2 transition-colors hover:text-bone"
                      >
                        &ldquo;{img.title}&rdquo;
                      </a>
                    ) : (
                      <>&ldquo;{img.title}&rdquo;</>
                    )}
                    {img.creator && <> · {img.creator}</>}
                    {img.year && <>, {img.year}</>}
                    {img.licenseLabel && img.licenseUrl && (
                      <>
                        {" "}·{" "}
                        <a
                          href={img.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-dotted underline-offset-2 transition-colors hover:text-bone"
                        >
                          {img.licenseLabel}
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* chapters waiting beyond the visitor's chosen narrative depth */}
      {gatedCount > 0 && (
        <section className="relative flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="font-display max-w-sm text-xl italic text-ash">
            {visible.length === 0
              ? "This life is not yet yours to read."
              : `${gatedCount} ${gatedCount === 1 ? "chapter waits" : "chapters wait"} deeper in the telling.`}
          </p>
          <Link
            href="/saga"
            className="ui-label underline decoration-dotted underline-offset-4 transition-colors hover:text-gold"
          >
            Turn the Kalachakra further
          </Link>
        </section>
      )}
    </div>
  );
}
