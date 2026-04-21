// Icônes d'armes HUD. Utilise les 2 silhouettes v1 (bazooka / plasma-staff)
// avec une palette d'accent par WeaponKind (v0 : 6 kinds) pour rester distinguable.
// Rendu en petit (scale HUD_SCALE) dans les 3 slots du bas.

import type { WeaponKind } from '../game/types';
import { createWeapon, drawWeapon as drawV1Weapon, updateWeapon, type WeaponState } from './parts/weapon';

export type WeaponVisualSpec = {
  kind: 'bazooka' | 'plasma-staff';
  primary: string;
  secondary: string;
  accent: string;
};

// Source de vérité du visuel d'une arme v0 (silhouette + couleurs).
// Utilisé par le HUD ET par le mob qui tient l'arme avant abduct, pour que
// cliquer sur un mob au bazooka rouge donne un bazooka rouge dans le slot.
export const WEAPON_SPECS: Record<WeaponKind, WeaponVisualSpec> = {
  // Armes à projectile → bazooka, accents différenciés par rôle
  pistol: { kind: 'bazooka', primary: '#3a3a3a', secondary: '#6a6a6a', accent: '#ff6040' },
  cannon: { kind: 'bazooka', primary: '#4a2a1a', secondary: '#8a5a3a', accent: '#ffb020' },
  smg:    { kind: 'bazooka', primary: '#2a3a2a', secondary: '#5a7a5a', accent: '#fff060' },
  // Armes énergie / support → plasma-staff
  pierce: { kind: 'plasma-staff', primary: '#1a3a5a', secondary: '#3a6a9a', accent: '#8affff' },
  heal:   { kind: 'plasma-staff', primary: '#1a4a2a', secondary: '#3a8a5a', accent: '#a0ffa0' },
  bomb:   { kind: 'plasma-staff', primary: '#4a1a1a', secondary: '#8a3a3a', accent: '#ff80a0' },
};

const cache = new Map<WeaponKind, WeaponState>();
function stateFor(kind: WeaponKind): WeaponState {
  const existing = cache.get(kind);
  if (existing) return existing;
  const spec = WEAPON_SPECS[kind];
  const w = createWeapon(spec.kind, { primary: spec.primary, secondary: spec.secondary, accent: spec.accent });
  cache.set(kind, w);
  return w;
}

// Scale pour rentrer dans un slot HUD (~60-80px).
const HUD_SCALE = 0.42;

export function drawWeapon(ctx: CanvasRenderingContext2D, t: number, kind: WeaponKind): void {
  const w = stateFor(kind);
  updateWeapon(w, t);
  ctx.save();
  ctx.scale(HUD_SCALE, HUD_SCALE);
  // Recadrage : bazooka est dessiné sur [-25..45, -18..18] → centre ~(10, 0)
  //             plasma-staff sur [-15..20, -110..35] → centre ~(5, -35)
  if (WEAPON_SPECS[kind].kind === 'bazooka') {
    ctx.translate(-10, 0);
  } else {
    ctx.translate(-5, 35);
  }
  drawV1Weapon(ctx, w);
  ctx.restore();
}
