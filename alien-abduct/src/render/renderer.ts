import type { GameState, Mob } from '../game/types';
import { drawScene } from './scene';
import { drawUFO } from './ufo';
import { drawHud } from './hud';
import { MOB_CONFIGS } from './mob-configs';
import { MOB_TO_WEAPON, type MobV1WeaponKind } from '../game/rules';
import { WEAPON_SPECS } from './weapon';
import { mobPosition, type Viewport } from './layout';
import { createMob, drawMob, updateMob, type MobState } from './parts/mob';
import { createWeapon, drawWeapon, updateWeapon, type WeaponState } from './parts/weapon';
import { mobColorsForKindAndWave } from './palette';

// Goomba de parts/mob.ts est intrinsèquement petit (body ellipse 38×42). Pour rester
// lisible sur le bord de la planète, on multiplie la scale par-kind de MOB_CONFIGS.
const MOB_BASE_SCALE = 1.4;

type MobRenderEntry = {
  mob: MobState;
  weapon: WeaponState;
  kind: MobV1WeaponKind;
};

const mobRenderCache = new Map<string, MobRenderEntry>();
let lastT = -1;

function entryFor(m: Mob, waveIndex: number): MobRenderEntry {
  const existing = mobRenderCache.get(m.id);
  if (existing) return existing;
  const colors = mobColorsForKindAndWave(m.kind, waveIndex);
  const spec = WEAPON_SPECS[MOB_TO_WEAPON[m.kind]];
  const entry: MobRenderEntry = {
    mob: createMob(colors),
    weapon: createWeapon(spec.kind, { primary: spec.primary, secondary: spec.secondary, accent: spec.accent }),
    kind: spec.kind,
  };
  mobRenderCache.set(m.id, entry);
  return entry;
}

function gc(state: GameState): void {
  if (mobRenderCache.size === 0) return;
  const alive = new Set(state.mobs.map((m) => m.id));
  for (const id of mobRenderCache.keys()) if (!alive.has(id)) mobRenderCache.delete(id);
}

// Anchors du showcase (drawMobWithWeapon dans showcase.ts) : l'arme se tient dans
// la main droite du mob, en coord locales (après scale mob). Ajustés par kind d'arme.
function positionWeapon(ctx: CanvasRenderingContext2D, kind: MobV1WeaponKind): void {
  if (kind === 'bazooka') {
    ctx.translate(50, 12);
    ctx.rotate(-0.05);
  } else {
    ctx.translate(44, 26);
    ctx.rotate(0.1);
  }
}

export function render(ctx: CanvasRenderingContext2D, vp: Viewport, t: number, state: GameState): void {
  const dt = lastT < 0 ? 16 : Math.min(50, t - lastT);
  lastT = t;

  gc(state);

  drawScene(ctx, vp, t, state.waveIndex);
  drawUFO(ctx, vp, t, state.ufo.hp / state.ufo.hpMax);

  const sorted = state.mobs.slice().sort((a, b) => {
    const pa = mobPosition(vp, a.angle).y;
    const pb = mobPosition(vp, b.angle).y;
    return pa - pb;
  });

  for (const m of sorted) {
    const pos = mobPosition(vp, m.angle);
    const cfg = MOB_CONFIGS[m.kind];
    const e = entryFor(m, state.waveIndex);

    updateMob(e.mob, t, dt);
    updateWeapon(e.weapon, t);

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.rot);
    ctx.scale(cfg.size * MOB_BASE_SCALE, cfg.size * (cfg.stretchY ?? 1) * MOB_BASE_SCALE);

    drawMob(ctx, e.mob, t);

    ctx.save();
    positionWeapon(ctx, e.kind);
    drawWeapon(ctx, e.weapon);
    ctx.restore();

    if (m.hp < m.hpMax) {
      ctx.fillStyle = '#000a';
      ctx.fillRect(-26, -70, 52, 5);
      ctx.fillStyle = '#e53';
      ctx.fillRect(-26, -70, 52 * (m.hp / m.hpMax), 5);
    }

    ctx.restore();
  }

  drawHud(ctx, vp, t, state);
}
