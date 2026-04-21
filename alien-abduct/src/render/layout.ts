import { ARC } from '../game/rules';
import { MOB_CONFIGS } from './mob-configs';
import type { MobKind } from '../game/types';

export type Viewport = { w: number; h: number };

// Doit matcher MOB_BASE_SCALE dans renderer.ts (le mob goomba v1 est intrinsèquement
// petit dans son repère local, on le scale up pour la lisibilité).
export const MOB_BASE_SCALE = 1.4;

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

// Cercle de détection de clic pour un mob, décalé outward de la surface de la planète
// pour recouvrir le corps visible du goomba (qui s'étend à ~50 unités locales au-dessus
// de son origine = pieds). Rayon scaled par kind (brute plus gros que grunt).
export function mobHitCircle(
  vp: Viewport, angle: number, kind: MobKind,
): { cx: number; cy: number; r: number } {
  const pos = mobPosition(vp, angle);
  const scale = MOB_CONFIGS[kind].size * MOB_BASE_SCALE;
  // Outward = vecteur de (arcCenter) vers pos, qui vaut (sin α, -cos α).
  const outX = Math.sin(angle);
  const outY = -Math.cos(angle);
  // Offset de 35 unités locales outward (= centre visuel du corps goomba).
  const offset = 35 * scale;
  return { cx: pos.x + outX * offset, cy: pos.y + outY * offset, r: 45 * scale };
}

export function ufoPosition(vp: Viewport): { x: number; y: number } {
  return { x: vp.w * 0.22, y: vp.h * 0.32 };
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
