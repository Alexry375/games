// Background spatial animé, adapté des techniques de coup-ahoo/src/scene.ts :
//   - "Rain lines" diagonales → streaks cosmiques (vitesse warp subtile)
//   - Clouds dashed → gas clouds / nébuleuses qui dérivent
//   - Water wave avec quadraticCurveTo + sin/cos → bande de nébuleuse qui ondule
// Contours blancs ou colorés (jamais noirs comme le reste du jeu).

type Star = {
  x: number; y: number; r: number; layer: 0 | 1 | 2; // layer = vitesse parallax
  twinkleSpeed: number; twinkleOffset: number;
};

type GasCloud = {
  x: number; y: number; rx: number; ry: number;
  color: string;       // rgba, l'alpha est utilisé tel quel (gradient vers transparent)
  speed: number;
  rot: number;         // rotation (rad) pour briser l'alignement horizontal
};

type Streak = {
  x: number; y: number; len: number; speed: number; alpha: number;
};

type Asteroid = {
  x: number; y: number; size: number; // rayon moyen
  radii: number[];       // rayons polaires modulés (forme irrégulière)
  rotation: number;
  rotSpeed: number;      // rotation sur soi-même
  speed: number;         // dérive horizontale
  layer: 0 | 1 | 2;      // 0 = far (petit, lent), 2 = near (gros, rapide)
  fill: string;
};

export type BgPalette = {
  top: string;     // gradient haut (ciel profond)
  bottom: string;  // gradient bas
  cloudColors: string[];    // 2-3 teintes pour les nébuleuses
  asteroidFills: string[];  // teintes des astéroïdes (sombres, palette-themed)
  asteroidStroke: string;   // contour clair (blanc ou pastel)
};

export const BG_PALETTES: BgPalette[] = [
  { // 1 — nuit profonde verte
    top: '#06101a', bottom: '#0e2a38',
    cloudColors: ['rgba(140, 230, 200, 0.22)', 'rgba(200, 255, 220, 0.18)', 'rgba(80, 180, 180, 0.20)'],
    asteroidFills: ['#0c1820', '#15303a', '#1d4050'],
    asteroidStroke: 'rgba(220, 255, 240, 0.95)',
  },
  { // 2 — nébuleuse orange martienne
    top: '#1a0808', bottom: '#3a1810',
    cloudColors: ['rgba(255, 180, 120, 0.22)', 'rgba(255, 120, 80, 0.18)', 'rgba(220, 100, 60, 0.20)'],
    asteroidFills: ['#1a0a06', '#3a1810', '#5a2814'],
    asteroidStroke: 'rgba(255, 230, 180, 0.95)',
  },
  { // 3 — nébuleuse violette
    top: '#0a0620', bottom: '#2a1060',
    cloudColors: ['rgba(200, 160, 255, 0.22)', 'rgba(255, 120, 220, 0.18)', 'rgba(120, 80, 220, 0.20)'],
    asteroidFills: ['#0e0820', '#1d1040', '#2a1860'],
    asteroidStroke: 'rgba(240, 220, 255, 0.95)',
  },
  { // 4 — volcanique rouge/noir
    top: '#0a0004', bottom: '#400814',
    cloudColors: ['rgba(255, 100, 60, 0.22)', 'rgba(255, 180, 80, 0.18)', 'rgba(180, 40, 20, 0.22)'],
    asteroidFills: ['#0e0406', '#1e0608', '#30080a'],
    asteroidStroke: 'rgba(255, 220, 120, 0.95)',
  },
  { // 5 — glacial bleu-blanc
    top: '#040812', bottom: '#152840',
    cloudColors: ['rgba(200, 230, 255, 0.25)', 'rgba(255, 255, 255, 0.18)', 'rgba(140, 180, 220, 0.22)'],
    asteroidFills: ['#0a1220', '#18304a', '#2a4868'],
    asteroidStroke: 'rgba(255, 255, 255, 0.95)',
  },
];

