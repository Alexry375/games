import type { GameState, Mob, MobKind } from './types';
import { nextId } from './ids';
import { MOB_STATS, UFO_MAX_HP, ARC, MOB_ANGLE_CENTER } from './rules';
import { WAVES } from './waves';

export function createInitialState(): GameState {
  return {
    phase: 'WaveIntro',
    waveIndex: 0,
    ufo: { hp: UFO_MAX_HP, hpMax: UFO_MAX_HP },
    slots: [null, null, null],
    mobs: [],
    selectedSlot: null,
    turnNumber: 0,
  };
}

function makeMob(kind: MobKind, angle: number): Mob {
  const s = MOB_STATS[kind];
  return {
    id: nextId('m'),
    kind,
    hp: s.hp,
    hpMax: s.hp,
    angle,
    cadenceTick: 0,
    fuseLeft: null,
  };
}

export function spawnWave(state: GameState, waveIndex: number): GameState {
  const kinds = WAVES[waveIndex] ?? [];
  const n = kinds.length;
  const mobs: Mob[] = kinds.map((k, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const angle = MOB_ANGLE_CENTER - ARC.spanRad / 2 + t * ARC.spanRad;
    return makeMob(k, angle);
  });
  return { ...state, waveIndex, mobs, turnNumber: 0, phase: 'WaveIntro' };
}
