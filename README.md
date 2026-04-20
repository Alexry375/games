# games

Bac à sable de préparation pour le hackathon **Voodoo × Anthropic** (Paris, 25–26 avril 2026).

Co-dev : [@Alexry375](https://github.com/Alexry375) et [@DanielMbouyou](https://github.com/DanielMbouyou).

---

## 🎮 anti-scroll (projet principal)

**Mon tout premier jeu web, codé en ~1h30.** L'objectif n'était pas de livrer un jeu fini et addictif, mais de **tester la capacité de Claude Code à produire une UI vraiment pro**, sans le look « vibe-coded » typique (gradients pastel, emojis en guise d'icônes, arrondis partout, défauts shadcn).

### Concept

Un faux iPhone plein écran. Un PNJ scrolle un feed TikTok-like tout seul — sa main apparaît par le bas et swipe les vidéos. **Le joueur ne peut pas scroller.** À la place, il dispose d'une palette d'outils pour faire lâcher le téléphone au PNJ : notifs, appels, messages de la copine…

- **Jauge d'engagement** (gauche) : monte à chaque swipe. 100 % → défaite.
- **Jauge d'ennui** (droite) : monte à chaque outil utilisé, bonus si on interrompt un swipe en cours. 100 % → victoire, le PNJ pose son téléphone.
- **Cookie-Clicker** : on débloque de nouveaux outils au fil des usages (Appel Maman après 5 notifs, Message Camille après 10 usages cumulés).

### Statut honnête

Ce qui est bien : l'UI (bezel iOS, Dynamic Island, status bar, toasts, appel entrant plein écran, grain SVG, typo `-apple-system` à l'intérieur du téléphone, tokens OKLCH, shadows stackées à la Josh Comeau). Ça ne ressemble pas à un truc généré à la chaîne.

Ce qui manque : **je ne suis pas allé au bout de l'idée**. Le jeu tient debout mais n'est pas vraiment addictif — pas de progression longue, pas de vrais paliers de difficulté, pas de sons, pas de polish gameplay. L'exercice était de valider que je peux livrer une belle surface, pas un jeu complet. Le cœur du hackathon sera de transformer cette base en vraie boucle addictive.

### Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind v4** (tokens OKLCH via `@theme inline`)
- **Framer Motion** pour les animations (spring, AnimatePresence)
- **lucide-react** (jamais d'emoji comme icône)
- Main du PNJ : SVG adapté d'[OpenMoji](https://openmoji.org) (CC BY-SA 4.0)
- 100 % DOM/CSS — pas de Canvas, pas de Three.js, pas de Phaser

### Lancer en local

```bash
cd anti-scroll
npm install
npm run dev
# → http://localhost:3000
```

---

## 🏎️ HexGL — bot autonome

Fork de [BKcore/HexGL](https://github.com/BKcore/HexGL) (Wipeout-like WebGL). On a codé **un bot capable de jouer à HexGL tout seul** et **créé un circuit custom** pour le tester. Utile pour explorer le pilotage d'un jeu existant par un agent.

```bash
cd HexGL
# serveur statique (python, serve, ou autre)
npx serve .
```

---

## 🛹 Sketchbook — sandbox 3D

Fork de [swift502/Sketchbook](https://github.com/swift502/Sketchbook) (sandbox Three.js + cannon.js : personnages, véhicules, avions, physique). Pas utilisé à fond, gardé comme **base potentiellement utile** si on veut partir sur un concept 3D au hackathon — toute la plomberie physique + scène est déjà en place.

```bash
cd Sketchbook
npm install
npm run dev
```

---

## Arborescence

```
games/
├── anti-scroll/     ← premier jeu web, UI-first
├── HexGL/           ← fork + bot + circuit custom
├── Sketchbook/      ← fork, sandbox 3D réservé pour idées
└── games-skill/     ← notes skill/méta
```

## Crédits

- HexGL © [Thibaut Despoulain (BKcore)](https://github.com/BKcore) — MIT
- Sketchbook © [swift502](https://github.com/swift502) — MIT
- OpenMoji — CC BY-SA 4.0
