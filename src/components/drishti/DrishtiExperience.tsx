"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { atmosphere } from "@/lib/atmosphere";
import { preloadPortrait } from "@/components/canvas/PortraitPlane";
import { selectAccessibleParva, useEpicStore } from "@/lib/store";
import type { CausalThread, EpicEvent } from "@/data/schema";

interface PersonView {
  id: string;
  name: string;
  deva: string;
  image?: { url: string; focalX: number; focalY: number; exposure?: number };
}

export default function DrishtiExperience({ event, people, threads }: { event: EpicEvent; people: PersonView[]; threads: CausalThread[] }) {
  const accessibleParva = useEpicStore(selectAccessibleParva);
  const revealed = event.parva <= accessibleParva;
  const [activeId, setActiveId] = useState(event.perspectives[0]?.characterId ?? "");
  const perspective = event.perspectives.find((item) => item.characterId === activeId) ?? event.perspectives[0];
  const person = people.find((item) => item.id === activeId);

  useEffect(() => {
    if (!revealed) return;
    if (person?.image) preloadPortrait(person.image.url);
    const activeIndex = people.findIndex((item) => item.id === activeId);
    const next = people[activeIndex + 1];
    if (next?.image) preloadPortrait(next.image.url);
  }, [activeId, people, person, revealed]);

  useEffect(() => {
    if (!revealed) return;
    atmosphere.portrait = person?.image ?? null;
    return () => { atmosphere.portrait = null; };
  }, [person, revealed]);

  if (!revealed) {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-start justify-center px-6 pb-28 pt-28">
        <p className="ui-label !text-gold">Drishti · one event, many truths</p>
        <p className="font-display mt-6 max-w-sm text-xl italic text-ash">
          This meeting waits deeper in the telling. Its truths would name what the wheel has not yet spoken.
        </p>
        <Link href="/saga" className="ui-label mt-8 underline decoration-dotted underline-offset-4 hover:text-gold">
          Turn the Kalachakra further
        </Link>
      </main>
    );
  }
  if (!perspective) return null;
  const activeThreads = threads.filter((thread) => perspective.threadIds.includes(thread.id));

  return (
    <main className="painting-readable relative mx-auto min-h-dvh w-full max-w-5xl px-6 pb-28 pt-28">
      <div aria-hidden className="ink-wash" />
      <p className="ui-label !text-gold">Drishti · one event, many truths</p>
      <h1 className="font-display mt-4 text-5xl font-light text-bone sm:text-6xl">{event.title}</h1>
      <p className="font-deva mt-2 text-2xl text-gold/70">{event.deva}</p>
      <p className="font-display mt-6 max-w-2xl text-xl leading-relaxed text-bone/80">{event.summary}</p>

      <nav className="mt-12 flex flex-wrap gap-2" aria-label="Choose a perspective">
        {people.map((item) => (
          <button key={item.id} type="button" onClick={() => setActiveId(item.id)} aria-pressed={activeId === item.id} className={`ui-label border px-4 py-3 transition-colors ${activeId === item.id ? "border-gold bg-gold/10 !text-bone" : "border-dotted border-ash/30 hover:border-gold/50 hover:!text-bone"}`}>
            {item.name}
          </button>
        ))}
      </nav>

      <section key={activeId} className="reading-ink relative mt-16 max-w-2xl border-l border-gold/35 pl-6 sm:pl-10">
        <p className="font-deva text-xl text-gold/70">{person?.deva}</p>
        <h2 className="font-display mt-2 text-3xl font-light italic text-bone">{perspective.heading}</h2>
        <p className="font-display mt-6 text-2xl leading-relaxed text-bone/85">{perspective.text}</p>
        <p className="ui-label mt-6 !normal-case !text-ash/60">{perspective.citations.join(" · ")} · K.M. Ganguli tr.</p>
        <Link href={`/who/${activeId}`} className="ui-label mt-6 inline-block underline decoration-dotted underline-offset-4 hover:text-bone">Enter {person?.name}&apos;s journey →</Link>
      </section>

      <section className="mt-20">
        <h2 className="ui-label mb-4 !text-vermillion">Threads crossing this view</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {activeThreads.map((thread) => (
            <Link key={thread.id} href={`/threads#${thread.id}`} className="border border-dotted border-ash/25 p-5 transition-colors hover:border-gold/50">
              <span className="ui-label !text-gold-dim">{thread.kind}</span>
              <span className="font-display mt-2 block text-xl text-bone">{thread.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
