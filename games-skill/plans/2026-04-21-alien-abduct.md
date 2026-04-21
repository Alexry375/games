# Alien Abduct Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire en ~1 session un proto web 2D turn-based polished (Alien Abduct) conforme au spec `games-skill/specs/2026-04-21-alien-abduct-design.md`.

**Architecture:** Vite + TS strict + Canvas 2D vanilla. Séparation stricte `game/` (logique pure + queue d'anims) / `render/` (lecture seule du state + tweens visuels) / `input/` (clics → actions). Rendu 100 % procédural paramétrique (1 `drawCreature` + 6 configs + 6 `drawWeapon`). HTMLAudioElement pour BGM, ZzFX pour SFX.

**Tech Stack:** Node 20+, Vite 6, TypeScript 5 strict, Vitest, ZzFX, `public/bgm.mp3` (Eric Skiff — "Chibi Ninja", CC-BY 4.0).

**Répertoire cible :** `/home/alexis/Global/Claude_Projects/games/alien-abduct/` (créé par la Task 1).

---

## File Structure

```
alien-abduct/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── public/
│   └── bgm.mp3
└── src/
    ├── main.ts                # boot, canvas, rAF loop, state machine wiring
    ├── game/
    │   ├── types.ts           # Mob, Weapon, UFO, Wave, Action, AnimStep, Phase, GameState
    │   ├── ids.ts             # nextId()
    │   ├── rules.ts           # constantes figées (HP, dmg, cooldowns, composition)
    │   ├── waves.ts           # 5 compositions scriptées
    │   ├── state.ts           # createInitialState, spawnWave (immutable)
    │   ├── logic.ts           # applyPlayerAction, resolveEnemyTurn purs
    │   └── anim.ts            # AnimQueue
    ├── render/
    │   ├── renderer.ts        # render(ctx, state, queue, t)
    │   ├── layout.ts          # arc angle→px, slot rect, resize-aware
    │   ├── scene.ts           # étoiles + planète
    │   ├── ufo.ts             # drawUFO
    │   ├── creature.ts        # drawCreature(ctx, t, config)
    │   ├── weapon.ts          # drawWeapon(ctx, t, kind) ×6
    │   ├── hud.ts             # HP, slots, wave counter, skip button
    │   └── feel.ts            # screen-shake, hitstop, dmg popups, flash
    ├── input/
    │   └── input.ts           # hit-test → Action
    ├── audio/
    │   ├── bgm.ts             # loop
    │   └── sfx.ts             # ZzFX
    └── util/
        └── math.ts            # clamp01, lerp, easeOutCubic, easeOutQuad, polarToCart
```

---

### Task 1: Scaffold projet Vite + TS strict

**Files:**
- Create: `alien-abduct/package.json`
- Create: `alien-abduct/tsconfig.json`
- Create: `alien-abduct/vite.config.ts`
- Create: `alien-abduct/vitest.config.ts`
- Create: `alien-abduct/index.html`
- Create: `alien-abduct/src/main.ts`

- [ ] **Step 1: Initialiser Vite (template vanilla-ts)**

```bash
cd /home/alexis/Global/Claude_Projects/games
npm create vite@latest alien-abduct -- --template vanilla-ts
cd alien-abduct
npm install
npm install --save-dev vitest @vitest/ui jsdom
npm install zzfx
```

- [ ] **Step 2: Activer TS strict**

Remplacer le contenu de `tsconfig.json` :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "skipLibCheck": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vitest/globals"],
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Config Vitest**

Créer `vitest.config.ts` :

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { globals: true, environment: 'jsdom' },
});
```

- [ ] **Step 4: index.html minimal**

Remplacer `index.html` :

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Alien Abduct</title>
    <style>
      html,body{margin:0;padding:0;background:#000;overflow:hidden;font-family:system-ui,sans-serif;color:#fff;}
      canvas{display:block;width:100vw;height:100vh;}
    </style>
  </head>
  <body>
    <canvas id="game"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: main.ts boot minimal (canvas + resize + rAF)**

Remplacer `src/main.ts` :

```ts
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function frame(t: number) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = '#fff';
  ctx.font = '20px system-ui';
  ctx.fillText(`alien-abduct boot t=${Math.floor(t)}`, 20, 40);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

Supprimer les fichiers générés inutiles : `src/counter.ts`, `src/typescript.svg`, `public/vite.svg`, `src/style.css`.

- [ ] **Step 6: Ajouter scripts de dev dans package.json**

S'assurer que `scripts` contient :

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 7: Lancer le dev server et vérifier**

Run: `npm run dev`
Expected: serveur sur http://localhost:5173, canvas noir avec texte "alien-abduct boot t=..." qui s'incrémente. Ctrl+C ensuite.

- [ ] **Step 8: Commit**

```bash
git add alien-abduct/
git commit -m "feat(alien-abduct): scaffold Vite TS strict + canvas boot"
```

---

### Task 2: Types fondamentaux

**Files:**
- Create: `alien-abduct/src/game/types.ts`
- Create: `alien-abduct/src/game/ids.ts`

- [ ] **Step 1: IDs stables**

Créer `src/game/ids.ts` :

```ts
let counter = 0;
export function nextId(prefix = 'e'): string {
  counter += 1;
  return `${prefix}_${counter}`;
}
export function resetIds(): void { counter = 0; }
```

- [ ] **Step 2: Types du jeu**

Créer `src/game/types.ts` :

```ts
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
  selectedSlot: 0 | 1 | 2 | null;     // pour la sélection de tir
  turnNumber: number;                 // incrémente à chaque EnemyTurn finie
};
```

- [ ] **Step 3: Commit**

```bash
git add alien-abduct/src/game/types.ts alien-abduct/src/game/ids.ts
git commit -m "feat(game): core types + stable IDs"
```

---

### Task 3: Constantes de règles (rules.ts)

**Files:**
- Create: `alien-abduct/src/game/rules.ts`

- [ ] **Step 1: Écrire les constantes**

Créer `src/game/rules.ts` :

```ts
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

export const ARC = {
  // centre de la planète en coord écran relative (multiplicateurs hauteur/largeur)
  centerXRel: 0.5,
  centerYRel: 2.5,      // centre sous l'écran → courbure douce
  radiusRel: 2.2,       // relatif à la hauteur écran
  spanRad: Math.PI / 4, // ~45° d'arc visible (étalé -spanRad/2..+spanRad/2)
};

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
```

- [ ] **Step 2: Commit**

```bash
git add alien-abduct/src/game/rules.ts
git commit -m "feat(game): rules constants (mob stats, weapon stats, arc, anim durations)"
```

---

### Task 4: Waves scriptées

**Files:**
- Create: `alien-abduct/src/game/waves.ts`
- Create: `alien-abduct/src/game/waves.test.ts`

- [ ] **Step 1: Test de la composition**

Créer `src/game/waves.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { WAVES } from './waves';

describe('waves', () => {
  it('has 5 waves', () => {
    expect(WAVES).toHaveLength(5);
  });

  it('W1 has 2 grunts', () => {
    expect(WAVES[0]).toEqual(['grunt', 'grunt']);
  });

  it('W5 has brute, sniper, bomber, medic', () => {
    expect(WAVES[4]).toEqual(['brute', 'sniper', 'bomber', 'medic']);
  });

  it('every wave has 2..4 mobs', () => {
    for (const w of WAVES) {
      expect(w.length).toBeGreaterThanOrEqual(2);
      expect(w.length).toBeLessThanOrEqual(4);
    }
  });
});
```

- [ ] **Step 2: Run test → fail**

Run: `cd alien-abduct && npm test -- waves`
Expected: FAIL "Cannot find module './waves'".

- [ ] **Step 3: Écrire waves.ts**

Créer `src/game/waves.ts` :

```ts
import type { MobKind } from './types';

export const WAVES: readonly (readonly MobKind[])[] = [
  ['grunt', 'grunt'],
  ['grunt', 'grunt', 'brute'],
  ['grunt', 'sniper', 'gunner'],
  ['brute', 'medic', 'grunt', 'grunt'],
  ['brute', 'sniper', 'bomber', 'medic'],
] as const;
```

- [ ] **Step 4: Run test → pass**

Run: `npm test -- waves`
Expected: 4 tests passent.

- [ ] **Step 5: Commit**

