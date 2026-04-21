# Références jeux pour le hackathon Voodoo × Anthropic

Bibliothèque personnelle d'exemples à rejouer, étudier, fork ou pitcher.

## Jeux déjà dans le repo (clones locaux)

| Jeu | Dossier | Stack | Usage prévu |
|---|---|---|---|
| **anti-scroll** | `anti-scroll/` | Next.js 16 + React 19 + Tailwind v4 + Framer Motion | Premier proto perso. Prouve qu'on peut faire une UI 2D très polie en DOM/CSS pur. |
| **HexGL** (fork) | `HexGL/` | Three.js + WebGL + Playwright (bot) | Course Wipeout-like 3D, bot autonome `tools/benchmark-ai.js`, circuit custom. |
| **Sketchbook** (fork) | `Sketchbook/` | Three.js + cannon.js | Sandbox 3D : personnages, véhicules, avions, physique. Base 3D réutilisable. |
| **Suroi** (clone) | `suroi/` | Bun + Vite + PixiJS v8 + TypeScript vanilla | **Battle royale 2D top-tier**. Caméra zoom-based fair-play, démo prod suroi.io. Référence stack moderne. |
| **Westward** (clone) | `westward/` | Phaser 3 + webpack + Node + MongoDB | **MMORPG 2D pixel-art**, fog of war, jour/nuit. Codebase 2018 legacy (canvas figé, boot lent). Impressionnant comme scope solo. |

## Top 10 jeux pixel-art web à étudier (vérifiés jouables 2026)

Classés par qualité visuelle décroissante.

1. **Soulbound** — https://play.soulbound.game/ — **GameMaker Studio HTML5 export**. MMO action/bullet-hell. Plafond pur, mais chargement très lourd (runtime WASM + assets MMO monolithiques).
2. **Taming.io** — https://taming.io/ — **stack non confirmée** (probable HTML5 Canvas + Node/WebSocket). Survie multi.
3. **Shattered Pixel Dungeon** — https://shattered-pixel.itch.io/shattered-pixel-dungeon — **Java + libGDX** (Gradle) — [OSS](https://github.com/00-Evan/shattered-pixel-dungeon).
4. **Coup Ahoo** (js13k 2024) — https://anttihaavikko.itch.io/coup-ahoo — **TS vanilla + Webpack + Closure + Roadroller** — [OSS](https://github.com/js13kGames/coup-ahoo). Pas de lib runtime. **Reproductible en 48h.**
5. **Ghosted** (js13k 2024) — https://js13kgames.com/2024/games/ghosted — **TS vanilla + Make + Closure**, framework maison Jani Nykänen. **Calibre exact hackathon.**
6. **PokéPath TD** — https://khydra98.itch.io/pokepath — **stack non confirmée** (suspicion Godot Web).
7. **Sandspiel** — https://sandspiel.club/ — **Rust → WASM (wasm-pack) + WebGL + Webpack** — [OSS](https://github.com/MaxBittker/sandspiel).
8. **Mirage Online Classic** — https://www.mirageonline.net/ — **moteur HTML5 custom** (réécriture moderne ; original VB6 2001).
9. **Pixel Dungeon (Watabou)** — https://watabou.itch.io/pixel-dungeon — **Java + framework maison PD-classes** (pas libGDX à l'origine).
10. **DR1V3N WILD** (js13k 2024) — https://frankforce.com/dr1v3n-wild/ — **Vanilla JS + WebGL from scratch + ZzFX** — [OSS](https://github.com/KilledByAPixel/Drive13K). Pas LittleJS : tout écrit à la main.

