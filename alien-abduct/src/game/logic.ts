import type { Action, AnimStep, GameState, Mob, Weapon } from './types';
import { ANIM_DURATIONS, MOB_TO_WEAPON, WEAPON_STATS } from './rules';
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

    case 'fire': {
      const slot = state.slots[action.slotIndex];
      if (!slot || slot.cooldown > 0) return { state, anims: [] };

      const stats = WEAPON_STATS[slot.kind];
      const anims: AnimStep[] = [];
      let mobs = state.mobs;
      let ufo = state.ufo;

      const killOrHit = (m: Mob, dmg: number): Mob | null => {
        const hp = m.hp - dmg;
        anims.push({ id: nextId('a'), kind: 'hit', duration: ANIM_DURATIONS.hit, data: { mobId: m.id, dmg } });
        if (hp <= 0) {
          anims.push({ id: nextId('a'), kind: 'mob_die', duration: ANIM_DURATIONS.mobDie, data: { mobId: m.id } });
          return null;
        }
        return { ...m, hp };
      };

      if (stats.kind === 'single') {
        const target = mobs.find(m => m.id === action.targetId);
        if (!target) return { state, anims: [] };
        mobs = mobs.map(m => m.id === target.id ? killOrHit(m, stats.dmg!) : m).filter((m): m is Mob => m !== null);
        anims.unshift({ id: nextId('a'), kind: 'shoot', duration: ANIM_DURATIONS.shoot, data: { slot: action.slotIndex, targetId: target.id } });
      } else if (stats.kind === 'lineAll') {
        anims.push({ id: nextId('a'), kind: 'shoot', duration: ANIM_DURATIONS.shoot, data: { slot: action.slotIndex, mode: 'pierce' } });
        mobs = mobs.map(m => killOrHit(m, stats.dmg!)).filter((m): m is Mob => m !== null);
      } else if (stats.kind === 'nearest3') {
        const sorted = mobs.slice().sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle) || a.angle - b.angle);
        const targets = new Set(sorted.slice(0, 3).map(m => m.id));
        anims.push({ id: nextId('a'), kind: 'shoot', duration: ANIM_DURATIONS.shoot, data: { slot: action.slotIndex, mode: 'smg', targets: [...targets] } });
        mobs = mobs.map(m => targets.has(m.id) ? killOrHit(m, stats.dmg!) : m).filter((m): m is Mob => m !== null);
      } else if (stats.kind === 'heal') {
        const heal = Math.min(ufo.hpMax - ufo.hp, stats.amount!);
        ufo = { ...ufo, hp: ufo.hp + heal };
        anims.push({ id: nextId('a'), kind: 'heal', duration: ANIM_DURATIONS.heal, data: { slot: action.slotIndex, heal } });
      } else if (stats.kind === 'aoeDelayed') {
        const target = mobs.find(m => m.id === action.targetId);
        if (!target) return { state, anims: [] };
        anims.push({ id: nextId('a'), kind: 'shoot', duration: ANIM_DURATIONS.shoot, data: { slot: action.slotIndex, mode: 'bomb', targetId: target.id } });
      }

      const slots = state.slots.slice() as GameState['slots'];
      const newSlot: Weapon = {
        ...slot,
        cooldown: stats.cooldown,
        pendingExplosion: stats.kind === 'aoeDelayed'
          ? { atAngle: (mobs.find(m => m.id === action.targetId)?.angle) ?? state.mobs.find(m => m.id === action.targetId)!.angle, turnsLeft: stats.delay! }
          : slot.pendingExplosion,
      };
      slots[action.slotIndex] = newSlot;

      return { state: { ...state, ufo, mobs, slots, selectedSlot: null }, anims };
    }

    case 'skip':
      return { state, anims: [] };
  }
}
