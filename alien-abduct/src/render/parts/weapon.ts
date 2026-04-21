// Armes des mobs — grosses et lisibles à l'écran (le problème v0 = petits guns noirs anonymes).
// 2 types à silhouette contrastée : bazooka mécanique vs bâton plasma organique.

export type WeaponKind = 'bazooka' | 'plasma-staff';

export type WeaponState = {
  kind: WeaponKind;
  // Palette par arme — chaque goomba peut avoir une variante couleur
  primary: string;
  secondary: string;
  accent: string;    // couleur "énergie" (gueule de bazooka, orbe plasma)
  // Anim
  wobble: number;    // -1..1, phase locale pour faire respirer
  charge: number;    // 0..1, pour pulsation (plasma) ou recul (bazooka)
};

export function createWeapon(kind: WeaponKind, opts: Partial<WeaponState> = {}): WeaponState {
  const defaults: Record<WeaponKind, Omit<WeaponState, 'kind'>> = {
    bazooka: {
      primary: opts.primary ?? '#2a2a2a',
      secondary: opts.secondary ?? '#5a5a5a',
      accent: opts.accent ?? '#ff6040',
      wobble: 0,
      charge: 0,
    },
    'plasma-staff': {
      primary: opts.primary ?? '#3a1a5a',
      secondary: opts.secondary ?? '#6a3a9a',
      accent: opts.accent ?? '#8affff',
      wobble: 0,
      charge: 0,
    },
  };
  return { kind, ...defaults[kind], ...opts };
}

export function updateWeapon(w: WeaponState, now: number): void {
  w.wobble = Math.sin(now * 0.004);
  w.charge = 0.5 + 0.5 * Math.sin(now * 0.006);
}

// Dessine l'arme à partir de l'origine (0,0) = point de tenue par la main du mob.
// Par défaut l'arme pointe vers la droite (+X). Le caller peut rotate/scale.
export function drawWeapon(ctx: CanvasRenderingContext2D, w: WeaponState): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (w.kind === 'bazooka') drawBazooka(ctx, w);
  else drawPlasmaStaff(ctx, w);
  ctx.restore();
}

