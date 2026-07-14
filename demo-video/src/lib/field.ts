/**
 * The battle-formation math, ported verbatim from the site's
 * src/components/war/SanjayaEye.tsx so the trailer draws the exact same vyuhas.
 * `time` is fed frame-based (frame * 0.016) to match the site's per-frame drift.
 */

export type Vyuha =
  | "krauncha" | "garuda" | "shyena" | "vajra" | "suchi" | "ardhachandra"
  | "makara" | "mandala" | "chakra" | "shringataka" | "sarvatobhadra"
  | "shakata-nested" | "scatter" | "duel" | "ring-outer" | "ring-inner" | "line";

export function jitter(j: number, k: number): number {
  const s = Math.sin(j * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const BIRDS: Partial<Record<Vyuha, { beak: number; span: number; sweep: number; body: number }>> = {
  krauncha: { beak: 0.17, span: 0.24, sweep: 0.13, body: 0.07 },
  garuda: { beak: 0.1, span: 0.34, sweep: 0.09, body: 0.1 },
  shyena: { beak: 0.08, span: 0.28, sweep: 0.19, body: 0.08 },
};

export function vyuhaPoint(
  vyuha: Vyuha, j: number, n: number, time: number, facing: 1 | -1
): [number, number] {
  const t = j / n;
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
    const a = -1.2 + t * 2.4;
    const u = -Math.cos(a) * 0.2 + 0.04 + (jitter(j, 8) - 0.5) * 0.05;
    return out(u, Math.sin(a) * 0.36 + (jitter(j, 9) - 0.5) * 0.02);
  }
  if (vyuha === "makara") {
    const jawsN = Math.floor(n * 0.3);
    if (j < jawsN) {
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
    const k = j - baseN;
    const side = k % 2 === 0 ? 1 : -1;
    const q = Math.floor(k / 2) / ((n - baseN) / 2);
    return out(-0.16 + q * 0.42, side * (0.33 - q * 0.2) + (jitter(k, 14) - 0.5) * 0.03);
  }
  if (vyuha === "sarvatobhadra") {
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
  const rows = 20;
  const column = Math.floor(j / rows);
  const row = j % rows;
  return out(-0.17 + column * 0.026 + (column % 2) * 0.006, -0.36 + row * 0.038);
}

/** Day → [pandava, kaurava] formations, from strategic-days.json. */
export const DAY_FORMATIONS: Record<number, [Vyuha, Vyuha]> = {
  1: ["vajra", "line"], 2: ["krauncha", "line"], 3: ["ardhachandra", "garuda"],
  4: ["vajra", "sarvatobhadra"], 5: ["shyena", "makara"], 6: ["makara", "krauncha"],
  7: ["vajra", "mandala"], 8: ["shringataka", "line"], 9: ["line", "sarvatobhadra"],
  10: ["suchi", "line"], 11: ["line", "chakra"], 12: ["ardhachandra", "garuda"],
  13: ["suchi", "chakra"], 14: ["vajra", "shakata-nested"], 15: ["scatter", "scatter"],
  16: ["ardhachandra", "makara"], 17: ["duel", "duel"], 18: ["ring-outer", "ring-inner"],
};

// ---- easing + value noise (for embers, smoke, camera) ----

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

export function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  return (
    hash2(ix, iy) * (1 - u) * (1 - v) +
    hash2(ix + 1, iy) * u * (1 - v) +
    hash2(ix, iy + 1) * (1 - u) * v +
    hash2(ix + 1, iy + 1) * u * v
  );
}
