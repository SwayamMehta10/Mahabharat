"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { parvas, toDevanagariNumeral } from "@/lib/kb";
import { useEpicStore } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

export default function ParvaIndex() {
  const rootRef = useRef<HTMLDivElement>(null);
  const knownParva = useEpicStore((s) => s.knownParva);

  useEffect(() => {
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
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-3xl px-6 pb-32 pt-28">
      <h1
        className="font-display mb-2 text-4xl font-light text-bone"
        style={{ letterSpacing: "0.25em" }}
      >
        THE EIGHTEEN PARVAS
      </h1>
      <p className="font-display mb-16 text-lg italic text-ash">
        One epic, eighteen books — from the first oath to the last ascent.
      </p>

      <ol className="flex flex-col">
        {parvas.map((p) => {
          const known = p.number <= knownParva;
          return (
            <li
              key={p.id}
              id={`parva-${p.number}`}
              data-parva
              className="group flex scroll-mt-28 gap-6 border-b border-dotted border-ash/20 py-10 sm:gap-10"
            >
              <span
                className={`font-deva w-14 shrink-0 text-right text-4xl leading-none ${
                  known ? "text-gold/80" : "text-ash/30"
                }`}
              >
                {toDevanagariNumeral(p.number)}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-light text-bone">
                  {p.name}
                  <span className="font-deva ml-3 text-base text-bone/50">{p.deva}</span>
                </h2>
                <p className="font-display mt-1 text-base italic text-ash">{p.meaning}</p>
                {known ? (
                  <p className="font-display mt-4 max-w-xl text-lg leading-relaxed text-bone/80">
                    {p.summary}
                  </p>
                ) : (
                  <p className="ui-label mt-4 !normal-case italic !text-ash/50">
                    — the wheel has not yet turned this far —{" "}
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
