import { arcCenter, type Viewport } from './layout';
import { createBackground, drawBackground, updateBackground, type BgState } from './parts/background';
import { createPlanet, drawPlanet, updatePlanet, type PlanetState } from './parts/planet';
import { WAVE_PALETTES } from './palette';

type Cache = {
  waveIndex: number;
  vpW: number;
  vpH: number;
  bg: BgState;
  planet: PlanetState;
};

let cache: Cache | null = null;
let lastT = -1;

function ensureCache(vp: Viewport, waveIndex: number): Cache {
  const palette = WAVE_PALETTES[waveIndex % WAVE_PALETTES.length];
  const { r } = arcCenter(vp);
  if (
    cache &&
    cache.waveIndex === waveIndex &&
    cache.vpW === vp.w &&
    cache.vpH === vp.h
  ) {
    return cache;
  }
  cache = {
    waveIndex,
    vpW: vp.w,
    vpH: vp.h,
    bg: createBackground(palette.bg, vp.w, vp.h),
    planet: createPlanet({ radius: r, palette: palette.planet }),
  };
  return cache;
}

export function drawScene(ctx: CanvasRenderingContext2D, vp: Viewport, t: number, waveIndex: number): void {
  const c = ensureCache(vp, waveIndex);
  const dt = lastT < 0 ? 16 : Math.min(50, t - lastT);
  lastT = t;

  updateBackground(c.bg, t, dt, vp);
  updatePlanet(c.planet, t, dt);

  drawBackground(ctx, c.bg, t, vp);

  const { cx, cy } = arcCenter(vp);
  ctx.save();
  ctx.translate(cx, cy);
  drawPlanet(ctx, c.planet);
  ctx.restore();
}
