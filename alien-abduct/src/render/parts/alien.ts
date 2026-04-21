// Port adapté de coup-ahoo/src/dude.ts — alien debout sur une soucoupe.
// Mêmes techniques : stacked strokes (noir épais + couleur plus fine),
// courbes quadratiques pour jambes/bras, face composable avec ctx.globalCompositeOperation=multiply.

import { createFace, drawFace, updateFace, type FaceState } from './face';

export type AlienState = {
  face: FaceState;
  skin: string;
  mainColor: string; // chapeau / habit
  secondaryColor: string; // plume / accent
  animationSpeed: number; // ~0.005, variation per-alien
  flipHat: 1 | -1;
  posing: boolean;
  air: number; // 0..1, pour sauts (hop)
  height: number; // 0..1, décroît dans le temps après hop
  // animationPhase dérivé du temps global : sin(t * animationSpeed)
};

export function createAlien(opts: Partial<AlienState> = {}): AlienState {
  return {
    face: createFace({
      blush: '#ed4ea3aa',
      width: 0.55,
      eyeSize: 16,
      mouthWidth: 0.7,
      mouthThickness: 11,
      blushOffset: 5,
      blushSize: 1.0,
      color: '#000',
    }),
    skin: opts.skin ?? '#7fd98a', // vert alien
    mainColor: opts.mainColor ?? '#c23b3b',
    secondaryColor: opts.secondaryColor ?? '#f5d24a',
    animationSpeed: opts.animationSpeed ?? 0.005 * (0.8 + Math.random() * 0.4),
    flipHat: opts.flipHat ?? (Math.random() < 0.5 ? 1 : -1),
    posing: false,
    air: 0,
    height: 0,
  };
}

export function updateAlien(a: AlienState, now: number, dt: number): void {
  if (a.height > 0) a.height = Math.max(0, a.height - 0.0025 * dt);
  a.air = Math.sin((1 - a.height) * Math.PI);
  updateFace(a.face, now, dt);
}

function drawLeg(ctx: CanvasRenderingContext2D, dir: number, yoff: number, phaseAbs: number, air: number): void {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.lineJoin = 'round';
  ctx.moveTo(0, -30 - phaseAbs * 10);
  const diff = Math.max(0, Math.min(1, air - 0.5)) * 20;
  ctx.quadraticCurveTo(
    dir * 30 * (1 + phaseAbs * 0.2) - diff * 0.2 * dir,
    -30 - phaseAbs * 5 + diff - diff * 0.2 * dir + yoff,
    dir * 22 - diff * dir,
    diff + yoff
  );
  ctx.stroke();
}

function drawArm(ctx: CanvasRenderingContext2D, dir: number, yoff: number, phaseAbs: number, air: number, wave: number, posing: boolean): void {
  ctx.save();
  ctx.translate(dir * 22, -15 + phaseAbs * 10);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 7;
  ctx.beginPath();
  const diff = phaseAbs * -15;
  ctx.moveTo(0, diff - 15);
  ctx.quadraticCurveTo(
    dir * 20 - wave * 5 + air * -10,
    -20 + diff * 1.2 + (posing ? yoff : 0),
    dir * 15 + wave * 5,
    diff + air * -10
  );
  ctx.stroke();
  ctx.restore();
}

export function drawAlien(ctx: CanvasRenderingContext2D, a: AlienState, now: number): void {
  const phase = Math.sin(now * a.animationSpeed);
  const phaseAbs = Math.abs(phase);
  const wave = Math.sin(now * 0.005);

  ctx.save();
  ctx.lineCap = 'round';

  // Hauteur : déplacement vertical selon air/pose
  ctx.translate(0, -a.air * 50 - (a.posing ? 10 : 0));

  // Jambes (partent de y=0, descendent vers y>0 pour se poser sur la soucoupe)
  const raisePos = -45;
  drawLeg(ctx, 1, a.posing ? raisePos : 0, phaseAbs, a.air);
  drawLeg(ctx, -1, 0, phaseAbs, a.air);

  // Bob + rotation légère du torse
  ctx.translate(0, -phaseAbs * 6);
  ctx.rotate(wave * 0.05 - (a.posing ? 0.3 : 0));

  // Torse : plus trapu, part plus bas pour mieux voir les bras
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(0, -55);
  ctx.lineWidth = 56;
  ctx.strokeStyle = '#000';
  ctx.stroke();
  ctx.lineWidth = 44;
  ctx.strokeStyle = a.skin;
  ctx.stroke();

  // Bras partant du torse (plus bas pour être visibles à côté de la tête)
  ctx.save();
  ctx.translate(0, -10);
  drawArm(ctx, 1, a.posing ? -30 : 10 + phaseAbs * 10, phaseAbs, a.air, wave, a.posing);
  drawArm(ctx, -1, 0, phaseAbs, a.air, wave, a.posing);
  ctx.restore();

  // === TÊTE D'ALIEN === (grosse tête ovale, chevauche le haut du torse)
  ctx.translate(0, -90 - phaseAbs * 3);

  // Crâne : ellipse avec stacked strokes
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#000';
  ctx.fillStyle = a.skin;
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Antennes (remplace le chapeau de pirate) : 2 tiges quadratic avec boules
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 5;
  const antennaWag = wave * 8;
  for (const dir of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(dir * 14, -42);
    ctx.quadraticCurveTo(dir * 20 + antennaWag * dir, -65, dir * 16 + antennaWag * dir, -80);
    ctx.stroke();
    // Boule au bout
    ctx.fillStyle = a.mainColor;
    ctx.beginPath();
    ctx.arc(dir * 16 + antennaWag * dir, -80, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Face : visage interne de ~150 units de large (eye à ±50, blush à ±65)
  // On veut que ça tienne dans un crâne de 80 units → scale ~0.45
  ctx.save();
  ctx.translate(0, 5);
  ctx.scale(0.42, 0.42);
  ctx.globalCompositeOperation = 'multiply';
  drawFace(ctx, a.face);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  ctx.restore();
}

// Soucoupe « véhicule » sous l'alien, inspirée du bateau de Coup Ahoo mais sans voiles.
// À dessiner APRÈS les jambes ou AVANT selon z-order voulu ; ici version simple
// qu'on appelle avant drawAlien pour que l'alien soit posé dessus.
export function drawSaucer(ctx: CanvasRenderingContext2D, now: number, hpFrac: number): void {
  const bob = Math.sin(now * 0.002) * 4;
  const shake = (1 - hpFrac) * Math.sin(now * 0.04) * 3;

  ctx.save();
  ctx.translate(shake, bob);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Halo lumineux sous la soucoupe
  const glow = 0.5 + 0.5 * Math.sin(now * 0.008);
  ctx.save();
  ctx.globalAlpha = 0.2 + 0.15 * glow;
  ctx.fillStyle = '#9be8ff';
  ctx.beginPath();
  ctx.ellipse(0, 40, 100, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Corps de la soucoupe : ellipse plate, stacked strokes
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#8a95a8';
  ctx.beginPath();
  ctx.ellipse(0, 30, 100, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bande centrale plus claire
  ctx.fillStyle = '#b8c4d4';
  ctx.beginPath();
  ctx.ellipse(0, 24, 95, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lumières sous la soucoupe (hublots)
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(i * 30, 40, 5 + glow * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe86a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }

  ctx.restore();
}
