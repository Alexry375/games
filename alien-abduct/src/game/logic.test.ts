import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, spawnWave } from './state';
import { applyPlayerAction } from './logic';
import { resetIds } from './ids';
import { WEAPON_STATS } from './rules';
import type { GameState } from './types';

describe('applyPlayerAction — abduct', () => {
  beforeEach(() => resetIds());

  it('abduction ajoute l\'arme du mob dans le 1er slot libre et retire le mob', () => {
    const s0 = { ...spawnWave(createInitialState(), 0), phase: 'PlayerTurn' as const };
    const target = s0.mobs[0]!;
    const { state: s1, anims } = applyPlayerAction(s0, { kind: 'abduct', mobId: target.id });

    expect(s1.mobs.find(m => m.id === target.id)).toBeUndefined();
    expect(s1.slots[0]).toEqual({ kind: 'pistol', cooldown: 0, pendingExplosion: null });
    expect(s1.slots[1]).toBeNull();
    expect(anims.some(a => a.kind === 'abduct')).toBe(true);
  });

  it('abduction bloquée si 3 slots pleins (state inchangé, pas d\'anim)', () => {
    const base = spawnWave(createInitialState(), 4);
    const full = {
      ...base, phase: 'PlayerTurn' as const,
      slots: [
        { kind: 'pistol', cooldown: 0, pendingExplosion: null },
        { kind: 'cannon', cooldown: 0, pendingExplosion: null },
        { kind: 'pierce', cooldown: 0, pendingExplosion: null },
      ] as const,
    };
    const target = full.mobs[0]!;
    const { state, anims } = applyPlayerAction(full as any, { kind: 'abduct', mobId: target.id });
    expect(state).toBe(full);
    expect(anims).toEqual([]);
  });

  it('abduction d\'un bomber armé désarme sa bombe et donne une arme Bombe cooldown 0', () => {
    const base = spawnWave(createInitialState(), 4);
    const bomber = base.mobs.find(m => m.kind === 'bomber')!;
    const armed = {
      ...base, phase: 'PlayerTurn' as const,
      mobs: base.mobs.map(m => m.id === bomber.id ? { ...m, fuseLeft: 1 } : m),
    };
    const { state } = applyPlayerAction(armed, { kind: 'abduct', mobId: bomber.id });
    expect(state.mobs.find(m => m.id === bomber.id)).toBeUndefined();
    const firstWeapon = state.slots.find(w => w !== null);
    expect(firstWeapon).toEqual({ kind: 'bomb', cooldown: 0, pendingExplosion: null });
  });
});

void WEAPON_STATS; // keep import live

function playerTurn(state: GameState, slots: GameState['slots'], mobs = state.mobs): GameState {
  return { ...state, slots, mobs, phase: 'PlayerTurn' };
}

describe('applyPlayerAction — fire', () => {
  beforeEach(() => resetIds());

  it('pistol deals 1 dmg, cooldown stays 0', () => {
    const base = spawnWave(createInitialState(), 0);
    const s0 = playerTurn(base, [
      { kind: 'pistol', cooldown: 0, pendingExplosion: null },
      null, null,
    ]);
    const target = s0.mobs[0]!;
    const { state } = applyPlayerAction(s0, { kind: 'fire', slotIndex: 0, targetId: target.id });
    const hit = state.mobs.find(m => m.id === target.id);
    expect(hit).toBeUndefined();
    expect(state.slots[0]!.cooldown).toBe(0);
  });

  it('cannon deals 4 dmg and enters cooldown 2', () => {
    const base = spawnWave(createInitialState(), 1);
    const brute = base.mobs.find(m => m.kind === 'brute')!;
    const s0 = playerTurn(base, [{ kind: 'cannon', cooldown: 0, pendingExplosion: null }, null, null]);
    const { state } = applyPlayerAction(s0, { kind: 'fire', slotIndex: 0, targetId: brute.id });
    expect(state.mobs.find(m => m.id === brute.id)).toBeUndefined();
    expect(state.slots[0]!.cooldown).toBe(2);
  });

  it('firing a weapon on cooldown is a no-op', () => {
    const base = spawnWave(createInitialState(), 0);
    const s0 = playerTurn(base, [{ kind: 'cannon', cooldown: 2, pendingExplosion: null }, null, null]);
    const target = s0.mobs[0]!;
    const { state, anims } = applyPlayerAction(s0, { kind: 'fire', slotIndex: 0, targetId: target.id });
    expect(state).toBe(s0);
    expect(anims).toEqual([]);
  });

  it('pierce hits all alive mobs and sets cd 2', () => {
    const base = spawnWave(createInitialState(), 2);
    const s0 = playerTurn(base, [{ kind: 'pierce', cooldown: 0, pendingExplosion: null }, null, null]);
    const any = s0.mobs[0]!;
    const { state } = applyPlayerAction(s0, { kind: 'fire', slotIndex: 0, targetId: any.id });
    expect(state.mobs).toEqual([]);
    expect(state.slots[0]!.cooldown).toBe(2);
  });

  it('smg picks nearest 3 by angular distance to UFO (angle=0), left-tie-break', () => {
    const base = spawnWave(createInitialState(), 4);
    const s0 = playerTurn(base, [{ kind: 'smg', cooldown: 0, pendingExplosion: null }, null, null]);
    const any = s0.mobs[0]!;
    const { state } = applyPlayerAction(s0, { kind: 'fire', slotIndex: 0, targetId: any.id });
    const hit = base.mobs
      .slice()
      .sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle) || a.angle - b.angle)
      .slice(0, 3)
      .map(m => m.id);
    for (const id of hit) {
      const after = state.mobs.find(m => m.id === id);
      const before = base.mobs.find(m => m.id === id)!;
      if (before.hp === 1) expect(after).toBeUndefined();
      else expect(after!.hp).toBe(before.hp - 1);
    }
  });

  it('heal gains 2 HP, capped to max', () => {
    const base = spawnWave(createInitialState(), 0);
    const s0 = playerTurn(
      { ...base, ufo: { hp: 5, hpMax: 15 } },
      [{ kind: 'heal', cooldown: 0, pendingExplosion: null }, null, null],
    );
    const any = s0.mobs[0]!;
    const { state } = applyPlayerAction(s0, { kind: 'fire', slotIndex: 0, targetId: any.id });
    expect(state.ufo.hp).toBe(7);
    expect(state.slots[0]!.cooldown).toBe(3);
  });

  it('bomb arms pendingExplosion at target angle, fires next turn', () => {
    const base = spawnWave(createInitialState(), 0);
    const s0 = playerTurn(base, [{ kind: 'bomb', cooldown: 0, pendingExplosion: null }, null, null]);
    const target = s0.mobs[0]!;
    const { state } = applyPlayerAction(s0, { kind: 'fire', slotIndex: 0, targetId: target.id });
    expect(state.slots[0]!.pendingExplosion).toEqual({ atAngle: target.angle, turnsLeft: 1 });
    expect(state.slots[0]!.cooldown).toBe(2);
  });
});
