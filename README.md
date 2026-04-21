# games

Hackathon **Voodoo × Anthropic** (Paris, 25–26 avril 2026).
Collaborateurs : [@Alexry375](https://github.com/Alexry375), [@DanielMbouyou](https://github.com/DanielMbouyou).

![alien-abduct v2](games-skill/RESSOURCES/Capture%20d%E2%80%99e%CC%81cran%20du%202026-04-21%2022-08-07.png)

## Stack & méthode

**Stack** : Vite + TypeScript strict + Canvas 2D vanilla + Vitest + ZzFX + HTMLAudioElement. Pas de framework de jeu.

**Méthode** (recette complète : [`games-skill/references-jeux-hackathon.md`](./games-skill/references-jeux-hackathon.md)) :

1. Cloner un jeu de référence MIT dont l'art plaît (ex. [coup-ahoo](https://github.com/anttihaavikko/coup-ahoo)).
2. Porter les modules en style fonctionnel (`createX` / `updateX` / `drawX`).
3. Créer un showcase mode (`?showcase=…`) : un asset en grand sur fond uni.
4. Boucle **code → screenshot Playwright → critique nommée → fix ciblé**. 3–5 itérations / perso.

Le screenshot est le vrai multiplicateur : sans voir le rendu, le modèle hallucine. Tour-par-tour choisi pour exploiter les LLMs dans le gameplay sans contrainte latence.

## Prototype principal — alien-abduct

Combat tour-par-tour : UFO hero vs vagues d'ennemis.

- **v0** (`alien-abduct-v0`) : gameplay OK, visuel brut (37 tests verts, ~350 l.).
- **v1** (`alien-abduct-v1`) : 5 modules "next level" (alien, mob goomba cyclope, planète cartoon, background parallax, armes bazooka/plasma). Visibles en showcase seulement.
- **v2** (HEAD `main`) : assets v1 intégrés live. Palette par vague, hit-zones recalibrées, `WEAPON_SPECS` comme source unique (arme mob = icône HUD).

### Exemples concrets d'itérations (v0 → v1)

- Mob : crabe 4 bras → goomba cyclope bouche-zigzag (3 itérations).
- Planète : blobs polygonaux → radii modulées par 2 sinusoïdes + smoothing (2).
- Background : wave clouds → ceinture d'astéroïdes 3 couches parallax (pivot complet).
- Armes : guns noirs → bazooka rouge + sceptre plasma (1).

```bash
cd alien-abduct && npm install && npm run dev   # http://localhost:5173
npm test
```

- `/` — jeu live (v2)
- `/?showcase=1` — alien + soucoupe
- `/?showcase=mob` — goomba (4 variantes) + armes
- `/?showcase=planet` — planète (5 palettes)
- `/?showcase=bg` — background (5 palettes, click = cycle)

Revenir en arrière : `git checkout alien-abduct-v0|v1`.

## Prototypes antérieurs

- **anti-scroll** — UI 2D (React + Tailwind + Framer Motion). Valide : stack web standard OK pour UI dominée par animations. Non retenu.
- **HexGL** — fork [BKcore/HexGL](https://github.com/BKcore/HexGL) (Wipeout-like WebGL) + bot autonome + circuit perso. Conservé comme référence.
- **Sketchbook** — fork [swift502/Sketchbook](https://github.com/swift502/Sketchbook), sandbox Three.js + cannon.js. Base 3D si besoin.

## Arborescence

```
alien-abduct/   prototype principal
anti-scroll/    prototype UI 2D web
coup-ahoo/      référence MIT (port inspiration)
games-skill/    méthodo, specs, plans
HexGL/          fork 3D + bot
Sketchbook/     fork Three.js
```

## Crédits

- HexGL © [BKcore](https://github.com/BKcore) — MIT
- Sketchbook © [swift502](https://github.com/swift502) — MIT
- Coup Ahoo © [Antti Haavikko](https://github.com/anttihaavikko) — MIT (techniques portées, détails dans `alien-abduct/README.md`)
- OpenMoji (anti-scroll) — CC BY-SA 4.0
