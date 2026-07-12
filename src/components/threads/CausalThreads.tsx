"use client";

import { useState } from "react";
import Link from "next/link";
import { selectAccessibleParva, useEpicStore } from "@/lib/store";
import type { CausalThread } from "@/data/schema";

export default function CausalThreads({ threads, names }: { threads: CausalThread[]; names: Record<string, string> }) {
  const accessibleParva = useEpicStore(selectAccessibleParva);
  const [selected, setSelected] = useState("");
  // a thread stays veiled until its last consequence is within the
  // visitor's depth; its summary names the whole arc, not just the vow
  const visible = threads.filter((thread) => Math.max(...thread.parvas) <= accessibleParva);
  const gatedCount = threads.length - visible.length;
  const active = visible.find((thread) => thread.id === selected) ?? visible[0];

  if (!active) {
    return (
      <div className="flex min-h-[40vh] flex-col items-start justify-center gap-6">
        <p className="font-display max-w-sm text-xl italic text-ash">
          The web is not yet yours to trace. Every thread here ends in a consequence.
        </p>
        <Link href="/saga" className="ui-label underline decoration-dotted underline-offset-4 hover:text-gold">
          Turn the Kalachakra further
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <nav className="flex flex-col" aria-label="Vows, curses, boons, secrets and debts">
        {visible.map((thread) => (
          <button id={thread.id} key={thread.id} type="button" onClick={() => setSelected(thread.id)} aria-pressed={active.id === thread.id} className={`border-b border-dotted px-2 py-5 text-left transition-colors ${active.id === thread.id ? "border-gold/60 text-bone" : "border-ash/20 text-ash hover:text-bone"}`}>
            <span className="ui-label !text-gold-dim">{thread.kind}</span>
            <span className="font-display mt-1 block text-2xl">{thread.title}</span>
          </button>
        ))}
        {gatedCount > 0 && (
          <p className="ui-label !normal-case mt-6 px-2 italic !text-ash/60">
            {gatedCount} {gatedCount === 1 ? "thread is" : "threads are"} still gathering deeper in the telling.
          </p>
        )}
      </nav>
      <section key={active.id} className="lg:sticky lg:top-28 lg:self-start">
        <p className="ui-label !text-vermillion">Parvas {active.parvas.join(" · ")}</p>
        <h2 className="font-display mt-4 text-4xl font-light text-bone">{active.title}</h2>
        <p className="font-display mt-6 text-2xl leading-relaxed text-bone/80">{active.summary}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {active.characterIds.map((id) => <Link key={id} href={`/who/${id}`} className="ui-label border border-dotted border-ash/30 px-3 py-2 hover:border-gold/50 hover:text-bone">{names[id] ?? id}</Link>)}
        </div>
        {active.eventIds.map((id) => <Link key={id} href={`/drishti/${id}`} className="ui-label mt-6 block underline decoration-dotted underline-offset-4 hover:text-gold">Enter the shared event →</Link>)}
        <p className="ui-label mt-8 !normal-case !text-ash/60">{active.citations.join(" · ")} · K.M. Ganguli tr.</p>
      </section>
    </div>
  );
}
