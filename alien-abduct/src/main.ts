import { drawScene } from './render/scene';
import { drawUFO } from './render/ufo';
import { drawCreature } from './render/creature';
import { mobPosition } from './render/layout';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const vp = () => ({ w: window.innerWidth, h: window.innerHeight });

function frame(t: number) {
  drawScene(ctx, vp(), t);
  drawUFO(ctx, vp(), t, 1);
  const m = mobPosition(vp(), 0);
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.rot);
  drawCreature(ctx, t, {
    bodyColor: '#8de86a', accentColor: '#4c9a3a',
    size: 0.9, eyeCount: 2, antennas: 2, armCount: 2, hat: 'none', weapon: 'pistol',
  }, 1);
  ctx.restore();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
