"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { parvas, toDevanagariNumeral } from "@/lib/kb";
import { useEpicStore } from "@/lib/store";
import EllipseButton from "@/components/ui/EllipseButton";
import WordReveal from "@/components/ui/WordReveal";

const SIZE = 380;
const C = SIZE / 2;
const R_SEG = 142; // interactive parva arcs
const R_NUM = 168; // numeral ring — the dial's affordance
const R_INNER = 92; // single faint inner ring, clearly not the control
const GAP_DEG = 3.2;

// coordinates rounded so SSR and client emit byte-identical path strings
// (raw trig differs in the last float digit between V8 runs → hydration mismatch)
function polar(r: number, angleDeg: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180; // 0° at top, clockwise
  return [
    Math.round((C + r * Math.cos(a)) * 100) / 100,
    Math.round((C + r * Math.sin(a)) * 100) / 100,
  ];
}

function arcPath(r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

export default function KalachakraGate() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // the store is the single source of truth; it rehydrates after mount
  // (StoreHydrator), so this re-renders to the visitor's saved position
  const { knownParva, setKnownParva } = useEpicStore();
  const selected = Math.max(1, knownParva);
  const [hovered, setHovered] = useState<number | null>(null);

  const shown = hovered ?? selected;
  const parva = parvas[shown - 1];

  const segments = useMemo(
    () =>
      parvas.map((p, i) => {
        const a0 = i * 20 + GAP_DEG / 2;
        const a1 = (i + 1) * 20 - GAP_DEG / 2;
        return { parva: p, n: i + 1, d: arcPath(R_SEG, a0, a1) };
      }),
    []
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-seg]",
        { opacity: 0 },
        { opacity: 1, duration: 1.2, stagger: 0.05, ease: "power2.out", delay: 0.4 }
      );
      gsap.to("[data-ring]", {
        rotation: 360,
        duration: 300,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
      gsap.fromTo(
        "[data-fade]",
        { opacity: 0 },
        { opacity: 1, duration: 1.6, stagger: 0.3, ease: "power2.out", delay: 1.2 }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const choose = (n: number) => {
    setKnownParva(n);
  };

  const continueOn = () => {
    gsap.to(rootRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => router.push("/family-tree"),
    });
  };

  return (
    <div
      ref={rootRef}
      className="flex h-dvh flex-col items-center justify-center gap-4 overflow-hidden px-6 py-6 text-center"
    >
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg ref={svgRef} width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* one faint inner ring for depth — clearly not the control */}
          <g data-ring>
            <circle
              cx={C} cy={C} r={R_INNER}
              fill="none" stroke="currentColor" strokeWidth="1"
              strokeDasharray="1 7" strokeLinecap="round"
              className="text-bone/15"
            />
          </g>

          {/* 18 parva segments */}
          {segments.map(({ n, d }) => {
            const known = n <= selected;
            const isHover = hovered === n;
            return (
              <g key={n} data-seg className="anim-hidden cursor-pointer">
                {/* wide invisible hit area */}
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={34}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => choose(n)}
                />
                <path
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={isHover ? 2.5 : 1.75}
                  strokeDasharray="1 5.5"
                  strokeLinecap="round"
                  className={
                    isHover
                      ? "text-gold-bright transition-colors duration-300"
                      : known
                        ? "text-gold transition-colors duration-300"
                        : "text-bone/40 transition-colors duration-300"
                  }
                  style={{ pointerEvents: "none" }}
                />
              </g>
            );
          })}

          {/* numerals — the affordance that says "this is a dial of 18" */}
          {segments.map(({ n }) => {
            const [nx, ny] = polar(R_NUM, n * 20 - 10);
            const known = n <= selected;
            const isHover = hovered === n;
            return (
              <text
                key={`num-${n}`}
                data-seg
                x={nx}
                y={ny}
                textAnchor="middle"
                dominantBaseline="central"
                className={`anim-hidden cursor-pointer select-none font-ui text-[11px] transition-colors duration-300 ${
                  isHover
                    ? "fill-gold-bright"
                    : known
                      ? "fill-gold/90"
                      : "fill-bone/45"
                }`}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => choose(n)}
              >
                {n}
              </text>
            );
          })}
        </svg>

        {/* hub */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-deva text-5xl text-gold-bright/90">
            {toDevanagariNumeral(shown)}
          </span>
          <span className="ui-label mt-1.5">Parva {shown} of 18</span>
        </div>
      </div>

      {/* selected parva details */}
      <div className="flex min-h-16 flex-col items-center gap-1" aria-live="polite">
        <p className="font-display text-2xl font-light tracking-wide text-bone">
          {parva.name}
          <span className="font-deva ml-3 text-lg text-bone/60">{parva.deva}</span>
        </p>
        <p className="font-display text-base italic text-ash">{parva.meaning}</p>
      </div>

      <div data-fade className="anim-hidden flex flex-col items-center gap-3">
        <WordReveal
          text="Turn the wheel to how far you know the tale, and nothing beyond it shall be spoken."
          className="max-w-md font-display text-base italic text-ash"
          delay={1.6}
        />
        <EllipseButton onClick={continueOn} ariaLabel="Continue to the family tree">
          <span className="ui-label !text-bone">Continue</span>
        </EllipseButton>
      </div>
    </div>
  );
}
