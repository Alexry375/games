# Alien Abduct — design

Prototype d'entraînement pour le hackathon Voodoo × Anthropic. Objectif : valider qu'on peut vibe-coder en one-shot un jeu web 2D turn-based propre, fonctionnel, robuste, avec l'esthétique vivante de Coup Ahoo.

## Pitch

Le joueur pilote une soucoupe volante (alien à la tête qui dépasse du cockpit) au-dessus d'une planète courbée. Des vagues d'ennemis montent depuis le sol. Chaque tour, le joueur fait **une seule action** : soit **abducter un ennemi** avec son rayon tracteur (l'ennemi devient une arme volée équipée dans un slot), soit **tirer avec une arme déjà volée** sur un ennemi. Les armes gardent l'apparence de l'ennemi d'origine. 5 vagues, fin. Pas de progression meta, pas d'autre planète pour ce proto.

## Objectifs

- Jeu complet jouable de A à Z en navigateur, zéro install côté joueur.
- Identité visuelle procédurale type Coup Ahoo : personnages dessinés en Canvas 2D avec bezier/stroke, animations pilotées par des sinus (pas de sprite, pas de SVG, pas de pixel art).
- Codebase lisible, testable, pas de dette inutile.
- Musique libre de droit : **Eric Skiff — "Chibi Ninja"** (CC-BY 4.0), attribution dans le README du repo.
- UFO et une créature canonique polished, autres mobs en **variantes paramétriques** (couleur, accessoires, taille) sans réécrire le code de dessin.

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

Inspiré de Coup Ahoo (`/tmp/coup-ahoo-peek/src/dude.ts` pour référence).

Règles :
- **Zéro sprite, zéro SVG, zéro PNG** hors fond étoilé (généré aléatoirement à l'init).
- Contours : `lineCap = 'round'`, `lineJoin = 'round'`, `lineWidth` 6-8, `strokeStyle = '#000'`.
- Remplissage : 1-2 couleurs plates par forme.
- Chaque point de contrôle contient **au moins une variable animée** (`Math.sin(t * freq + phase)`).
- Aucune entité n'est immobile ≥ 100 ms.

### Stratégie anti-scope

Le scope naïf (6 mobs × ~240 lignes chacun) dépasse une session de vibe-code. Approche adoptée :

**UFO + 1 créature canonique polished.** Écrit à fond, avec 2 jambes, 2 bras, corps, tête, 2 yeux, 2 antennes, bouche, plus leurs oscillations (jambes qui flexent, antennes qui flottent, yeux qui clignent, corps qui bobbe). C'est la base.

**5 autres mobs = variantes paramétriques** de la même fonction `drawCreature(ctx, t, config)`. Le `config` expose :

```ts
type CreatureConfig = {
  bodyColor: string;          // palette
  accentColor: string;
  size: number;               // 0.8 = grunt, 1.4 = brute
  eyeCount: 1 | 2 | 3;
  antennas: 0 | 1 | 2;
  armCount: 2 | 4;            // mitrailleur = 4
  hat: 'none' | 'cross' | 'cap';   // medic = cross, autres optionnels
  weapon: WeaponVisual;       // sprite vectoriel de l'arme tenue
};
```

**6 armes = 6 petites fonctions `drawWeapon(ctx, t, kind)`** séparées (pistolet, canon, fusil long, mitraillette, tube médical, bombe). Elles sont tenues dans la main droite de la créature.

Résultat : **1 grosse fonction `drawCreature` (~300 lignes) + 6 mini `drawWeapon` (~30 lignes chacune) = ~480 lignes totales**, vs 1500+ pour 6 créatures distinctes. Viable en une session.

### Variantes de mobs (configs)

| Mob | bodyColor | size | eyeCount | antennas | armCount | hat | weapon |
|---|---|---|---|---|---|---|---|
| Grunt | vert fluo | 0.85 | 2 | 2 | 2 | none | pistolet |
| Brute | rose sombre | 1.35 | 1 | 0 | 2 | none | canon |
| Sniper | cyan clair | 1.0 (élancé Y×1.3) | 2 | 1 | 2 | none | fusil long |
| Mitrailleur | violet | 0.9 | 3 | 2 | 4 | none | mitraillette |
| Medic | bleu pastel | 0.95 | 2 | 2 | 2 | cross | tube médical |
| Bomber | orange vif | 0.95 (corps sphérique) | 1 | 0 | 2 | none | bombe (clignote) |

L'UFO est dessiné séparément (fonction `drawUFO(ctx, t, hp)`), distinct des créatures : dôme transparent, pilote alien qui dépasse, anneau lumineux rotatif, propulseurs, secousse proportionnelle à `1 - hp/maxHp`.

## Architecture code

Stack : **Vite + TypeScript + Canvas 2D vanilla + HTMLAudioElement** (BGM) + **ZzFX** (SFX procéduraux). Pas de lib de jeu. Pas de framework UI.

```
alien-abduct/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── bgm.mp3                # Eric Skiff — "Chibi Ninja" (CC-BY 4.0)
└── src/
    ├── main.ts                # boot, canvas setup, game loop
    ├── game/
    │   ├── types.ts           # Mob, Weapon, UFO, Wave, Action, AnimStep, Phase, GameState
    │   ├── ids.ts             # nextId() pour IDs stables
    │   ├── state.ts           # createInitialState, updates immutables
    │   ├── waves.ts           # table des 5 vagues
    │   ├── logic.ts           # applyPlayerAction, resolveEnemyTurn purs → (State, AnimStep[])
    │   ├── anim.ts            # AnimQueue (enqueue, tick, isEmpty, currentStep)
    │   └── rules.ts           # constantes (HP, dmg, cooldowns, composition, easings)
    ├── render/
    │   ├── renderer.ts        # render(ctx, state, queue, t) orchestre
    │   ├── layout.ts          # world→screen, arc angle→pixel, slot index→rect, resize-aware
    │   ├── ufo.ts             # drawUFO(ctx, t, hp)
    │   ├── creature.ts        # drawCreature(ctx, t, config) canonique paramétrique
    │   ├── weapon.ts          # drawWeapon(ctx, t, kind) × 6 mini fns
    │   ├── scene.ts           # étoiles + planète courbe
    │   ├── hud.ts             # jauge HP, 3 slots, compteur vague, bouton skip, overlays
    │   └── feel.ts            # screen-shake, hitstop, dmg-popup, flash hit
    ├── input/
    │   └── input.ts           # click → hit-test hitboxes (mobs + slots + skip) → Action
    ├── audio/
    │   ├── bgm.ts             # loop Chibi Ninja via HTMLAudioElement
    │   └── sfx.ts             # wrappers ZzFX
    └── util/
        └── math.ts            # clamp01, lerp, easeOutCubic, easeOutQuad, polarToCart
```

**Règles d'architecture** :
- `game/logic.ts` : fonctions pures `(state, action) → newState`. Testable sans DOM.
- `render/*` : lit `state`, n'écrit jamais dans `state`.
- `input/input.ts` : transforme clics en `Action`, appelle `applyPlayerAction`.
- `main.ts` orchestre la boucle `requestAnimationFrame(t)` : `update(t)` → `render(ctx, state, t)`.

## Machine d'état et queue d'animations

```
enum Phase {
  WaveIntro,         // overlay "WAVE N"
  PlayerTurn,        // attend input
  Resolving,         // la queue d'animations est en train de se vider
  EnemyTurn,         // résolution logique des ennemis (produit des anims dans la queue)
  WaveCleared,       // délai court
  Victory,
  Defeat,
}
```

**Input gelé** en `WaveIntro`, `Resolving`, `EnemyTurn`, `WaveCleared`, `Victory`, `Defeat`. Seul `PlayerTurn` accepte les clics.

**Queue d'animations explicite.** Toute action (abduction, tir, explosion différée, heal, hit dmg, dmg popup, explosion bombe, mort de mob) pousse un `AnimStep` dans la queue. La phase `Resolving` vide la queue **séquentiellement**, une anim à la fois. Les anims ne s'empilent jamais en parallèle sauf si explicitement marquées `parallel: true` (ex: particules secondaires en background).

```ts
type AnimStep = {
  id: string;
  kind: 'abduct' | 'shoot' | 'hit' | 'heal' | 'explode' | 'bomber_tick' | 'mob_die' | 'dmg_popup' | 'screen_shake' | 'hitstop';
  duration: number;          // ms
  data: unknown;             // params (source, cible, dmg, etc.)
  parallel?: boolean;        // peut jouer en même temps que le précédent
};
```

Transitions :
- `WaveIntro` → (2 s) → `PlayerTurn`
- `PlayerTurn` → (input valide, queue remplie) → `Resolving`
- `Resolving` → (queue vide) → `EnemyTurn`
- `EnemyTurn` → (logique résolue, queue remplie) → `Resolving`
- `Resolving` → (queue vide, check fin) → `PlayerTurn` | `WaveCleared` | `Defeat`
- `WaveCleared` → (1 s) → `WaveIntro` suivant ou `Victory`

**Règle dure** : le `GameState` logique est mis à jour *avant* de pousser les anims correspondantes. Le render s'appuie sur le `GameState` + lerps d'anim en cours pour interpoler visuellement. Une entité "en train de mourir" a son HP à 0 dans le state mais reste visible jusqu'à la fin de l'anim `mob_die`.

## Trous de règles bouchés

- **Medic seul slot + UFO plein HP** : le tir heal reste valide et est gaspillé (consomme le tour, met le cooldown). Pas de softlock. Alternative offerte : action "**skip turn**" disponible à tout moment en `PlayerTurn` via clic sur le bouton HUD "attendre" (ne consomme pas d'énergie, passe à `EnemyTurn` directement).
- **Bomber JOUEUR armé (bombe en slot tirée) puis UFO mort avant explosion** : la bombe différée est **abandonnée**. Le jeu termine immédiatement à `Defeat` dès que HP ≤ 0.
- **Bomber ENNEMI tué pendant son fuse** : sa bombe s'annule, **aucun AOE post-mortem**.
- **UFO tombe à 0 au milieu d'un EnemyTurn** : les ennemis restants ne jouent pas. Queue d'anims interrompue, on saute à `Defeat`.
- **Arme perforant sur un arc** : lire "tous les ennemis vivants de la vague" (pas "de la ligne"). Le perforant balaye la surface de la planète de gauche à droite.
- **2 Medics ennemis qui se heal mutuellement** : un mob ne peut pas dépasser son HP max de spawn. Heal au-dessus = gaspillé.
- **Clic pendant WaveIntro** : ignoré (input gelé).
- **Abduction d'un Bomber ennemi qui a déjà armé son fuse** : l'abduction **désarme** la bombe ennemie. Le joueur reçoit une arme Bombe fraîche à cooldown 0 (prête à tirer).
- **IDs mobs** : chaque mob spawn reçoit un `id: string` unique (`nanoid()` ou incrément). Les anims et hit-tests réfèrent les mobs par `id`, jamais par index de tableau.

## Hitboxes

Chaque mob et chaque slot HUD exposent une **hitbox découplée du rendu** : cercle `{ cx, cy, r }` en coordonnées écran, recalculé à chaque frame à partir de la position arc (ou slot layout). Hit-test = distance au centre < r. **Jamais `ctx.isPointInPath`** sur une forme animée.

## Z-order

Mobs triés par `screenY` croissant avant draw. Un mob au "loin" (haut d'arc) passe derrière un mob "proche" (bas d'arc). UFO toujours au-dessus du ciel, en-dessous du HUD.

## Resize fenêtre

Canvas redimensionné sur `resize` event. Tous les tweens en cours recalculent leurs positions cibles en coordonnées écran au début de chaque frame (source et cible sont des positions *logiques* — arc angle, slot index — converties en pixels à chaque frame, pas stockées en pixels figés).

## Game feel (non-négociable)

- **Screen-shake** : 250 ms, amplitude proportionnelle aux dmg, sur hit UFO et sur explosion.
- **Hitstop** : 60 ms de freeze sur impact (pause globale sauf la victime qui flash blanc). Déclenché sur kill de mob et sur hit UFO ≥ 2 dmg.
- **Dmg popups** : number flottant qui monte + fade, 700 ms. Rouge pour dmg, vert pour heal, orange pour AOE.
- **Flash** : mob touché passe 80 ms en `globalCompositeOperation = 'source-over'` surfill blanc, puis retour normal.
- **Abduction** : mob se rétrécit vers la base du rayon UFO (tween scale 1→0) en 400 ms pendant que le rayon tracteur se dessine.
- **Easing** : tout lerp utilise `easeOutCubic` par défaut. Les explosions : `easeOutQuad`.

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

- **BGM** : Eric Skiff — "Chibi Ninja" (CC-BY 4.0). Fichier local `public/bgm.mp3`. Attribution dans README : `Music: "Chibi Ninja" by Eric Skiff — ericskiff.com/music (CC-BY 4.0)`.
- Fallback plus neutre si besoin : Pixabay "Chiptune Loop 100 BPM" (licence Pixabay, sans attribution).
- **SFX** générés procéduralement via **ZzFX** (zéro fichier, zéro licence) : `abduct`, `shoot_pistol`, `shoot_cannon`, `shoot_pierce`, `shoot_smg`, `heal`, `explode`, `bomber_tick`, `wave_start`, `defeat`, `victory`, `click`.

## Robustesse

- `logic.ts` : pure, testable. Tests Vitest minimum :
  1. abduction ajoute l'arme dans le 1er slot libre
  2. abduction bloquée si 3 slots pleins (pas d'effet de bord, state inchangé)
  3. abduction d'un Bomber armé désarme la bombe ennemie et donne une arme Bombe cooldown 0
  4. mort d'un Bomber ennemi pendant son fuse annule l'AOE
  5. Medic priorise l'allié au HP absolu le plus bas ; tie → le plus à gauche
  6. tie-break mitraillette "3 plus proches" déterministe gauche→droite
  7. perforant touche tous les mobs vivants, 0 si vague déjà vidée (no-op, cooldown consommé quand même)
  8. cooldown décrémente à la fin d'EnemyTurn, pas au moment du tir
  9. HP mob cappé à son HP de spawn (heal au-delà = wasted)
  10. UFO à 0 HP pendant EnemyTurn → phase Defeat immédiate, tirs restants non résolus
  11. fin de vague simultanée à mort UFO → Defeat l'emporte sur Victory/WaveCleared
  12. skip-turn consomme le tour et passe direct à EnemyTurn, cooldowns décrémentent normalement
- `TypeScript strict: true`. Aucun `any`.
- Aucun état mutable global hors de l'instance `GameState` principale.
- Input gelé hors `PlayerTurn` (cf. machine d'état).
- Toute entité identifiée par `id` stable. Tableaux d'entités sont des arrays d'`id`, pas d'indices.

## Vérification (definition of done)

1. `npm run dev` lance le jeu sans erreur console, canvas responsive au resize.
2. Jouer 5 vagues consécutives sans crash.
3. Gagner une partie de référence (séquence scriptée) en ≤ 30 clics.
4. Perdre une partie si on ignore les Medics 4 tours d'affilée.
5. Les 6 mobs (variantes paramétriques) et 6 armes sont tous reconnaissables à 1 s de lecture. L'UFO et la créature canonique ont un niveau de polish visible (multi-animations par frame).
6. Toute entité à l'écran montre ≥ 1 mouvement (oscillation, rotation, twinkle).
7. `npm run build` produit un bundle < 250 KB gz (hors `bgm.mp3`).
8. `vitest run` passe les 12 tests logiques.
9. Screen-shake, hitstop, dmg popups, flash hit sont visibles en jeu.
10. Resize de la fenêtre ne casse ni le layout ni les tweens en cours.

## Références

- Coup Ahoo source (procédural Canvas 2D) : https://github.com/js13kGames/coup-ahoo
- Coup Ahoo jouable : https://anttihaavikko.itch.io/coup-ahoo
- ZzFX (SFX procéduraux JS) : https://github.com/KilledByAPixel/ZzFX
