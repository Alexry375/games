import type { Action, AnimStep, GameState, Weapon } from './types';
import { ANIM_DURATIONS, MOB_TO_WEAPON } from './rules';
import { nextId } from './ids';

export type ActionResult = { state: GameState; anims: AnimStep[] };

function freeSlotIndex(slots: readonly (Weapon | null)[]): number {
  return slots.findIndex(s => s === null);
}

export function applyPlayerAction(state: GameState, action: Action): ActionResult {
  if (state.phase !== 'PlayerTurn') return { state, anims: [] };

  switch (action.kind) {
    case 'abduct': {
      const mob = state.mobs.find(m => m.id === action.mobId);
      if (!mob) return { state, anims: [] };
      const idx = freeSlotIndex(state.slots);
      if (idx === -1) return { state, anims: [] };
      const weapon: Weapon = {
        kind: MOB_TO_WEAPON[mob.kind],
        cooldown: 0,
        pendingExplosion: null,
      };
      const slots = state.slots.slice() as GameState['slots'];
      slots[idx as 0 | 1 | 2] = weapon;
      const mobs = state.mobs.filter(m => m.id !== mob.id);
      const anims: AnimStep[] = [{
        id: nextId('a'),
        kind: 'abduct',
        duration: ANIM_DURATIONS.abduct,
        data: { mobId: mob.id, slotIndex: idx, weaponKind: weapon.kind },
      }];
      return { state: { ...state, slots, mobs }, anims };
    }

    case 'fire':
      return { state, anims: [] };

    case 'skip':
      return { state, anims: [] };
  }
}