function drawBazooka(ctx: CanvasRenderingContext2D, w: WeaponState): void {
  const recoil = w.charge * 2; // léger recul
  ctx.translate(-recoil, 0);

  // Poignée pistolet (rectangle vertical sous le tube, incliné)
  ctx.save();
  ctx.translate(-2, 6);
  ctx.rotate(0.15);
  ctx.fillStyle = '#000';
  ctx.fillRect(-5, 0, 10, 22);
  ctx.fillStyle = w.primary;
  ctx.fillRect(-3, 2, 6, 18);
  // Grip texture : 3 stries horizontales
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-3, 6 + i * 5);
    ctx.lineTo(3, 6 + i * 5);
    ctx.stroke();
  }
  ctx.restore();

  // Corps principal : gros tube conique (plus large à la gueule)
  // Silhouette trapézoïdale épaisse, contour noir
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(-25, -10);   // arrière haut
  ctx.lineTo(40, -18);    // gueule haut (flare)
  ctx.lineTo(45, -15);    // lèvre gueule
  ctx.lineTo(45, 15);     // lèvre gueule bas
  ctx.lineTo(40, 18);     // gueule bas
  ctx.lineTo(-25, 10);    // arrière bas
  ctx.closePath();
  ctx.fill();
  // Remplissage métallique
  ctx.fillStyle = w.primary;
  ctx.beginPath();
  ctx.moveTo(-22, -8);
  ctx.lineTo(38, -14);
  ctx.lineTo(42, -12);
  ctx.lineTo(42, 12);
  ctx.lineTo(38, 14);
  ctx.lineTo(-22, 8);
  ctx.closePath();
  ctx.fill();

  // Bande lumineuse (reflet métallique horizontal)
  ctx.fillStyle = w.secondary;
  ctx.fillRect(-20, -5, 58, 3);

  // Anneaux sur le tube (détail mécanique)
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  for (const x of [-10, 10, 25]) {
    ctx.beginPath();
    const topY = -14 + (x + 25) * (4 / 65); // suit la pente trapèze top
    const botY = 14 - (x + 25) * (4 / 65);
    ctx.moveTo(x, topY + 2);
    ctx.lineTo(x, botY - 2);
    ctx.stroke();
  }

  // Gueule (cercle rouge profond) — énorme pour lisibilité
  // Ombre interne pour profondeur
  ctx.fillStyle = '#200';
  ctx.beginPath();
  ctx.ellipse(42, 0, 6, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Anneau rouge glow
  ctx.fillStyle = w.accent;
  ctx.beginPath();
  ctx.ellipse(43, 0, 3, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Reflet lumineux petit
  ctx.fillStyle = '#fff8';
  ctx.beginPath();
  ctx.ellipse(43, -4, 1.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Viseur / mire sur le dessus (petit triangle)
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(5, -12);
  ctx.lineTo(10, -12);
  ctx.lineTo(7.5, -18);
  ctx.closePath();
  ctx.fill();
}

function drawPlasmaStaff(ctx: CanvasRenderingContext2D, w: WeaponState): void {
  const pulse = w.charge;
  const pulseSize = 1 + pulse * 0.15;

  // Léger wobble organique du bâton
  ctx.rotate(w.wobble * 0.03);

  // Tige principale : longue, courbe organique, du bas (poignée) vers le haut (orbe)
  // Stacked strokes (noir épais + couleur plus fine)
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.quadraticCurveTo(14, -30, 8, -85);
  ctx.stroke();
  // Couleur principale
  ctx.strokeStyle = w.primary;
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.quadraticCurveTo(14, -30, 8, -85);
  ctx.stroke();

  // Nœuds/bosses organiques sur la tige (répartis sur la longueur)
  ctx.fillStyle = '#000';
  const knots: Array<[number, number, number]> = [
    [8, 0, 7],
    [13, -25, 6],
    [12, -50, 5.5],
    [9, -72, 5],
  ];
  for (const [kx, ky, kr] of knots) {
    ctx.beginPath();
    ctx.arc(kx, ky, kr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = w.secondary;
    ctx.beginPath();
    ctx.arc(kx, ky, kr - 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
  }

  // Griffes organiques qui enserrent l'orbe (3 pointes recourbées)
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4.5;
  const claws: Array<[number, number]> = [
    [-12, -8],   // griffe gauche
    [16, -14],   // griffe droite
    [4, -22],    // griffe arrière
  ];
  for (const [dx, dy] of claws) {
    ctx.beginPath();
    ctx.moveTo(8, -85);
    ctx.quadraticCurveTo(8 + dx * 0.5, -92 + dy * 0.3, 8 + dx, -92 + dy);
    ctx.stroke();
  }

  // === Orbe plasma pulsante (la star de l'arme) ===
  const ox = 8, oy = -95;
  const orbR = 15 * pulseSize;

  // Halo externe (composite lighter pour effet glow)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const halo = ctx.createRadialGradient(ox, oy, 0, ox, oy, orbR * 2.2);
  halo.addColorStop(0, w.accent);
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.globalAlpha = 0.55 * pulse;
  ctx.fillStyle = halo;
  ctx.fillRect(ox - orbR * 2.5, oy - orbR * 2.5, orbR * 5, orbR * 5);
  ctx.restore();

  // Orbe : gradient radial centre lumineux → bord coloré
  const orb = ctx.createRadialGradient(ox - 3, oy - 3, 0, ox, oy, orbR);
  orb.addColorStop(0, '#ffffff');
  orb.addColorStop(0.3, w.accent);
  orb.addColorStop(1, w.secondary);
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(ox, oy, orbR, 0, Math.PI * 2);
  ctx.fill();

  // Contour sombre fin autour de l'orbe
  ctx.strokeStyle = '#000a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Petits éclairs/sparks internes (2-3 traits courts aléatoires-looking)
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.8 * pulse;
  const sparks: Array<[number, number, number, number]> = [
    [ox - 5, oy - 2, ox - 1, oy + 3],
    [ox + 2, oy - 5, ox + 5, oy - 1],
    [ox - 2, oy + 4, ox + 3, oy + 6],
  ];
  for (const [x1, y1, x2, y2] of sparks) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
