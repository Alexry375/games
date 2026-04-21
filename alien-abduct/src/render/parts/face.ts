// Port fonctionnel de coup-ahoo/src/engine/face.ts + eye.ts
// Différences : pas d'Entity/Container OOP, juste un state object + update/draw purs.

export type FaceOptions = {
  blush: string;
  blinkDuration: number; // ms
  blinkDiff: number; // jitter intra-clignement entre œil gauche/droit
  width: number; // échelle horizontale globale du visage
  eyeSize: number;
  blushSize: number;
  mouthWidth: number;
  mouthThickness: number;
  color: string; // couleur des traits (yeux, bouche)
  blushOffset: number;
};

const DEFAULTS: FaceOptions = {
  blush: 'red',
  eyeSize: 10,
  width: 1,
  blinkDiff: 100,
  blinkDuration: 200,
  blushSize: 1,
  mouthWidth: 1,
  mouthThickness: 7,
  blushOffset: 0,
  color: '#000',
};

type EyeState = {
  x: number;
  y: number;
  size: number;
  openess: number;
  targetOpeness: number;
  nextToggleAt: number; // ms
  closing: boolean; // true pendant la phase ciliaire
};

export type FaceState = {
  options: FaceOptions;
  left: EyeState;
  right: EyeState;
  openess: number; // bouche
  targetOpeness: number;
  mouthCloseAt: number; // ms
  mirrorer: 1 | -1;
  angry: boolean;
  nextBlinkAt: number; // ms
};

function makeEye(x: number, size: number): EyeState {
  return {
    x,
    y: 0,
    size,
    openess: 1,
    targetOpeness: 1,
    nextToggleAt: 0,
    closing: false,
  };
}

export function createFace(overrides: Partial<FaceOptions> = {}): FaceState {
  const options = { ...DEFAULTS, ...overrides };
  return {
    options,
    left: makeEye(-50 * options.width, options.eyeSize),
    right: makeEye(50 * options.width, options.eyeSize),
    openess: 0,
    targetOpeness: 0,
    mouthCloseAt: 0,
    mirrorer: 1,
    angry: false,
    nextBlinkAt: 1000 + Math.random() * 3000,
  };
}

export function openMouth(face: FaceState, now: number, amount: number, closeAfterMs: number): void {
  face.targetOpeness = amount;
  face.mouthCloseAt = now + closeAfterMs;
}

function moveTowards(v: number, target: number, step: number): number {
  if (Math.abs(target - v) <= step) return target;
  return v + Math.sign(target - v) * step;
}

function updateEye(eye: EyeState, now: number, dt: number): void {
  eye.openess = moveTowards(eye.openess, eye.targetOpeness, 0.075 * (dt / 16.67));
  if (now >= eye.nextToggleAt) {
    if (eye.closing) {
      eye.targetOpeness = 1;
      eye.closing = false;
    }
    // la réouverture se fait simplement par interpolation
  }
}

export function updateFace(face: FaceState, now: number, dt: number): void {
  face.openess = moveTowards(face.openess, face.targetOpeness, 0.1 * (dt / 16.67));
  if (face.mouthCloseAt > 0 && now >= face.mouthCloseAt) {
    face.targetOpeness = 0;
    face.mouthCloseAt = 0;
  }
  if (now >= face.nextBlinkAt) {
    // clignement : les deux yeux passent targetOpeness=0 pour blinkDuration, avec jitter blinkDiff
    const jL = Math.random() * face.options.blinkDiff;
    const jR = Math.random() * face.options.blinkDiff;
    face.left.targetOpeness = 0;
    face.left.closing = true;
    face.left.nextToggleAt = now + jL + face.options.blinkDuration;
    face.right.targetOpeness = 0;
    face.right.closing = true;
    face.right.nextToggleAt = now + jR + face.options.blinkDuration;
    face.nextBlinkAt = now + 1000 + Math.random() * 3000;
  }
  updateEye(face.left, now, dt);
  updateEye(face.right, now, dt);
  if (Math.random() < 0.002) face.mirrorer = face.mirrorer === 1 ? -1 : 1;
}

function drawEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEye(ctx: CanvasRenderingContext2D, eye: EyeState, color: string): void {
  drawEllipse(ctx, eye.x, eye.y, eye.size, eye.size * eye.openess, color);
}

export function drawFace(ctx: CanvasRenderingContext2D, face: FaceState): void {
  const o = face.options;

  // Blush (joues) — à gauche et à droite
  drawEllipse(ctx, -65 * o.width - o.blushOffset, 20, 15 * o.blushSize, 10 * o.blushSize, o.blush);
  drawEllipse(ctx, 65 * o.width + o.blushOffset, 20, 15 * o.blushSize, 10 * o.blushSize, o.blush);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = o.mouthThickness;
  ctx.strokeStyle = o.color;
  ctx.fillStyle = o.color;

  // Sourcils colère
  if (face.angry) {
    ctx.beginPath();
    ctx.moveTo(-50 * o.width + 10, -5);
    ctx.lineTo(-50 * o.width - 20, -20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(50 * o.width - 10, -5);
    ctx.lineTo(50 * o.width + 20, -20);
    ctx.stroke();
  }

  // Bouche (courbée)
  ctx.save();
  ctx.scale(face.mirrorer, 1);
  ctx.beginPath();
  const mw = o.width * o.mouthWidth;
  const start = 20;
  ctx.moveTo(-40 * mw, start);
  const curve = face.angry ? -30 : 0;
  ctx.quadraticCurveTo(0, 40 - 60 * mw * face.openess + curve, 40 * mw, 20);
  ctx.quadraticCurveTo(0, 40 + 60 * mw * face.openess + curve, -40 * mw, start);
  ctx.stroke();
  ctx.fill();
  ctx.restore();

  drawEye(ctx, face.left, o.color);
  drawEye(ctx, face.right, o.color);
}
