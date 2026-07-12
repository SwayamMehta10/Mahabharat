"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { parvaOfWarDay } from "@/lib/kb";
import { selectAccessibleParva, useEpicStore } from "@/lib/store";
import type { StrategicDay } from "@/data/schema";

function point(pattern: StrategicDay["pattern"], index: number, total: number, time: number): [number, number] {
  const side = index % 2;
  const i = Math.floor(index / 2);
  const count = total / 2;
  const t = i / count;
  if (pattern === "wheel") {
    const ring = 0.18 + (i % 7) * 0.055;
    const angle = t * Math.PI * 12 + time * (side ? -0.05 : 0.05);
    return [0.5 + Math.cos(angle) * ring, 0.5 + Math.sin(angle) * ring];
  }
  if (pattern === "crescent") {
    const angle = -1.15 + t * 2.3;
    return [0.5 + Math.sin(angle) * 0.38, 0.5 + Math.cos(angle) * (side ? 0.31 : 0.42)];
  }
  if (pattern === "duel") {
    const angle = i * 2.399;
    const radius = Math.sqrt(t) * 0.18;
    return [0.33 + side * 0.34 + Math.cos(angle) * radius, 0.5 + Math.sin(angle) * radius];
  }
  if (pattern === "encirclement") {
    const angle = t * Math.PI * 2;
    const radius = side ? 0.13 : 0.38;
    return [0.5 + Math.cos(angle) * radius, 0.5 + Math.sin(angle) * radius];
  }
  const row = i % 18;
  const column = Math.floor(i / 18);
  return [0.12 + column * 0.032 + side * 0.45, 0.18 + row * 0.036];
}

export default function SanjayaEye({ days }: { days: StrategicDay[] }) {
  const accessibleParva = useEpicStore(selectAccessibleParva);
  const [selectedDay, setSelectedDay] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // a day's formation may only be studied once its parva has been spoken;
  // the phases name commanders and falls, so the gate matches /war exactly
  const visible = days.filter((day) => parvaOfWarDay(day.day) <= accessibleParva);
  const gatedCount = days.length - visible.length;
  const active = visible.find((day) => day.day === selectedDay) ?? visible[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let raf = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);
      context.fillStyle = "rgba(5,6,10,.65)";
      context.fillRect(0, 0, rect.width, rect.height);
      const total = 560;
      for (let i = 0; i < total; i += 1) {
        const [x, y] = point(active.pattern, i, total, frame);
        const pandava = i % 2 === 0;
        context.fillStyle = pandava ? "rgba(201,164,55,.72)" : "rgba(207,74,31,.68)";
        context.beginPath();
        context.arc(x * rect.width, y * rect.height, i % 11 === 0 ? 2.2 : 1.1, 0, Math.PI * 2);
        context.fill();
      }
      frame += 0.016;
      if (!reduced) raf = requestAnimationFrame(render);
    };
    render();
    const observer = new ResizeObserver(() => {
      if (reduced) render();
    });
    observer.observe(canvas);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [active]);

  if (!active) {
    return (
      <div className="flex min-h-[40vh] flex-col items-start justify-center gap-6">
        <p className="font-display max-w-sm text-xl italic text-ash">
          Sanjaya has not yet been given the sight. The field opens with the Bhishma Parva.
        </p>
        <Link href="/saga" className="ui-label underline decoration-dotted underline-offset-4 hover:text-gold">
          Turn the Kalachakra further
        </Link>
      </div>
    );
  }
  return (
    <div>
      <nav className="flex flex-wrap items-center gap-2" aria-label="Choose a strategic war day">
        {visible.map((day) => <button key={day.day} type="button" onClick={() => setSelectedDay(day.day)} aria-pressed={active.day === day.day} className={`ui-label h-11 min-w-11 border transition-colors ${active.day === day.day ? "border-vermillion bg-vermillion/10 !text-bone" : "border-dotted border-ash/30 hover:border-vermillion/60 hover:!text-bone"}`}>{day.day}</button>)}
        {gatedCount > 0 && (
          <span className="ui-label !normal-case ml-2 italic !text-ash/60">
            {gatedCount} {gatedCount === 1 ? "day waits" : "days wait"} deeper in the telling
          </span>
        )}
      </nav>
      <section className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_.6fr]">
        <div>
          <div className="relative overflow-hidden border border-dotted border-ash/25 bg-void"><canvas ref={canvasRef} className="block h-[55vh] min-h-[420px] w-full" aria-label={`Procedural strategic diagram for day ${active.day}: ${active.formation}. Gold points trace the Pandava host, vermillion points the Kaurava host, arranged as the day's battle array.`} /><div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-void p-6 pt-24"><p className="ui-label !text-vermillion">Day {active.day}</p><h2 className="font-display mt-2 text-3xl text-bone">{active.formation}</h2></div></div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-2 w-2 rounded-full bg-gold/90" />
              <span className="ui-label">Pandava host</span>
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-2 w-2 rounded-full bg-vermillion/90" />
              <span className="ui-label">Kaurava host</span>
            </span>
            <span className="ui-label !normal-case italic !text-ash/60">
              The points draw the day&apos;s battle array as Sanjaya describes it.
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center"><p className="font-display text-2xl italic leading-relaxed text-bone/80">{active.focus}</p><ol className="mt-8 flex flex-col gap-5 border-l border-dotted border-ash/30 pl-5">{active.phases.map((phase, index) => <li key={phase} className="font-display text-lg text-ash"><span className="ui-label mr-3 !text-gold-dim">{index + 1}</span>{phase}</li>)}</ol>{active.citations?.length ? <p className="ui-label mt-8 !normal-case !text-ash/60">{active.citations.join(" · ")} · K.M. Ganguli tr.</p> : null}<Link href={`/war#day-${active.day}`} className="ui-label mt-4 underline decoration-dotted underline-offset-4 hover:text-gold">Read the human chronicle →</Link></div>
      </section>
    </div>
  );
}
