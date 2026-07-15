"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { characters, getJourneyArt, getThreadsForParva, parvas, toDevanagariNumeral } from "@/lib/kb";
import { selectAccessibleParva, useEpicStore } from "@/lib/store";
import { atmosphere } from "@/lib/atmosphere";
import { lenisRef } from "@/lib/lenis";
import { preloadPortrait } from "@/components/canvas/PortraitPlane";
import { TABLEAU_STRENGTH, toPortraitRequest } from "@/lib/tableau";

export default function ParvaIndex() {
  const rootRef = useRef<HTMLDivElement>(null);
  const knownParva = useEpicStore(selectAccessibleParva);
  const [activeParva, setActiveParva] = useState<number | null>(null);

  const jumpToParva = (number: number) => {
    const el = document.getElementById(`parva-${number}`);
    if (!el) return;
    // native smooth scrolling loses to Lenis; route the jump through it
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(el, { offset: -112 });
    else el.scrollIntoView({ block: "start" });
  };

  useEffect(() => {
    // hold-until-next-anchor: a known parva with art carries its painting
    // until the next illustrated book; after the last anchor (Sauptika)
    // the index returns to smoke. Gated parvas never resolve art at all.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const knownParvas = parvas.filter((p) => p.number <= knownParva);
    const lastAnchor = knownParvas.reduce((max, p) => (p.art ? p.number : max), 0);
    const portraitForParva = new Map<number, ReturnType<typeof toPortraitRequest>>();
    let current: ReturnType<typeof toPortraitRequest> = null;
    for (const p of knownParvas) {
      if (p.art) current = toPortraitRequest(p.art, TABLEAU_STRENGTH);
      portraitForParva.set(p.number, p.number > lastAnchor ? null : current);
    }
    if (!reduced) {
      const seen = new Set<string>();
      for (const p of portraitForParva.values()) {
        if (p && !seen.has(p.url)) {
          seen.add(p.url);
          preloadPortrait(p.url);
        }
      }
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parva]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
        const number = Number(el.id.replace("parva-", ""));
        if (!Number.isFinite(number)) return;
        const arrive = () => {
          setActiveParva(number);
          if (!reduced) atmosphere.portrait = portraitForParva.get(number) ?? null;
        };
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onEnter: arrive,
          onEnterBack: arrive,
        });
      });
    }, rootRef);
    return () => {
      ctx.revert();
      atmosphere.portrait = null;
    };
  }, [knownParva]);

  return (
    <div ref={rootRef} className="painting-readable relative mx-auto w-full max-w-4xl px-6 pb-32 pt-28">
      <div aria-hidden className="ink-wash" />
      {/* the parva rail: jump to any book */}
      <nav
        aria-label="Parvas"
        className="cinematic-control fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex"
      >
        {parvas.map((p) => (
          <a
            key={p.id}
            href={`#parva-${p.number}`}
            aria-label={`Parva ${p.number}: ${p.name}`}
            aria-current={activeParva === p.number ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              history.replaceState(null, "", `#parva-${p.number}`);
              jumpToParva(p.number);
            }}
            className={`font-deva px-1 text-[0.7rem] leading-tight transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gold/70 ${
              activeParva === p.number
                ? "text-gold"
                : p.number <= knownParva
                  ? "text-ash/40 hover:text-ash"
                  : "text-ash/20 hover:text-ash/40"
            }`}
          >
            {toDevanagariNumeral(p.number)}
          </a>
        ))}
      </nav>

      <h1
        className="font-display mb-2 text-[clamp(1.5rem,6vw,2.25rem)] font-light text-bone"
        style={{ letterSpacing: "0.25em" }}
      >
        THE EIGHTEEN PARVAS
      </h1>
      <p className="font-display mb-16 text-lg italic text-bone/80">
        One epic, eighteen books, from the first oath to the last ascent.
      </p>

      <ol className="flex flex-col">
        {parvas.map((p) => {
          const known = p.number <= knownParva;
          const arrivals = characters.filter((character) => character.firstParva === p.number).slice(0, 6);
          const threads = getThreadsForParva(p.number);
          const tableau = known && p.art ? getJourneyArt(p.art) : undefined;
          return (
            <li
              key={p.id}
              id={`parva-${p.number}`}
              data-parva
              className="group relative flex scroll-mt-28 gap-6 border-b border-dotted border-ash/20 py-10 sm:gap-10"
            >
              {/* watermark numeral, the /war treatment */}
              <span
                aria-hidden
                className="font-deva pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none text-[7rem] leading-none text-indigo-deep/50"
              >
                {toDevanagariNumeral(p.number)}
              </span>
              <span
                className={`font-deva w-14 shrink-0 text-right text-4xl leading-none ${
                  known ? "text-gold/80" : "text-ash/30"
                }`}
              >
                {toDevanagariNumeral(p.number)}
              </span>
              <div className="relative min-w-0">
                <h2 className="font-display text-2xl font-light text-bone">
                  {p.name}
                  <span className="font-deva ml-3 text-base text-bone/70">{p.deva}</span>
                </h2>
                <p className="font-display mt-1 text-lg italic text-bone/70">{p.meaning}</p>
                {known ? (
                  <>
                    <p className="font-display mt-4 max-w-2xl text-xl leading-relaxed text-bone/95">
                      {p.summary}
                    </p>
                    {tableau && (
                      /* reduced-motion sessions skip the WebGL crossfade and
                         get the book's tableau inline instead */
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={tableau.file}
                        alt=""
                        loading="lazy"
                        className="mt-5 hidden max-h-64 w-full max-w-2xl rounded-sm object-cover motion-reduce:block"
                        style={{
                          objectPosition: tableau.position,
                          filter: `grayscale(0.05) sepia(0.08) contrast(1.04) brightness(${(1.08 * (tableau.exposure ?? 1)).toFixed(2)}) saturate(0.98)`,
                        }}
                      />
                    )}
                    {(arrivals.length > 0 || threads.length > 0) && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {arrivals.map((character) => <Link key={character.id} href={`/who/${character.id}`} className="ui-label !text-bone/80 border border-dotted border-ash/30 px-2.5 py-1.5 hover:border-gold/50 hover:!text-bone">{character.name}</Link>)}
                        {threads.slice(0, 3).map((thread) => <Link key={thread.id} href={`/threads#${thread.id}`} className="ui-label border border-dotted border-vermillion/40 bg-void/40 px-2.5 py-1.5 !text-vermillion hover:border-vermillion hover:bg-void/60 hover:!text-vermillion">{thread.title}</Link>)}
                      </div>
                    )}
                    {p.synopsis && p.synopsis.length > 0 && (
                      <details
                        className="group/details mt-6 max-w-2xl border-l border-dotted border-ash/25 pl-6"
                        onToggle={() => requestAnimationFrame(() => ScrollTrigger.refresh())}
                      >
                        <summary className="ui-label cursor-pointer list-none py-2 transition-colors hover:text-bone">Read the full parva <span aria-hidden>+</span></summary>
                        <div className="reading-ink relative mt-4 flex flex-col gap-4">
                          {p.synopsis.map((para, j) => <p key={j} className="font-display text-lg leading-relaxed text-bone">{para}</p>)}
                        </div>
                      </details>
                    )}
                  </>
                ) : (
                  <p className="ui-label mt-4 !normal-case italic !text-ash/50">
                    · waiting deeper in the telling ·{" "}
                    <Link
                      href="/saga"
                      className="underline decoration-dotted underline-offset-2 transition-colors hover:text-gold"
                    >
                      turn it
                    </Link>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
