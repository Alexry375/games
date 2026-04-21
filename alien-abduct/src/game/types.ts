export type MobKind = 'grunt' | 'brute' | 'sniper' | 'gunner' | 'medic' | 'bomber';
export type WeaponKind = 'pistol' | 'cannon' | 'pierce' | 'smg' | 'heal' | 'bomb';

export type Mob = {
  id: string;
  kind: MobKind;
  hp: number;
  hpMax: number;
  angle: number;           // position sur l'arc, radians
  cadenceTick: number;     // pour brute (tous les 2 tours)
  fuseLeft: number | null; // null si pas de bomber ou pas armé; 2→1→0 = explose
};

export type Weapon = {
  kind: WeaponKind;
  cooldown: number;           // tours restants avant réutilisable
  pendingExplosion: { atAngle: number; turnsLeft: number } | null; // bombe différée
};

export type UFO = {
  hp: number;
  hpMax: number;
};

export type Phase =
  | 'WaveIntro'
  | 'PlayerTurn'
  | 'Resolving'
  | 'EnemyTurn'
  | 'WaveCleared'
  | 'Victory'
  | 'Defeat';

export type Action =
  | { kind: 'abduct'; mobId: string }
  | { kind: 'fire'; slotIndex: 0 | 1 | 2; targetId: string }
  | { kind: 'skip' };

export type AnimStep = {
  id: string;
  kind:
    | 'abduct' | 'shoot' | 'hit' | 'heal' | 'explode'
    | 'bomber_tick' | 'mob_die' | 'dmg_popup'
    | 'screen_shake' | 'hitstop' | 'flash'
    | 'wave_intro' | 'victory' | 'defeat';
  duration: number;
  data: Record<string, unknown>;
  parallel?: boolean;
};

export type GameState = {
  phase: Phase;
  waveIndex: number;                  // 0..4
  ufo: UFO;
  slots: [Weapon | null, Weapon | null, Weapon | null];
  mobs: Mob[];
  selectedSlot: 0 | 1 | 2 | null;
  turnNumber: number;
};
