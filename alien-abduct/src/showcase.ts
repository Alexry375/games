// Showcase mode : affiche un perso en grand au centre sur fond sombre.
// ?showcase=1    → alien + soucoupe (hero)
// ?showcase=mob  → mob goomba
// Pas de gameplay, juste une boucle de rendu pour itérer sur l'UI par screenshots.

import { createAlien, drawAlien, drawSaucerBowl, drawSaucerShadow, updateAlien } from './render/parts/alien';
import { createMob, drawMob, updateMob, type MobState } from './render/parts/mob';
import { createWeapon, drawWeapon, updateWeapon, type WeaponKind, type WeaponState } from './render/parts/weapon';
import { createPlanet, drawPlanet, drawStars, PLANET_PALETTES, updatePlanet, type PlanetState } from './render/parts/planet';
import { BG_PALETTES, createBackground, drawBackground, updateBackground, type BgState } from './render/parts/background';

export function runShowcase(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const mode = new URLSearchParams(location.search).get('showcase');

  if (mode === 'mob') {
    runMobShowcase(canvas, ctx);
  } else if (mode === 'planet') {
    runPlanetShowcase(canvas, ctx);
  } else if (mode === 'bg') {
    runBgShowcase(canvas, ctx);
  } else {
    runHeroShowcase(canvas, ctx);
  }
}

