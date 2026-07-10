"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gitaVerses from "@/data/gita.json";
import { useEpicStore } from "@/lib/store";
import { atmosphere } from "@/lib/atmosphere";
import WordReveal from "@/components/ui/WordReveal";

gsap.registerPlugin(ScrollTrigger);

interface Verse {
  ref: string;
  deva: string;
  iast: string;
  en: string;
}

const verses = gitaVerses as Verse[];
const byRef = new Map(verses.map((v) => [v.ref, v]));

function VerseCard({ v }: { v: Verse }) {
  return (
    <section
      data-verse
      className="flex min-h-dvh flex-col items-center justify-center gap-7 px-6 text-center"
    >
      <p className="ui-label">Bhagavad Gita · {v.ref}</p>
      <p className="font-deva whitespace-pre-line text-2xl leading-loose text-gold-bright/90 sm:text-3xl">
        {v.deva}
      </p>
      <p className="font-display max-w-2xl text-lg italic leading-relaxed text-ash sm:text-xl">
        {v.iast}
      </p>
      <p className="font-display max-w-2xl text-2xl leading-relaxed text-bone/90 sm:text-3xl">
        {v.en}
      </p>
    </section>
  );
}

export default function GitaExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const thousandSunsRef = useRef<HTMLDivElement>(null);
  const kaloAsmiRef = useRef<HTMLDivElement>(null);
  const knownParva = useEpicStore((s) => s.knownParva);
  const gated = knownParva < 6;

  useEffect(() => {
    if (gated) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // verses drift up into view
      gsap.utils.toArray<HTMLElement>("[data-verse], [data-line]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 75%" },
          }
        );
      });

      // the world slows to a stop as Arjuna's bow slips
      ScrollTrigger.create({
        trigger: "[data-stillness]",
        start: "top 80%",
        end: "bottom 60%",
        scrub: true,
        onUpdate: (self) => {
          atmosphere.timeScale = 1 - self.progress;
          document.body.classList.toggle("time-frozen", self.progress > 0.6);
        },
      });

      // the cosmic form erupts, scrubbed by the descent
      ScrollTrigger.create({
        trigger: "[data-vishvarupa]",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          atmosphere.vishvarupa = p;
          if (thousandSunsRef.current) {
            thousandSunsRef.current.style.opacity = String(
              Math.max(0, 1 - p * 2.4)
            );
          }
          if (kaloAsmiRef.current) {
            const k = Math.max(0, (p - 0.55) / 0.35);
            kaloAsmiRef.current.style.opacity = String(Math.min(1, k));
          }
        },
      });

      // time returns with the last verse
      ScrollTrigger.create({
        trigger: "[data-return]",
        start: "top 80%",
        end: "top 30%",
        scrub: true,
        onUpdate: (self) => {
          atmosphere.timeScale = self.progress;
          atmosphere.vishvarupa = 1 - self.progress;
          if (self.progress > 0.4) document.body.classList.remove("time-frozen");
        },
      });
    }, root);

    return () => {
      ctx.revert();
      atmosphere.timeScale = 1;
      atmosphere.vishvarupa = 0;
      document.body.classList.remove("time-frozen");
    };
  }, [gated]);

  if (gated) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="font-display max-w-sm text-xl italic text-ash">
          The song is sung on the first morning of the war. It is not yet yours to hear.
        </p>
        <Link
          href="/saga"
          className="ui-label underline decoration-dotted underline-offset-4 transition-colors hover:text-gold"
        >
          Turn the Kalachakra to the Bhishma Parva
        </Link>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      {/* the field, before */}
      <section className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
        <p className="ui-label">Bhishma Parva · The first morning</p>
        <h1
          className="font-display text-3xl font-light text-bone sm:text-5xl"
          style={{ letterSpacing: "0.28em", textIndent: "0.28em" }}
        >
          THE SONG OF THE LORD
        </h1>
        <p className="font-deva text-xl text-gold/80">श्रीमद्भगवद्गीता</p>
        <WordReveal
          text="Two armies. Four million men. And one chariot, driven between them."
          className="max-w-md font-display text-xl italic text-ash"
          delay={0.8}
        />
        <p className="ui-label mt-8 animate-pulse">Descend</p>
      </section>

      {/* the despair — time slows across this passage */}
      <section data-stillness className="mx-auto flex min-h-[160vh] max-w-xl flex-col justify-around gap-24 px-6 py-32 text-center">
        <p data-line className="font-display text-2xl italic leading-relaxed text-bone/85">
          Arjuna looks across the field and sees no enemies — only teachers,
          uncles, cousins, sons.
        </p>
        <p data-line className="font-display text-2xl italic leading-relaxed text-bone/85">
          His mouth dries. His skin burns. The great bow Gandiva slips from
          his hand.
        </p>
        <p data-line className="font-display text-2xl italic leading-relaxed text-bone/70">
          &ldquo;I will not fight,&rdquo; he says — and falls silent.
        </p>
        <p data-line className="ui-label !text-gold-dim">
          And between one breath and the next, time stood still
        </p>
      </section>

      {/* the teaching */}
      <VerseCard v={byRef.get("2.47")!} />
      <VerseCard v={byRef.get("2.20")!} />
      <VerseCard v={byRef.get("4.7–8")!} />

      {/* the reveal — 350vh of held breath */}
      <section data-vishvarupa className="relative h-[350vh]">
        <div className="sticky top-0 flex h-dvh flex-col items-center justify-center px-6 text-center">
          {/* a soft dark scrim so the verses survive the glare of the form */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[54rem] max-w-[120vw] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "radial-gradient(closest-side, rgba(5,6,10,0.9) 0%, rgba(5,6,10,0.55) 45%, transparent 72%)",
            }}
          />
          <div ref={thousandSunsRef} className="relative flex flex-col items-center gap-7">
            <p className="ui-label">Bhagavad Gita · 11.12</p>
            <p className="font-deva whitespace-pre-line text-2xl leading-loose text-gold-bright/90 sm:text-3xl">
              {byRef.get("11.12")!.deva}
            </p>
            <p className="font-display max-w-2xl text-2xl leading-relaxed text-bone/90 sm:text-3xl">
              {byRef.get("11.12")!.en}
            </p>
          </div>
          <div
            ref={kaloAsmiRef}
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6"
            style={{ opacity: 0 }}
          >
            <p className="font-deva text-5xl text-bone sm:text-7xl">कालोऽस्मि</p>
            <p className="font-display max-w-xl text-2xl italic leading-relaxed text-bone/90">
              {byRef.get("11.32")!.en}
            </p>
            <p className="ui-label">Bhagavad Gita · 11.32</p>
          </div>
        </div>
      </section>

      {/* time returns */}
      <section data-return className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6 text-center">
        <VerseCardInline v={byRef.get("18.66")!} />
      </section>

      <section className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-6 text-center">
        <WordReveal
          text="The bow is lifted. The conches sound. The wheel turns again."
          className="max-w-md font-display text-2xl italic text-bone/90"
        />
        <Link
          href="/war#day-1"
          className="ui-label underline decoration-dotted underline-offset-4 transition-colors hover:text-vermillion"
        >
          Return to the field →
        </Link>
      </section>
    </div>
  );
}

function VerseCardInline({ v }: { v: Verse }) {
  return (
    <div data-verse className="flex flex-col items-center gap-7">
      <p className="ui-label">Bhagavad Gita · {v.ref}</p>
      <p className="font-deva whitespace-pre-line text-2xl leading-loose text-gold-bright/90 sm:text-3xl">
        {v.deva}
      </p>
      <p className="font-display max-w-2xl text-lg italic leading-relaxed text-ash sm:text-xl">
        {v.iast}
      </p>
      <p className="font-display max-w-2xl text-2xl leading-relaxed text-bone/90 sm:text-3xl">
        {v.en}
      </p>
    </div>
  );
}
