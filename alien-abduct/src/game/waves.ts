import type { MobKind } from './types';

export const WAVES: readonly (readonly MobKind[])[] = [
  ['grunt', 'grunt'],
  ['grunt', 'grunt', 'brute'],
  ['grunt', 'sniper', 'gunner'],
  ['brute', 'medic', 'grunt', 'grunt'],
  ['brute', 'sniper', 'bomber', 'medic'],
] as const;
