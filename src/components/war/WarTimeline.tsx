"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { warDays, charactersById, getJourneyArt, parvaOfWarDay, toDevanagariNumeral } from "@/lib/kb";
import { selectAccessibleParva, useEpicStore } from "@/lib/store";
import { atmosphere } from "@/lib/atmosphere";
import { lenisRef } from "@/lib/lenis";
import { preloadPortrait } from "@/components/canvas/PortraitPlane";
import { TABLEAU_STRENGTH, toPortraitRequest } from "@/lib/tableau";
import WordReveal from "@/components/ui/WordReveal";

gsap.registerPlugin(ScrollTrigger);

function FallChip({ id }: { id: string }) {
  const c = charactersById.get(id);
  if (!c) return null;
  return (
    <Link
      href={`/who/${c.id}`}
      className="ui-label rounded-sm border border-dotted border-vermillion/50 px-3 py-1.5 !text-bone/85 transition-colors hover:border-solid hover:!text-vermillion"
    >
      {c.name}
    </Link>
  );
}

export default function WarTimeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const knownParva = useEpicStore(selectAccessibleParva);
  const [activeDay, setActiveDay] = useState<number | null>(null);

  // the war lives in parvas 6–9; guided depth controls how many days unfold
  const visibleDays = warDays.filter((d) => parvaOfWarDay(d.day) <= knownParva);
  const gated = visibleDays.length < warDays.length;

  const jumpToDay = (day: number) => {
    const el = document.getElementById(`day-${day}`);
    if (!el) return;
    // native smooth scrolling loses to Lenis (it rewrites the scroll
    // position every frame), so the jump goes through Lenis when it exists;
    // reduced-motion sessions have no Lenis and jump natively
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(el, { offset: -96 });
    else el.scrollIntoView({ block: "start" });
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // hold-until-next-anchor: each visible day resolves to the nearest
    // art-bearing day at or above it, so the charioteer carries days 1-9,
    // the arrow bed days 10-12, and so on; days before any anchor get null
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const portraitForDay = new Map<number, ReturnType<typeof toPortraitRequest>>();
    let current: ReturnType<typeof toPortraitRequest> = null;
    for (const d of visibleDays) {
      if (d.art) current = toPortraitRequest(d.art, TABLEAU_STRENGTH);
      portraitForDay.set(d.day, current);
    }
    if (!reduced) {
      const seen = new Set<string>();
      for (const p of portraitForDay.values()) {
        if (p && !seen.has(p.url)) {
          seen.add(p.url);
          preloadPortrait(p.url);
        }
      }
    }

    const ctx = gsap.context(() => {
      // the spine draws itself as you descend
      gsap.fromTo(
        "[data-spine]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: "[data-days]",
            start: "top 60%",
            end: "bottom bottom",
            scrub: 0.6,
          },
        }
      );

      // each day rises into view; days with an id also report themselves to
      // the rail as they pass the reading line (discrete events, no per-frame
      // state - the atmosphere convention holds)
      gsap.utils.toArray<HTMLElement>("[data-day]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 78%" },
          }
        );
        const day = Number(el.id.replace("day-", ""));
        if (!Number.isFinite(day) || !el.id) return;
        const arrive = () => {
          setActiveDay(day);
          if (!reduced) atmosphere.portrait = portraitForDay.get(day) ?? null;
        };
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onEnter: arrive,
          onEnterBack: arrive,
        });
      });

      // above the first day (the hero) and below the last (aftermath or the
      // gate), the field returns to smoke
      ScrollTrigger.create({
        trigger: "[data-days]",
        start: "top 60%",
        end: "bottom 60%",
        onLeaveBack: () => {
          if (!reduced) atmosphere.portrait = null;
        },
      });
      gsap.utils.toArray<HTMLElement>("[data-day-end]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onEnter: () => {
            if (!reduced) atmosphere.portrait = null;
          },
          onEnterBack: () => {
            if (!reduced) atmosphere.portrait = null;
          },
        });
      });

      // the atmosphere bruises as the war deepens
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          atmosphere.war = self.progress;
        },
      });
    }, root);

    // honor a #day-N deep link: on a cold load the browser's own hash jump
    // fires before the store rehydrates and the gated days exist, so the
    // jump has to be replayed once the target is actually in the document
    const hash = window.location.hash.match(/^#day-(\d+)$/);
    if (hash && window.scrollY < 10) {
      const el = document.getElementById(`day-${hash[1]}`);
      if (el) {
        requestAnimationFrame(() => {
          const lenis = lenisRef.current;
          if (lenis) lenis.scrollTo(el, { offset: -96, immediate: true });
          else el.scrollIntoView({ block: "start" });
        });
      }
    }

    return () => {
      ctx.revert();
      atmosphere.war = 0;
      atmosphere.portrait = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleDays.length]);

  return (
    <div ref={rootRef} className="relative">
      {/* hero */}
      <section className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
        <p className="ui-label">Bhishma Parva · Drona Parva · Karna Parva · Shalya Parva</p>
        <h1
          className="font-display text-[clamp(1.6rem,7vw,3.75rem)] font-light text-bone"
          style={{ letterSpacing: "0.3em", textIndent: "0.3em" }}
        >
          KURUKSHETRA
        </h1>
        <p className="font-deva text-lg text-gold/80">धर्मक्षेत्रे कुरुक्षेत्रे</p>
        <WordReveal
          text="Eighteen mornings the conches sounded. Eighteen nights the fires were counted."
          className="max-w-md font-display text-xl italic text-ash"
          delay={0.8}
        />
        <Link href="/war/strategy" className="ui-label underline decoration-dotted underline-offset-4 transition-colors hover:text-vermillion">
          Open Sanjaya&apos;s Eye →
        </Link>
      </section>

      {/* the day rail: jump to any morning of the war */}
      {visibleDays.length > 1 && (
        <nav
          aria-label="War days"
          className="fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex"
        >
          {visibleDays.map((d) => (
            <a
              key={d.day}
              href={`#day-${d.day}`}
              aria-label={`Day ${d.day}: ${d.title}`}
              aria-current={activeDay === d.day ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault();
                history.replaceState(null, "", `#day-${d.day}`);
                jumpToDay(d.day);
              }}
              className={`font-deva px-1 text-[0.7rem] leading-tight transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gold/70 ${
                activeDay === d.day ? "text-gold" : "text-ash/40 hover:text-ash"
              }`}
            >
              {toDevanagariNumeral(d.day)}
            </a>
          ))}
        </nav>
      )}

      {/* the days */}
      <div data-days className="relative mx-auto max-w-5xl px-6 pb-40">
        {/* dotted spine */}
        <div
          data-spine
          aria-hidden
          className="absolute bottom-0 left-8 top-0 w-px sm:left-1/2"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(233,228,216,0.35) 0 2px, transparent 2px 9px)",
          }}
        />

        {visibleDays.map((d, i) => {
          const heavy = d.falls.length > 0;
          const left = i % 2 === 0;
          const tableau = d.art ? getJourneyArt(d.art) : undefined;
          return (
            <section
              key={d.day}
              data-day
              id={`day-${d.day}`}
              className={`relative flex scroll-mt-24 flex-col justify-center py-14 pl-20 sm:w-1/2 sm:pl-0 md:py-20 ${
                left ? "sm:pr-16 sm:text-right" : "sm:ml-auto sm:pl-16"
              }`}
            >
              {/* node on the spine */}
              <span
                aria-hidden
                className={`absolute left-8 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full sm:left-auto ${
                  left ? "sm:-right-1" : "sm:-left-1"
                } ${heavy ? "bg-vermillion" : "bg-bone/50"}`}
              />

              <span
                aria-hidden
                className={`font-deva pointer-events-none absolute top-1/2 -translate-y-1/2 select-none text-[9rem] leading-none text-indigo-deep/70 ${
                  left ? "sm:right-10" : "sm:left-10"
                } left-16`}
              >
                {toDevanagariNumeral(d.day)}
              </span>

              <div className="relative">
                <p className="ui-label mb-3">Day {d.day}</p>
                <h2 className="font-display mb-2 text-3xl font-light italic text-bone">
                  {d.title}
                </h2>
                <p className="ui-label mb-6 !text-gold-dim">
                  Kaurava command · {charactersById.get(d.commanderKaurava)?.name ?? d.commanderKaurava}
                </p>
                {tableau && (
                  /* reduced-motion sessions skip the WebGL crossfade and get
                     the day's tableau inline, the journey-chapter pattern */
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={tableau.file}
                    alt=""
                    loading="lazy"
                    className="mb-6 hidden max-h-64 w-full rounded-sm object-cover motion-reduce:block"
                    style={{
                      objectPosition: tableau.position,
                      filter: `grayscale(0.15) sepia(0.10) contrast(1.04) brightness(${(0.9 * (tableau.exposure ?? 1)).toFixed(2)})`,
                    }}
                  />
                )}
                <ul className={`flex flex-col gap-3 ${left ? "sm:items-end" : ""}`}>
                  {d.events.map((ev, j) => (
                    <li key={j} className="font-display max-w-md text-lg leading-relaxed text-bone/80">
                      {ev}
                    </li>
                  ))}
                </ul>
                {heavy && (
                  <div className={`mt-6 flex flex-wrap gap-2 ${left ? "sm:justify-end" : ""}`}>
                    <span className="ui-label mr-1 self-center !text-vermillion/80">Falls</span>
                    {d.falls.map((id) => (
                      <FallChip key={id} id={id} />
                    ))}
                  </div>
                )}
                {d.narrative && d.narrative.length > 0 && (
                  <details
                    className={`group/details mt-8 max-w-lg border-t border-dotted border-ash/25 pt-4 ${
                      left ? "sm:ml-auto" : ""
                    }`}
                    onToggle={() => requestAnimationFrame(() => ScrollTrigger.refresh())}
                  >
                    <summary
                      className={`ui-label cursor-pointer list-none py-2 transition-colors hover:text-bone ${
                        left ? "sm:text-right" : ""
                      }`}
                    >
                      Read the day in full <span aria-hidden>+</span>
                    </summary>
                    <div className="mt-4 flex flex-col gap-5">
                      {d.narrative.map((para, j) => (
                        <p
                          key={j}
                          className={`font-display text-lg leading-relaxed text-bone/75 ${
                            left ? "sm:text-right" : "text-left"
                          }`}
                        >
                          {para}
                        </p>
                      ))}
                      <p className="ui-label mt-2 !normal-case !text-ash/60">
                        {d.citations.join(" · ")} · K.M. Ganguli tr.
                      </p>
                    </div>
                  </details>
                )}
                {d.day === 1 && (
                  <Link
                    href="/gita"
                    className="ui-label mt-6 inline-block !text-gold underline decoration-dotted underline-offset-4 transition-colors hover:!text-gold-bright"
                  >
                    Hear the Song of the Lord →
                  </Link>
                )}
              </div>
            </section>
          );
        })}

        {/* the veil when guided depth has not reached the remaining days */}
        {gated && (
          <section data-day-end className="relative flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
            <p className="font-display max-w-sm text-xl italic text-ash">
              {visibleDays.length === 0
                ? "The field waits. What happens here is not yet yours to know."
                : `${warDays.length - visibleDays.length} days wait deeper in the telling.`}
            </p>
            <Link href="/saga" className="ui-label underline decoration-dotted underline-offset-4 transition-colors hover:text-gold">
              Turn the Kalachakra further
            </Link>
          </section>
        )}

        {/* aftermath */}
        {!gated && (
          <section data-day data-day-end className="relative flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
            <p className="font-deva text-lg text-ash/80">अष्टादश दिनानि</p>
            <WordReveal
              text="Of eleven armies and seven, ten men walked away."
              className="max-w-md font-display text-2xl italic text-bone/90"
            />
            <Link
              href="/family-tree"
              className="ui-label underline decoration-dotted underline-offset-4 transition-colors hover:text-gold"
            >
              ← Return to the Kuru Line
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
