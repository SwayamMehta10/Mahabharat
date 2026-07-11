"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { characters, getArt } from "@/lib/kb";
import { useEpicStore } from "@/lib/store";
import type { Character } from "@/data/schema";

const GROUPS: { key: Character["allegiance"]; title: string; deva: string; tint: string }[] = [
  { key: "pandava", title: "The Pandavas & Their Own", deva: "पाण्डव", tint: "text-gold" },
  { key: "kaurava", title: "The Kauravas & Their Own", deva: "कौरव", tint: "text-vermillion" },
  { key: "divine", title: "The Divine", deva: "देव", tint: "text-gold-bright" },
  { key: "neutral", title: "Between the Worlds", deva: "तटस्थ", tint: "text-ash" },
];

function CharacterCard({ c, revealed }: { c: Character; revealed: boolean }) {
  const painting = getArt(c.id);

  if (!revealed) {
    return (
      <div className="flex aspect-[4/5] flex-col items-center justify-center rounded-sm border border-dotted border-ash/15 bg-abyss/60">
        <span className="font-display text-3xl text-ash/30">?</span>
      </div>
    );
  }

  return (
    <Link
      href={`/who/${c.id}`}
      data-card
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-sm border border-dotted border-ash/25 bg-abyss/80 p-3 transition-colors duration-300 hover:border-solid hover:border-gold/50"
    >
      {painting ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={painting.thumb}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
            style={{ filter: "grayscale(0.2) sepia(0.12) contrast(1.04) brightness(0.78)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
        </>
      ) : (
        <span
          aria-hidden
          className="font-deva pointer-events-none absolute right-1 top-1 text-6xl leading-none text-indigo-deep"
        >
          {c.deva.charAt(0)}
        </span>
      )}
      <span className="ui-label relative !text-[0.7rem] !text-bone">{c.name}</span>
      {c.epithets[0] && (
        <span className="font-display relative mt-0.5 text-sm italic text-ash">
          {c.epithets[0]}
        </span>
      )}
    </Link>
  );
}

export default function WhoIndex() {
  const rootRef = useRef<HTMLDivElement>(null);
  const knownParva = useEpicStore((s) => s.knownParva);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-card]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.02, ease: "power3.out", delay: 0.2 }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-5xl px-6 pb-32 pt-28">
      <h1
        className="font-display mb-2 text-4xl font-light text-bone"
        style={{ letterSpacing: "0.25em" }}
      >
        WHO
      </h1>
      <p className="font-display mb-14 text-lg italic text-ash">
        The figures of the epic, as far as the wheel allows.
      </p>

      {GROUPS.map((g) => {
        const members = characters.filter((c) => c.allegiance === g.key);
        if (!members.length) return null;
        return (
          <section key={g.key} className="mb-14">
            <div className="mb-5 flex items-baseline gap-4">
              <h2 className={`ui-label ${g.tint}`}>{g.title}</h2>
              <span className="font-deva text-sm text-ash/50">{g.deva}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {members.map((c) => (
                <CharacterCard key={c.id} c={c} revealed={c.firstParva <= knownParva} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
