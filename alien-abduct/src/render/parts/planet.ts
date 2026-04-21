// Planète cartoon stylisée. Techniques :
//   - Disque plein + gradient radial (lumière top-left) pour volume
//   - Continents/taches de surface générés procéduralement (blobs) qui dérivent (rotation)
//   - Cratères (ellipses sombres avec highlight)
//   - Atmosphère : halo externe (gradient alpha)
//   - Champ d'étoiles scintillantes en arrière-plan
// Palette configurable pour avoir une planète par vague.

export type PlanetPalette = {
  base: string;        // couleur principale du disque
  baseDark: string;    // shade côté ombre
  land: string;        // continents (hue décalée par rapport à base)
  landDark: string;    // contour des continents
  crater: string;      // fond des cratères
  atmosphere: string;  // halo (doit avoir alpha, ex. '#a0c8ff')
  highlight: string;   // reflet lumineux (touche spéculaire)
};

export const PLANET_PALETTES: PlanetPalette[] = [
  { // 1 — verte forestière (terres + océans turquoise)
    base: '#2a6e8a', baseDark: '#0e2a38', land: '#4aa858', landDark: '#1a4020',
    crater: '#0a1a20', atmosphere: 'rgba(140, 230, 200, 0.55)', highlight: '#c8ffe0',
  },
  { // 2 — orangé martien (désert rocheux)
    base: '#c77040', baseDark: '#5a2410', land: '#7a2a14', landDark: '#3a1408',
    crater: '#200810', atmosphere: 'rgba(255, 180, 120, 0.50)', highlight: '#ffe0b0',
  },
  { // 3 — violet nébuleuse (continents sombres sur sol lumineux)
    base: '#9a60d8', baseDark: '#2a1060', land: '#3a1470', landDark: '#160838',
    crater: '#1a0830', atmosphere: 'rgba(200, 160, 255, 0.55)', highlight: '#f0d8ff',
  },
  { // 4 — rouge volcanique (lave + cendre)
    base: '#8a1820', baseDark: '#300408', land: '#f08030', landDark: '#802010',
    crater: '#200410', atmosphere: 'rgba(255, 120, 80, 0.55)', highlight: '#ffe060',
  },
  { // 5 — glacial (océan gelé + masses blanches)
    base: '#4a78a0', baseDark: '#152840', land: '#e8f0ff', landDark: '#5080a0',
    crater: '#0a1828', atmosphere: 'rgba(200, 230, 255, 0.60)', highlight: '#ffffff',
  },
];

type Blob = {
  lng: number;
  lat: number;
  size: number; // rayon moyen en unités angulaires (rad)
  // N rayons (un par secteur angulaire) — blob organique = variation radiale lisse
  radii: number[];
};

type Crater = {
  lng: number;
  lat: number;
  size: number; // rayon en pixels (projeté sur sphere plane pour simplicité)
};

type Star = {
  x: number; y: number; r: number; twinkleSpeed: number; twinkleOffset: number;
};