```bash
git add alien-abduct/src/game/waves.ts alien-abduct/src/game/waves.test.ts
git commit -m "test(game): wave composition tests + WAVES table"
```

---

### Task 5: Initial state + spawn wave

**Files:**
- Create: `alien-abduct/src/game/state.ts`
- Create: `alien-abduct/src/game/state.test.ts`

- [ ] **Step 1: Test initial state + spawnWave**

Créer `src/game/state.test.ts` :

```ts
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
    expect(s.mobs[0]!.angle).toBeLessThan(s.mobs[1]!.angle); // de gauche à droite
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
```

- [ ] **Step 2: Implémentation**

Créer `src/game/state.ts` :

```ts
import type { GameState, Mob, MobKind } from './types';
import { nextId } from './ids';
import { MOB_STATS, UFO_MAX_HP, ARC } from './rules';
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
    // étale de -spanRad/2 à +spanRad/2, centré
    const t = n === 1 ? 0.5 : i / (n - 1);
    const angle = -ARC.spanRad / 2 + t * ARC.spanRad;
    return makeMob(k, angle);
  });
  return { ...state, waveIndex, mobs, turnNumber: 0, phase: 'WaveIntro' };
}
```

- [ ] **Step 3: Run tests**

Run: `npm test -- state`
Expected: 4 tests passent.

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/game/state.ts alien-abduct/src/game/state.test.ts
git commit -m "test(game): initial state + spawnWave with spread angles"
```

---

### Task 6: Logique joueur — abduction

**Files:**
- Create: `alien-abduct/src/game/logic.ts`
- Create: `alien-abduct/src/game/logic.test.ts`

- [ ] **Step 1: Tests abduction**

Créer `src/game/logic.test.ts` :

```ts
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
    expect(state).toBe(full);       // même référence (aucun changement)
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
```

- [ ] **Step 2: Implémenter `applyPlayerAction` pour `abduct`**

Créer `src/game/logic.ts` :

```ts
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
      // Task 7
      return { state, anims: [] };

    case 'skip':
      // Task 9
      return { state, anims: [] };
  }
}
```

- [ ] **Step 3: Run tests → 3 pass**

Run: `npm test -- logic`
Expected: 3 tests passent.

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/game/logic.ts alien-abduct/src/game/logic.test.ts
git commit -m "test(game): abduction logic + bomber disarm case"
```

---

### Task 7: Logique tir — toutes armes

**Files:**
- Modify: `alien-abduct/src/game/logic.ts`
- Modify: `alien-abduct/src/game/logic.test.ts`

- [ ] **Step 1: Tests par arme**

Ajouter à `src/game/logic.test.ts` :

```ts
import { WEAPON_STATS } from './rules';

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
    expect(hit).toBeUndefined();              // grunt hp=1, killed
    expect(state.slots[0]!.cooldown).toBe(0); // pistol has no cd
  });

  it('cannon deals 4 dmg and enters cooldown 2', () => {
    const base = spawnWave(createInitialState(), 1);
    const brute = base.mobs.find(m => m.kind === 'brute')!;
    const s0 = playerTurn(base, [{ kind: 'cannon', cooldown: 0, pendingExplosion: null }, null, null]);
    const { state } = applyPlayerAction(s0, { kind: 'fire', slotIndex: 0, targetId: brute.id });
    expect(state.mobs.find(m => m.id === brute.id)).toBeUndefined(); // brute hp=4, killed
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
    const base = spawnWave(createInitialState(), 2); // grunt, sniper, gunner
    const s0 = playerTurn(base, [{ kind: 'pierce', cooldown: 0, pendingExplosion: null }, null, null]);
    const any = s0.mobs[0]!;
    const { state } = applyPlayerAction(s0, { kind: 'fire', slotIndex: 0, targetId: any.id });
    // pierce deals 2 dmg: grunt(1)→dies, sniper(2)→dies, gunner(1)→dies
    expect(state.mobs).toEqual([]);
    expect(state.slots[0]!.cooldown).toBe(2);
  });

  it('smg picks nearest 3 by angular distance to UFO (angle=0), left-tie-break', () => {
    const base = spawnWave(createInitialState(), 4); // 4 mobs
    const s0 = playerTurn(base, [{ kind: 'smg', cooldown: 0, pendingExplosion: null }, null, null]);
    const any = s0.mobs[0]!;
    const { state } = applyPlayerAction(s0, { kind: 'fire', slotIndex: 0, targetId: any.id });
    // Each of the 3 nearest to angle=0 takes 1 dmg. The 4th (furthest) is untouched.
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
```

- [ ] **Step 2: Implémenter fire dans logic.ts**

Remplacer le cas `fire` dans `src/game/logic.ts` :

```ts
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
    // pendingExplosion posée sur le slot
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
```

Ajouter l'import en tête de fichier :

```ts
import { ANIM_DURATIONS, MOB_TO_WEAPON, WEAPON_STATS } from './rules';
import type { Mob } from './types';
```

- [ ] **Step 3: Run tests → toutes passent**

Run: `npm test -- logic`
Expected: tests `fire` (7) + `abduct` (3) passent, 10 total.

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/game/logic.ts alien-abduct/src/game/logic.test.ts
git commit -m "test(game): fire logic for all 6 weapon kinds"
```

---

### Task 8: Logique ennemis — resolveEnemyTurn

**Files:**
- Modify: `alien-abduct/src/game/logic.ts`
- Modify: `alien-abduct/src/game/logic.test.ts`

- [ ] **Step 1: Tests ennemis**

Ajouter à `logic.test.ts` :

```ts
import { resolveEnemyTurn } from './logic';