**Fourchette réaliste 48h** : entre Coup Ahoo (#4) et Ghosted (#5). Le reste = plafonds de polish accumulé sur des mois.

## Stacks candidates pour un jeu pixel-art au hackathon

| Stack | Pour | Contre |
|---|---|---|
| **PixiJS v8 + Vite + TS vanilla** (modèle Suroi) | `llms.txt` officiel, WebGPU, pixel-perfect natif (`roundPixels`, nearest filter), caméra custom facile | Pas de framework gameplay → tout se construit |
| **Phaser 4 + Vite + TS** | Scale.FIT + pixelArt:true plug-and-play, arcade physics, tilemaps Tiled, agent skills officiels | Rendu moins premium que Pixi en post-processing |
| **Kaplay + Vite** | Ergonomie max, pixel-art first-class, idéal 48h | Écosystème petit, peut plafonner |
| **LittleJS** | Engine minimaliste Canvas 2D de Frank Force (cf. DR1V3N WILD), screen-shake/particules built-in | Très niche, doc plus courte |
| **Godot 4 Web export** | Qualité visuelle et tooling hors JS, pixel-perfect parfait | **Mauvais pour Claude Code** (peu de docs Godot dans training), .wasm 30MB+ |

## Pièges build à éviter

### Webpack + Roadroller + Closure : uniquement pour js13k

**Coup Ahoo (#4)** et plusieurs autres du top 10 utilisent une stack `Webpack + google-closure-compiler + Roadroller`. C'est séduisant — **mais ça n'a de sens que pour la contrainte js13k de 13 KB zippés**.

Pour un hackathon **sans contrainte de taille** (Voodoo × Anthropic, 48h), cette stack est du friction build pur :
- Webpack = setup lourd, recompiles lentes vs Vite (HMR <100ms)
- Roadroller = re-minifieur JS ultra-agressif (passes de plusieurs minutes) qui ne sert qu'à gagner quelques KB
- Closure ADVANCED renomme tout et casse les code-paths non-statiquement-prouvables → debug cauchemar

**Retour d'expérience (Alien Abduct v0)** : Vite + TS + Canvas 2D + ZzFX suffit. Bundle ~21 KB / 7.4 KB gzip sans aucune minif exotique. Recompile instantanée, tests vitest 1.5 s, Playwright en loop pour visual regression.

**Ce qu'on garde de Coup Ahoo** : l'**architecture procédurale** (`src/dude.ts`, `ship.ts`, `flashable.ts`, `engine/tween.ts`, `engine/easings.ts`, `engine/effects.ts`, `engine/face.ts`), la **palette** (`colors.ts`, pools de couleurs à piocher), le **pattern Entity/Container OOP** pour cinématiques fluides.

**Ce qu'on jette** : `webpack.*.js`, `package.json` scripts `closure`/`roadroll*`, minification agressive. Irrelevant hors concours js13k.

## Bonnes pratiques Claude Code pour le hackathon 48h

Retour d'expérience Alien Abduct v0 (itération #1 de préparation).

### Quand appliquer le formalisme superpowers, quand faire « yolo » ?

**Tension centrale** : le formalisme `superpowers` (specs détaillées → plan → implémentation → review Opus par tâche → merge) est solide pour du code durable, mais peut **coûter 2-3× plus de temps** qu'une approche directe, et — surtout — **ne protège pas des bugs qui comptent en jeu** (cf. v0 : 3 bugs game-breaking passés à travers 37 tests verts et reviews Opus, caught par Playwright).

**Règle empirique dérivée du ROI** :

| Phase hackathon | Workflow recommandé | Raison |
|---|---|---|
| **Pré-hack, choix stack** | Spec texte courte (1 page, pas de plan formel) | On a besoin de trancher vite, pas de code |
| **v0 — squelette** | **brainstorming → writing-plans → subagent-driven strict** avec Opus reviewer | Décisions architecturales (state machine, séparation logique/render, types) **coûtent très cher à refondre** après. C'est **le seul moment** où le formalisme paie. |
| **v0 — 1ère passe gameplay** | Subagent-driven avec reviewer ponctuel (pas systématique) | Logique métier testable, on veut des tests dès le début |
| **v1+ polish visuel** | **Plan léger + implémentation directe + Playwright en loop** | Polish = itération rapide, commits atomiques par feature, feedback visuel imbattable. Formalisme = friction pure ici. |
| **Debug / bugs visuels** | `systematic-debugging` **toujours** (formalise la recherche), mais pas de review par tâche | Hypothèses bayésiennes + Playwright screenshots trouve les bugs que les tests ratent |
| **Intégration finale / demo** | `verification-before-completion` obligatoire, `finishing-a-development-branch` pour merger propre | Éviter les « ça marche chez moi » au moment de la démo |

### Comment commencer proprement une v0 sans partir dans tous les sens

**Ordre non-négociable** (v0 = fondations) :

1. **Brainstorming** (30 min) — pas de code. Énumère 3-5 hypothèses gameplay, tranche sur une. Identifie les **3 contraintes dures** (ex. turn-based, une seule scène, 5 vagues max).
2. **Spec design courte** (1h) — `games-skill/specs/AAAA-MM-JJ-<nom>-design.md`. Ce qui DOIT y figurer :
   - 1 paragraphe pitch
   - Types TypeScript clés (Mob, Weapon, GameState, Action, Phase, AnimStep) — **c'est le contrat, pas de l'exemple**
   - Règles de combat et équilibrage (tableau stats)
   - Règles visuelles dures (style procédural Canvas 2D, pas sprite ; palette ; animation via sinus)
   - Hors scope explicite (pour ne PAS rédiger de plan pour ça)
3. **Plan formel** (30 min) — `games-skill/plans/AAAA-MM-JJ-<nom>.md`. Découpage en tâches **indépendantes**, chacune testable isolément. Ordre par dépendance croissante : types → rules/config → logic pur → state → render → input → orchestrateur.
4. **Worktree** (2 min) — `git worktree add .worktrees/<branche> -b feat/<branche>`. **Toujours en isolation**, jamais sur main direct.
5. **Subagent-driven strict** pour v0 uniquement : Sonnet implementer + Opus reviewer par tâche. Le reviewer Opus attrape les oublis de spec (ex. vite.config.ts manquant en v0 — caught par Opus).
6. **Playwright smoke test dès la fin de l'orchestrateur**, avant de se dire « v0 finie ». Non négociable. Les tests vitest testent la logique pure ; seul Playwright teste le comportement live.

**Piège à éviter** : commencer par le render. On finit avec un rendu joli mais un state management spaghetti. **Render en dernier** = rendu « propre mais plat », facile à upgrader en v1.

### Comment itérer derrière (v1, v2)

**Règle d'or** : le capital de la v0, c'est la **séparation logique pure / render / state / input**. En v1 polish visuel, **on ne touche pas à la logique ni aux types** — tout se passe dans `src/render/*` et éventuellement ajout de champs cosmétiques sur les types (ex. `animSpeed`, `bobPhase` par mob).

1. **Sauvegarder la v0 avant tout** : `git merge --no-ff` sur main + `git tag v0` + créer `feat/<branche>-v1`. Comme ça tu peux toujours `git checkout v0` pour montrer à l'équipe l'état précédent.
2. **Worktree parallèle** (`.worktrees/<branche>-v1/`) pour comparer v0 et v1 côte à côte en live.
3. **Plan léger** (pas de spec formelle) — 1 fichier plan avec 5-6 axes numérotés, ordre par ROI visuel, effort estimé, ce qui est hors scope.
4. **Commits atomiques** : 1 commit = 1 axe. Playwright snapshot après chaque commit (si régression visuelle, on sait lequel).
5. **Reviewer Opus ponctuellement**, pas systématiquement : seulement si coincé > 1h ou sur un axe où on n'est pas sûr (ex. refonte du state machine).
6. **Ne pas ré-écrire ce qui marche** pour l'élégance. « Ugly but shipping > elegant but late ».

### Quand utiliser quel skill (cheat sheet)

- `brainstorming` : avant **toute** création (feature, composant, système)
- `writing-plans` : une fois la spec figée, avant d'écrire une ligne de code
- `subagent-driven-development` : v0 architecture + logique métier critique
- `test-driven-development` : logique pure (game rules, combat math) — PAS render
- `systematic-debugging` : chaque bug ≥ 15 min (classer, hypothèses, checkpoints)
- `verification-before-completion` : avant chaque « fini », **avec preuves** (screenshots, test output collé)
- `using-git-worktrees` : toujours, pour chaque feature branch
- `finishing-a-development-branch` : à la fin de chaque branche, pour merger propre
- `frontend-design` : si on a du chrome UI non-jeu (menus, HUD complexe) — pas si tout est sur canvas

### Anti-patterns observés

- **Sur-formalisation du polish visuel** : écrire une spec pour « ajouter des particules » → 20 min de doc pour 40 lignes de code, le formalisme devient le produit
- **Sous-formalisation de la v0** : yolo direct → state spaghetti, on refond tout à j+6h
- **Tests unitaires qui mentent** : 37/37 green mais le jeu crashe au lancement (cas v0). Les tests testent des fonctions pures, pas des interactions live → ajouter Playwright comme smoke test, point non-négociable
- **Skip du reviewer Opus en v0** : on gagne 30 min, on perd 2h sur des bugs évitables
- **Reviewer Opus en v1 polish** : on perd 30 min par tâche triviale, aucun bug trouvé
