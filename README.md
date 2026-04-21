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

- **v0** (tag `alien-abduct-v0`, merge `3b6c45d`) : gameplay fonctionnel (5 vagues, 6 types de mobs, 37 tests verts, ~350 lignes de logique pure).
- **v1** (branche `feat/alien-abduct-v1`, mergée) : refonte visuelle complète inspirée de coup-ahoo. Alien + soucoupe asymétrique, mob goomba cyclope, planète cartoon avec continents organiques, background animé (parallax stars + nébuleuses + ceinture d'astéroïdes). Visible en showcase mode, pas encore intégré dans le gameplay live.

```bash
cd alien-abduct
npm install
npm run dev         # http://localhost:5173
npm test            # suite Vitest
```

URLs utiles pendant le dev :

- `http://localhost:5173/` — jeu live (v0)
- `http://localhost:5173/?showcase=1` — alien + soucoupe
- `http://localhost:5173/?showcase=mob` — goomba (4 variantes)
- `http://localhost:5173/?showcase=planet` — planète (5 palettes)
- `http://localhost:5173/?showcase=bg` — background animé (5 palettes, click = cycle)

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
