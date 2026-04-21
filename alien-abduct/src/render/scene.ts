import { arcCenter, type Viewport } from './layout';

type Star = { x: number; y: number; r: number; phase: number };

let stars: Star[] | null = null;

function ensureStars(vp: Viewport) {
  if (stars && stars.length > 0) return;
  stars = [];
  const n = Math.min(200, Math.floor((vp.w * vp.h) / 8000));
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random() * vp.w,
      y: Math.random() * vp.h * 0.75,
      r: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

export function drawScene(ctx: CanvasRenderingContext2D, vp: Viewport, t: number): void {
  ctx.fillStyle = '#060616';
  ctx.fillRect(0, 0, vp.w, vp.h);

  ensureStars(vp);
  for (const s of stars!) {
    const tw = 0.5 + 0.5 * Math.sin(t * 0.002 + s.phase);
    ctx.globalAlpha = 0.4 + 0.6 * tw;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const { cx, cy, r } = arcCenter(vp);
  ctx.save();
  // Ombre pour donner du volume : offset haut-gauche (éclairage venant de l'UFO)
  const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  grad.addColorStop(0, '#6ecf9b');
  grad.addColorStop(0.6, '#3d8a5f');
  grad.addColorStop(1, '#1f3a2a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Bordure épaisse style Coup Ahoo
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Quelques cratères/taches pour texture
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  const craters: Array<[number, number, number]> = [[0.25, -0.1, 0.18], [-0.15, 0.3, 0.12], [0.35, 0.4, 0.09], [-0.4, -0.2, 0.07]];
  for (const [ax, ay, ar] of craters) {
    ctx.beginPath();
    ctx.arc(cx + ax * r, cy + ay * r, ar * r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
