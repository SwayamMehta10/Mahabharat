import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { WIDTH, HEIGHT, COLOR } from "../config";
import { easeInOut, clamp01 } from "../lib/field";

type Node = { x: number; y: number; house: "gold" | "verm" | "root" };

// a stylised dynasty: one root splitting into two houses that branch down
const NODES: Node[] = [
  { x: 0.5, y: 0.16, house: "root" },
  { x: 0.32, y: 0.4, house: "gold" },
  { x: 0.68, y: 0.4, house: "verm" },
  { x: 0.18, y: 0.66, house: "gold" }, { x: 0.32, y: 0.66, house: "gold" }, { x: 0.46, y: 0.66, house: "gold" },
  { x: 0.56, y: 0.66, house: "verm" }, { x: 0.7, y: 0.66, house: "verm" }, { x: 0.84, y: 0.66, house: "verm" },
  { x: 0.25, y: 0.86, house: "gold" }, { x: 0.4, y: 0.86, house: "gold" },
  { x: 0.62, y: 0.86, house: "verm" }, { x: 0.78, y: 0.86, house: "verm" },
];
// [from, to] index pairs, drawn in order (by depth)
const EDGES: [number, number][] = [
  [0, 1], [0, 2],
  [1, 3], [1, 4], [1, 5], [2, 6], [2, 7], [2, 8],
  [3, 9], [4, 10], [7, 11], [8, 12],
];

const houseColor = (h: Node["house"]) => (h === "gold" ? COLOR.gold : h === "verm" ? COLOR.vermillion : COLOR.bone);

/**
 * The line of the dynasty drawing itself: threads grow from the root and branch
 * into the gold and vermillion houses, nodes igniting as each thread lands.
 * The "two houses from one seed" beat — pure vector graphic, no imagery.
 */
export const LineageThreads: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const per = 9; // frames per edge draw
  const start = 10;

  const px = (n: Node) => n.x * WIDTH;
  const py = (n: Node) => n.y * HEIGHT;

  const fade = Math.min(1, frame / 12, (durationInFrames - frame) / 14);

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void, opacity: Math.max(0, fade) }}>
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute" }}>
        {EDGES.map(([a, b], i) => {
          const t0 = start + i * per * 0.6; // slight overlap
          const grow = easeInOut(clamp01((frame - t0) / per));
          if (grow <= 0) return null;
          const A = NODES[a], B = NODES[b];
          const mx = px(A), my = py(A);
          const nx = mx + (px(B) - mx) * grow;
          const ny = my + (py(B) - my) * grow;
          const col = houseColor(B.house);
          return (
            <line
              key={i}
              x1={mx} y1={my} x2={nx} y2={ny}
              stroke={col}
              strokeWidth={1.4}
              strokeOpacity={0.55}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${col})` }}
            />
          );
        })}
        {NODES.map((n, i) => {
          // node lights when its incoming edge is ~done
          const edgeIdx = EDGES.findIndex(([, to]) => to === i);
          const t0 = edgeIdx < 0 ? start : start + edgeIdx * per * 0.6;
          const lit = clamp01((frame - (t0 + per)) / 8);
          if (lit <= 0 && i !== 0) return null;
          const col = houseColor(n.house);
          const r = (n.house === "root" ? 6 : 4) * (0.6 + 0.4 * lit);
          return (
            <circle
              key={`n${i}`}
              cx={px(n)} cy={py(n)} r={r}
              fill={col}
              fillOpacity={0.9 * (i === 0 ? interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }) : lit)}
              style={{ filter: `drop-shadow(0 0 8px ${col})` }}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
