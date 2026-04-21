import type { MobKind } from '../game/types';
import type { CreatureConfig } from './creature';
import { MOB_TO_WEAPON } from '../game/rules';

export const MOB_CONFIGS: Record<MobKind, Omit<CreatureConfig, 'weapon'>> = {
  grunt:  { bodyColor: '#8de86a', accentColor: '#4c9a3a', size: 0.85, eyeCount: 2, antennas: 2, armCount: 2, hat: 'none' },
  brute:  { bodyColor: '#e24c80', accentColor: '#a02050', size: 1.35, eyeCount: 1, antennas: 0, armCount: 2, hat: 'none' },
  sniper: { bodyColor: '#7bd4ea', accentColor: '#3a8fa6', size: 1.0, eyeCount: 2, antennas: 1, armCount: 2, hat: 'none', stretchY: 1.3 },
  gunner: { bodyColor: '#a86bda', accentColor: '#5e3689', size: 0.9, eyeCount: 3, antennas: 2, armCount: 4, hat: 'none' },
  medic:  { bodyColor: '#7aa8e6', accentColor: '#3a5ea8', size: 0.95, eyeCount: 2, antennas: 2, armCount: 2, hat: 'cross' },
  bomber: { bodyColor: '#ff9a3c', accentColor: '#b85a10', size: 0.95, eyeCount: 1, antennas: 0, armCount: 2, hat: 'none' },
};

export function configFor(kind: MobKind): CreatureConfig {
  return { ...MOB_CONFIGS[kind], weapon: MOB_TO_WEAPON[kind] };
}