export type BgState = {
  palette: BgPalette;
  stars: Star[];
  clouds: GasCloud[];
  streaks: Streak[];
  asteroids: Asteroid[];
  parallaxOffset: number;
  animationPhase: number;
};

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function createBackground(palette: BgPalette = BG_PALETTES[2], width = 1400, height = 900): BgState {
  const stars: Star[] = [];
  // 3 couches parallax : lointaine (petite, lente), moyenne, proche (grosse, rapide)
  for (let i = 0; i < 150; i++) stars.push({
    x: rand(-width * 0.2, width * 1.4), y: rand(0, height), r: rand(0.4, 1.2), layer: 0,
    twinkleSpeed: rand(0.0005, 0.0015), twinkleOffset: rand(0, Math.PI * 2),
  });
  for (let i = 0; i < 70; i++) stars.push({
    x: rand(-width * 0.2, width * 1.4), y: rand(0, height), r: rand(1.0, 1.8), layer: 1,
    twinkleSpeed: rand(0.001, 0.003), twinkleOffset: rand(0, Math.PI * 2),
  });
  for (let i = 0; i < 30; i++) stars.push({
    x: rand(-width * 0.2, width * 1.4), y: rand(0, height), r: rand(1.6, 2.6), layer: 2,
    twinkleSpeed: rand(0.002, 0.005), twinkleOffset: rand(0, Math.PI * 2),
  });

  // Gas clouds : blobs radial-gradient soft (technique nébuleuse classique, pas de dashes)
  const clouds: GasCloud[] = [];
  for (let i = 0; i < 12; i++) {
    const scale = rand(0.7, 1.8);
    clouds.push({
      x: rand(-200, width + 200),
      y: rand(height * 0.08, height * 0.68),
      rx: 180 * scale,
      ry: 90 * scale,
      color: palette.cloudColors[Math.floor(Math.random() * palette.cloudColors.length)],
      speed: rand(0.2, 0.7),
      rot: rand(-0.3, 0.3),
    });
  }

  // Streaks : petites traînées horizontales très subtiles (warp effect)
  const streaks: Streak[] = [];
  for (let i = 0; i < 35; i++) streaks.push({
    x: rand(-200, width + 200),
    y: rand(0, height * 0.85),
    len: rand(15, 45),
    speed: rand(0.4, 1.2),
    alpha: rand(0.1, 0.3),
  });

  // Ceinture d'astéroïdes : concentrée dans le tiers inférieur, 3 couches parallax
  const asteroids: Asteroid[] = [];
  const makeShape = (): number[] => {
    const nSec = 12;
    const radii: number[] = [];
    const f1 = 1 + Math.floor(Math.random() * 2);
    const f2 = 2 + Math.floor(Math.random() * 2);
    const phi1 = Math.random() * Math.PI * 2;
    const phi2 = Math.random() * Math.PI * 2;
    const a1 = rand(0.15, 0.35);
    const a2 = rand(0.08, 0.20);
    for (let j = 0; j < nSec; j++) {
      const ang = (j / nSec) * Math.PI * 2;
      const r = 1 + a1 * Math.sin(f1 * ang + phi1) + a2 * Math.sin(f2 * ang + phi2);
      radii.push(Math.max(0.5, r));
    }
    return radii;
  };
  const pickFill = (): string => palette.asteroidFills[Math.floor(Math.random() * palette.asteroidFills.length)];
  // Couche lointaine : 18 petits, lents, dans le tiers médian-bas
  for (let i = 0; i < 18; i++) asteroids.push({
    x: rand(-100, width + 100), y: rand(height * 0.60, height * 0.95),
    size: rand(8, 16), radii: makeShape(),
    rotation: rand(0, Math.PI * 2), rotSpeed: rand(-0.00015, 0.00015),
    speed: rand(0.15, 0.35), layer: 0, fill: pickFill(),
  });
  // Couche médiane : 12 moyens
  for (let i = 0; i < 12; i++) asteroids.push({
    x: rand(-100, width + 100), y: rand(height * 0.68, height * 0.98),
    size: rand(18, 32), radii: makeShape(),
    rotation: rand(0, Math.PI * 2), rotSpeed: rand(-0.0002, 0.0002),
    speed: rand(0.4, 0.7), layer: 1, fill: pickFill(),
  });
  // Couche proche : 7 gros, rapides, très bas
  for (let i = 0; i < 7; i++) asteroids.push({
    x: rand(-100, width + 100), y: rand(height * 0.75, height * 1.02),
    size: rand(40, 72), radii: makeShape(),
    rotation: rand(0, Math.PI * 2), rotSpeed: rand(-0.00025, 0.00025),
    speed: rand(0.8, 1.3), layer: 2, fill: pickFill(),
  });

  return {
    palette,
    stars,
    clouds,
    streaks,
    asteroids,
    parallaxOffset: 0,
    animationPhase: 0,
  };
}

