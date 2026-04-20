import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, spawnWave } from './state';
import { applyPlayerAction } from './logic';
import { resetIds } from './ids';

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
