import type { WeaponKind } from '../game/types';
import { drawWeapon } from './weapon';

export type CreatureConfig = {
  bodyColor: string;
  accentColor: string;
  size: number;
  eyeCount: 1 | 2 | 3;
  antennas: 0 | 1 | 2;
  armCount: 2 | 4;
  hat: 'none' | 'cross' | 'cap';
  stretchY?: number;
  weapon: WeaponKind;
};

export function drawCreature(
  ctx: CanvasRenderingContext2D,
  t: number,
  config: CreatureConfig,
  hpFrac: number,
): void {
  const wave = Math.sin(t * 0.004);
  const bob = Math.sin(t * 0.006);
  const blink = Math.max(0, Math.sin(t * 0.002 + config.bodyColor.length));
  const s = config.size;
  const sy = config.stretchY ?? 1;

  ctx.save();
  ctx.scale(s, s * sy);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#000';

  drawLeg(ctx, -1, t);
  drawLeg(ctx, +1, t);

  ctx.translate(0, bob * 3 - 20);
  ctx.fillStyle = config.bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 36, wave * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (config.armCount === 4) {
    drawArm(ctx, -1, -8, t, 0);
    drawArm(ctx, +1, -8, t, 0);
    drawArm(ctx, -1, 8, t, 0.8);
    drawArm(ctx, +1, 8, t, 0.8);
  } else {
    drawArm(ctx, -1, 0, t, 0);
    drawArm(ctx, +1, 0, t, 0);
  }

  ctx.save();
  ctx.translate(0, -44 + wave * 1.5);
  ctx.fillStyle = config.bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  const eyeSpacing = config.eyeCount === 1 ? 0 : 9;
  const eyes = config.eyeCount === 3 ? [-12, 0, 12] : config.eyeCount === 2 ? [-eyeSpacing, eyeSpacing] : [0];
  for (const ex of eyes) {
    const ey = 5 * blink + 2;
    ctx.beginPath();
    ctx.ellipse(ex, -2, 5, ey, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(ex, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
  }

  for (let i = 0; i < config.antennas; i++) {
    const dir = config.antennas === 1 ? 0 : i === 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(dir * 8, -16);
    ctx.quadraticCurveTo(dir * (12 + wave * 3), -28, dir * (8 + wave * 2), -38);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = config.accentColor;
    ctx.beginPath();
    ctx.arc(dir * (8 + wave * 2), -38, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 7;
  }

  if (config.hat === 'cross') {
    ctx.save();
    ctx.translate(0, -22);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.rect(-12, -10, 24, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e53';
    ctx.fillRect(-8, -2, 16, 4);
    ctx.fillRect(-2, -8, 4, 16);
    ctx.restore();
  } else if (config.hat === 'cap') {
    ctx.save();
    ctx.translate(0, -20);
    ctx.fillStyle = config.accentColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 8, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(22, -5 + wave * 2);
  ctx.rotate(wave * 0.08);
  drawWeapon(ctx, t, config.weapon);
  ctx.restore();

  ctx.restore();

  if (hpFrac < 1) {
    ctx.save();
    ctx.translate(0, -80);
    ctx.fillStyle = '#000a';
    ctx.fillRect(-18, 0, 36, 4);
    ctx.fillStyle = '#e53';
    ctx.fillRect(-18, 0, 36 * hpFrac, 4);
    ctx.restore();
  }
}

function drawLeg(ctx: CanvasRenderingContext2D, dir: number, t: number): void {
  const swing = Math.sin(t * 0.01 + dir * Math.PI / 2) * 3;
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(dir * 12 + swing, 12, dir * 14 + swing, 24);
  ctx.stroke();
  ctx.restore();
}

function drawArm(ctx: CanvasRenderingContext2D, dir: number, yoff: number, t: number, phase: number): void {
  const swing = Math.sin(t * 0.008 + phase + dir) * 4;
  ctx.save();
  ctx.translate(dir * 18, yoff - 10);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(dir * 10 + swing, 8, dir * 14 + swing, 14);
  ctx.stroke();
  ctx.restore();
}