export function updateBackground(bg: BgState, _now: number, dt: number, vp: { w: number; h: number }): void {
  bg.animationPhase = Math.sin(_now * 0.001);
  bg.parallaxOffset += dt * 0.01;

  for (const c of bg.clouds) {
    c.x -= c.speed * dt * 0.03;
    if (c.x < -300) {
      c.x = vp.w + 300 + Math.random() * 400;
      c.y = rand(vp.h * 0.05, vp.h * 0.68);
    }
  }

  for (const s of bg.streaks) {
    s.x -= s.speed * dt * 0.15;
    if (s.x + s.len < -50) {
      s.x = vp.w + 50 + Math.random() * 200;
      s.y = rand(0, vp.h * 0.85);
    }
  }

  for (const a of bg.asteroids) {
    a.x -= a.speed * dt * 0.05;
    a.rotation += a.rotSpeed * dt;
    if (a.x + a.size * 2 < -50) {
      a.x = vp.w + 50 + Math.random() * 300;
      // Re-randomiser la Y selon la couche pour garder la distribution verticale
      if (a.layer === 0) a.y = rand(vp.h * 0.60, vp.h * 0.95);
      else if (a.layer === 1) a.y = rand(vp.h * 0.68, vp.h * 0.98);
      else a.y = rand(vp.h * 0.75, vp.h * 1.02);
    }
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D, bg: BgState, now: number, vp: { w: number; h: number }): void {
  // === 1. Gradient de fond (ciel profond) ===
  const sky = ctx.createLinearGradient(0, 0, 0, vp.h);
  sky.addColorStop(0, bg.palette.top);
  sky.addColorStop(1, bg.palette.bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, vp.w, vp.h);

  // === 2. Streaks (traînées warp horizontales très subtiles, loin derrière) ===
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.5;
  for (const s of bg.streaks) {
    ctx.globalAlpha = s.alpha;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + s.len, s.y);
    ctx.stroke();
  }
  ctx.restore();

  // === 3. Starfield (3 couches parallax, scintillement sin) ===
  ctx.save();
  for (const st of bg.stars) {
    const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(now * st.twinkleSpeed + st.twinkleOffset));
    ctx.globalAlpha = tw;
    ctx.fillStyle = '#fff';
    // Parallax : layer 0 = lointain, layer 2 = proche, décalage horizontal léger
    const par = bg.parallaxOffset * (0.1 + st.layer * 0.3);
    let sx = (st.x - par) % vp.w;
    if (sx < 0) sx += vp.w;
    ctx.beginPath();
    ctx.arc(sx, st.y, st.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // === 4. Nébuleuses (radial gradient soft, composite lighter pour addition lumineuse) ===
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const c of bg.clouds) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    // Gradient centre → transparent. On utilise l'alpha de c.color comme pic central.
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(c.rx, c.ry));
    grad.addColorStop(0, c.color);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    // Scale Y pour ellipse (le gradient est circulaire, on déforme)
    ctx.scale(1, c.ry / c.rx);
    ctx.beginPath();
    ctx.arc(0, 0, c.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // === 5. Ceinture d'astéroïdes (3 couches parallax, silhouettes + contour clair) ===
  // Technique : rayons polaires modulés par 2 sinusoïdes harmoniques + lissage midpoints-as-anchors.
  // Contour BLANC (ou pastel selon palette), fill sombre palette-themed.
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const strokeWidths = [1.5, 2.5, 3.5]; // plus large pour les couches proches
  // Trier par layer pour dessiner far → near (bon ordre d'occlusion)
  const sorted = [...bg.asteroids].sort((a, b) => a.layer - b.layer);
  for (const a of sorted) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rotation);
    // Construire les points cartésiens
    const nSec = a.radii.length;
    const pts: Array<[number, number]> = [];
    for (let j = 0; j < nSec; j++) {
      const ang = (j / nSec) * Math.PI * 2;
      const r = a.radii[j] * a.size;
      pts.push([Math.cos(ang) * r, Math.sin(ang) * r]);
    }
    // Smoothing via midpoints-as-anchors
    const mid = (p: [number, number], q: [number, number]): [number, number] => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    ctx.beginPath();
    const first = mid(pts[nSec - 1], pts[0]);
    ctx.moveTo(first[0], first[1]);
    for (let i = 0; i < nSec; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % nSec];
      const m = mid(p0, p1);
      ctx.quadraticCurveTo(p0[0], p0[1], m[0], m[1]);
    }
    ctx.closePath();
    ctx.fillStyle = a.fill;
    ctx.fill();
    ctx.strokeStyle = bg.palette.asteroidStroke;
    ctx.lineWidth = strokeWidths[a.layer];
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
