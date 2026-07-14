/**
 * Pre-rendered radial-gradient glow sprites, cached per colour. Drawing these
 * with `drawImage` + `globalCompositeOperation:"lighter"` is dramatically faster
 * than canvas `shadowBlur` (which gaussian-blurs every arc and tanks the render
 * on hundreds of particles per frame). One sprite per colour, made once.
 */

const SIZE = 64; // sprite is 64×64; core at center
const cache = new Map<string, HTMLCanvasElement>();

export function glowSprite(rgb: string): HTMLCanvasElement {
  const hit = cache.get(rgb);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.25, `rgba(${rgb},0.65)`);
  g.addColorStop(0.55, `rgba(${rgb},0.18)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  cache.set(rgb, c);
  return c;
}

/** Draw a glowing particle at (x,y) with visual radius r and opacity a. */
export function drawGlow(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  r: number,
  a: number
): void {
  ctx.globalAlpha = a;
  ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
}
