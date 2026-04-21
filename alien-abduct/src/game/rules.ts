import type { MobKind, WeaponKind } from './types';

export const UFO_MAX_HP = 15;
export const SLOT_COUNT = 3;
export const WAVE_COUNT = 5;

export const MOB_STATS: Record<MobKind, {
  hp: number; dmg: number; cadence?: number; shots?: number;
  heal?: number; fuse?: number; aoeDmg?: number;
}> = {
  grunt:  { hp: 1, dmg: 1 },
  brute:  { hp: 4, dmg: 3, cadence: 2 },
  sniper: { hp: 2, dmg: 2 },
  gunner: { hp: 1, dmg: 1, shots: 3 },
  medic:  { hp: 2, dmg: 0, heal: 1 },
  bomber: { hp: 1, dmg: 0, fuse: 2, aoeDmg: 5 },
};

export const WEAPON_STATS: Record<WeaponKind, {
  dmg?: number; amount?: number; cooldown: number;
  kind: 'single' | 'lineAll' | 'nearest3' | 'heal' | 'aoeDelayed';
  delay?: number;
  radiusRad?: number;
}> = {
  pistol: { dmg: 1, cooldown: 0, kind: 'single' },
  cannon: { dmg: 4, cooldown: 2, kind: 'single' },
  pierce: { dmg: 2, cooldown: 2, kind: 'lineAll' },
  smg:    { dmg: 1, cooldown: 1, kind: 'nearest3' },
  heal:   { amount: 2, cooldown: 3, kind: 'heal' },
  bomb:   { dmg: 3, cooldown: 2, kind: 'aoeDelayed', delay: 1, radiusRad: Math.PI / 12 },
};

export const MOB_TO_WEAPON: Record<MobKind, WeaponKind> = {
  grunt: 'pistol',
  brute: 'cannon',
  sniper: 'pierce',
  gunner: 'smg',
  medic: 'heal',
  bomber: 'bomb',
};

// Mapping v1 (2 archétypes visuels) utilisé pour le rendu des mobs en jeu.
// Mécaniques : bazooka = gros mob costaud/lourd ; plasma = mob rapide/magique.
export type MobV1WeaponKind = 'bazooka' | 'plasma-staff';
export const MOB_TO_V1_WEAPON: Record<MobKind, MobV1WeaponKind> = {
  grunt: 'plasma-staff',
  brute: 'bazooka',
  sniper: 'plasma-staff',
  gunner: 'bazooka',
  medic: 'plasma-staff',
  bomber: 'bazooka',
};

export const ARC = {
  // Planète entièrement visible, centrée sur la moitié droite de l'écran.
  centerXRel: 0.72,
  centerYRel: 0.55,
  radiusRel: 0.32,
  // Mobs répartis sur l'hémisphère gauche de la planète, face à l'UFO.
  spanRad: Math.PI * 0.75, // ~135°
};

// Centre angulaire des mobs (angle=0 = sommet / nord de la planète)
// -π/2 = ouest, côté gauche, face à l'UFO.
export const MOB_ANGLE_CENTER = -Math.PI / 2;

export const ANIM_DURATIONS = {
  waveIntro: 2000,
  abduct: 450,
  shoot: 250,
  hit: 180,
  heal: 300,
  explode: 500,
  bomberTick: 220,
  mobDie: 350,
  dmgPopup: 700,
  screenShake: 250,
  hitstop: 60,
  flash: 80,
  waveCleared: 1000,
  victory: 1500,
  defeat: 1500,
} as const;
