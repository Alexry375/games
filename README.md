# games

Dépôt de préparation pour le hackathon **Voodoo × Anthropic** (Paris, 25–26 avril 2026).

Collaborateurs : [@Alexry375](https://github.com/Alexry375), [@DanielMbouyou](https://github.com/DanielMbouyou).

## Objectif

Ce dépôt regroupe des expérimentations visant à identifier les **stacks les plus efficaces pour développer des jeux web avec Claude Code**. Chaque sous-dossier correspond à un test ciblé. L'objectif n'est pas de livrer des jeux finis, mais de cartographier, pour chaque type de gameplay, la stack qui minimise les hallucinations du modèle et maximise la qualité du résultat.

## Stacks évaluées

| Type de jeu | Stack retenue | Justification |
|---|---|---|
| UI 2D non temps réel (animations déclenchées, logique d'état simple) | Next.js + React + Tailwind + Framer Motion (DOM/CSS) | Corpus d'entraînement massif sur le web standard ; Claude produit une UI propre rapidement. Limite : ne scale pas sur le temps réel ou les nombreuses entités. |
| 2D ambitieux (plateformer, shoot'em up, physique, sprites) | Phaser 3 (Canvas/WebGL) | Large documentation publique ; le modèle génère du code fiable. |
| 3D | Three.js (WebGL) | Même raison ; écosystème mature et bien documenté. |

**Heuristique retenue** : DOM/CSS par défaut, bascule sur Canvas/WebGL dès que le gameplay exige du temps réel, de la physique ou un grand nombre d'entités à l'écran.

## Outillage ciblé

- **Skill `OpusGameLabs/game-creator`** pour le scaffolding initial
- **Playwright MCP** et **chrome-devtools-mcp** pour fournir au modèle une boucle de feedback visuelle (captures d'écran, erreurs console WebGL)
- **Vite / HMR** pour l'itération rapide

---

## anti-scroll

Premier prototype, réalisé en environ 1 h 30. Son objectif était de vérifier qu'il est possible de livrer une interface soignée avec Claude Code, dans le temps contraint d'un hackathon. La boucle de gameplay n'a pas été poussée à maturité.

Concept : un smartphone fictif sur lequel un PNJ scrolle seul un feed de type TikTok. Le joueur ne peut pas interagir avec le feed mais dispose d'une palette d'outils (notifications, appels, messages) pour interrompre le scroll.

Enseignement : une UI 2D dominée par des animations déclenchées peut être livrée avec une stack web standard, sans recours au canvas.

```bash
cd anti-scroll
npm install
npm run dev
```

## games-skill

Dossier principal d'expérimentation pour la suite. Y seront traitées les itérations suivantes :

- Phaser 3 sur un 2D plus ambitieux (plateformer, shoot'em up)
- Three.js sur un prototype 3D
- Intégration de Playwright MCP et chrome-devtools-mcp
- Utilisation de la skill `game-creator`

Finalité : disposer, avant le hackathon, d'une cartographie exploitable associant type de jeu, stack recommandée, outillage, et pièges courants.

## HexGL

Fork de [BKcore/HexGL](https://github.com/BKcore/HexGL), jeu de course de type Wipeout en WebGL. Ajouts : un bot autonome capable de jouer seul (`tools/benchmark-ai.js`) et un circuit personnalisé. Cas d'usage : pilotage automatisé d'un jeu existant par un agent.

```bash
cd HexGL
npm install                      # dépendances Playwright pour le bot

# Exécution manuelle (http://localhost:8000)
python3 -m http.server 8000

# Exécution du bot
node tools/benchmark-ai.js       # plusieurs runs auto-pilotés
node tools/capture-console.js    # run instrumenté avec capture console
```

## Sketchbook

Fork de [swift502/Sketchbook](https://github.com/swift502/Sketchbook), sandbox Three.js + cannon.js (personnages, véhicules, avions, physique). Conservé comme base réutilisable pour un éventuel concept 3D : la plomberie scène et physique est déjà en place.

```bash
cd Sketchbook
npm install
npm run dev
```

---

## Arborescence

```
games/
├── anti-scroll/    UI 2D, stack web standard
├── games-skill/    expérimentations principales (Phaser, Three.js, MCP)
├── HexGL/          fork + bot + circuit personnalisé
└── Sketchbook/     fork Three.js, sandbox 3D réservée
```

## Crédits et licences

- HexGL © [Thibaut Despoulain (BKcore)](https://github.com/BKcore) — MIT
- Sketchbook © [swift502](https://github.com/swift502) — MIT
- Assets main (anti-scroll) : [OpenMoji](https://openmoji.org) — CC BY-SA 4.0