export type PlanetState = {
  radius: number;
  palette: PlanetPalette;
  rotationSpeed: number; // rad/ms
  rotation: number; // rad courant
  tilt: number; // inclinaison axe (rad)
  blobs: Blob[];
  craters: Crater[];
  stars: Star[];
  lightDir: { x: number; y: number }; // vecteur normalisé vers la source de lumière
};

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function createPlanet(opts: Partial<PlanetState> = {}): PlanetState {
  const radius = opts.radius ?? 180;
  const palette = opts.palette ?? PLANET_PALETTES[0];

  // Continents répartis via golden angle (évite les clusters) avec tailles variables
  const blobs: Blob[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5)); // angle d'or
  const totalBlobs = 14;
  for (let i = 0; i < totalBlobs; i++) {
    const nSec = 14;
    const radii: number[] = [];
    const f1 = 1 + Math.floor(Math.random() * 2);
    const f2 = 2 + Math.floor(Math.random() * 2);
    const phi1 = Math.random() * Math.PI * 2;
    const phi2 = Math.random() * Math.PI * 2;
    const a1 = rand(0.2, 0.4);
    const a2 = rand(0.08, 0.2);
    for (let j = 0; j < nSec; j++) {
      const ang = (j / nSec) * Math.PI * 2;
      const r = 1 + a1 * Math.sin(f1 * ang + phi1) + a2 * Math.sin(f2 * ang + phi2);
      radii.push(Math.max(0.5, r));
    }
    // Distribution uniforme sur sphère : lat via arcsin, lng via golden angle
    const y = 1 - (i / (totalBlobs - 1)) * 2; // -1..1
    const lat = Math.asin(y * 0.85);
    const lng = ((i * golden) % (Math.PI * 2)) - Math.PI;
    // Taille : mélange 3 classes via indice
    let size: number;
    if (i < 3) size = rand(0.32, 0.42);       // 3 gros
    else if (i < 8) size = rand(0.18, 0.26);  // 5 moyens
    else size = rand(0.08, 0.14);             // 6 petites îles
    blobs.push({ lng, lat, size, radii });
  }

  // Cratères uniquement sur palettes « rocheuses » (basedark très foncé)
  // → laissé paramétrable mais réduit à 2-3 max
  const craterCount = 0; // par défaut pas de cratères — les continents suffisent
  const craters: Crater[] = [];
  for (let i = 0; i < craterCount; i++) {
    craters.push({
      lng: rand(-Math.PI, Math.PI),
      lat: rand(-1, 1) * 0.85,
      size: rand(8, 18),
    });
  }

  // ~120 étoiles réparties dans un carré large autour de la planète
  const stars: Star[] = [];
  const starCount = 120;
  const spread = radius * 4;
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: rand(-spread, spread),
      y: rand(-spread, spread),
      r: rand(0.5, 2.2),
      twinkleSpeed: rand(0.001, 0.003),
      twinkleOffset: rand(0, Math.PI * 2),
    });
  }

  return {
    radius,
    palette,
    rotationSpeed: opts.rotationSpeed ?? 0.00008, // très lent
    rotation: opts.rotation ?? 0,
    tilt: opts.tilt ?? 0.2,
    blobs,
    craters,
    stars,
    lightDir: opts.lightDir ?? { x: -0.6, y: -0.55 }, // lumière venant du haut-gauche
  };
}

export function updatePlanet(p: PlanetState, _now: number, dt: number): void {
  p.rotation += p.rotationSpeed * dt;
}