describe('resolveEnemyTurn', () => {
  beforeEach(() => resetIds());

  it('grunt deals 1 dmg to UFO', () => {
    const base = spawnWave(createInitialState(), 0);
    const { state } = resolveEnemyTurn({ ...base, phase: 'EnemyTurn' });
    expect(state.ufo.hp).toBe(15 - 2); // 2 grunts × 1 dmg
  });

  it('brute deals 3 dmg every 2 turns (turn0=no, turn1=yes)', () => {
    const base = spawnWave(createInitialState(), 1); // 2 grunts + 1 brute
    // turn 0 (brute cadenceTick=0, fires)
    const r1 = resolveEnemyTurn({ ...base, phase: 'EnemyTurn' });
    expect(r1.state.ufo.hp).toBe(15 - 2 - 3);
    // turn 1 (brute cadenceTick=1, skips)
    const r2 = resolveEnemyTurn({ ...r1.state, phase: 'EnemyTurn' });
    expect(r2.state.ufo.hp).toBe(r1.state.ufo.hp - 2);
  });

  it('medic heals most-wounded ally, left tie-break', () => {
    const base = spawnWave(createInitialState(), 3); // brute, medic, 2 grunts
    const brute = base.mobs.find(m => m.kind === 'brute')!;
    const mobs = base.mobs.map(m => m.id === brute.id ? { ...m, hp: 1 } : m);
    const { state } = resolveEnemyTurn({ ...base, mobs, phase: 'EnemyTurn' });
    const brAfter = state.mobs.find(m => m.id === brute.id)!;
    expect(brAfter.hp).toBe(2);
  });

  it('medic cannot over-heal past hpMax', () => {
    const base = spawnWave(createInitialState(), 3);
    const { state } = resolveEnemyTurn({ ...base, phase: 'EnemyTurn' });
    for (const m of state.mobs) expect(m.hp).toBeLessThanOrEqual(m.hpMax);
  });

  it('bomber ticks fuse null→2, 2→1, 1→0 explode, dies', () => {
    const base = spawnWave(createInitialState(), 4);
    const bomber = base.mobs.find(m => m.kind === 'bomber')!;
    // turn 1 : fuse passe à 2
    const t1 = resolveEnemyTurn({ ...base, phase: 'EnemyTurn' });
    expect(t1.state.mobs.find(m => m.id === bomber.id)!.fuseLeft).toBe(2);
    // turn 2 : fuse passe à 1
    const t2 = resolveEnemyTurn({ ...t1.state, phase: 'EnemyTurn' });
    expect(t2.state.mobs.find(m => m.id === bomber.id)!.fuseLeft).toBe(1);
    // turn 3 : explode, bomber mort, UFO -5
    const t3 = resolveEnemyTurn({ ...t2.state, phase: 'EnemyTurn' });
    expect(t3.state.mobs.find(m => m.id === bomber.id)).toBeUndefined();
  });

  it('cooldowns decrement at end of enemy turn', () => {
    const base = spawnWave(createInitialState(), 0);
    const s0 = {
      ...base, phase: 'EnemyTurn' as const,
      slots: [{ kind: 'cannon' as const, cooldown: 2, pendingExplosion: null }, null, null] as GameState['slots'],
    };
    const { state } = resolveEnemyTurn(s0);
    expect(state.slots[0]!.cooldown).toBe(1);
  });

  it('pending bomb player explodes at end of turn, dmg mobs in 15° radius', () => {
    const base = spawnWave(createInitialState(), 2); // grunt, sniper, gunner at -22°, 0°, +22°
    const target = base.mobs[1]!; // sniper at 0°
    const s0: GameState = {
      ...base, phase: 'EnemyTurn',
      slots: [{ kind: 'bomb', cooldown: 2, pendingExplosion: { atAngle: target.angle, turnsLeft: 1 } }, null, null],
    };
    const { state } = resolveEnemyTurn(s0);
    // La bombe (delay 1) tourne de 1→0 ce tour, explose. Radius = 15° = 0.26 rad
    // Seul le sniper à angle 0 est dans le rayon, les autres à ±22° sont hors rayon
    expect(state.slots[0]!.pendingExplosion).toBeNull();
    // sniper hp=2, bomb dmg=3 → tué
    expect(state.mobs.find(m => m.id === target.id)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Implémenter resolveEnemyTurn**

Ajouter à `src/game/logic.ts` :

```ts
import { MOB_STATS } from './rules';

export function resolveEnemyTurn(state: GameState): ActionResult {
  if (state.phase !== 'EnemyTurn') return { state, anims: [] };

  const anims: AnimStep[] = [];
  let ufo = state.ufo;
  let mobs = state.mobs.map(m => ({ ...m })); // clone shallow

  // 1) Sort mobs by angle (left to right) for deterministic order
  mobs.sort((a, b) => a.angle - b.angle);

  for (const m of mobs) {
    if (ufo.hp <= 0) break;
    const stats = MOB_STATS[m.kind];
    if (m.kind === 'brute') {
      if (m.cadenceTick === 0) {
        ufo = { ...ufo, hp: Math.max(0, ufo.hp - stats.dmg) };
        anims.push({ id: nextId('a'), kind: 'hit', duration: ANIM_DURATIONS.hit, data: { targetUfo: true, dmg: stats.dmg, fromId: m.id } });
      }
      m.cadenceTick = (m.cadenceTick + 1) % (stats.cadence ?? 1);
    } else if (m.kind === 'gunner') {
      for (let i = 0; i < (stats.shots ?? 1); i++) {
        if (ufo.hp <= 0) break;
        ufo = { ...ufo, hp: Math.max(0, ufo.hp - stats.dmg) };
        anims.push({ id: nextId('a'), kind: 'hit', duration: ANIM_DURATIONS.hit, data: { targetUfo: true, dmg: stats.dmg, fromId: m.id } });
      }
    } else if (m.kind === 'medic') {
      const wounded = mobs
        .filter(x => x.hp < x.hpMax && x.id !== m.id)
        .sort((a, b) => a.hp - b.hp || a.angle - b.angle);
      const target = wounded[0];
      if (target) {
        target.hp = Math.min(target.hpMax, target.hp + (stats.heal ?? 0));
        anims.push({ id: nextId('a'), kind: 'heal', duration: ANIM_DURATIONS.heal, data: { targetId: target.id, fromId: m.id } });
      }
    } else if (m.kind === 'bomber') {
      // fuse progression : null → 2 → 1 → explode
      if (m.fuseLeft === null) m.fuseLeft = 2;
      else m.fuseLeft -= 1;
      anims.push({ id: nextId('a'), kind: 'bomber_tick', duration: ANIM_DURATIONS.bomberTick, data: { mobId: m.id, fuse: m.fuseLeft } });
      if (m.fuseLeft <= 0) {
        ufo = { ...ufo, hp: Math.max(0, ufo.hp - (stats.aoeDmg ?? 0)) };
        anims.push({ id: nextId('a'), kind: 'explode', duration: ANIM_DURATIONS.explode, data: { mobId: m.id, dmg: stats.aoeDmg } });
        m.hp = 0;
      }
    } else {
      // grunt, sniper
      ufo = { ...ufo, hp: Math.max(0, ufo.hp - stats.dmg) };
      anims.push({ id: nextId('a'), kind: 'hit', duration: ANIM_DURATIONS.hit, data: { targetUfo: true, dmg: stats.dmg, fromId: m.id } });
    }
  }

  mobs = mobs.filter(m => m.hp > 0);

  // 2) Pending player bombs (slots)
  const slots = state.slots.slice() as GameState['slots'];
  for (let i = 0; i < 3; i++) {
    const w = slots[i];
    if (!w || !w.pendingExplosion) continue;
    const pe = { ...w.pendingExplosion, turnsLeft: w.pendingExplosion.turnsLeft - 1 };
    if (pe.turnsLeft <= 0) {
      // explose
      const radius = WEAPON_STATS.bomb.radiusRad!;
      const victims = mobs.filter(m => Math.abs(m.angle - pe.atAngle) <= radius);
      anims.push({ id: nextId('a'), kind: 'explode', duration: ANIM_DURATIONS.explode, data: { atAngle: pe.atAngle, victims: victims.map(v => v.id), dmg: WEAPON_STATS.bomb.dmg } });
      for (const v of victims) {
        v.hp -= WEAPON_STATS.bomb.dmg!;
      }
      mobs = mobs.filter(m => m.hp > 0);
      slots[i] = { ...w, pendingExplosion: null };
    } else {
      slots[i] = { ...w, pendingExplosion: pe };
    }
  }

  // 3) Cooldowns decrement
  for (let i = 0; i < 3; i++) {
    const w = slots[i];
    if (w && w.cooldown > 0) slots[i] = { ...w, cooldown: w.cooldown - 1 };
  }

  return { state: { ...state, ufo, mobs, slots, turnNumber: state.turnNumber + 1 }, anims };
}
```

- [ ] **Step 3: Run tests**

Run: `npm test -- logic`
Expected: tous passent (10 précédents + 7 nouveaux = 17).

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/game/logic.ts alien-abduct/src/game/logic.test.ts
git commit -m "test(game): enemy turn resolution (grunt, brute, gunner, medic, bomber, pending bomb)"
```

---

### Task 9: Skip turn + edge case bomber joueur post-mortem

**Files:**
- Modify: `alien-abduct/src/game/logic.ts`
- Modify: `alien-abduct/src/game/logic.test.ts`

- [ ] **Step 1: Tests**

Ajouter à `logic.test.ts` :

```ts
describe('applyPlayerAction — skip', () => {
  beforeEach(() => resetIds());
  it('skip returns empty anims, unchanged mobs', () => {
    const base = spawnWave(createInitialState(), 0);
    const s0: GameState = { ...base, phase: 'PlayerTurn' };
    const { state, anims } = applyPlayerAction(s0, { kind: 'skip' });
    expect(state.mobs).toEqual(s0.mobs);
    expect(anims).toEqual([]);  // skip ne produit pas d'anim, juste passe au tour suivant
  });
});

describe('defeat edge cases', () => {
  beforeEach(() => resetIds());

  it('UFO at 0 HP mid-enemy-turn stops remaining fires', () => {
    const base = spawnWave(createInitialState(), 2); // 3 mobs
    const s0: GameState = { ...base, phase: 'EnemyTurn', ufo: { hp: 1, hpMax: 15 } };
    const { state } = resolveEnemyTurn(s0);
    expect(state.ufo.hp).toBe(0);
    // Les mobs n'ont pas tous tiré (break sur ufo.hp <= 0)
  });
});
```

- [ ] **Step 2: Implémenter skip**

Dans `src/game/logic.ts`, remplacer le cas skip :

```ts
case 'skip':
  return { state, anims: [] };
```

(Le main orchestrator fera la transition PlayerTurn → EnemyTurn ; `skip` est un no-op pur côté logique.)

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: 19 tests passent.

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/game/logic.ts alien-abduct/src/game/logic.test.ts
git commit -m "test(game): skip action + defeat mid-enemy-turn"
```

---

### Task 10: Anim queue

**Files:**
- Create: `alien-abduct/src/game/anim.ts`
- Create: `alien-abduct/src/game/anim.test.ts`

- [ ] **Step 1: Tests**

Créer `src/game/anim.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { AnimQueue } from './anim';
import type { AnimStep } from './types';

const step = (id: string, duration = 200, parallel = false): AnimStep =>
  ({ id, kind: 'hit', duration, data: {}, parallel });

describe('AnimQueue', () => {
  it('empty by default', () => {
    const q = new AnimQueue();
    expect(q.isEmpty).toBe(true);
  });

  it('enqueue + tick(0) activates first step', () => {
    const q = new AnimQueue();
    q.enqueue([step('a'), step('b')]);
    q.tick(0);
    expect(q.current?.id).toBe('a');
  });

  it('tick beyond duration pops to next', () => {
    const q = new AnimQueue();
    q.enqueue([step('a', 100), step('b', 100)]);
    q.tick(50);
    expect(q.current?.id).toBe('a');
    q.tick(60);
    expect(q.current?.id).toBe('b');
  });

  it('isEmpty true after last step done', () => {
    const q = new AnimQueue();
    q.enqueue([step('a', 50)]);
    q.tick(100);
    expect(q.isEmpty).toBe(true);
  });

  it('returns progress 0..1', () => {
    const q = new AnimQueue();
    q.enqueue([step('a', 100)]);
    q.tick(30);
    expect(q.progress).toBeCloseTo(0.3, 2);
  });
});
```

- [ ] **Step 2: Implémenter**

Créer `src/game/anim.ts` :

```ts
import type { AnimStep } from './types';

export class AnimQueue {
  private steps: AnimStep[] = [];
  private elapsedInCurrent = 0;

  enqueue(steps: AnimStep[]): void {
    this.steps.push(...steps);
  }

  clear(): void {
    this.steps = [];
    this.elapsedInCurrent = 0;
  }

  get current(): AnimStep | undefined {
    return this.steps[0];
  }

  get isEmpty(): boolean {
    return this.steps.length === 0;
  }

  get progress(): number {
    const c = this.current;
    if (!c) return 0;
    return Math.min(1, this.elapsedInCurrent / c.duration);
  }

  tick(dtMs: number): void {
    this.elapsedInCurrent += dtMs;
    while (this.steps.length > 0 && this.elapsedInCurrent >= this.steps[0]!.duration) {
      this.elapsedInCurrent -= this.steps[0]!.duration;
      this.steps.shift();
    }
  }
}
```

- [ ] **Step 3: Run**

Run: `npm test -- anim`
Expected: 5 passent.

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/game/anim.ts alien-abduct/src/game/anim.test.ts
git commit -m "test(game): AnimQueue (enqueue, tick, current, progress)"
```

---

### Task 11: Math utils

**Files:**
- Create: `alien-abduct/src/util/math.ts`
- Create: `alien-abduct/src/util/math.test.ts`

- [ ] **Step 1: Tests**

Créer `src/util/math.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { clamp01, lerp, easeOutCubic, easeOutQuad, polarToCart } from './math';

describe('math', () => {
  it('clamp01', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(2)).toBe(1);
  });
  it('lerp', () => {
    expect(lerp(0, 10, 0.3)).toBeCloseTo(3);
  });
  it('easeOutCubic(0)=0, (1)=1, (0.5)≈0.875', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 3);
  });
  it('easeOutQuad(0.5)=0.75', () => {
    expect(easeOutQuad(0.5)).toBe(0.75);
  });
  it('polarToCart around center', () => {
    const p = polarToCart(100, 200, 10, 0);
    expect(p.x).toBeCloseTo(110);
    expect(p.y).toBeCloseTo(200);
  });
});
```

- [ ] **Step 2: Implémenter**

Créer `src/util/math.ts` :

```ts
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t);
export function polarToCart(cx: number, cy: number, r: number, angle: number): { x: number; y: number } {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}
```

- [ ] **Step 3: Run + commit**

```bash
npm test -- math
git add alien-abduct/src/util/
git commit -m "test(util): math helpers"
```

---

### Task 12: Layout arc (screen-world math)

**Files:**
- Create: `alien-abduct/src/render/layout.ts`

- [ ] **Step 1: Implémenter**

Créer `src/render/layout.ts` :

```ts
import { ARC } from '../game/rules';

