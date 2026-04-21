import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, spawnWave } from './state';
import { resetIds } from './ids';
import { UFO_MAX_HP } from './rules';

describe('state', () => {
  beforeEach(() => resetIds());

  it('createInitialState returns clean WaveIntro at wave 0, UFO full HP, empty slots', () => {
    const s = createInitialState();
    expect(s.phase).toBe('WaveIntro');
    expect(s.waveIndex).toBe(0);
    expect(s.ufo.hp).toBe(UFO_MAX_HP);
    expect(s.slots).toEqual([null, null, null]);
    expect(s.mobs).toEqual([]);
    expect(s.selectedSlot).toBeNull();
  });

  it('spawnWave(0) places 2 grunts with stable IDs and spread angles', () => {
    const s = spawnWave(createInitialState(), 0);
    expect(s.mobs).toHaveLength(2);
    expect(s.mobs[0]!.kind).toBe('grunt');
    expect(s.mobs[0]!.id).not.toBe(s.mobs[1]!.id);
    expect(s.mobs[0]!.angle).toBeLessThan(s.mobs[1]!.angle);
  });

  it('spawnWave sets mob hp from MOB_STATS', () => {
    const s = spawnWave(createInitialState(), 4);
    const brute = s.mobs.find(m => m.kind === 'brute')!;
    expect(brute.hp).toBe(4);
    expect(brute.hpMax).toBe(4);
  });

  it('bomber spawned has fuseLeft=null until armed', () => {
    const s = spawnWave(createInitialState(), 4);
    const bomber = s.mobs.find(m => m.kind === 'bomber')!;
    expect(bomber.fuseLeft).toBeNull();
  });
});
