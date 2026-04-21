import type { GameState } from '../game/types';
import { drawScene } from './scene';
import { drawUFO } from './ufo';
import { drawCreature } from './creature';
import { drawHud } from './hud';
import { configFor } from './mob-configs';
import { mobPosition, type Viewport } from './layout';

export function render(ctx: CanvasRenderingContext2D, vp: Viewport, t: number, state: GameState): void {
  drawScene(ctx, vp, t);
  drawUFO(ctx, vp, t, state.ufo.hp / state.ufo.hpMax);

  const sorted = state.mobs.slice().sort((a, b) => {
    const pa = mobPosition(vp, a.angle).y;
    const pb = mobPosition(vp, b.angle).y;
    return pa - pb;
  });
  for (const m of sorted) {
    const pos = mobPosition(vp, m.angle);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.rot);
    drawCreature(ctx, t, configFor(m.kind), m.hp / m.hpMax);
    ctx.restore();
  }

  drawHud(ctx, vp, t, state);
}