export type Viewport = { w: number; h: number };

export function arcCenter(vp: Viewport): { cx: number; cy: number; r: number } {
  return {
    cx: vp.w * ARC.centerXRel,
    cy: vp.h * ARC.centerYRel,
    r: vp.h * ARC.radiusRel,
  };
}

/** Position d'un mob au sol, en coord écran. angle=0 = sommet de l'arc (nord). */
export function mobPosition(vp: Viewport, angle: number): { x: number; y: number; rot: number } {
  const { cx, cy, r } = arcCenter(vp);
  // angle = 0 → haut de l'arc → (cx, cy - r). On utilise sin pour x, -cos pour y.
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  return { x, y, rot: angle };
}

export function ufoPosition(vp: Viewport): { x: number; y: number } {
  return { x: vp.w * 0.5, y: vp.h * 0.28 };
}

export function slotRect(vp: Viewport, index: 0 | 1 | 2): { x: number; y: number; w: number; h: number } {
  const size = Math.min(80, vp.w * 0.08);
  const gap = size * 0.25;
  const totalW = size * 3 + gap * 2;
  const startX = vp.w * 0.5 - totalW / 2;
  return { x: startX + index * (size + gap), y: vp.h - size - 20, w: size, h: size };
}

export function hpBarRect(vp: Viewport): { x: number; y: number; w: number; h: number } {
  return { x: 20, y: vp.h - 40, w: 200, h: 20 };
}

export function skipButtonRect(vp: Viewport): { x: number; y: number; w: number; h: number } {
  return { x: vp.w - 120, y: vp.h - 50, w: 100, h: 30 };
}

export function pointInRect(px: number, py: number, r: { x: number; y: number; w: number; h: number }): boolean {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function pointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
  const dx = px - cx, dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}
```

- [ ] **Step 2: Commit**

```bash
git add alien-abduct/src/render/layout.ts
git commit -m "feat(render): layout helpers (arc, ufo, slots, hitboxes)"
```

---

### Task 13: Scene (étoiles + planète)

**Files:**
- Create: `alien-abduct/src/render/scene.ts`

- [ ] **Step 1: Implémenter**

Créer `src/render/scene.ts` :

```ts
import { arcCenter, type Viewport } from './layout';

type Star = { x: number; y: number; r: number; phase: number };

let stars: Star[] | null = null;

function ensureStars(vp: Viewport) {
  if (stars && stars.length > 0) return;
  stars = [];
  const n = Math.min(200, Math.floor((vp.w * vp.h) / 8000));
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random() * vp.w,
      y: Math.random() * vp.h * 0.75,
      r: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

export function drawScene(ctx: CanvasRenderingContext2D, vp: Viewport, t: number): void {
  // background
  ctx.fillStyle = '#060616';
  ctx.fillRect(0, 0, vp.w, vp.h);

  // étoiles
  ensureStars(vp);
  for (const s of stars!) {
    const tw = 0.5 + 0.5 * Math.sin(t * 0.002 + s.phase);
    ctx.globalAlpha = 0.4 + 0.6 * tw;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // planète (arc rempli + contour)
  const { cx, cy, r } = arcCenter(vp);
  ctx.save();
  ctx.fillStyle = '#3d5a4b';
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 1.5 - Math.PI / 4, Math.PI * 1.5 + Math.PI / 4, false);
  ctx.lineTo(cx + r, vp.h + 50);
  ctx.lineTo(cx - r, vp.h + 50);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 1.5 - Math.PI / 4, Math.PI * 1.5 + Math.PI / 4, false);
  ctx.stroke();
  ctx.restore();
}
```

- [ ] **Step 2: Brancher dans main**

Remplacer le corps de `frame()` dans `src/main.ts` :

```ts
import { drawScene } from './render/scene';

const vp = () => ({ w: window.innerWidth, h: window.innerHeight });

function frame(t: number) {
  drawScene(ctx, vp(), t);
  requestAnimationFrame(frame);
}
```

- [ ] **Step 3: Visual check**

Run: `npm run dev`
Expected: ciel sombre + étoiles qui twinklent + planète verte courbe en bas.

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/render/scene.ts alien-abduct/src/main.ts
git commit -m "feat(render): stars twinkle + curved planet"
```

