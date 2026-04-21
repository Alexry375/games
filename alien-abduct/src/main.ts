import { createInitialState, spawnWave } from './game/state';
import { applyPlayerAction, resolveEnemyTurn } from './game/logic';
import { AnimQueue } from './game/anim';
import { resolveClick } from './input/input';
import { render } from './render/renderer';
import { startBgm } from './audio/bgm';
import { SFX } from './audio/sfx';
import { applyShake, drawPopups, isHitstopped, pushPopup, triggerFlash, triggerHitstop, triggerShake } from './render/feel';
import { mobPosition, ufoPosition } from './render/layout';
import { ANIM_DURATIONS, WAVE_COUNT } from './game/rules';
import type { GameState, AnimStep } from './game/types';

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

let state: GameState = spawnWave(createInitialState(), 0);
const queue = new AnimQueue();
let lastT = performance.now();
let phaseDelayEnd = 0;

state = { ...state, phase: 'WaveIntro' };
phaseDelayEnd = performance.now() + ANIM_DURATIONS.waveIntro;
SFX.waveStart();

canvas.addEventListener('pointerdown', (e) => {
  startBgm();
  if (state.phase !== 'PlayerTurn') return;
  const rect = canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  const res = resolveClick({ w: window.innerWidth, h: window.innerHeight }, state, px, py);
  if (res.kind === 'selectSlot') {
    state = { ...state, selectedSlot: res.slotIndex };
    SFX.click();
  } else if (res.kind === 'deselect') {
    state = { ...state, selectedSlot: null };
  } else if (res.kind === 'action') {
    const { state: newState, anims } = applyPlayerAction(state, res.action);
    pushFeelFromAnims(anims);
    state = newState;
    queue.enqueue(anims);
    SFX.click();
    if (res.action.kind === 'abduct') SFX.abduct();
    if (res.action.kind === 'fire') {
      const slot = state.slots[res.action.slotIndex];
      if (slot?.kind === 'pistol') SFX.shootPistol();
      else if (slot?.kind === 'cannon') SFX.shootCannon();
      else if (slot?.kind === 'pierce') SFX.shootPierce();
      else if (slot?.kind === 'smg') SFX.shootSmg();
      else if (slot?.kind === 'heal') SFX.heal();
    }
    state = { ...state, phase: 'Resolving' };
  }
});

function pushFeelFromAnims(anims: AnimStep[]): void {
  const vp = { w: window.innerWidth, h: window.innerHeight };
  for (const a of anims) {
    if (a.kind === 'hit') {
      const dmg = (a.data as { dmg?: number; targetUfo?: boolean }).dmg ?? 0;
      if ((a.data as any).targetUfo) {
        triggerShake(performance.now(), 4 + dmg * 2, 250);
        const up = ufoPosition(vp);
        pushPopup(performance.now(), up.x, up.y, `-${dmg}`, '#e53');
      } else {
        const mobId = (a.data as any).mobId as string;
        triggerFlash(performance.now(), mobId, 80);
        const m = state.mobs.find(x => x.id === mobId);
        if (m) {
          const pos = mobPosition(vp, m.angle);
          pushPopup(performance.now(), pos.x, pos.y, `-${dmg}`, '#fff');
        }
        if (dmg >= 2) triggerHitstop(performance.now(), 60);
      }
    } else if (a.kind === 'explode') {
      triggerShake(performance.now(), 12, 400);
      triggerHitstop(performance.now(), 80);
    } else if (a.kind === 'heal') {
      const up = ufoPosition(vp);
      pushPopup(performance.now(), up.x, up.y, `+heal`, '#5c5');
    }
  }
}

function frame(now: number) {
  const dt = now - lastT;
  lastT = now;

  if (!isHitstopped(now)) queue.tick(dt);

  if (state.phase === 'WaveIntro' && now > phaseDelayEnd) {
    state = { ...state, phase: 'PlayerTurn' };
  } else if (state.phase === 'Resolving' && queue.isEmpty) {
    if (state.ufo.hp <= 0) {
      state = { ...state, phase: 'Defeat' };
      SFX.defeat();
    } else if (state.mobs.length === 0) {
      state = { ...state, phase: 'WaveCleared' };
      phaseDelayEnd = now + ANIM_DURATIONS.waveCleared;
    } else {
      state = { ...state, phase: 'EnemyTurn' };
      const { state: s2, anims } = resolveEnemyTurn(state);
      pushFeelFromAnims(anims);
      state = s2;
      queue.enqueue(anims);
      state = { ...state, phase: 'Resolving' };
    }
  } else if (state.phase === 'WaveCleared' && now > phaseDelayEnd) {
    const next = state.waveIndex + 1;
    if (next >= WAVE_COUNT) {
      state = { ...state, phase: 'Victory' };
      SFX.victory();
    } else {
      state = spawnWave(state, next);
      state = { ...state, phase: 'WaveIntro', selectedSlot: null };
      phaseDelayEnd = now + ANIM_DURATIONS.waveIntro;
      SFX.waveStart();
      state = { ...state, slots: state.slots.map(w => w ? { ...w, cooldown: 0 } : null) as GameState['slots'] };
    }
  }

  ctx.save();
  applyShake(ctx, now);
  render(ctx, { w: window.innerWidth, h: window.innerHeight }, now, state);
  drawPopups(ctx, now, { w: window.innerWidth, h: window.innerHeight });
  ctx.restore();

  if (state.phase === 'WaveIntro') drawOverlay(`WAVE ${state.waveIndex + 1}`);
  else if (state.phase === 'Victory') drawOverlay('VICTOIRE', '#5c5');
  else if (state.phase === 'Defeat') drawOverlay('DÉFAITE', '#e53');

  requestAnimationFrame(frame);
}

function drawOverlay(text: string, color = '#fff') {
  ctx.save();
  ctx.fillStyle = '#0008';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 80px system-ui';
  ctx.fillText(text, window.innerWidth / 2, window.innerHeight / 2);
  ctx.restore();
}

requestAnimationFrame(frame);
