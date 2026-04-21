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

export type BgPalette = {
  top: string;     // gradient haut (ciel profond)
  bottom: string;  // gradient bas (horizon nébuleux)
  nebulaFill: string;     // fond de la bande de nébuleuse (semi-transparent)
  nebulaStroke: string;   // contour clair de la bande (blanc ou pastel)
  cloudColors: string[];  // 2-3 teintes pour les gas clouds
};

export const BG_PALETTES: BgPalette[] = [
  { // 1 — nuit profonde verte
    top: '#06101a', bottom: '#0e2a38',
    nebulaFill: 'rgba(100, 230, 200, 0.28)', nebulaStroke: 'rgba(220, 255, 240, 0.85)',
    cloudColors: ['rgba(140, 230, 200, 0.22)', 'rgba(200, 255, 220, 0.18)', 'rgba(80, 180, 180, 0.20)'],
  },
  { // 2 — nébuleuse orange martienne
    top: '#1a0808', bottom: '#3a1810',
    nebulaFill: 'rgba(255, 150, 80, 0.30)', nebulaStroke: 'rgba(255, 230, 180, 0.90)',
    cloudColors: ['rgba(255, 180, 120, 0.22)', 'rgba(255, 120, 80, 0.18)', 'rgba(220, 100, 60, 0.20)'],
  },
  { // 3 — nébuleuse violette
    top: '#0a0620', bottom: '#2a1060',
    nebulaFill: 'rgba(180, 120, 255, 0.30)', nebulaStroke: 'rgba(240, 220, 255, 0.90)',
    cloudColors: ['rgba(200, 160, 255, 0.22)', 'rgba(255, 120, 220, 0.18)', 'rgba(120, 80, 220, 0.20)'],
  },
  { // 4 — volcanique rouge/noir
    top: '#0a0004', bottom: '#400814',
    nebulaFill: 'rgba(255, 80, 60, 0.30)', nebulaStroke: 'rgba(255, 220, 120, 0.90)',
    cloudColors: ['rgba(255, 100, 60, 0.22)', 'rgba(255, 180, 80, 0.18)', 'rgba(180, 40, 20, 0.22)'],
  },
  { // 5 — glacial bleu-blanc
    top: '#040812', bottom: '#152840',
    nebulaFill: 'rgba(160, 220, 255, 0.28)', nebulaStroke: 'rgba(255, 255, 255, 0.90)',
    cloudColors: ['rgba(200, 230, 255, 0.25)', 'rgba(255, 255, 255, 0.18)', 'rgba(140, 180, 220, 0.22)'],
  },
];

export type BgState = {
  palette: BgPalette;
  stars: Star[];
  clouds: GasCloud[];
  streaks: Streak[];
  parallaxOffset: number;
  wave: number;     // phase lente
  fastWave: number; // phase rapide
  animationPhase: number; // sin lent pour pulsation globale
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

  return {
    palette,
    stars,
    clouds,
    streaks,
    parallaxOffset: 0,
    wave: 0,
    fastWave: 0,
    animationPhase: 0,
  };
}

