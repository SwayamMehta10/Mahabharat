"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { warDays, charactersById, parvaOfWarDay, toDevanagariNumeral } from "@/lib/kb";
import { useEpicStore } from "@/lib/store";
import { atmosphere } from "@/lib/atmosphere";
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
  const knownParva = useEpicStore((s) => s.knownParva);

  // the war lives in parvas 6–9; how many days may be spoken of?
  const visibleDays = warDays.filter((d) => parvaOfWarDay(d.day) <= knownParva);
  const gated = visibleDays.length < warDays.length;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

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

      // each day rises into view
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

    return () => {
      ctx.revert();
      atmosphere.war = 0;
    };
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
      </section>

      {/* the days */}
      <div data-days className="relative mx-auto max-w-4xl px-6 pb-40">
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
          return (
            <section
              key={d.day}
              data-day
              id={`day-${d.day}`}
              className={`relative flex min-h-[55vh] flex-col justify-center py-16 pl-20 sm:w-1/2 sm:pl-0 ${
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
                <ul className={`flex flex-col gap-3 ${left ? "sm:items-end" : ""}`}>
                  {d.events.map((ev, j) => (
                    <li key={j} className="font-display max-w-sm text-lg leading-relaxed text-bone/80">
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
                  <div
                    className={`mt-10 flex max-w-md flex-col gap-5 border-t border-dotted border-ash/25 pt-8 ${
                      left ? "sm:ml-auto" : ""
                    }`}
                  >
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

        {/* the veil, if the wheel forbids the rest */}
        {gated && (
          <section className="relative flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
            <p className="font-display max-w-sm text-xl italic text-ash">
              {visibleDays.length === 0
                ? "The field waits. What happens here is not yet yours to know."
                : `${warDays.length - visibleDays.length} days remain beyond the wheel.`}
            </p>
            <Link href="/saga" className="ui-label underline decoration-dotted underline-offset-4 transition-colors hover:text-gold">
              Turn the Kalachakra further
            </Link>
          </section>
        )}

        {/* aftermath */}
        {!gated && (
          <section data-day className="relative flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
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
