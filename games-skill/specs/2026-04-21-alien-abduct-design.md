# Alien Abduct — design

Prototype d'entraînement pour le hackathon Voodoo × Anthropic. Objectif : valider qu'on peut vibe-coder en one-shot un jeu web 2D turn-based propre, fonctionnel, robuste, avec l'esthétique vivante de Coup Ahoo.

## Pitch

Le joueur pilote une soucoupe volante (alien à la tête qui dépasse du cockpit) au-dessus d'une planète courbée. Des vagues d'ennemis montent depuis le sol. Chaque tour, le joueur fait **une seule action** : soit **abducter un ennemi** avec son rayon tracteur (l'ennemi devient une arme volée équipée dans un slot), soit **tirer avec une arme déjà volée** sur un ennemi. Les armes gardent l'apparence de l'ennemi d'origine. 5 vagues, fin. Pas de progression meta, pas d'autre planète pour ce proto.

## Objectifs

- Jeu complet jouable de A à Z en navigateur, zéro install côté joueur.
- Identité visuelle procédurale type Coup Ahoo : personnages dessinés en Canvas 2D avec bezier/stroke, animations pilotées par des sinus (pas de sprite, pas de SVG, pas de pixel art).
- Codebase lisible, testable, pas de dette inutile.
- Musique reprise de Coup Ahoo pour ce proto (bgm lo-fi, looped).

## Non-objectifs

- Multijoueur.
- Progression méta entre parties.
- Autres planètes, autres biomes.
- Sauvegarde.
- Mobile/tactile (souris desktop uniquement).
- Internationalisation.

## Boucle de jeu

```
initGame() -> UFO { hp: 15, slots: [null, null, null] }
  for wave in [W1..W5]:
    spawnWave(wave)
    showOverlay("WAVE N") 2s
    while mobsAlive() > 0 and UFO.hp > 0:
      waitPlayerAction()
        - click mob           -> abduct(mob) if freeSlot()
        - click slot + mob    -> fire(slot, mob) if cooldown == 0
      resolveEnemyTurn()
        - each alive enemy applies its ability
        - tick bombers, decrement cooldowns
      checkEnd()
    if UFO.hp <= 0 -> defeat()
  victory()
```

**Règles** :
- Exactement 1 action joueur par tour.
- Abduction bloquée si les 3 slots sont pleins. Tirer ne libère pas le slot — l'arme y reste en cooldown puis redevient utilisable. Il n'existe dans ce proto aucun autre moyen de vider un slot. Le joueur doit donc choisir ses abductions en connaissance de cause.
- Entre vagues : HP conservé, slots conservés, cooldowns remis à zéro, overlay 2s.

**Tie-breakers déterministes** (anti-RNG) :
- Medic soigne l'allié avec le HP absolu le plus bas ; égalité → le plus à gauche sur l'arc.
- Mitraillette "3 ennemis les plus proches" = tri par distance angulaire à l'UFO ; égalité → le plus à gauche.
- Bombe AOE : touche tous les ennemis dont la position angulaire est à ≤ 15° de la cible au moment de l'explosion.

## Entités

### UFO (joueur)

| Champ | Valeur |
|---|---|
| hp | 15 (max) |
| slots | `[Weapon \| null, Weapon \| null, Weapon \| null]` |
| position | fixe, centre-haut écran, légère oscillation idle |

### Mobs

| Type | HP | Action chaque tour | Télégraphe visuel |
|---|---|---|---|
| Grunt | 1 | 1 dmg UFO | petit alien vert, pistolet laser |
| Brute | 4 | 3 dmg UFO tous les 2 tours | gros, canon d'épaule |
| Sniper | 2 | 2 dmg UFO | filiforme, long fusil |
| Mitrailleur | 1 | 3×1 dmg UFO (3 tirs) | 4 bras, mitraillette |
| Medic | 2 | soigne +1 HP à l'allié le plus blessé | bleu, croix médicale |
| Bomber | 1 | compteur interne : 2→1→explose (5 dmg AOE UFO) | rond, bombe qui clignote |

Tous les mobs ont une **position fixe** sur l'arc de la planète (assignée au spawn de la vague).

### Armes volées (identité 1:1 avec le type de mob)

| Arme (source) | Effet | Cooldown |
|---|---|---|
| Pistolet (Grunt) | 1 dmg à 1 cible | 0 |
| Canon (Brute) | 4 dmg à 1 cible | 2 tours |
| Perforant (Sniper) | 2 dmg à **tous** les ennemis de la ligne | 2 tours |
| Mitraillette (Mitrailleur) | 1 dmg chacun aux 3 ennemis les plus proches (déterministe, par distance angulaire sur l'arc) | 1 tour |
| Rayon médical (Medic) | +2 HP UFO | 3 tours |
| Bombe (Bomber) | 3 dmg AOE au tour suivant (2-tile radius angulaire) | 2 tours |

Aucune arme ne consomme le slot. Tirer = action + arme passe en cooldown.

## Vagues

Scriptées, ordre fixe :

| # | Composition |
|---|---|
| W1 | 2 Grunts |
| W2 | 2 Grunts, 1 Brute |
| W3 | 1 Grunt, 1 Sniper, 1 Mitrailleur |
| W4 | 1 Brute, 1 Medic, 2 Grunts |
| W5 | 1 Brute, 1 Sniper, 1 Bomber, 1 Medic |

## Scène

Résolution logique : canvas responsive (resize fenêtre), système de coordonnées 1920×1080 virtuel + transform.

Composition verticale :
- **Ciel étoilé** : haut ~60% écran. Étoiles positionnées aléatoirement une fois, twinkle léger via sinus.
- **Planète courbée** : arc en bas, centre de la planète placé ~1.5× hauteur écran sous le viewport → courbure douce mais visible. Remplit ~40% écran en bas.
- **UFO** : centré haut, ~1/3 hauteur écran du haut. Idle float Y via sinus. Tête alien visible dans bulle de verre.
- **Mobs** : alignés sur l'arc, chacun transformé : `translate(cx + R·sin(angle), cy - R·cos(angle))` puis `rotate(angle)` pour orthogonalité au sol.

HUD (bottom bar fixe, hauteur ~100 px) :
- **Jauge HP UFO** à gauche (cœurs ou bar stylée).
- **3 slots d'armes** centrés. Chaque slot montre soit une case vide pointillée (pulse quand vide), soit le sprite procédural de l'arme + anneau de cooldown.
- **Compteur vague** à droite : "WAVE 3 / 5".

Overlay inter-vague : texte centré "WAVE N", fade-in 0.3s + hold 1.4s + fade-out 0.3s.

## Input

Souris desktop. Tous les clics gauche.

- **Hover mob** → highlight contour + tooltip au-dessus : "[Arme]: brief effet".
- **Clic mob** :
  - si 0 arme sélectionnée dans HUD : tentative d'abduction. Si slot libre → abduction anim + mob retiré + arme ajoutée. Sinon → shake du HUD, message "slots pleins".
  - si 1 arme sélectionnée (slot highlighté dans HUD) : tir sur le mob, cooldown activé.
- **Clic slot HUD avec arme en cooldown** : shake du slot, pas de sélection.
- **Clic slot vide** : rien.
- **Clic ailleurs** : déselectionne l'arme en cours.

Aucun raccourci clavier pour ce proto.

## Rendu procédural

Inspiré directement de Coup Ahoo (`/tmp/coup-ahoo-peek/src/dude.ts` comme référence).

Règles :
- **Zéro sprite, zéro SVG, zéro PNG** hors fond étoilé (lui-même généré aléatoirement à l'init).
- Chaque mob, l'UFO, les armes : classe TS avec méthode `draw(ctx, t)`.
- Chaque `draw` :
  - `ctx.save()`, translate à la position, rotate si au sol, scale selon état.
  - Corps en `bezierCurveTo` / `quadraticCurveTo` / `arc`.
  - Chaque point de contrôle contient **au moins une variable animée** : `Math.sin(t * freq + phase)` ou `animPhase` mis à jour dans `update(t)`.
  - Contours : `lineCap = 'round'`, `lineWidth` 6-8, `strokeStyle = '#000'`.
  - Remplissage : 1-2 couleurs plates par forme.
- L'identité visuelle repose sur : traits épais noirs + formes rondes + mouvement constant (aucune entité n'est immobile ≥ 100 ms).

## Architecture code

Stack : **Vite + TypeScript + Canvas 2D vanilla + Howler** (audio). Pas de lib de jeu. Pas de framework UI.

```
alien-abduct/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── bgm.mp3                # musique Coup Ahoo
└── src/
    ├── main.ts                # boot, canvas setup, game loop
    ├── game/
    │   ├── types.ts           # Mob, Weapon, UFO, Wave, Action, GameState
    │   ├── state.ts           # createInitialState, mutations pures
    │   ├── waves.ts           # table des 5 vagues
    │   ├── logic.ts           # applyPlayerAction(), resolveEnemyTurn() pures
    │   └── rules.ts           # constantes (HP, dmg, cooldowns, composition)
    ├── render/
    │   ├── renderer.ts        # render(ctx, state, t) — orchestre tous les draws
    │   ├── layout.ts          # math: screen→world, arc positioning, normals
    │   ├── ufo.ts             # draw procédural UFO + alien
    │   ├── mobs.ts            # draw procédural par type
    │   ├── weapons.ts         # draw procédural arme dans slot + projectile
    │   ├── scene.ts           # étoiles, planète, courbure
    │   └── hud.ts             # jauge HP, slots, compteur vague, overlays
    ├── input/
    │   └── input.ts           # click handler, hit-tests (hit sur mob, hit sur slot)
    ├── audio/
    │   └── audio.ts           # wrapper Howler (bgm, sfx abduct, sfx hit)
    └── util/
        ├── math.ts            # clamp01, lerp, easeInOut, polarToCart
        └── anim.ts            # useSinPhase, oscillate helpers
```

**Règles d'architecture** :
- `game/logic.ts` : fonctions pures `(state, action) → newState`. Testable sans DOM.
- `render/*` : lit `state`, n'écrit jamais dans `state`.
- `input/input.ts` : transforme clics en `Action`, appelle `applyPlayerAction`.
- `main.ts` orchestre la boucle `requestAnimationFrame(t)` : `update(t)` → `render(ctx, state, t)`.

## Machine d'état

```
enum Phase {
  WaveIntro,         // overlay "WAVE N"
  PlayerTurn,        // attend input
  Animating,         // une action est en train de jouer (abduction, tir, explosion)
  EnemyTurn,         // résolution auto des ennemis
  WaveCleared,       // délai court avant WaveIntro suivante
  Victory,
  Defeat,
}
```

Transitions :
- `WaveIntro` → (2s) → `PlayerTurn`
- `PlayerTurn` → (input valide) → `Animating`
- `Animating` → (fin anim, ~0.5s) → `EnemyTurn` (sauf si WaveCleared détecté)
- `EnemyTurn` → (fin anim, ~0.8s) → `PlayerTurn` ou `Defeat` ou `WaveCleared`
- `WaveCleared` → (1s) → `WaveIntro` (suivante) ou `Victory`

## Données de jeu figées (rules.ts)

```ts
export const UFO_MAX_HP = 15;
export const SLOT_COUNT = 3;

export const MOBS = {
  grunt:      { hp: 1, dmg: 1 },
  brute:      { hp: 4, dmg: 3, cadence: 2 },     // toutes les 2 rounds
  sniper:     { hp: 2, dmg: 2 },
  gunner:     { hp: 1, dmg: 1, shots: 3 },
  medic:      { hp: 2, heal: 1 },
  bomber:     { hp: 1, fuse: 2, aoeDmg: 5 },
} as const;

export const WEAPONS = {
  pistol:   { dmg: 1, cooldown: 0, kind: 'single' },
  cannon:   { dmg: 4, cooldown: 2, kind: 'single' },
  pierce:   { dmg: 2, cooldown: 2, kind: 'line' },
  smg:      { dmg: 1, cooldown: 1, kind: 'nearest3' },
  heal:     { amount: 2, cooldown: 3, kind: 'heal' },
  bomb:     { dmg: 3, cooldown: 2, kind: 'aoeDelayed', delay: 1 },
} as const;

// mapping mob → arme (abduction)
export const MOB_TO_WEAPON = {
  grunt: 'pistol',
  brute: 'cannon',
  sniper: 'pierce',
  gunner: 'smg',
  medic: 'heal',
  bomber: 'bomb',
} as const;
```

## Audio

- **BGM** : loop `bgm.mp3` (musique de Coup Ahoo, usage proto uniquement, à retirer avant publication publique — licence à clarifier avant hackathon).
- **SFX** (générés via ZzFX ou petits wav CC0) : `abduct`, `shoot`, `hit`, `heal`, `explode`, `wave_start`, `defeat`, `victory`.

## Robustesse

- `logic.ts` : pure, testable. On écrit 3-5 tests Vitest minimum :
  - abduction ajoute l'arme dans le 1er slot libre
  - abduction bloquée si 3 slots pleins
  - mort d'un bomber avant fuse n'applique pas l'AOE
  - medic priorise l'allié au HP le plus bas
  - tir perforant touche tous les mobs vivants
- `TypeScript strict: true`. Aucun `any`.
- Aucun état mutable global hors de l'instance `GameState` principale.
- `pointerdown` préventé dans `Animating` et `EnemyTurn` (pas de clic spam).

## Vérification (definition of done)

1. `npm run dev` lance le jeu sans erreur console, canvas responsive au resize.
2. Jouer 5 vagues consécutives sans crash.
3. Gagner une partie de référence (séquence scriptée) en ≤ 30 clics.
4. Perdre une partie si on ignore les Medics 4 tours d'affilée.
5. Les 6 mobs et 6 armes sont tous visuellement distincts à 1 s de lecture.
6. Toute entité à l'écran montre ≥ 1 mouvement (oscillation, rotation, twinkle).
7. `npm run build` produit un bundle < 200 KB gz.
8. `vitest run` passe les 5 tests logiques.

## Références

- Coup Ahoo source (procédural Canvas 2D) : https://github.com/js13kGames/coup-ahoo
- Coup Ahoo jouable : https://anttihaavikko.itch.io/coup-ahoo
- ZzFX (SFX procéduraux JS) : https://github.com/KilledByAPixel/ZzFX