export function updateBackground(bg: BgState, now: number, dt: number, vp: { w: number; h: number }): void {
  bg.wave = Math.sin(now * 0.0003);
  bg.fastWave = Math.sin(now * 0.0007);
  bg.animationPhase = Math.sin(now * 0.001);
  bg.parallaxOffset += dt * 0.01;

  // Dérive clouds
  for (const c of bg.clouds) {
    c.x -= c.speed * dt * 0.03;
    if (c.x < -300) {
      c.x = vp.w + 300 + Math.random() * 400;
      c.y = rand(vp.h * 0.05, vp.h * 0.75);
    }
  }

  // Dérive streaks (plus rapides)
  for (const s of bg.streaks) {
    s.x -= s.speed * dt * 0.15;
    if (s.x + s.len < -50) {
      s.x = vp.w + 50 + Math.random() * 200;
      s.y = rand(0, vp.h * 0.85);
    }
  }

  // Scintillement stars : pas besoin, c'est calculé au draw via twinkleSpeed/offset
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

  // === 5. Bande de nébuleuse qui ondule en bas (adaptation du pattern "water" de coup-ahoo) ===
  // Fill semi-transparent + contour CLAIR (blanc/pastel, pas noir).
  const bandHeight = vp.h * 0.28;
  const bandTop = vp.h - bandHeight;
  const waveAmp = 18 + 8 * Math.abs(bg.animationPhase);
  ctx.save();
  ctx.fillStyle = bg.palette.nebulaFill;
  ctx.strokeStyle = bg.palette.nebulaStroke;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, vp.h);
  ctx.lineTo(0, bandTop);
  const step = 50;
  for (let x = 0; x <= vp.w; x += step) {
    const top = Math.sin(x * 0.01 + 25 * bg.wave) * waveAmp
             + Math.cos(x * 0.02 + 12 * bg.fastWave) * waveAmp * 0.5;
    const y = bandTop + top;
    const prevX = x - step;
    const prevY = bandTop + Math.sin(prevX * 0.01 + 25 * bg.wave) * waveAmp
                + Math.cos(prevX * 0.02 + 12 * bg.fastWave) * waveAmp * 0.5;
    const mx = (prevX + x) / 2;
    const my = (prevY + y) / 2;
    ctx.quadraticCurveTo(prevX + step * 0.5, prevY - 4, mx, my);
  }
  ctx.lineTo(vp.w, vp.h);
  ctx.closePath();
  ctx.fill();
  // Trace juste le bord supérieur séparément pour la ligne claire (pas sur les bords verticaux/bas)
  ctx.beginPath();
  let firstY = bandTop + Math.sin(0 + 25 * bg.wave) * waveAmp + Math.cos(0 + 12 * bg.fastWave) * waveAmp * 0.5;
  ctx.moveTo(0, firstY);
  for (let x = step; x <= vp.w; x += step) {
    const top = Math.sin(x * 0.01 + 25 * bg.wave) * waveAmp
             + Math.cos(x * 0.02 + 12 * bg.fastWave) * waveAmp * 0.5;
    const y = bandTop + top;
    const prevX = x - step;
    const prevY = bandTop + Math.sin(prevX * 0.01 + 25 * bg.wave) * waveAmp
                + Math.cos(prevX * 0.02 + 12 * bg.fastWave) * waveAmp * 0.5;
    const mx = (prevX + x) / 2;
    const my = (prevY + y) / 2;
    ctx.quadraticCurveTo(prevX + step * 0.5, prevY - 4, mx, my);
  }
  ctx.stroke();
  ctx.restore();

  // === 6. Deuxième onde plus fine, contour pur blanc, décalée verticalement ===
  // Donne l'impression de plusieurs strates de nébuleuse (style Coup Ahoo 2 couches).
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const bandTop2 = bandTop - 40;
  const waveAmp2 = 10 + 4 * Math.abs(bg.animationPhase);
  let firstY2 = bandTop2 + Math.sin(0 * 0.015 + 20 * bg.fastWave) * waveAmp2;
  ctx.moveTo(0, firstY2);
  for (let x = step; x <= vp.w; x += step) {
    const top = Math.sin(x * 0.015 + 20 * bg.fastWave) * waveAmp2
             + Math.cos(x * 0.025 + 15 * bg.wave) * waveAmp2 * 0.4;
    const y = bandTop2 + top;
    const prevX = x - step;
    const prevY = bandTop2 + Math.sin(prevX * 0.015 + 20 * bg.fastWave) * waveAmp2
                + Math.cos(prevX * 0.025 + 15 * bg.wave) * waveAmp2 * 0.4;
    const mx = (prevX + x) / 2;
    const my = (prevY + y) / 2;
    ctx.quadraticCurveTo(prevX + step * 0.5, prevY - 2, mx, my);
  }
  ctx.stroke();
  ctx.restore();
}
