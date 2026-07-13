"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { parvaOfWarDay } from "@/lib/kb";
import { selectAccessibleParva, useEpicStore } from "@/lib/store";
import type { StrategicDay, Vyuha } from "@/data/schema";

// deterministic scatter: every frame redraws the same array, only the drift moves
function jitter(j: number, k: number): number {
  const s = Math.sin(j * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// one parametric bird serves three vyuhas; the epic's crane, eagle and hawk
// differ in beak and wing, not in kind
const BIRDS: Partial<Record<Vyuha, { beak: number; span: number; sweep: number; body: number }>> = {
  krauncha: { beak: 0.17, span: 0.24, sweep: 0.13, body: 0.07 },
  garuda: { beak: 0.1, span: 0.34, sweep: 0.09, body: 0.1 },
  shyena: { beak: 0.08, span: 0.28, sweep: 0.19, body: 0.08 },
};

/**
 * Places point j of n for one host's array. Local coordinates: u advances
 * toward the enemy, v runs along the front; `facing` mirrors the shape so
 * beaks, horns and needle points always aim at the opposing host.
 */
function vyuhaPoint(vyuha: Vyuha, j: number, n: number, time: number, facing: 1 | -1): [number, number] {
  const t = j / n;
  // the hosts breathe: a slow per-point drift keeps every array alive
  const dx = 0.005 * Math.sin(time * 0.7 + j * 1.7);
  const dy = 0.005 * Math.cos(time * 0.6 + j * 2.3);
  const cx = 0.5 - facing * 0.21;
  const out = (u: number, v: number): [number, number] => [cx + facing * u + dx, 0.5 + v + dy];

  const bird = BIRDS[vyuha];
  if (bird) {
    const beakN = Math.floor(n * 0.14);
    const bodyN = Math.floor(n * 0.36);
    if (j < beakN) {
      const q = j / beakN;
      return out(bird.body + q * bird.beak, (jitter(j, 3) - 0.5) * 0.02 * (1 - q));
    }
    if (j < beakN + bodyN) {
      const k = j - beakN;
      const a = jitter(k, 4) * Math.PI * 2;
      const r = Math.sqrt(jitter(k, 5));
      return out(Math.cos(a) * bird.body * r, Math.sin(a) * bird.body * 0.8 * r);
    }
    const k = j - beakN - bodyN;
    const side = k % 2 === 0 ? 1 : -1;
    const q = Math.floor(k / 2) / ((n - beakN - bodyN) / 2);
    const u = -q * bird.sweep * (0.6 + 0.8 * q) + (jitter(k, 6) - 0.5) * 0.03;
    const v = side * (0.04 + q * bird.span) + (jitter(k, 7) - 0.5) * 0.03;
    return out(u, v);
  }

  if (vyuha === "vajra") {
    // the bolt tapers and kinks toward its point
    const u = -0.18 + t * 0.42;
    const zig = 0.07 * (1 - t) * Math.sin(t * Math.PI * 4);
    const w = 0.22 * (1 - t) + 0.012;
    return out(u, zig + (jitter(j, 1) - 0.5) * w);
  }
  if (vyuha === "suchi") {
    const u = -0.2 + Math.pow(t, 0.85) * 0.46;
    const w = 0.02 + 0.05 * (1 - t);
    return out(u, (jitter(j, 2) - 0.5) * w);
  }
  if (vyuha === "ardhachandra") {
    // the crescent bulges backward, horns forward
    const a = -1.2 + t * 2.4;
    const u = -Math.cos(a) * 0.2 + 0.04 + (jitter(j, 8) - 0.5) * 0.05;
    return out(u, Math.sin(a) * 0.36 + (jitter(j, 9) - 0.5) * 0.02);
  }
  if (vyuha === "makara") {
    const jawsN = Math.floor(n * 0.3);
    if (j < jawsN) {
      // the open jaws
      const side = j % 2 === 0 ? 1 : -1;
      const q = Math.floor(j / 2) / (jawsN / 2);
      return out(0.1 + q * 0.16, side * (0.015 + q * 0.09) + (jitter(j, 10) - 0.5) * 0.02);
    }
    const k = j - jawsN;
    const q = k / (n - jawsN);
    const w = 0.04 + 0.13 * Math.sin(Math.PI * q);
    return out(-0.22 + q * 0.32, (jitter(k, 11) - 0.5) * w);
  }
  if (vyuha === "mandala") {
    const ring = j % 5;
    const r = 0.1 + ring * 0.05;
    const a = t * Math.PI * 34 + time * 0.04 * (ring % 2 ? 1 : -1);
    return out(0.05 + Math.cos(a) * r, Math.sin(a) * r * 1.05);
  }
  if (vyuha === "chakra") {
    // rank curling within rank, the whole wheel slowly turning
    const a = t * Math.PI * 7 + time * 0.16;
    const r = 0.05 + t * 0.27;
    return out(0.05 + Math.cos(a) * r, Math.sin(a) * r + (jitter(j, 12) - 0.5) * 0.015);
  }
  if (vyuha === "shringataka") {
    const baseN = Math.floor(n * 0.3);
    if (j < baseN) {
      const q = j / baseN;
      return out(-0.16 + (jitter(j, 13) - 0.5) * 0.04, -0.33 + q * 0.66);
    }
    // two horns converging as they advance
    const k = j - baseN;
    const side = k % 2 === 0 ? 1 : -1;
    const q = Math.floor(k / 2) / ((n - baseN) / 2);
    return out(-0.16 + q * 0.42, side * (0.33 - q * 0.2) + (jitter(k, 14) - 0.5) * 0.03);
  }
  if (vyuha === "sarvatobhadra") {
    // a square facing all quarters, ranks filling the inside
    const s = 0.24;
    const perimN = Math.floor(n * 0.55);
    if (j < perimN) {
      const q = (j / perimN) * 4;
      const sideIdx = Math.floor(q);
      const p = -s + (q - sideIdx) * 2 * s;
      const edges: [number, number][] = [[p, -s], [s, p], [-p, s], [-s, -p]];
      const [u, v] = edges[Math.min(sideIdx, 3)];
      return out(u + 0.03 + (jitter(j, 15) - 0.5) * 0.02, v * 1.15 + (jitter(j, 16) - 0.5) * 0.02);
    }
    const k = j - perimN;
    const cols = 11;
    const rows = Math.ceil((n - perimN) / cols);
    const u = 0.03 - s * 0.7 + ((k % cols) / (cols - 1)) * s * 1.4;
    const v = (-s * 0.7 + (Math.floor(k / cols) / Math.max(1, rows - 1)) * s * 1.4) * 1.15;
    return out(u, v);
  }
  if (vyuha === "shakata-nested") {
    // day fourteen's three walls: the cart, the lotus within, the needle at the heart
    const third = Math.floor(n / 3);
    if (j < third) {
      const q = (j / third) * 3;
      const wall = Math.floor(q);
      const p = q - wall;
      if (wall === 0) return out(0.16 + (jitter(j, 17) - 0.5) * 0.025, -0.34 + p * 0.68);
      const side = wall === 1 ? 1 : -1;
      return out(0.16 - p * 0.4 + (jitter(j, 18) - 0.5) * 0.025, side * (0.34 - p * 0.04));
    }
    if (j < third * 2) {
      const k = j - third;
      const a = (k / third) * Math.PI * 2;
      const r = 0.05 + 0.08 * Math.abs(Math.cos(a * 3)) + (jitter(k, 19) - 0.5) * 0.02;
      return out(-0.04 + Math.cos(a) * r, Math.sin(a) * r);
    }
    const k = j - third * 2;
    const q = k / (n - third * 2);
    return out(0.04 - q * 0.2, (jitter(k, 20) - 0.5) * 0.022);
  }
  if (vyuha === "scatter") {
    // the night battle: torn clusters drifting where the ranks were
    const cluster = j % 9;
    const seed = cluster + (facing === 1 ? 0 : 9);
    const cu = (jitter(seed, 21) - 0.5) * 0.36 + 0.02 * Math.sin(time * 0.18 + cluster * 2.1);
    const cv = (jitter(seed, 22) - 0.5) * 0.62;
    const a = jitter(j, 23) * Math.PI * 2;
    const r = jitter(j, 24) * 0.07;
    return out(cu + Math.cos(a) * r, cv + Math.sin(a) * r);
  }
  if (vyuha === "duel") {
    const a = j * 2.399;
    const r = Math.sqrt(t) * 0.17;
    return out(0.04 + Math.cos(a) * r, Math.sin(a) * r);
  }
  if (vyuha === "ring-outer") {
    const a = t * Math.PI * 2 + time * 0.05;
    const r = 0.36 + (jitter(j, 25) - 0.5) * 0.05;
    return [0.5 + Math.cos(a) * r * 1.08 + dx, 0.5 + Math.sin(a) * r + dy];
  }
  if (vyuha === "ring-inner") {
    const a = t * Math.PI * 2 - time * 0.04;
    const r = 0.12 + 0.012 * Math.sin(time * 0.5) + (jitter(j, 26) - 0.5) * 0.06;
    return [0.5 + Math.cos(a) * r + dx, 0.5 + Math.sin(a) * r + dy];
  }
  // "line" and any future default: ranks of columns facing the enemy
  const rows = 20;
  const column = Math.floor(j / rows);
  const row = j % rows;
  return out(-0.17 + column * 0.026 + (column % 2) * 0.006, -0.36 + row * 0.038);
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
      context.fillStyle = "rgba(9,11,18,.65)";
      context.fillRect(0, 0, rect.width, rect.height);
      const perHost = 280;
      for (let i = 0; i < perHost * 2; i += 1) {
        const pandava = i < perHost;
        const host = pandava ? active.hosts.pandava : active.hosts.kaurava;
        const j = pandava ? i : i - perHost;
        const [x, y] = vyuhaPoint(host.vyuha, j, perHost, frame, pandava ? 1 : -1);
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
          <div className="relative overflow-hidden border border-dotted border-ash/25 bg-void"><canvas ref={canvasRef} className="block h-[55vh] min-h-[420px] w-full" aria-label={`Procedural strategic diagram for day ${active.day}: ${active.formation}. Gold points trace the Pandava host arrayed as ${active.hosts.pandava.name}; vermillion points the Kaurava host arrayed as ${active.hosts.kaurava.name}.`} /><div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-void p-6 pt-24"><p className="ui-label !text-vermillion">Day {active.day}</p><h2 className="font-display mt-2 text-3xl text-bone">{active.formation}</h2></div></div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-2 w-2 rounded-full bg-gold/90" />
              <span className="ui-label">Pandava host · {active.hosts.pandava.name}</span>
              <span className="font-deva text-sm text-gold/70">{active.hosts.pandava.deva}</span>
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-2 w-2 rounded-full bg-vermillion/90" />
              <span className="ui-label">Kaurava host · {active.hosts.kaurava.name}</span>
              <span className="font-deva text-sm text-vermillion/70">{active.hosts.kaurava.deva}</span>
            </span>
            <span className="ui-label !normal-case italic !text-ash/60">
              The points draw each host&apos;s vyuha as Sanjaya names it.
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center"><p className="font-display text-2xl italic leading-relaxed text-bone/80">{active.focus}</p><ol className="mt-8 flex flex-col gap-5 border-l border-dotted border-ash/30 pl-5">{active.phases.map((phase, index) => <li key={phase} className="font-display text-lg text-ash"><span className="ui-label mr-3 !text-gold-dim">{index + 1}</span>{phase}</li>)}</ol>{active.citations?.length ? <p className="ui-label mt-8 !normal-case !text-ash/60">{active.citations.join(" · ")} · K.M. Ganguli tr.</p> : null}<Link href={`/war#day-${active.day}`} className="ui-label mt-4 underline decoration-dotted underline-offset-4 hover:text-gold">Read the human chronicle →</Link></div>
      </section>
    </div>
  );
}
