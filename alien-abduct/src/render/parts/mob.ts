// Mob "goomba alien" — créature trapue, cyclope, toujours énervée.
// Silhouette lisible de loin (sera affiché petit sur le bord d'une planète).
// Techniques : stacked strokes, quadratic curves, œil unique + crocs.

export type MobState = {
  skin: string;
  belly: string; // ventre plus clair
  eyeColor: string; // sclère (souvent blanc/jaune)
  pupilColor: string;
  hornColor: string;
  animationSpeed: number;
  bobPhase: number; // offset initial pour désynchroniser les mobs entre eux
  pupilTargetX: number; // -1..1, la pupille suit une cible
  pupilTargetY: number;
  pupilX: number; // current (lerp towards target)
  pupilY: number;
};

export function createMob(opts: Partial<MobState> = {}): MobState {
  return {
    skin: opts.skin ?? '#5d2a8a',
    belly: opts.belly ?? '#8a4fbf',
    eyeColor: opts.eyeColor ?? '#fff5c2',
    pupilColor: opts.pupilColor ?? '#111',
    hornColor: opts.hornColor ?? '#2a1144',
    animationSpeed: opts.animationSpeed ?? 0.006 * (0.8 + Math.random() * 0.4),
    bobPhase: opts.bobPhase ?? Math.random() * Math.PI * 2,
    pupilTargetX: 0,
    pupilTargetY: 0,
    pupilX: 0,
    pupilY: 0,
  };
}

export function updateMob(m: MobState, _now: number, dt: number): void {
  // Pupille : change de cible aléatoirement, glisse vers elle (regard nerveux)
  if (Math.random() < 0.008) {
    m.pupilTargetX = (Math.random() * 2 - 1) * 0.6;
    m.pupilTargetY = (Math.random() * 2 - 1) * 0.4;
  }
  const k = Math.min(1, dt * 0.01);
  m.pupilX += (m.pupilTargetX - m.pupilX) * k;
  m.pupilY += (m.pupilTargetY - m.pupilY) * k;
}

export function drawMob(ctx: CanvasRenderingContext2D, m: MobState, now: number): void {
  const phase = Math.sin(now * m.animationSpeed + m.bobPhase);
  const phaseAbs = Math.abs(phase);
  const bob = phase * 2;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Léger bob du corps (jambes incluses : tout le mob flotte légèrement)
  ctx.translate(0, bob);

  // === Jambes/pieds trapus (émergent visiblement du bas du corps) ===
  // Stacked strokes : jambe = segment épais noir, puis même trajet plus fin en couleur peau
  // Un petit mouvement latéral sync avec phase pour la vie
  for (const dir of [-1, 1] as const) {
    const sway = phase * dir * 1.5;
    // Jambe : courte, large, part du dessous du corps
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(dir * 16, 28);
    ctx.lineTo(dir * 18 + sway, 42);
    ctx.stroke();
    // Reprise peau pour garder l'unité colorée avec le corps
    ctx.strokeStyle = m.skin;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(dir * 16, 28);
    ctx.lineTo(dir * 18 + sway, 42);
    ctx.stroke();
  }

  // === Corps en œuf (tête + torse combinés, façon Goomba) ===
  // Ellipse principale : stacked strokes
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000';
  ctx.fillStyle = m.skin;
  ctx.beginPath();
  ctx.ellipse(0, -5, 38, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ventre plus clair (ellipse partielle en bas, couleur belly)
  ctx.fillStyle = m.belly;
  ctx.beginPath();
  ctx.ellipse(0, 15, 24, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // === Cornes (3 piquants sur le crâne) ===
  ctx.fillStyle = m.hornColor;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  const hornPositions: Array<[number, number, number]> = [
    [-18, -40, -0.35], // [x, yBase, tilt]
    [0, -46, 0],
    [18, -40, 0.35],
  ];
  for (const [hx, hy, tilt] of hornPositions) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(tilt);
    ctx.beginPath();
    ctx.moveTo(-6, 6);
    ctx.lineTo(0, -14);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // === Petites griffes/bras courts (moignons incurvés, sans pinces complexes) ===
  for (const dir of [-1, 1] as const) {
    const armWag = phaseAbs * 3;
    // Bras : court, incurvé, stacked strokes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(dir * 32, 2);
    ctx.quadraticCurveTo(dir * 42, 10 + armWag, dir * 40, 20);
    ctx.stroke();
    ctx.strokeStyle = m.skin;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(dir * 32, 2);
    ctx.quadraticCurveTo(dir * 42, 10 + armWag, dir * 40, 20);
    ctx.stroke();
    // 2 petites griffes en éventail au bout (triangles étroits qui pointent vers l'extérieur)
    ctx.fillStyle = '#1a1a1a';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    for (const off of [-3, 3] as const) {
      ctx.beginPath();
      ctx.moveTo(dir * 40, 20);
      ctx.lineTo(dir * (43 + Math.abs(off) * 0.3), 24 + off);
      ctx.lineTo(dir * 38, 23 + off * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // === Sourcil angry (barre épaisse inclinée au-dessus de l'œil) ===
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';
  ctx.lineCap = 'round';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-24, -26);
  ctx.lineTo(22, -18);
  ctx.stroke();

  // === ŒIL CYCLOPE (gros, au milieu) ===
  // Sclère (ellipse jaunâtre)
  ctx.fillStyle = m.eyeColor;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, -8, 20, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Pupille (suit une cible)
  ctx.fillStyle = m.pupilColor;
  ctx.beginPath();
  ctx.arc(m.pupilX * 8, -8 + m.pupilY * 6, 7, 0, Math.PI * 2);
  ctx.fill();
  // Reflet pupille
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(m.pupilX * 8 - 2, -8 + m.pupilY * 6 - 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // === Bouche en zigzag (crocs intégrés, une seule forme fermée) ===
  // Intérieur sombre + contour noir. Les crocs supérieurs et inférieurs sont directement
  // les pointes du zigzag, pas des triangles ajoutés par-dessus.
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'miter';
  ctx.fillStyle = '#2a0a1a';
  ctx.beginPath();
  // Ligne supérieure (crocs pointant vers le bas)
  ctx.moveTo(-18, 14);
  ctx.lineTo(-12, 19);
  ctx.lineTo(-6, 14);
  ctx.lineTo(0, 19);
  ctx.lineTo(6, 14);
  ctx.lineTo(12, 19);
  ctx.lineTo(18, 14);
  // Ligne inférieure (crocs pointant vers le haut)
  ctx.lineTo(14, 25);
  ctx.lineTo(8, 21);
  ctx.lineTo(2, 25);
  ctx.lineTo(-4, 21);
  ctx.lineTo(-10, 25);
  ctx.lineTo(-14, 21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineJoin = 'round';

  ctx.restore();
}
