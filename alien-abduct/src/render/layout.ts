import { ARC } from '../game/rules';

export type Viewport = { w: number; h: number };

export function arcCenter(vp: Viewport): { cx: number; cy: number; r: number } {
  return {
    cx: vp.w * ARC.centerXRel,
    cy: vp.h * ARC.centerYRel,
    r: vp.h * ARC.radiusRel,
  };
}

/** Position d'un mob au sol, en coord écran. angle=0 = sommet de l'arc (nord). */
export function mobPosition(vp: Viewport, angle: number): { x: number; y: number; rot: number } {
  const { cx, cy, r } = arcCenter(vp);
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  return { x, y, rot: angle };
}

export function ufoPosition(vp: Viewport): { x: number; y: number } {
  return { x: vp.w * 0.5, y: vp.h * 0.12 };
}

export function slotRect(vp: Viewport, index: 0 | 1 | 2): { x: number; y: number; w: number; h: number } {
  const size = Math.min(80, vp.w * 0.08);
  const gap = size * 0.25;
  const totalW = size * 3 + gap * 2;
  const startX = vp.w * 0.5 - totalW / 2;
  return { x: startX + index * (size + gap), y: vp.h - size - 20, w: size, h: size };
}

export function hpBarRect(vp: Viewport): { x: number; y: number; w: number; h: number } {
  return { x: 20, y: vp.h - 40, w: 200, h: 20 };
}

export function skipButtonRect(vp: Viewport): { x: number; y: number; w: number; h: number } {
  return { x: vp.w - 120, y: vp.h - 50, w: 100, h: 30 };
}

export function pointInRect(px: number, py: number, r: { x: number; y: number; w: number; h: number }): boolean {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function pointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
  const dx = px - cx, dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}
