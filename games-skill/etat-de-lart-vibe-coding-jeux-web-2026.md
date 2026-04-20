# État de l'art 2026 — vibe coding de jeux web avec Claude Code

> Note de recherche — 2026-04-20

## 1. Plugins / skills de référence

Pas de plugin officiel Anthropic dédié au game dev web. Les références communautaires :

- **[OpusGameLabs/game-creator](https://github.com/OpusGameLabs/game-creator)** — le plus aligné avec du web game dev.
  - Installation : `npx skills add OpusGameLabs/game-creator`
  - Scaffold Phaser 3 `^3.90` (2D) ou Three.js `^0.183` (3D)
  - Commandes : `/make-game 2d mon-jeu`, `/improve-game`, `/qa-game` (tests Playwright auto), `/review-game`, `/add-assets`, `/add-audio` (Strudel.cc)
  - Particularité clé : chaque jeu expose `render_game_to_text()` retournant l'état en JSON → l'agent "lit" le jeu sans interpréter des pixels.
- **[Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)** — 49 agents + 72 skills simulant une hiérarchie de studio (ux-designer, ui-programmer, prototyper). `/prototype`, `/smoke-check`, `/soak-test`, `/playtest-report`. Orienté orchestration.
- **[htdt/godogen](https://github.com/htdt/godogen)** — pour cibler Godot web export.
- **[obra/superpowers](https://github.com/obra/superpowers)** — méta-skill (TDD, brainstorming, code review bloquant). À combiner par-dessus game-creator.
- Agrégateurs :
  - [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
  - [awesome-claude-plugins](https://github.com/quemsah/awesome-claude-plugins)
  - [tonsofskills.com](https://github.com/jeremylongshore/claude-code-plugins-plus-skills) (423 plugins, CLI `ccpi`)
  - [claudemarketplaces — catégorie game-dev](https://claudemarketplaces.com/skills/category/game-dev)

## 2. Stack technique recommandée

Le [comparatif Phaser.io d'avril 2026](https://phaser.io/news/2026/04/phaser-vs-kaplay-vs-excalibur-2d-web-game-framework) tranche : **Phaser 3 gagne en vibe coding** parce que les LLM hallucinent moins dessus (volume massif de docs/exemples dans les données d'entraînement). Kaplay et Excalibur sont plus ergonomiques mais produisent plus d'erreurs d'API.

Hiérarchie consensuelle 2026 :

| Besoin | Choix par défaut | Alternative |
|---|---|---|
| 2D web | **Phaser 3** | Kaplay (game jams), Canvas vanilla (<500 lignes) |
| 3D web | **Three.js** (WebGPU prod-ready) | Babylon.js (si besoin d'éditeur) |
| À éviter | Unity WebGL (build lent), Godot web export (friable) | — |

**Modèles** : Opus 4.7 pour l'architecture, Sonnet 4.6 comme daily driver. Source : [sentisight tier list](https://www.sentisight.ai/which-ai-llm-best-for-vibe-coding/).

## 3. Vérification visuelle

Deux MCP complémentaires :

- **[Playwright MCP](https://playwright.dev/docs/getting-started-mcp)** — flux utilisateur, screenshots, génère des fichiers de tests committables. Guide : [builder.io](https://www.builder.io/blog/playwright-mcp-server-claude-code). Skill alt : [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill).
- **[chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)** — erreurs console WebGL, network, Lighthouse, performance tracing. Setup : [raf.dev](https://raf.dev/blog/chrome-debugging-profile-mcp/). Casse le loop "write→hope→check" en "write→observe→fix".
- **Régression pixel** : Playwright standalone + `pixelmatch` (hors MCP).
- **Figma MCP** → code pour HUD/menus ([retour d'expérience](https://javascript.plainenglish.io/experience-story-figma-mcp-claude-code-playwright-68b20bb0f8ce)). Peu utile pour le gameplay lui-même.

## 4. Boucle de feedback efficace

Pattern QA de `game-creator` — après chaque change, 5 phases automatisées :

1. `npm run build`
2. Headless Chromium → capture des erreurs console WebGL
3. Replay d'actions gameplay
4. Validation d'architecture
5. Screenshots Playwright

Jusqu'à 3 autofix retries par phase. Vite dev server + HMR en backbone hot-reload. Slash commands persos dans `.claude/commands/` pour l'inner loop (`/playtest`, `/screenshot-scene`).

## 5. Retours terrain

- [Troy Scott — 2D shooter Phaser en 3h](https://troyscott.ca/posts/building-2d-shooter-phaser-claude/)
- [XDA — "vibe-coded game doesn't look vibe-coded"](https://www.xda-developers.com/i-vibe-coded-a-fully-functional-game-with-claude-code-and-it-doesnt-look-vibe-coded-at-all/)
- [alexop.dev — AI QA Engineer Claude Code + Playwright](https://alexop.dev/posts/building_ai_qa_engineer_claude_code_playwright/)
- [HuggingFace — VibeGame](https://huggingface.co/blog/vibegame)
- [YouTube — Vibe Coding 2D Games with Claude Code & Agent Skills](https://www.youtube.com/watch?v=QPZCMd5REP8)
- [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice) — comparatif Claude-in-Chrome vs chrome-devtools-mcp
- [Vibe Coding Game Jam 2026](https://www.utsubo.com/blog/threejs-2026-what-changed) : >1000 soumissions.

## TL;DR opérationnel

```bash
npx skills add OpusGameLabs/game-creator
# + Playwright MCP
# + chrome-devtools-mcp
# + Phaser 3 (2D) ou Three.js (3D)
# + Vite/HMR
# + superpowers en surcouche méthodo
# + Sonnet 4.6 daily, Opus 4.7 pour l'archi
```
