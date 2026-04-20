# games

Bac à sable de préparation pour le hackathon **Voodoo × Anthropic** (Paris, 25–26 avril 2026).

Co-dev : [@Alexry375](https://github.com/Alexry375) et [@DanielMbouyou](https://github.com/DanielMbouyou).

Ce dépôt est une **collection de ressources** pour trouver les **stacks idéales pour vibe-coder des jeux avec Claude Code**. Chaque sous-dossier est un test concret, pas une démo finie. L'objectif n'est pas de livrer des jeux — c'est de cartographier ce qui marche, ce qui hallucine, ce qui scale.

---

## 🧭 Ce qu'on cherche à apprendre

### Les stacks testées / à tester

| Besoin | Stack | Pourquoi |
|---|---|---|
| UI de jeu 2D pas trop complexe, surtout des animations déclenchées | **Next.js + React + Tailwind + Framer Motion + lucide + OKLCH** (DOM/CSS, pas de canvas) | Très proche d'une webapp normale — Claude est ultra-à-l'aise. On livre des UI propres vite. Limite : dès qu'il faut du temps réel ou beaucoup d'entités, ça casse. |
| 2D plus ambitieux (plateformer, shoot'em up, collisions, sprites) | **Phaser 3** (canvas/WebGL 2D) | Beaucoup de data dans l'entraînement → peu d'hallucinations. |
| Passer en 3D | **Three.js** (WebGL 3D) | Idem, gros corpus public → Claude génère du code qui tourne. |

### Tooling qu'on va vouloir câbler

- **Skill `OpusGameLabs/game-creator`** pour le scaffold initial
- **Playwright MCP + chrome-devtools-mcp** pour que Claude **voie ce qu'il code** (screenshots + erreurs console WebGL en boucle de feedback)
- **Vite / HMR** pour l'itération rapide

### Règle empirique qu'on teste

> **DOM/CSS tant que tu peux, Canvas dès que tu dois.** Dès qu'il y a du vrai temps réel, de la physique, ou beaucoup d'entités à l'écran → bascule sur canvas/WebGL.

---

## 🎮 anti-scroll — premier check « UI de jeu »

**Mon tout premier jeu web, codé en ~1h30.** Pas un jeu fini et addictif : un **test** pour valider qu'on peut livrer une UI vraiment pro avec Claude Code, sans le look « vibe-coded » typique (gradients pastel, emojis en guise d'icônes, arrondis partout, défauts shadcn).

### Concept

Un faux iPhone plein écran. Un PNJ scrolle un feed TikTok-like tout seul — sa main apparaît par le bas et swipe les vidéos. **Le joueur ne peut pas scroller.** À la place, il dispose d'une palette d'outils pour faire lâcher le téléphone au PNJ : notifs, appels, messages de la copine…

- **Jauge d'engagement** (gauche) : monte à chaque swipe. 100 % → défaite.
- **Jauge d'ennui** (droite) : monte à chaque outil utilisé, bonus si on interrompt un swipe en cours. 100 % → victoire, le PNJ pose son téléphone.
- **Cookie-Clicker** : on débloque de nouveaux outils au fil des usages.

### Ce qu'on a appris

- **UI-only 2D = stack webapp classique qui suffit largement.** Ici c'était surtout des déclenchements d'animations, donc Next.js + React + Tailwind + Framer Motion + lucide + OKLCH, 100 % DOM/CSS, pas de canvas.
- Claude sort une UI propre si on lui donne des **règles dures** (une seule hue OKLCH, shadows stackées, `tabular-nums`, jamais d'emoji comme icône…).
- **Je ne suis pas allé au bout** : pas de progression longue, pas de sons, pas de vrai polish gameplay. L'exercice était la surface, pas la boucle addictive.

### Lancer en local

```bash
cd anti-scroll
npm install
npm run dev
# → http://localhost:3000
```

---

## 🧪 games-skill — terrain d'expérimentation principal

C'est **ici qu'on va faire des dingueries**. À partir de maintenant je teste :

- **Phaser 3** pour un 2D plus ambitieux (plateformer, shoot'em up)
- **Three.js** pour toucher du 3D
- Intégration **Playwright MCP / chrome-devtools-mcp** pour la boucle de feedback visuelle
- Skill **game-creator** pour accélérer le scaffold

Chaque essai y atterrit comme une note ou un mini-projet. Le but : avant le jour J du hackathon, savoir **quelle stack prendre selon le concept**, les doigts dans le nez.

---

## 🏎️ HexGL — bot autonome

Fork de [BKcore/HexGL](https://github.com/BKcore/HexGL) (Wipeout-like WebGL). On a codé **un bot capable de jouer à HexGL tout seul** et **créé un circuit custom** pour le tester. Utile pour explorer le pilotage d'un jeu existant par un agent.

```bash
cd HexGL
npx serve .
```

---

## 🛹 Sketchbook — sandbox 3D réservée

Fork de [swift502/Sketchbook](https://github.com/swift502/Sketchbook) (Three.js + cannon.js : personnages, véhicules, avions, physique). Pas utilisé à fond — gardé comme **base potentiellement utile** si un concept 3D ambitieux émerge au hackathon, toute la plomberie physique + scène est déjà en place.

```bash
cd Sketchbook
npm install
npm run dev
```

---

## Arborescence

```
games/
├── anti-scroll/     ← 1er check UI, stack webapp classique
├── games-skill/     ← terrain principal d'expérimentation (Phaser, Three.js, MCP…)
├── HexGL/           ← fork + bot + circuit custom
└── Sketchbook/      ← fork Three.js, sandbox 3D en réserve
```

## Crédits

- HexGL © [Thibaut Despoulain (BKcore)](https://github.com/BKcore) — MIT
- Sketchbook © [swift502](https://github.com/swift502) — MIT
- OpenMoji — CC BY-SA 4.0
