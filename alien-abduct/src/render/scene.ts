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
  ctx.fillStyle = '#3d5a4b';
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 1.5 - Math.PI / 4, Math.PI * 1.5 + Math.PI / 4, false);
  ctx.lineTo(cx + r, vp.h + 50);
  ctx.lineTo(cx - r, vp.h + 50);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 1.5 - Math.PI / 4, Math.PI * 1.5 + Math.PI / 4, false);
  ctx.stroke();
  ctx.restore();
}