---

### Task 14: UFO procédural

**Files:**
- Create: `alien-abduct/src/render/ufo.ts`

- [ ] **Step 1: Implémenter drawUFO**

Créer `src/render/ufo.ts` :

```ts
import { ufoPosition, type Viewport } from './layout';

export function drawUFO(ctx: CanvasRenderingContext2D, vp: Viewport, t: number, hpFrac: number): void {
  const { x, y } = ufoPosition(vp);
  const bob = Math.sin(t * 0.002) * 6;
  const shake = (1 - hpFrac) * (Math.sin(t * 0.04) * 4);

  ctx.save();
  ctx.translate(x + shake, y + bob);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000';

  // anneau de lumière propulseurs
  const glow = 0.5 + 0.5 * Math.sin(t * 0.008);
  ctx.save();
  ctx.globalAlpha = 0.2 + 0.15 * glow;
  ctx.fillStyle = '#9be8ff';
  ctx.beginPath();
  ctx.ellipse(0, 22, 75, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // corps soucoupe (ellipse aplatie)
  ctx.fillStyle = '#9aa5b4';
  ctx.beginPath();
  ctx.ellipse(0, 18, 80, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // dôme verre
  ctx.fillStyle = 'rgba(180,230,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 32, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // tête alien dans dôme
  ctx.save();
  ctx.translate(0, -6);
  ctx.fillStyle = '#a4dc6a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // yeux
  const blink = Math.max(0, Math.sin(t * 0.003 + 1.2));
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(-8, -4, 4, 5 * blink + 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8, -4, 4, 5 * blink + 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // reflet
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-9, -6, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(7, -6, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // antennes UFO (3 bumps lumineux)
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(i * 25, 26, 4 + (glow * 1.5), 0, Math.PI * 2);
    ctx.fillStyle = '#ffe86a';
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
```

- [ ] **Step 2: Brancher**

Dans `src/main.ts` ajouter après `drawScene` :

```ts
import { drawUFO } from './render/ufo';
// ...
drawScene(ctx, vp(), t);
drawUFO(ctx, vp(), t, 1);
```

- [ ] **Step 3: Visual**

Run: `npm run dev`
Expected: UFO avec alien dedans, bob idle, bumps lumineux qui pulsent.

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/render/ufo.ts alien-abduct/src/main.ts
git commit -m "feat(render): drawUFO procédural avec pilote alien"
```

---

### Task 15: Créature canonique paramétrique (polish intense)

**Files:**
- Create: `alien-abduct/src/render/creature.ts`

- [ ] **Step 1: Types de config**

En tête de `src/render/creature.ts` :

```ts
import type { WeaponKind } from '../game/types';

export type CreatureConfig = {
  bodyColor: string;
  accentColor: string;
  size: number;
  eyeCount: 1 | 2 | 3;
  antennas: 0 | 1 | 2;
  armCount: 2 | 4;
  hat: 'none' | 'cross' | 'cap';
  stretchY?: number; // pour sniper
  weapon: WeaponKind;
};
```

- [ ] **Step 2: Implémenter drawCreature + sous-primitives**

Ajouter dans `src/render/creature.ts` (300+ lignes — inspire-toi fidèlement de `/tmp/coup-ahoo-peek/src/dude.ts` pour la structure) :

```ts
import { drawWeapon } from './weapon';

