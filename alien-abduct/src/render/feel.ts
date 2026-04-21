import type { Viewport } from './layout';

type Popup = { x: number; y: number; text: string; color: string; startT: number };

let shake = 0;
let shakeEndT = 0;
let hitstopEndT = 0;
let popups: Popup[] = [];
const flashes = new Map<string, number>();

export function triggerShake(now: number, amp: number, durMs: number): void {
  shake = amp;
  shakeEndT = now + durMs;
}

export function triggerHitstop(now: number, durMs: number): void {
  hitstopEndT = now + durMs;
}

export function isHitstopped(now: number): boolean {
  return now < hitstopEndT;
}

export function triggerFlash(now: number, mobId: string, durMs: number): void {
  flashes.set(mobId, now + durMs);
}

export function isFlashing(now: number, mobId: string): boolean {
  const end = flashes.get(mobId);
  if (end === undefined) return false;
  if (now > end) { flashes.delete(mobId); return false; }
  return true;
}

export function pushPopup(now: number, x: number, y: number, text: string, color: string): void {
  popups.push({ x, y, text, color, startT: now });
}

export function applyShake(ctx: CanvasRenderingContext2D, now: number): void {
  if (now < shakeEndT) {
    const left = (shakeEndT - now) / 250;
    const dx = (Math.random() - 0.5) * 2 * shake * left;
    const dy = (Math.random() - 0.5) * 2 * shake * left;
    ctx.translate(dx, dy);
  }
}

export function drawPopups(ctx: CanvasRenderingContext2D, now: number, _vp: Viewport): void {
  popups = popups.filter(p => now - p.startT < 700);
  for (const p of popups) {
    const t = (now - p.startT) / 700;
    const alpha = 1 - t;
    const yoff = -40 * t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.font = 'bold 22px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y + yoff);
    ctx.restore();
  }
}
