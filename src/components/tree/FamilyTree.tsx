"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { characters, buildTreeEdges, getArt } from "@/lib/kb";
import { TREE_POSITIONS, CELL_X, CELL_Y } from "@/data/tree-layout";
import { useEpicStore } from "@/lib/store";
import type { Character } from "@/data/schema";

const CARD_W = 150;
const CARD_H = 118;
const PAD = 200;
// on-screen stroke width the edges should hold at any zoom
const EDGE_STROKE = 1.75;

const ALLEGIANCE_STYLE: Record<Character["allegiance"], { border: string; glyph: string }> = {
  pandava: { border: "border-gold/35", glyph: "text-gold" },
  kaurava: { border: "border-vermillion/40", glyph: "text-vermillion" },
  neutral: { border: "border-ash/30", glyph: "text-ash" },
  divine: { border: "border-gold-bright/60", glyph: "text-gold-bright" },
};

export default function FamilyTree() {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const edgesRef = useRef<SVGSVGElement>(null);
  const knownParva = useEpicStore((s) => s.knownParva);

  const { nodes, edges, width, height, toPx } = useMemo(() => {
    const placed = characters.filter((c) => TREE_POSITIONS[c.id]);
    const xs = placed.map((c) => TREE_POSITIONS[c.id].x);
    const ys = placed.map((c) => TREE_POSITIONS[c.id].y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const toPx = (id: string) => {
      const p = TREE_POSITIONS[id];
      return {
        x: (p.x - minX) * CELL_X + PAD,
        y: (p.y - minY) * CELL_Y + PAD,
      };
    };
    const width = (Math.max(...xs) - minX) * CELL_X + PAD * 2;
    const height = (Math.max(...ys) - minY) * CELL_Y + PAD * 2;
    const edges = buildTreeEdges().filter(
      (e) => TREE_POSITIONS[e.from] && TREE_POSITIONS[e.to]
    );
    return { nodes: placed, edges, width, height, toPx };
  }, []);

  // pan/zoom state lives in refs; gsap.set applies the transform
  const cam = useRef({ tx: 0, ty: 0, scale: 0.78 });
  const drag = useRef({ active: false, startX: 0, startY: 0, moved: 0 });

  const apply = () => {
    gsap.set(worldRef.current, {
      x: cam.current.tx,
      y: cam.current.ty,
      scale: cam.current.scale,
      transformOrigin: "0 0",
    });
    // counter-scale the edge strokes so lines never thin to sub-pixel;
    // children inherit this from the svg root (they carry no stroke-width
    // of their own)
    const sw = Math.min(3, Math.max(1, EDGE_STROKE / cam.current.scale));
    edgesRef.current?.style.setProperty("stroke-width", String(sw));
  };

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    // start centered on the trunk (Shantanu), slightly zoomed out
    const rect = vp.getBoundingClientRect();
    const shantanu = toPx("shantanu");
    cam.current.scale = 0.78;
    cam.current.tx = rect.width / 2 - shantanu.x * cam.current.scale;
    cam.current.ty = rect.height * 0.22 - shantanu.y * cam.current.scale;
    apply();

    gsap.fromTo(
      worldRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 2, ease: "power2.out" }
    );
    gsap.fromTo(
      "[data-node]",
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 1.1, stagger: 0.025, ease: "power3.out", delay: 0.3 }
    );

    // no pointer capture: capturing retargets the click away from the
    // node buttons, so a tap on a card would never navigate
    const onPointerDown = (e: PointerEvent) => {
      drag.current = { active: true, startX: e.clientX, startY: e.clientY, moved: 0 };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;
      drag.current.startX = e.clientX;
      drag.current.startY = e.clientY;
      drag.current.moved += Math.abs(dx) + Math.abs(dy);
      cam.current.tx += dx;
      cam.current.ty += dy;
      apply();
    };
    const onPointerUp = () => {
      drag.current.active = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const prev = cam.current.scale;
      const next = Math.min(1.6, Math.max(0.42, prev * (e.deltaY > 0 ? 0.9 : 1.11)));
      // zoom toward the cursor
      cam.current.tx = mx - ((mx - cam.current.tx) / prev) * next;
      cam.current.ty = my - ((my - cam.current.ty) / prev) * next;
      cam.current.scale = next;
      apply();
    };

    vp.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      vp.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      vp.removeEventListener("wheel", onWheel);
    };
  }, [toPx]);

  const openCharacter = (id: string) => {
    if (drag.current.moved > 6) return; // it was a drag, not a click
    router.push(`/who/${id}`);
  };

  return (
    <div
      ref={viewportRef}
      className="relative h-dvh w-full cursor-grab touch-none overflow-hidden active:cursor-grabbing"
    >
      <div ref={worldRef} className="absolute left-0 top-0" style={{ width, height }}>
        {/* edges - stroke-width lives on the svg root so apply() can
            counter-scale it against the camera zoom */}
        <svg
          ref={edgesRef}
          width={width}
          height={height}
          className="absolute left-0 top-0"
          style={{ strokeWidth: EDGE_STROKE }}
        >
          {edges.map((e, i) => {
            const a = toPx(e.from);
            const b = toPx(e.to);
            if (e.kind === "marriage") {
              return (
                <line
                  key={i}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="currentColor"
                  strokeDasharray="2 7"
                  strokeLinecap="round"
                  className="text-bone/50"
                />
              );
            }
            // parent to child: gentle elbow through the space between rows
            const midY = a.y + (b.y - a.y) * 0.55;
            const d = `M ${a.x} ${a.y + CARD_H / 2} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y - CARD_H / 2}`;
            const isKarnaLine = e.from === "kunti" && e.to === "karna";
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="currentColor"
                strokeDasharray={isKarnaLine ? "2 6" : undefined}
                strokeLinecap="round"
                className={isKarnaLine ? "text-gold/75" : "text-bone/45"}
              />
            );
          })}
        </svg>

        {/* nodes */}
        {nodes.map((c) => {
          const p = toPx(c.id);
          const revealed = c.firstParva <= knownParva;
          const style = ALLEGIANCE_STYLE[c.allegiance];
          const painting = getArt(c.id);
          return (
            <button
              key={c.id}
              data-node
              onClick={() => revealed && openCharacter(c.id)}
              className={`absolute flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-sm border border-dotted bg-abyss/80 backdrop-blur-[2px] transition-colors duration-300 ${
                revealed
                  ? `${style.border} cursor-pointer hover:border-solid hover:bg-indigo-deep/60`
                  : "cursor-default border-ash/15"
              }`}
              style={{
                width: CARD_W,
                height: CARD_H,
                left: p.x - CARD_W / 2,
                top: p.y - CARD_H / 2,
              }}
              aria-label={revealed ? c.name : "A figure not yet revealed"}
            >
              {revealed ? (
                painting ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={painting.thumb}
                      alt=""
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover opacity-90"
                      style={{
                        filter:
                          "grayscale(0.2) sepia(0.12) contrast(1.04) brightness(0.78)",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void/95 via-transparent to-void/30" />
                    <span className="ui-label relative mt-auto pb-1.5 !text-[0.75rem] !tracking-[0.13em] !text-bone">
                      {c.name}
                    </span>
                  </>
                ) : (
                  <>
                    <span className={`font-deva text-2xl leading-none ${style.glyph}`}>
                      {c.deva.charAt(0)}
                    </span>
                    <span className="ui-label !text-[0.75rem] !tracking-[0.13em] !text-bone/90">{c.name}</span>
                  </>
                )
              ) : (
                <span className="font-display text-2xl text-ash/30">?</span>
              )}
            </button>
          );
        })}
      </div>

      {/* HUD, pushed below the fixed chrome (menu glyph / chakra icon) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 pb-6 pt-16">
        <div>
          <h1 className="font-display text-2xl font-light tracking-[0.2em] text-bone">
            THE KURU LINE
          </h1>
          <p className="ui-label mt-1">One seed, two forests</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 text-right">
          <span className="ui-label"><span className="text-gold">●</span> Pandava</span>
          <span className="ui-label"><span className="text-vermillion">●</span> Kaurava</span>
          <span className="ui-label"><span className="text-gold-bright">●</span> Divine</span>
          <span className="ui-label"><span className="text-ash">●</span> Unaligned</span>
        </div>
      </div>
      <p className="ui-label pointer-events-none absolute inset-x-0 bottom-5 z-20 text-center">
        Drag to wander · Scroll to draw near
      </p>
      <a
        href="/war"
        className="ui-label absolute bottom-5 right-6 z-20 transition-colors hover:text-vermillion"
      >
        The Eighteen Days →
      </a>
    </div>
  );
}
