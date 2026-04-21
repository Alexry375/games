// Showcase mode : affiche l'alien + soucoupe en grand au centre sur fond sombre.
// Activé via ?showcase=1 dans main.ts. Pas de gameplay, juste une boucle de rendu
// pour itérer sur l'UI character par screenshots.

import { createAlien, drawAlien, drawSaucerBowl, drawSaucerShadow, updateAlien } from './render/parts/alien';

export function runShowcase(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const alien = createAlien();
  let last = performance.now();

  // toggle angry en cliquant, pour vérifier la face
  canvas.addEventListener('pointerdown', () => {
    alien.face.angry = !alien.face.angry;
  });

  function frame(now: number) {
    const dt = Math.min(50, now - last);
    last = now;
    updateAlien(alien, now, dt);

    const vp = { w: window.innerWidth, h: window.innerHeight };
    // Fond sombre uni
    ctx.fillStyle = '#0a0a16';
    ctx.fillRect(0, 0, vp.w, vp.h);

    // Label en haut
    ctx.fillStyle = '#666';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHOWCASE — alien on saucer (click to toggle angry)', vp.w / 2, 28);

    // Perso centré, échelle grande (×3) pour iterer visuellement
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