function runBgShowcase(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  let paletteIdx = 2; // violette par défaut
  let bg: BgState = createBackground(BG_PALETTES[paletteIdx], window.innerWidth, window.innerHeight);
  let last = performance.now();

  // Click pour cycler les palettes
  canvas.addEventListener('pointerdown', () => {
    paletteIdx = (paletteIdx + 1) % BG_PALETTES.length;
    bg = createBackground(BG_PALETTES[paletteIdx], window.innerWidth, window.innerHeight);
  });

  function frame(now: number) {
    const dt = Math.min(50, now - last);
    last = now;
    const vp = { w: window.innerWidth, h: window.innerHeight };
    updateBackground(bg, now, dt, vp);
    drawBackground(ctx, bg, now, vp);

    ctx.fillStyle = '#fffc';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SHOWCASE BG — palette ${paletteIdx + 1}/${BG_PALETTES.length} (click pour changer)`, vp.w / 2, 28);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function runPlanetShowcase(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  const big = createPlanet({ radius: 260, palette: PLANET_PALETTES[2] });
  const mini: PlanetState[] = PLANET_PALETTES.map((pal) => createPlanet({ radius: 70, palette: pal, rotation: Math.random() * Math.PI * 2 }));
  let last = performance.now();

  function frame(now: number) {
    const dt = Math.min(50, now - last);
    last = now;
    updatePlanet(big, now, dt);
    for (const m of mini) updatePlanet(m, now, dt);

    const vp = { w: window.innerWidth, h: window.innerHeight };
    ctx.fillStyle = '#040610';
    ctx.fillRect(0, 0, vp.w, vp.h);

    ctx.fillStyle = '#666';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHOWCASE PLANET — gros plan + 5 palettes par vague', vp.w / 2, 28);

    // Gros plan en haut
    ctx.save();
    ctx.translate(vp.w / 2, vp.h * 0.42);
    drawStars(ctx, big, now);
    drawPlanet(ctx, big);
    ctx.restore();

    // Ligne de 5 variantes
    for (let i = 0; i < mini.length; i++) {
      const x = vp.w * (0.15 + 0.175 * i);
      ctx.save();
      ctx.translate(x, vp.h * 0.86);
      drawPlanet(ctx, mini[i]);
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function runHeroShowcase(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  const alien = createAlien();
  let last = performance.now();

  canvas.addEventListener('pointerdown', () => {
    alien.face.angry = !alien.face.angry;
  });

  function frame(now: number) {
    const dt = Math.min(50, now - last);
    last = now;
    updateAlien(alien, now, dt);

    const vp = { w: window.innerWidth, h: window.innerHeight };
    ctx.fillStyle = '#0a0a16';
    ctx.fillRect(0, 0, vp.w, vp.h);

    ctx.fillStyle = '#666';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHOWCASE HERO — click to toggle angry', vp.w / 2, 28);

    ctx.save();
    ctx.translate(vp.w / 2, vp.h * 0.75);
    ctx.scale(2.4, 2.4);
    drawSaucerShadow(ctx, now);
    drawAlien(ctx, alien, now);
    drawSaucerBowl(ctx, now, 1.0);
    ctx.restore();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function runMobShowcase(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  // 4 mobs × 2 types d'armes alternés
  const kinds: WeaponKind[] = ['bazooka', 'plasma-staff', 'bazooka', 'plasma-staff'];
  const mobs: Array<{ m: MobState; w: WeaponState; x: number; scale: number }> = [
    { m: createMob(), w: createWeapon(kinds[0]), x: 0.17, scale: 2.4 },
    { m: createMob({ skin: '#a03030', belly: '#d35555', hornColor: '#5a0d0d' }), w: createWeapon(kinds[1]), x: 0.39, scale: 2.4 },
    { m: createMob({ skin: '#2a8a5a', belly: '#4fbf82', hornColor: '#103d26' }), w: createWeapon(kinds[2]), x: 0.61, scale: 2.4 },
    { m: createMob({ skin: '#c28a20', belly: '#e5b855', hornColor: '#5a3d0a', eyeColor: '#ffefc2' }), w: createWeapon(kinds[3]), x: 0.83, scale: 2.4 },
  ];
  // 2 gros au centre, un avec chaque arme, pour voir le détail
  const bigMobBazooka = createMob();
  const bigWeaponBazooka = createWeapon('bazooka');
  const bigMobPlasma = createMob({ skin: '#6a2a8a', belly: '#a04fbf', hornColor: '#3a0d5a' });
  const bigWeaponPlasma = createWeapon('plasma-staff');
  let last = performance.now();

  function frame(now: number) {
    const dt = Math.min(50, now - last);
    last = now;
    for (const { m, w } of mobs) { updateMob(m, now, dt); updateWeapon(w, now); }
    updateMob(bigMobBazooka, now, dt); updateWeapon(bigWeaponBazooka, now);
    updateMob(bigMobPlasma, now, dt); updateWeapon(bigWeaponPlasma, now);

    const vp = { w: window.innerWidth, h: window.innerHeight };
    ctx.fillStyle = '#0a0a16';
    ctx.fillRect(0, 0, vp.w, vp.h);

    ctx.fillStyle = '#666';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHOWCASE MOB — goomba + 2 armes (bazooka / bâton plasma)', vp.w / 2, 28);

    // Gros plan : bazooka à gauche, plasma à droite
    drawMobWithWeapon(ctx, bigMobBazooka, bigWeaponBazooka, 'bazooka', vp.w * 0.30, vp.h * 0.4, 4.0, now);
    drawMobWithWeapon(ctx, bigMobPlasma, bigWeaponPlasma, 'plasma-staff', vp.w * 0.70, vp.h * 0.4, 4.0, now);

    // Ligne de variantes en bas (4 mobs armés)
    for (const { m, w, x, scale } of mobs) {
      drawMobWithWeapon(ctx, m, w, w.kind, vp.w * x, vp.h * 0.84, scale, now);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Dessine un mob à (cx, cy) avec son arme en main droite (bras droit du mob).
// Le bras droit du mob est en (32, 20) à scale 1 → on ancre l'arme là.
function drawMobWithWeapon(
  ctx: CanvasRenderingContext2D,
  m: MobState, w: WeaponState, kind: WeaponKind,
  cx: number, cy: number, scale: number, now: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  drawMob(ctx, m, now);
  // Position main droite : sortie du bras à ~(32-44, 20)
  ctx.save();
  if (kind === 'bazooka') {
    // Bazooka : décalé franchement à droite du mob, pointant horizontal
    ctx.translate(50, 12);
    ctx.rotate(-0.05);
  } else {
    // Plasma staff : ancré main droite, l'orbe dépasse haut-droite
    ctx.translate(44, 26);
    ctx.rotate(0.1);
  }
  drawWeapon(ctx, w);
  ctx.restore();
  ctx.restore();
}
