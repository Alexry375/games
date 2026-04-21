import { createInitialState, spawnWave } from './game/state';
import { render } from './render/renderer';

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

let state = spawnWave(createInitialState(), 0);
state = { ...state, phase: 'PlayerTurn' };

function frame(t: number) {
  render(ctx, vp(), t, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
