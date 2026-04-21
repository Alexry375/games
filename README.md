# games

Dépôt de préparation pour le hackathon **Voodoo × Anthropic** (Paris, 25–26 avril 2026).

Collaborateurs : [@Alexry375](https://github.com/Alexry375), [@DanielMbouyou](https://github.com/DanielMbouyou).

## Stratégie retenue

Après plusieurs prototypes, la stack et la méthode qui donnent les meilleurs résultats avec Claude Code ont été figées :

**Stack** : Vite + TypeScript strict + Canvas 2D vanilla + Vitest + ZzFX (SFX) + HTMLAudioElement (BGM). Aucun framework de jeu (pas de Phaser, pas de Three.js pour ces cas-là). Compilation sub-100ms, HMR, et le modèle génère du Canvas 2D très propre.

**Méthode** :

1. **Cloner un jeu de référence sous licence MIT** dont l'art plaît (ex. [coup-ahoo](https://github.com/anttihaavikko/coup-ahoo), js13kGames 2023).
2. **Porter les modules character en style fonctionnel** (pas Entity/Container OOP). Typiquement `face.ts` + `dude.ts` → `createFace(opts)` / `updateFace(s, now, dt)` / `drawFace(ctx, s)`.
3. **Créer un showcase mode** (`?showcase=1`) qui affiche UN perso en grand sur fond uni, pour itérer sur le rendu sans le bruit du gameplay.
4. **Itérer via screenshots Playwright + critique honnête**. 3 à 5 itérations par perso. La boucle "code → screenshot → critique nommée → fix ciblé" est le vrai multiplicateur : sans voir le rendu, le modèle hallucine.

La recette est détaillée dans [`games-skill/references-jeux-hackathon.md`](./games-skill/references-jeux-hackathon.md) (section "Stratégie gagnante pour créer un perso cartoon propre" + démystification honnête des leviers).

**Pourquoi tour-par-tour pour le hackathon** : le format Anthropic invite à exploiter les LLMs dans le gameplay. Le tour-par-tour s'y prête naturellement (décisions ennemies, narration générative, dialogues) sans devoir gérer la latence des appels API en temps réel.

## Prototype principal — alien-abduct

Jeu de combat tour-par-tour : un UFO hero défend une planète contre des vagues d'ennemis. État actuel :

- **v0** (tag `alien-abduct-v0`, commit `3b6c45d`) : gameplay fonctionnel mais visuel brut (5 vagues, 6 types de mobs, 37 tests verts, ~350 lignes de logique pure). Grey saucer, créatures génériques, planète verte uniforme, starfield statique.
- **v1** (tag `alien-abduct-v1`, commit `281931a`) : les 5 modules visuels "next level" (alien + soucoupe asymétrique, mob goomba cyclope, planète cartoon avec continents, background animé parallax + astéroïdes, armes bazooka/plasma) créés via la méthodo ci-dessous. Visibles **uniquement en showcase mode** (`?showcase=…`). Le jeu live reste en visuel v0.
- **v2** (tag `alien-abduct-v2`, merge `4aea566`, HEAD actuel de `main`) : intégration des assets v1 dans le pipeline de rendu live. La home `/` montre maintenant le jeu en v1 visuel. Ajoute palette par vague (WAVE_PALETTES), hit-zones mobs recalibrées pour le nouveau corps goomba, source de vérité unique `WEAPON_SPECS` pour que l'arme tenue par un mob matche exactement l'icône HUD qu'il drop.

### Comment on est passé de v0 à v1 → v2

Le saut visuel est entièrement dû à la **boucle itérative guidée par screenshots**, pas à un meilleur modèle ou à une génération one-shot.

Recette effectivement appliquée à chaque perso (alien, mob, planète, background, armes) :

1. **Spec grossière** — décrire en 2-3 phrases ce qu'on veut ("mob cyclope trapu, toujours énervé, posé sur le bord d'une planète, lisible de loin"). Pas de mood board détaillé.
2. **Première passe** via référence MIT (coup-ahoo) — porter les techniques : stacked strokes (noir épais + couleur plus fine), `quadraticCurveTo` pour courbes organiques, face composable via `globalCompositeOperation='multiply'`, palette sinusoïdale pour continents.
3. **Showcase mode** (`?showcase=mob`, `?showcase=planet`, `?showcase=bg`, `?showcase=1`) — route dédiée qui affiche UN asset en grand sur fond uni. Permet d'itérer sans le bruit du gameplay.
4. **Playwright screenshot → critique honnête → fix ciblé**. Le critère : "est-ce que ça ressemble à un jeu pro ?" Réponse nuancée, 2-3 défauts concrets cités. Sans voir le rendu, le modèle hallucine : "les crocs se mélangent au visage", "les antennes ressemblent à des pinces", "le violet du continent est plus clair que le fond → effet tache laiteuse".
5. Fix → commit → screenshot → recritique. 3 à 5 itérations par perso suffisent. Exemples réels rencontrés dans ce projet :
   - Mob v0 : crabe à 4 bras indistinct → mob goomba cyclope avec bouche-zigzag + sourcil angry (3 itérations).
   - Planète v0 : blobs polygonaux visibles → radii modulées par 2 sinusoïdes + midpoints-as-anchors smoothing (2 itérations après "je vois des angles").
   - Background v0 : wave clouds qui devenaient des grosses bulles rondes → remplacement par ceinture d'astéroïdes 3 couches parallax (pivot complet après retour "première fois que je suis déçu").
   - Armes v0 : petits guns noirs anonymes → bazooka mécanique rouge + sceptre plasma organique violet/cyan (1 itération).

**Le vrai multiplicateur** : la boucle "code → screenshot → critique nommée → fix ciblé". Sans le screenshot, le modèle ne peut pas corriger ce qu'il ne voit pas.

**La démystification honnête** est détaillée dans [`games-skill/references-jeux-hackathon.md`](./games-skill/references-jeux-hackathon.md) (section "Pourquoi ça marche — démystification honnête") : template-stealing depuis référence MIT + recombinaison d'archétypes + feedback-loop Playwright = ~80 % de ce qui ressemble à "une bonne direction artistique".

```bash
cd alien-abduct
npm install
npm run dev         # http://localhost:5173
npm test            # suite Vitest
```

URLs utiles pendant le dev :

- `http://localhost:5173/` — jeu live (v2 : assets v1 intégrés, palette par vague)
- `http://localhost:5173/?showcase=1` — alien + soucoupe
- `http://localhost:5173/?showcase=mob` — goomba (4 variantes) + armes v1
- `http://localhost:5173/?showcase=planet` — planète (5 palettes)
- `http://localhost:5173/?showcase=bg` — background animé (5 palettes, click = cycle)

Pour revenir à un état antérieur : `git checkout alien-abduct-v0` ou `alien-abduct-v1` (les tags pointent sur les merges correspondants).

## Prototypes antérieurs

### anti-scroll

Premier prototype, ~1h30. Smartphone fictif où un PNJ scrolle un feed TikTok ; le joueur interrompt avec notifications/appels. Enseignement validé : pour une UI 2D dominée par des animations déclenchées, une stack web standard (React + Tailwind + Framer Motion) peut suffire et cohabite bien avec Claude. Non retenue pour le hackathon — le tour-par-tour Canvas marche mieux avec la méthode "port depuis référence".

```bash
cd anti-scroll && npm install && npm run dev
```

### HexGL

Fork de [BKcore/HexGL](https://github.com/BKcore/HexGL) (course Wipeout-like WebGL). Ajouts : bot autonome (`tools/benchmark-ai.js`) + circuit perso. Cas d'usage : pilotage automatisé d'un jeu existant par un agent. Pas notre direction pour le hackathon mais conservé comme référence.

### Sketchbook

Fork de [swift502/Sketchbook](https://github.com/swift502/Sketchbook), sandbox Three.js + cannon.js. Gardé comme base réutilisable si un concept 3D est demandé, mais pas la direction actuelle.

## Arborescence

```
games/
├── alien-abduct/     jeu tour-par-tour — prototype principal du hackathon
├── anti-scroll/      prototype UI 2D (stack web standard)
├── coup-ahoo/        référence MIT clonée (port inspiration)
├── games-skill/      notes méthodo, specs, plans, références hackathon
├── HexGL/            fork 3D + bot (scripts Playwright y vivent aussi)
└── Sketchbook/       fork Three.js (sandbox 3D)
```

## Crédits et licences

- HexGL © [Thibaut Despoulain (BKcore)](https://github.com/BKcore) — MIT
- Sketchbook © [swift502](https://github.com/swift502) — MIT
- Coup Ahoo © [Matt McKenna](https://github.com/mattvonrocketstein) / [Antti Haavikko](https://github.com/anttihaavikko) — MIT (techniques de rendu portées pour alien-abduct ; voir attribution détaillée dans `alien-abduct/README.md`)
- Assets main (anti-scroll) : [OpenMoji](https://openmoji.org) — CC BY-SA 4.0
