import { drawScene } from './render/scene';
import { drawUFO } from './render/ufo';

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
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