export function drawCreature(
  ctx: CanvasRenderingContext2D,
  t: number,
  config: CreatureConfig,
  hpFrac: number,
): void {
  const wave = Math.sin(t * 0.004);
  const bob = Math.sin(t * 0.006);
  const blink = Math.max(0, Math.sin(t * 0.002 + config.bodyColor.length));
  const s = config.size;
  const sy = config.stretchY ?? 1;

  ctx.save();
  ctx.scale(s, s * sy);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#000';

  // jambes
  drawLeg(ctx, -1, t);
  drawLeg(ctx, +1, t);

  // corps (ellipse verticale)
  ctx.translate(0, bob * 3 - 20);
  ctx.fillStyle = config.bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 36, wave * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // bras (2 ou 4)
  if (config.armCount === 4) {
    drawArm(ctx, -1, -8, t, 0);
    drawArm(ctx, +1, -8, t, 0);
    drawArm(ctx, -1, 8, t, 0.8);
    drawArm(ctx, +1, 8, t, 0.8);
  } else {
    drawArm(ctx, -1, 0, t, 0);
    drawArm(ctx, +1, 0, t, 0);
  }

  // tête
  ctx.save();
  ctx.translate(0, -44 + wave * 1.5);
  ctx.fillStyle = config.bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // yeux
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  const eyeSpacing = config.eyeCount === 1 ? 0 : 9;
  const eyes = config.eyeCount === 3 ? [-12, 0, 12] : config.eyeCount === 2 ? [-eyeSpacing, eyeSpacing] : [0];
  for (const ex of eyes) {
    const ey = 5 * blink + 2;
    ctx.beginPath();
    ctx.ellipse(ex, -2, 5, ey, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(ex, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
  }

  // antennes
  for (let i = 0; i < config.antennas; i++) {
    const dir = config.antennas === 1 ? 0 : i === 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(dir * 8, -16);
    ctx.quadraticCurveTo(dir * (12 + wave * 3), -28, dir * (8 + wave * 2), -38);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = config.accentColor;
    ctx.beginPath();
    ctx.arc(dir * (8 + wave * 2), -38, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 7;
  }

  // chapeau
  if (config.hat === 'cross') {
    ctx.save();
    ctx.translate(0, -22);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.rect(-12, -10, 24, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e53';
    ctx.fillRect(-8, -2, 16, 4);
    ctx.fillRect(-2, -8, 4, 16);
    ctx.restore();
  } else if (config.hat === 'cap') {
    ctx.save();
    ctx.translate(0, -20);
    ctx.fillStyle = config.accentColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 8, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore(); // head

  // arme dans la main droite (+22 x)
  ctx.save();
  ctx.translate(22, -5 + wave * 2);
  ctx.rotate(wave * 0.08);
  drawWeapon(ctx, t, config.weapon);
  ctx.restore();

  ctx.restore();

  // HP bar si touché
  if (hpFrac < 1) {
    ctx.save();
    ctx.translate(0, -80);
    ctx.fillStyle = '#000a';
    ctx.fillRect(-18, 0, 36, 4);
    ctx.fillStyle = '#e53';
    ctx.fillRect(-18, 0, 36 * hpFrac, 4);
    ctx.restore();
  }
}

function drawLeg(ctx: CanvasRenderingContext2D, dir: number, t: number): void {
  const swing = Math.sin(t * 0.01 + dir * Math.PI / 2) * 3;
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(dir * 12 + swing, 12, dir * 14 + swing, 24);
  ctx.stroke();
  ctx.restore();
}

function drawArm(ctx: CanvasRenderingContext2D, dir: number, yoff: number, t: number, phase: number): void {
  const swing = Math.sin(t * 0.008 + phase + dir) * 4;
  ctx.save();
  ctx.translate(dir * 18, yoff - 10);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(dir * 10 + swing, 8, dir * 14 + swing, 14);
  ctx.stroke();
  ctx.restore();
}
```

- [ ] **Step 3: Brancher un grunt de test**

Dans `src/main.ts` :

```ts
import { drawCreature } from './render/creature';
import { mobPosition } from './render/layout';

// dans frame(), après drawUFO :
const m = mobPosition(vp(), 0);
ctx.save();
ctx.translate(m.x, m.y);
ctx.rotate(m.rot);
drawCreature(ctx, t, {
  bodyColor: '#8de86a', accentColor: '#4c9a3a',
  size: 0.9, eyeCount: 2, antennas: 2, armCount: 2, hat: 'none', weapon: 'pistol',
}, 1);
ctx.restore();
```

- [ ] **Step 4: Visual**

Run: `npm run dev`
Expected: un grunt vert au sommet de la planète, qui bouge, yeux qui clignent, bras qui balancent, antennes qui flottent.

- [ ] **Step 5: Commit**

```bash
git add alien-abduct/src/render/creature.ts alien-abduct/src/main.ts
git commit -m "feat(render): drawCreature paramétrique, polish sur grunt"
```

---

### Task 16: 6 drawWeapon

**Files:**
- Create: `alien-abduct/src/render/weapon.ts`

- [ ] **Step 1: Implémenter**

Créer `src/render/weapon.ts` :

```ts
import type { WeaponKind } from '../game/types';

export function drawWeapon(ctx: CanvasRenderingContext2D, t: number, kind: WeaponKind): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000';

  switch (kind) {
    case 'pistol': {
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.rect(0, -3, 14, 6);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(2, 2, 5, 7);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'cannon': {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.rect(-2, -6, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(22, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'pierce': {
      // long fusil
      ctx.fillStyle = '#6b4226';
      ctx.beginPath();
      ctx.rect(0, -2, 32, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#444';
      ctx.fillRect(4, -1, 6, 6);
      ctx.strokeRect(4, -1, 6, 6);
      break;
    }
    case 'smg': {
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.rect(0, -4, 16, 8);
      ctx.fill();
      ctx.stroke();
      // petites bouches
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(16 + i * 2, -2 + i * 2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
      }
      break;
    }
    case 'heal': {
      // tube médical verre + cross
      ctx.fillStyle = 'rgba(120,220,255,0.6)';
      ctx.beginPath();
      ctx.rect(0, -10, 10, 20);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillRect(2, -2, 6, 4);
      ctx.fillRect(4, -4, 2, 8);
      break;
    }
    case 'bomb': {
      // bombe sphérique + mèche clignotante
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(8, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const spark = 0.5 + 0.5 * Math.sin(t * 0.02);
      ctx.fillStyle = `rgb(${255},${Math.floor(180 * spark)},0)`;
      ctx.beginPath();
      ctx.arc(8, -13, 3 + spark * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}
```

- [ ] **Step 2: Commit**

```bash
git add alien-abduct/src/render/weapon.ts
git commit -m "feat(render): 6 drawWeapon mini-fns"
```

---

### Task 17: Variantes de mobs (configs mapping)

**Files:**
- Create: `alien-abduct/src/render/mob-configs.ts`

- [ ] **Step 1: Implémenter**

Créer `src/render/mob-configs.ts` :

```ts
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
```

- [ ] **Step 2: Sandbox visuelle — aligner les 6 sur l'arc**

Dans `src/main.ts` remplacer le grunt hardcodé par un cycle de 6 :

```ts
import { configFor } from './render/mob-configs';
import type { MobKind } from './game/types';

const kinds: MobKind[] = ['grunt', 'brute', 'sniper', 'gunner', 'medic', 'bomber'];
// dans frame :
for (let i = 0; i < kinds.length; i++) {
  const angle = (i / (kinds.length - 1) - 0.5) * (Math.PI / 4);
  const m = mobPosition(vp(), angle);
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.rot);
  drawCreature(ctx, t, configFor(kinds[i]!), 1);
  ctx.restore();
}
```

- [ ] **Step 3: Visual**

Run: `npm run dev`
Expected: 6 mobs alignés sur l'arc, chacun distinct visuellement (couleur, taille, bras, chapeau medic, 3 yeux gunner, élongation sniper).

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/render/mob-configs.ts alien-abduct/src/main.ts
git commit -m "feat(render): 6 mob config variants visibles sur l'arc"
```

---

### Task 18: HUD

**Files:**
- Create: `alien-abduct/src/render/hud.ts`

- [ ] **Step 1: Implémenter**

Créer `src/render/hud.ts` :

```ts
import type { GameState } from '../game/types';
import { hpBarRect, slotRect, skipButtonRect, type Viewport } from './layout';
import { drawWeapon } from './weapon';
import { UFO_MAX_HP } from '../game/rules';

export function drawHud(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  t: number,
  state: GameState,
): void {
  // HP bar
  const hp = hpBarRect(vp);
  ctx.fillStyle = '#000c';
  ctx.fillRect(hp.x - 2, hp.y - 2, hp.w + 4, hp.h + 4);
  ctx.fillStyle = '#2a1010';
  ctx.fillRect(hp.x, hp.y, hp.w, hp.h);
  ctx.fillStyle = '#e53';
  ctx.fillRect(hp.x, hp.y, hp.w * (state.ufo.hp / UFO_MAX_HP), hp.h);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(hp.x, hp.y, hp.w, hp.h);
  ctx.fillStyle = '#fff';
  ctx.font = '14px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`HP ${state.ufo.hp}/${UFO_MAX_HP}`, hp.x, hp.y - 6);

  // slots
  for (let i = 0 as 0 | 1 | 2; i < 3; i = (i + 1) as 0 | 1 | 2) {
    const r = slotRect(vp, i);
    ctx.strokeStyle = state.selectedSlot === i ? '#ffe86a' : '#fffc';
    ctx.lineWidth = state.selectedSlot === i ? 4 : 2;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.006);
    ctx.setLineDash(state.slots[i] ? [] : [6, 6]);
    ctx.globalAlpha = state.slots[i] ? 1 : 0.6 + pulse * 0.4;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0006';
    ctx.fillRect(r.x, r.y, r.w, r.h);

    const w = state.slots[i];
    if (w) {
      ctx.save();
      ctx.translate(r.x + r.w / 2 - 8, r.y + r.h / 2);
      drawWeapon(ctx, t, w.kind);
      ctx.restore();
      if (w.cooldown > 0) {
        ctx.fillStyle = '#000a';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${r.h * 0.6}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText(`${w.cooldown}`, r.x + r.w / 2, r.y + r.h * 0.72);
      }
    }
    if (i === 2) break; // sortie explicite, TS strict
  }

  // wave counter
  ctx.fillStyle = '#fff';
  ctx.font = '18px system-ui';
  ctx.textAlign = 'right';
  ctx.fillText(`WAVE ${state.waveIndex + 1} / 5`, vp.w - 20, 30);

  // skip button
  const sb = skipButtonRect(vp);
  ctx.fillStyle = '#222c';
  ctx.fillRect(sb.x, sb.y, sb.w, sb.h);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(sb.x, sb.y, sb.w, sb.h);
  ctx.fillStyle = '#fff';
  ctx.font = '14px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Attendre', sb.x + sb.w / 2, sb.y + sb.h / 2);
  ctx.textBaseline = 'alphabetic';
}
```

- [ ] **Step 2: Brancher**

Dans main.ts, initialiser un `GameState` bidon pour le moment (sera remplacé Task 22) :

```ts
import { createInitialState, spawnWave } from './game/state';
import { drawHud } from './render/hud';

let state = spawnWave(createInitialState(), 0);
// dans frame, après mobs loop :
drawHud(ctx, vp(), t, state);
```

- [ ] **Step 3: Visual**

Run: `npm run dev`
Expected: HP bar, 3 slots pointillés pulsant, "WAVE 1 / 5", bouton "Attendre".

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/render/hud.ts alien-abduct/src/main.ts
git commit -m "feat(render): HUD (HP, slots, wave counter, skip button)"
```

---

### Task 19: Renderer orchestrateur + z-order

**Files:**
- Create: `alien-abduct/src/render/renderer.ts`

- [ ] **Step 1: Implémenter**

Créer `src/render/renderer.ts` :

```ts
import type { GameState } from '../game/types';
import { drawScene } from './scene';
import { drawUFO } from './ufo';
import { drawCreature } from './creature';
import { drawHud } from './hud';
import { configFor } from './mob-configs';
import { mobPosition, type Viewport } from './layout';

export function render(ctx: CanvasRenderingContext2D, vp: Viewport, t: number, state: GameState): void {
  drawScene(ctx, vp, t);
  drawUFO(ctx, vp, t, state.ufo.hp / state.ufo.hpMax);

  // z-order mobs : tri par screenY croissant (plus bas = devant)
  const sorted = state.mobs.slice().sort((a, b) => {
    const pa = mobPosition(vp, a.angle).y;
    const pb = mobPosition(vp, b.angle).y;
    return pa - pb;
  });
  for (const m of sorted) {
    const pos = mobPosition(vp, m.angle);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.rot);
    drawCreature(ctx, t, configFor(m.kind), m.hp / m.hpMax);
    ctx.restore();
  }

  drawHud(ctx, vp, t, state);
}
```

- [ ] **Step 2: Brancher dans main**

Remplacer la loop `for (let i = 0; ...)` dans main.ts par :

```ts
import { render } from './render/renderer';
// dans frame :
render(ctx, vp(), t, state);
```

- [ ] **Step 3: Visual**

Run: `npm run dev`
Expected: 2 grunts au sommet de l'arc (wave 0), bien rendus, HUD en place, UFO au-dessus.

- [ ] **Step 4: Commit**

```bash
git add alien-abduct/src/render/renderer.ts alien-abduct/src/main.ts
git commit -m "feat(render): renderer orchestrator with z-order"
```

---

### Task 20: Input — hit-test & actions

**Files:**
- Create: `alien-abduct/src/input/input.ts`

- [ ] **Step 1: Implémenter**

Créer `src/input/input.ts` :

```ts
import type { Action, GameState } from '../game/types';
import { mobPosition, skipButtonRect, slotRect, pointInCircle, pointInRect, type Viewport } from '../render/layout';

export type InputResolution =
  | { kind: 'action'; action: Action }
  | { kind: 'selectSlot'; slotIndex: 0 | 1 | 2 }
  | { kind: 'deselect' }
  | { kind: 'none' };

const MOB_HIT_RADIUS = 40;

export function resolveClick(vp: Viewport, state: GameState, px: number, py: number): InputResolution {
  if (state.phase !== 'PlayerTurn') return { kind: 'none' };

  // skip button
  if (pointInRect(px, py, skipButtonRect(vp))) {
    return { kind: 'action', action: { kind: 'skip' } };
  }

  // slots
  for (const i of [0, 1, 2] as const) {
    if (pointInRect(px, py, slotRect(vp, i))) {
      const w = state.slots[i];
      if (!w || w.cooldown > 0) return { kind: 'none' };
      if (state.selectedSlot === i) return { kind: 'deselect' };
      return { kind: 'selectSlot', slotIndex: i };
    }
  }

  // mobs
  for (const m of state.mobs) {
    const pos = mobPosition(vp, m.angle);
    if (pointInCircle(px, py, pos.x, pos.y, MOB_HIT_RADIUS)) {
      if (state.selectedSlot !== null) {
        return { kind: 'action', action: { kind: 'fire', slotIndex: state.selectedSlot, targetId: m.id } };
      }
      return { kind: 'action', action: { kind: 'abduct', mobId: m.id } };
    }
  }

  return { kind: 'deselect' };
}
```

- [ ] **Step 2: Commit**

```bash
git add alien-abduct/src/input/input.ts
git commit -m "feat(input): click hit-test → Action or slot selection"
```

---

### Task 21: Audio — BGM + SFX

**Files:**
- Create: `alien-abduct/src/audio/bgm.ts`
- Create: `alien-abduct/src/audio/sfx.ts`
- Create: `alien-abduct/public/bgm.mp3` (télécharger)

- [ ] **Step 1: Télécharger la BGM**

Run:

```bash
cd /home/alexis/Global/Claude_Projects/games/alien-abduct/public
curl -L -o bgm.mp3 "https://ericskiff.com/music/Resistor%20Anthems/03%20Chibi%20Ninja.mp3"
ls -la bgm.mp3
```

Expected: fichier ~4-6 MB.

- [ ] **Step 2: BGM loop**

Créer `src/audio/bgm.ts` :

```ts
let audio: HTMLAudioElement | null = null;

export function startBgm(): void {
  if (audio) return;
  audio = new Audio('/bgm.mp3');
  audio.loop = true;
  audio.volume = 0.35;
  audio.play().catch(() => { /* attend interaction user */ });
}
```

- [ ] **Step 3: SFX via ZzFX**

Créer `src/audio/sfx.ts` :

```ts
import { zzfx } from 'zzfx';

export const SFX = {
  click:      () => zzfx(0.3, 0, 500, 0.01, 0.02, 0.05, 0, 2, 0, 0),
  abduct:     () => zzfx(0.4, 0, 250, 0.3, 0.5, 0.2, 1, 3, 0, 0, 0, 0, 0.1, 0, 0, 0, 0.15),
  shootPistol:() => zzfx(0.3, 0, 800, 0.01, 0.04, 0.05, 1, 2, 0, 0),
  shootCannon:() => zzfx(0.5, 0, 120, 0.02, 0.15, 0.3, 3, 1, 0, 0),
  shootPierce:() => zzfx(0.4, 0, 1500, 0.02, 0.1, 0.1, 0, 2, 0, 0),
  shootSmg:   () => zzfx(0.25, 0, 500, 0.01, 0.02, 0.03, 1, 2, 0, 0),
  heal:       () => zzfx(0.35, 0, 400, 0.1, 0.4, 0.1, 0, 3, 0, 0, 100),
  explode:    () => zzfx(0.6, 0, 60, 0.02, 0.3, 0.5, 4, 1.5, 0, 0),
  bomberTick: () => zzfx(0.2, 0, 1000, 0.01, 0.02, 0.02, 0, 1.5, 0, 0),
  waveStart:  () => zzfx(0.4, 0, 400, 0.05, 0.3, 0.2, 0, 2, 0, 150),
  victory:    () => zzfx(0.5, 0, 600, 0.1, 0.5, 0.3, 0, 3, 0, 500),
  defeat:     () => zzfx(0.5, 0, 200, 0.1, 0.5, 0.4, 3, 0.5, 0, -200),
};
```

- [ ] **Step 4: Déclencher BGM sur premier clic**

Dans `src/main.ts` ajouter :

```ts
import { startBgm } from './audio/bgm';
canvas.addEventListener('pointerdown', () => startBgm(), { once: true });
```

- [ ] **Step 5: Commit**

```bash
git add alien-abduct/public/bgm.mp3 alien-abduct/src/audio/ alien-abduct/src/main.ts
git commit -m "feat(audio): BGM (Eric Skiff Chibi Ninja) + ZzFX sfx wrappers"
```

---

### Task 22: Game feel (screen-shake, hitstop, dmg popups, flash)

**Files:**
- Create: `alien-abduct/src/render/feel.ts`

- [ ] **Step 1: Implémenter**

Créer `src/render/feel.ts` :

```ts
import type { Viewport } from './layout';

type Popup = { x: number; y: number; text: string; color: string; startT: number };

let shake = 0;
let shakeEndT = 0;
let hitstopEndT = 0;
let popups: Popup[] = [];
const flashes = new Map<string, number>(); // mobId → endT

export function triggerShake(now: number, amp: number, durMs: number): void {
  shake = amp;
  shakeEndT = now + durMs;
}

export function triggerHitstop(now: number, durMs: number): void {
  hitstopEndT = now + durMs;
}

export function isHitstopped(now: number): boolean {
  return now < hitstopEndT;
}

export function triggerFlash(now: number, mobId: string, durMs: number): void {
  flashes.set(mobId, now + durMs);
}

export function isFlashing(now: number, mobId: string): boolean {
  const end = flashes.get(mobId);
  if (end === undefined) return false;
  if (now > end) { flashes.delete(mobId); return false; }
  return true;
}

export function pushPopup(now: number, x: number, y: number, text: string, color: string): void {
  popups.push({ x, y, text, color, startT: now });
}

export function applyShake(ctx: CanvasRenderingContext2D, now: number): void {
  if (now < shakeEndT) {
    const left = (shakeEndT - now) / 250;
    const dx = (Math.random() - 0.5) * 2 * shake * left;
    const dy = (Math.random() - 0.5) * 2 * shake * left;
    ctx.translate(dx, dy);
  }
}

export function drawPopups(ctx: CanvasRenderingContext2D, now: number, _vp: Viewport): void {
  popups = popups.filter(p => now - p.startT < 700);
  for (const p of popups) {
    const t = (now - p.startT) / 700;
    const alpha = 1 - t;
    const yoff = -40 * t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.font = 'bold 22px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y + yoff);
    ctx.restore();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add alien-abduct/src/render/feel.ts
git commit -m "feat(render): screen-shake, hitstop, dmg popups, mob flash"
```

---

### Task 23: State machine wiring dans main.ts

**Files:**
- Modify: `alien-abduct/src/main.ts`

- [ ] **Step 1: Remplacer main.ts complet**

Remplacer `src/main.ts` :

```ts
import { createInitialState, spawnWave } from './game/state';
import { applyPlayerAction, resolveEnemyTurn } from './game/logic';
import { AnimQueue } from './game/anim';
import { resolveClick } from './input/input';
import { render } from './render/renderer';
import { startBgm } from './audio/bgm';
import { SFX } from './audio/sfx';
import { applyShake, drawPopups, isHitstopped, pushPopup, triggerFlash, triggerHitstop, triggerShake } from './render/feel';
import { mobPosition, ufoPosition } from './render/layout';
import { ANIM_DURATIONS, WAVE_COUNT } from './game/rules';
import type { GameState, AnimStep } from './game/types';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

let state: GameState = spawnWave(createInitialState(), 0);
const queue = new AnimQueue();
let lastT = performance.now();
let phaseDelayEnd = 0;

// WaveIntro initial
state = { ...state, phase: 'WaveIntro' };
phaseDelayEnd = performance.now() + ANIM_DURATIONS.waveIntro;
SFX.waveStart();

canvas.addEventListener('pointerdown', (e) => {
  startBgm();
  if (state.phase !== 'PlayerTurn') return;
  const rect = canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  const res = resolveClick({ w: window.innerWidth, h: window.innerHeight }, state, px, py);
  if (res.kind === 'selectSlot') {
    state = { ...state, selectedSlot: res.slotIndex };
    SFX.click();
  } else if (res.kind === 'deselect') {
    state = { ...state, selectedSlot: null };
  } else if (res.kind === 'action') {
    const { state: newState, anims } = applyPlayerAction(state, res.action);
    state = newState;
    pushFeelFromAnims(anims);
    queue.enqueue(anims);
    SFX.click();
    if (res.action.kind === 'abduct') SFX.abduct();
    if (res.action.kind === 'fire') {
      const slot = state.slots[res.action.slotIndex];
      if (slot?.kind === 'pistol') SFX.shootPistol();
      else if (slot?.kind === 'cannon') SFX.shootCannon();
      else if (slot?.kind === 'pierce') SFX.shootPierce();
      else if (slot?.kind === 'smg') SFX.shootSmg();
      else if (slot?.kind === 'heal') SFX.heal();
    }
    state = { ...state, phase: 'Resolving' };
  }
});

function pushFeelFromAnims(anims: AnimStep[]): void {
  const vp = { w: window.innerWidth, h: window.innerHeight };
  for (const a of anims) {
    if (a.kind === 'hit') {
      const dmg = (a.data as { dmg?: number; targetUfo?: boolean }).dmg ?? 0;
      if ((a.data as any).targetUfo) {
        triggerShake(performance.now(), 4 + dmg * 2, 250);
        const up = ufoPosition(vp);
        pushPopup(performance.now(), up.x, up.y, `-${dmg}`, '#e53');
      } else {
        const mobId = (a.data as any).mobId as string;
        triggerFlash(performance.now(), mobId, 80);
        const m = state.mobs.find(x => x.id === mobId);
        if (m) {
          const pos = mobPosition(vp, m.angle);
          pushPopup(performance.now(), pos.x, pos.y, `-${dmg}`, '#fff');
        }
        if (dmg >= 2) triggerHitstop(performance.now(), 60);
      }
    } else if (a.kind === 'explode') {
      triggerShake(performance.now(), 12, 400);
      triggerHitstop(performance.now(), 80);
    } else if (a.kind === 'heal') {
      const up = ufoPosition(vp);
      pushPopup(performance.now(), up.x, up.y, `+heal`, '#5c5');
    }
  }
}

function frame(now: number) {
  const dt = now - lastT;
  lastT = now;

  if (!isHitstopped(now)) queue.tick(dt);

  if (state.phase === 'WaveIntro' && now > phaseDelayEnd) {
    state = { ...state, phase: 'PlayerTurn' };
  } else if (state.phase === 'Resolving' && queue.isEmpty) {
    // post-action : check fin de vague / défaite
    if (state.ufo.hp <= 0) {
      state = { ...state, phase: 'Defeat' };
      SFX.defeat();
    } else if (state.mobs.length === 0) {
      state = { ...state, phase: 'WaveCleared' };
      phaseDelayEnd = now + ANIM_DURATIONS.waveCleared;
    } else {
      // enchaîne EnemyTurn
      state = { ...state, phase: 'EnemyTurn' };
      const { state: s2, anims } = resolveEnemyTurn(state);
      state = s2;
      pushFeelFromAnims(anims);
      queue.enqueue(anims);
      state = { ...state, phase: 'Resolving' };
    }
  } else if (state.phase === 'WaveCleared' && now > phaseDelayEnd) {
    const next = state.waveIndex + 1;
    if (next >= WAVE_COUNT) {
      state = { ...state, phase: 'Victory' };
      SFX.victory();
    } else {
      state = spawnWave(state, next);
      state = { ...state, phase: 'WaveIntro', selectedSlot: null };
      phaseDelayEnd = now + ANIM_DURATIONS.waveIntro;
      SFX.waveStart();
      // remettre cooldowns à 0 entre vagues
      state = { ...state, slots: state.slots.map(w => w ? { ...w, cooldown: 0 } : null) as GameState['slots'] };
    }
  }

  ctx.save();
  applyShake(ctx, now);
  render(ctx, { w: window.innerWidth, h: window.innerHeight }, now, state);
  drawPopups(ctx, now, { w: window.innerWidth, h: window.innerHeight });
  ctx.restore();

  // overlay wave intro / victory / defeat
  if (state.phase === 'WaveIntro') drawOverlay(`WAVE ${state.waveIndex + 1}`);
  else if (state.phase === 'Victory') drawOverlay('VICTOIRE', '#5c5');
  else if (state.phase === 'Defeat') drawOverlay('DÉFAITE', '#e53');

  requestAnimationFrame(frame);
}

function drawOverlay(text: string, color = '#fff') {
  ctx.save();
  ctx.fillStyle = '#0008';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 80px system-ui';
  ctx.fillText(text, window.innerWidth / 2, window.innerHeight / 2);
  ctx.restore();
}

requestAnimationFrame(frame);
```

- [ ] **Step 2: Playtest end-to-end**

Run: `npm run dev`
Expected :
- Overlay WAVE 1 (2s) puis les 2 grunts apparaissent.
- Clic sur un grunt → abduction (son + popup) → arme dans slot 1.
- Clic slot 1 (highlight jaune) → clic autre grunt → pistol tire → kill → vague claimed 1s → WAVE 2.
- Défaite possible si on temporise.
- Victoire après W5 vidée.

- [ ] **Step 3: Commit**

```bash
git add alien-abduct/src/main.ts
git commit -m "feat(main): full state machine, input wiring, anim queue + game feel"
```

---

### Task 24: Vérification finale (Definition of Done)

**Files:**
- Create: `alien-abduct/README.md`

- [ ] **Step 1: README avec attribution**

Créer `alien-abduct/README.md` :

```markdown
# Alien Abduct

Proto turn-based 2D web vibe-codé pour le hackathon Voodoo × Anthropic.
Design : `../games-skill/specs/2026-04-21-alien-abduct-design.md`.

## Run

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # tests logique
npm run build
```

## Attribution

- Musique : "Chibi Ninja" par Eric Skiff — <https://ericskiff.com/music/> — CC-BY 4.0
- SFX : générés procéduralement via [ZzFX](https://github.com/KilledByAPixel/ZzFX) (MIT)
- Inspiration visuelle : Coup Ahoo par Antti Haavikko (Canvas 2D procédural)
```

- [ ] **Step 2: Check DoD**

Manuellement :
- [ ] Jouer 5 vagues consécutives sans crash.
- [ ] Gagner une partie (séquence nominale).
- [ ] Perdre une partie (ignorer les medics).
- [ ] Les 6 mobs reconnaissables à 1 s.
- [ ] Toute entité à l'écran montre ≥ 1 mouvement.
- [ ] Resize fenêtre ne casse rien.
- [ ] Screen-shake, hitstop, dmg popups, flash visibles.

Run: `npm run build`
Expected: bundle < 250 KB gz (hors bgm.mp3).

Run: `npm test`
Expected: 25+ tests passent.

- [ ] **Step 3: Commit final**

```bash
git add alien-abduct/README.md
git commit -m "docs(alien-abduct): README + attribution"
```

---

## Sortie

Jeu jouable sur `http://localhost:5173`, source complète dans `alien-abduct/`, tests verts, spec respecté. Pas de progression meta, pas d'autres planètes, pas de mobile — par design (spec §Non-objectifs).
