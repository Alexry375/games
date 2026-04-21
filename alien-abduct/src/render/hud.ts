import type { GameState } from '../game/types';
import { hpBarRect, slotRect, skipButtonRect, type Viewport } from './layout';
import { drawWeapon } from './weapon';
import { UFO_MAX_HP } from '../game/rules';

export function drawHud(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  t: number,
  state: GameState,
): void {
  const hp = hpBarRect(vp);
  ctx.fillStyle = '#000c';
  ctx.fillRect(hp.x - 2, hp.y - 2, hp.w + 4, hp.h + 4);
  ctx.fillStyle = '#2a1010';
  ctx.fillRect(hp.x, hp.y, hp.w, hp.h);
  ctx.fillStyle = '#e53';
  ctx.fillRect(hp.x, hp.y, hp.w * (state.ufo.hp / UFO_MAX_HP), hp.h);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(hp.x, hp.y, hp.w, hp.h);
  ctx.fillStyle = '#fff';
  ctx.font = '14px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`HP ${state.ufo.hp}/${UFO_MAX_HP}`, hp.x, hp.y - 6);

  for (let i = 0; i < 3; i++) {
    const idx = i as 0 | 1 | 2;
    const r = slotRect(vp, idx);
    ctx.strokeStyle = state.selectedSlot === idx ? '#ffe86a' : '#fffc';
    ctx.lineWidth = state.selectedSlot === idx ? 4 : 2;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.006);
    ctx.setLineDash(state.slots[idx] ? [] : [6, 6]);
    ctx.globalAlpha = state.slots[idx] ? 1 : 0.6 + pulse * 0.4;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0006';
    ctx.fillRect(r.x, r.y, r.w, r.h);

    const w = state.slots[idx];
    if (w) {
      ctx.save();
      ctx.translate(r.x + r.w / 2 - 8, r.y + r.h / 2);
      drawWeapon(ctx, t, w.kind);
      ctx.restore();
      if (w.cooldown > 0) {
        ctx.fillStyle = '#000a';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${r.h * 0.6}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText(`${w.cooldown}`, r.x + r.w / 2, r.y + r.h * 0.72);
      }
    }
  }

  ctx.fillStyle = '#fff';
  ctx.font = '18px system-ui';
  ctx.textAlign = 'right';
  ctx.fillText(`WAVE ${state.waveIndex + 1} / 5`, vp.w - 20, 30);

  const sb = skipButtonRect(vp);
  ctx.fillStyle = '#222c';
  ctx.fillRect(sb.x, sb.y, sb.w, sb.h);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(sb.x, sb.y, sb.w, sb.h);
  ctx.fillStyle = '#fff';
  ctx.font = '14px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Attendre', sb.x + sb.w / 2, sb.y + sb.h / 2);
  ctx.textBaseline = 'alphabetic';
}
