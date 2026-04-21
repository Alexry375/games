import type { Action, GameState } from '../game/types';
import { mobPosition, skipButtonRect, slotRect, pointInCircle, pointInRect, type Viewport } from '../render/layout';

export type InputResolution =
  | { kind: 'action'; action: Action }
  | { kind: 'selectSlot'; slotIndex: 0 | 1 | 2 }
  | { kind: 'deselect' }
  | { kind: 'none' };

const MOB_HIT_RADIUS = 40;

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

  for (const m of state.mobs) {
    const pos = mobPosition(vp, m.angle);
    if (pointInCircle(px, py, pos.x, pos.y, MOB_HIT_RADIUS)) {
      if (state.selectedSlot !== null) {
        return { kind: 'action', action: { kind: 'fire', slotIndex: state.selectedSlot, targetId: m.id } };
      }
      return { kind: 'action', action: { kind: 'abduct', mobId: m.id } };
    }
  }

  return { kind: 'deselect' };
}