export function drawStars(ctx: CanvasRenderingContext2D, p: PlanetState, now: number): void {
  ctx.save();
  for (const s of p.stars) {
    const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(now * s.twinkleSpeed + s.twinkleOffset));
    ctx.globalAlpha = tw;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Projette (lng, lat) sur le plan 2D de la sphère vue de face, avec rotation globale.
// Retourne { x, y, visible, shade } où shade ∈ [0..1] est 1 côté lumière, 0 côté ombre.
function project(p: PlanetState, lng: number, lat: number): { x: number; y: number; visible: boolean; shade: number } {
  const l = lng + p.rotation;
  // Rotation autour axe vertical : x = sin(l) * cos(lat), z = cos(l) * cos(lat)
  // Puis inclinaison (tilt sur axe horizontal) pour l'esthétique.
  const cosLat = Math.cos(lat);
  let x = Math.sin(l) * cosLat;
  let y = Math.sin(lat);
  const z = Math.cos(l) * cosLat;
  // Appliquer tilt autour de X
  const yT = y * Math.cos(p.tilt) - z * Math.sin(p.tilt);
  const zT = y * Math.sin(p.tilt) + z * Math.cos(p.tilt);
  y = yT;
  // Projection orthographique (pas de perspective, plus simple)
  const sx = x * p.radius;
  const sy = y * p.radius;
  const visible = zT > -0.1; // seuil de coupure légèrement au-delà du terminateur
  // Shade : produit scalaire entre normale surface et lightDir (approximé en 2D ici)
  const nx = x, ny = y;
  const shade = Math.max(0, -(nx * p.lightDir.x + ny * p.lightDir.y));
  return { x: sx, y: sy, visible, shade };
}

export function drawPlanet(ctx: CanvasRenderingContext2D, p: PlanetState): void {
  const R = p.radius;

  // === Atmosphère externe (halo) ===
  const halo = ctx.createRadialGradient(0, 0, R * 0.95, 0, 0, R * 1.25);
  halo.addColorStop(0, p.palette.atmosphere);
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.25, 0, Math.PI * 2);
  ctx.fill();

  // === Disque planète : base unie puis clip pour tout ce qui suit ===
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.clip();

  // Fond : gradient radial décalé vers light source
  const lx = p.lightDir.x * R * 0.5;
  const ly = p.lightDir.y * R * 0.5;
  const grad = ctx.createRadialGradient(lx, ly, R * 0.1, 0, 0, R * 1.1);
  grad.addColorStop(0, p.palette.base);
  grad.addColorStop(0.65, p.palette.base);
  grad.addColorStop(1, p.palette.baseDark);
  ctx.fillStyle = grad;
  ctx.fillRect(-R, -R, R * 2, R * 2);

  // === Continents (blobs projetés) ===
  // Chaque blob : N points polaires autour du centre, tracé lissé via quadraticCurveTo
  // avec les midpoints comme anchors (technique classique de smoothing fermé).
  for (const b of p.blobs) {
    const c = project(p, b.lng, b.lat);
    if (!c.visible) continue;
    const z = Math.sqrt(Math.max(0, 1 - (c.x / R) ** 2 - (c.y / R) ** 2));
    // Construire les points cartésiens autour du centre (foreshortening en X)
    const pts: Array<[number, number]> = [];
    const nSec = b.radii.length;
    for (let j = 0; j < nSec; j++) {
      const ang = (j / nSec) * Math.PI * 2;
      const r = b.radii[j] * b.size * R;
      pts.push([Math.cos(ang) * r * z, Math.sin(ang) * r]);
    }
    ctx.save();
    ctx.translate(c.x, c.y);
    // Smoothing : on trace via midpoints comme anchors, pts comme controls
    ctx.beginPath();
    const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const first = mid(pts[nSec - 1], pts[0]);
    ctx.moveTo(first[0], first[1]);
    for (let i = 0; i < nSec; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % nSec];
      const m = mid(p0, p1);
      ctx.quadraticCurveTo(p0[0], p0[1], m[0], m[1]);
    }
    ctx.closePath();
    ctx.fillStyle = p.palette.land;
    ctx.fill();
    // Contour discret (pas de gros outline : on veut une texture, pas un dessin enfantin)
    ctx.strokeStyle = p.palette.landDark;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // === Cratères ===
  for (const cr of p.craters) {
    const c = project(p, cr.lng, cr.lat);
    if (!c.visible) continue;
    const z = Math.sqrt(Math.max(0, 1 - (c.x / R) ** 2 - (c.y / R) ** 2));
    const rx = cr.size * z; // foreshortening horizontal
    const ry = cr.size;
    ctx.save();
    ctx.translate(c.x, c.y);
    // Fond cratère
    ctx.fillStyle = p.palette.crater;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    // Highlight bord opposé à la lumière (simule la profondeur)
    ctx.fillStyle = p.palette.highlight;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(-p.lightDir.x * rx * 0.4, -p.lightDir.y * ry * 0.4, rx * 0.75, ry * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // === Terminateur : voile sombre qui recouvre la moitié ombragée ===
  // Gradient du côté lumière (transparent) vers côté opposé (sombre).
  const termX = -p.lightDir.x;
  const termY = -p.lightDir.y;
  const termGrad = ctx.createLinearGradient(-termX * R, -termY * R, termX * R * 1.1, termY * R * 1.1);
  termGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  termGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
  termGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = termGrad;
  ctx.fillRect(-R, -R, R * 2, R * 2);

  // === Reflet spéculaire (petit highlight lumineux côté lumière) ===
  const specX = p.lightDir.x * R * 0.55;
  const specY = p.lightDir.y * R * 0.55;
  const spec = ctx.createRadialGradient(specX, specY, 0, specX, specY, R * 0.45);
  spec.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  spec.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = spec;
  ctx.fillRect(-R, -R, R * 2, R * 2);

  ctx.restore();

  // === Contour planète (fin, trace la silhouette) ===
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();
}
