// Hero render : alien dans soucoupe (v1). Conserve l'API drawUFO pour le renderer.
// Compose drawSaucerShadow → drawAlien → drawSaucerBowl (3 passes pour effet "dedans").

import { createAlien, drawAlien, drawSaucerBowl, drawSaucerShadow, updateAlien, type AlienState } from './parts/alien';
import { ufoPosition, type Viewport } from './layout';

let alien: AlienState | null = null;
let lastT = -1;

function ensure(): AlienState {
  if (!alien) alien = createAlien();
  return alien;
}

export function drawUFO(ctx: CanvasRenderingContext2D, vp: Viewport, t: number, hpFrac: number): void {
  const a = ensure();
  const dt = lastT < 0 ? 16 : Math.min(50, t - lastT);
  lastT = t;
  updateAlien(a, t, dt);
  a.face.angry = hpFrac < 0.3;

  const { x, y } = ufoPosition(vp);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.2, 1.2);
  drawSaucerShadow(ctx, t);
  drawAlien(ctx, a, t);
  drawSaucerBowl(ctx, t, hpFrac);
  ctx.restore();
}
