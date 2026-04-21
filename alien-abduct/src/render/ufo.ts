import { ufoPosition, type Viewport } from './layout';

export function drawUFO(ctx: CanvasRenderingContext2D, vp: Viewport, t: number, hpFrac: number): void {
  const { x, y } = ufoPosition(vp);
  const bob = Math.sin(t * 0.002) * 6;
  const shake = (1 - hpFrac) * (Math.sin(t * 0.04) * 4);

  ctx.save();
  ctx.translate(x + shake, y + bob);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000';

  const glow = 0.5 + 0.5 * Math.sin(t * 0.008);
  ctx.save();
  ctx.globalAlpha = 0.2 + 0.15 * glow;
  ctx.fillStyle = '#9be8ff';
  ctx.beginPath();
  ctx.ellipse(0, 22, 75, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#9aa5b4';
  ctx.beginPath();
  ctx.ellipse(0, 18, 80, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(180,230,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 32, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.translate(0, -6);
  ctx.fillStyle = '#a4dc6a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const blink = Math.max(0, Math.sin(t * 0.003 + 1.2));
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(-8, -4, 4, 5 * blink + 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8, -4, 4, 5 * blink + 1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-9, -6, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(7, -6, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(i * 25, 26, 4 + (glow * 1.5), 0, Math.PI * 2);
    ctx.fillStyle = '#ffe86a';
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
