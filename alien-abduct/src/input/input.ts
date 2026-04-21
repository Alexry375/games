import type { Action, GameState } from '../game/types';
import { mobHitCircle, skipButtonRect, slotRect, pointInCircle, pointInRect, type Viewport } from '../render/layout';

export type InputResolution =
  | { kind: 'action'; action: Action }
  | { kind: 'selectSlot'; slotIndex: 0 | 1 | 2 }
  | { kind: 'deselect' }
  | { kind: 'none' };

export function resolveClick(vp: Viewport, state: GameState, px: number, py: number): InputResolution {
  if (state.phase !== 'PlayerTurn') return { kind: 'none' };

  if (pointInRect(px, py, skipButtonRect(vp))) {
    return { kind: 'action', action: { kind: 'skip' } };
  }

  for (const i of [0, 1, 2] as const) {
    if (pointInRect(px, py, slotRect(vp, i))) {
      const w = state.slots[i];
      if (!w || w.cooldown > 0) return { kind: 'none' };
      if (state.selectedSlot === i) return { kind: 'deselect' };
      return { kind: 'selectSlot', slotIndex: i };
    }
  }

  // Parcours dans l'ordre "plus proche du clic d'abord" : si deux cercles se
  // chevauchent on choisit celui dont le centre est le plus près — matching le
  // mob visuellement le plus proche du pointeur.
  const hits: Array<{ m: typeof state.mobs[number]; d2: number }> = [];
  for (const m of state.mobs) {
    const h = mobHitCircle(vp, m.angle, m.kind);
    if (pointInCircle(px, py, h.cx, h.cy, h.r)) {
      const dx = px - h.cx, dy = py - h.cy;
      hits.push({ m, d2: dx * dx + dy * dy });
    }
  }
  if (hits.length > 0) {
    hits.sort((a, b) => a.d2 - b.d2);
    const target = hits[0].m;
    if (state.selectedSlot !== null) {
      return { kind: 'action', action: { kind: 'fire', slotIndex: state.selectedSlot, targetId: target.id } };
    }
    return { kind: 'action', action: { kind: 'abduct', mobId: target.id } };
  }

  return { kind: 'deselect' };
}
