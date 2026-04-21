// Palette globale par vague : planète + background partagent le même thème visuel
// pour une cohérence forte (chaque vague a une identité chromatique).
// Les couleurs des mobs dérivent aussi de la palette planète (continents comme skin).

import { PLANET_PALETTES, type PlanetPalette } from './parts/planet';
import { BG_PALETTES, type BgPalette } from './parts/background';

export type WavePalette = {
  planet: PlanetPalette;
  bg: BgPalette;
};

// Ordre dramatique : violet (wave 1, confirmé) → vert → martien → glacial → volcanique (final).
// Les index pointent dans PLANET_PALETTES et BG_PALETTES qui sont déjà alignés
// (idx 0=vert, 1=martien, 2=violet, 3=volcanique, 4=glacial).
const PALETTE_ORDER = [2, 0, 1, 4, 3] as const;

export const WAVE_PALETTES: WavePalette[] = PALETTE_ORDER.map((i) => ({
  planet: PLANET_PALETTES[i],
  bg: BG_PALETTES[i],
}));

// Couleurs de mob distinctes par kind (contraste garanti avec la planète).
// On tint un peu par vague en forçant la couleur de corne depuis la palette.
export type MobSkinKind = 'grunt' | 'brute' | 'sniper' | 'gunner' | 'medic' | 'bomber';

const MOB_BASE_COLORS: Record<MobSkinKind, { skin: string; belly: string }> = {
  grunt:  { skin: '#5a8a3a', belly: '#8de86a' },
  brute:  { skin: '#a02050', belly: '#e24c80' },
  sniper: { skin: '#3a8fa6', belly: '#7bd4ea' },
  gunner: { skin: '#5e3689', belly: '#a86bda' },
  medic:  { skin: '#3a5ea8', belly: '#7aa8e6' },
  bomber: { skin: '#b85a10', belly: '#ff9a3c' },
};

export function mobColorsForKindAndWave(kind: MobSkinKind, waveIndex: number): {
  skin: string; belly: string; hornColor: string; eyeColor: string; pupilColor: string;
} {
  const base = MOB_BASE_COLORS[kind];
  const pal = WAVE_PALETTES[waveIndex % WAVE_PALETTES.length].planet;
  return {
    skin: base.skin,
    belly: base.belly,
    hornColor: pal.landDark,
    eyeColor: '#fff5c2',
    pupilColor: '#111',
  };
}
