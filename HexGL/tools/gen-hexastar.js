// Generator for the Hexastar track assets (collision.png + height.png).
// Run: node tools/gen-hexastar.js
// Writes into textures/tracks/hexastar/ and textures.full/tracks/hexastar/.

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// --- Geometry params (world units) -------------------------------------------
const R_OUT = 2500;      // outer star radius
const R_IN  = 900;       // inner star radius
const HALF_W = 90;       // ribbon half-width (so full width = 180)

// --- Image params ------------------------------------------------------------
const IMG = 2048;
const WORLD_SPAN = 6000; // HexGL convention: 2048 px covers 6000 world units
const PX_PER_UNIT = IMG / WORLD_SPAN;  // ≈ 0.3413
const HALF_W_PX = HALF_W * PX_PER_UNIT; // ribbon half-width in pixels

// Build 12 star vertices (XZ plane). Alternating outer/inner.
const verts = [];
for (let i = 0; i < 12; i++) {
  const a = (i * Math.PI) / 6; // 30° steps
  const r = i % 2 === 0 ? R_OUT : R_IN;
  verts.push({ x: r * Math.cos(a), z: r * Math.sin(a) });
}

// 12 segments: verts[i] -> verts[(i+1)%12]
const segs = [];
for (let i = 0; i < 12; i++) {
  const a = verts[i], b = verts[(i + 1) % 12];
  segs.push({ ax: a.x, az: a.z, bx: b.x, bz: b.z });
}

// Checkpoint zones = 6 inner vertices (indices 1, 3, 5, 7, 9, 11 in verts[]).
// Each checkpoint painted as a small disk around its inner vertex.
// Checkpoint IDs encoded in blue channel: 0, 40, 80, 120, 160, 200.
const CP_RADIUS = 70; // world units: disk radius around inner vertex
const CP_IDS = [0, 40, 80, 120, 160, 200];
const checkpoints = [];
for (let k = 0; k < 6; k++) {
  const v = verts[2 * k + 1]; // inner vertex k
  checkpoints.push({ x: v.x, z: v.z, id: CP_IDS[k] });
}

// Distance from point (px,pz) to segment (ax,az)-(bx,bz).
function distToSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz;
  let t = ((px - ax) * dx + (pz - az) * dz) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cz = az + t * dz;
  const ex = px - cx, ez = pz - cz;
  return Math.sqrt(ex * ex + ez * ez);
}

// Image pixel (i, j) → world coord (x, z).
// HexGL: world_to_px_x = IMG/2 + world_x * PX_PER_UNIT
// inverse: world_x = (px - IMG/2) / PX_PER_UNIT
function pxToWorld(i, j) {
  return {
    x: (i - IMG / 2) / PX_PER_UNIT,
    z: (j - IMG / 2) / PX_PER_UNIT,
  };
}

// --- Generate collision.png --------------------------------------------------
function makeCollision() {
  const png = new PNG({ width: IMG, height: IMG, colorType: 2 }); // RGB
  const data = png.data;
  // Fill with black (off-track). colorType 2 → still 4 bytes/pixel in pngjs buffer.
  for (let y = 0; y < IMG; y++) {
    for (let x = 0; x < IMG; x++) {
      const w = pxToWorld(x, y);
      let onTrack = false;
      for (let s = 0; s < segs.length; s++) {
        const d = distToSeg(w.x, w.z, segs[s].ax, segs[s].az, segs[s].bx, segs[s].bz);
        if (d <= HALF_W) { onTrack = true; break; }
      }
      const idx = (y * IMG + x) * 4;
      if (onTrack) {
        // Default track: R=255, G=255, B=255 (not a checkpoint, not a boost)
        let B = 255;
        // Checkpoint disks override blue.
        for (let k = 0; k < checkpoints.length; k++) {
          const cp = checkpoints[k];
          const dxp = w.x - cp.x, dzp = w.z - cp.z;
          if (dxp * dxp + dzp * dzp <= CP_RADIUS * CP_RADIUS) { B = cp.id; break; }
        }
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = B;
        data[idx + 3] = 255;
      } else {
        data[idx] = 0; data[idx + 1] = 0; data[idx + 2] = 0; data[idx + 3] = 255;
      }
    }
  }
  return PNG.sync.write(png);
}

// --- Generate height.png -----------------------------------------------------
// All zeros → ship hovers at heightBias = 4 above the map.
function makeHeight() {
  const png = new PNG({ width: IMG, height: IMG, colorType: 2 });
  const data = png.data;
  for (let i = 0; i < IMG * IMG; i++) {
    data[i * 4] = 0; data[i * 4 + 1] = 0; data[i * 4 + 2] = 0; data[i * 4 + 3] = 255;
  }
  return PNG.sync.write(png);
}

// --- Write files -------------------------------------------------------------
const root = path.resolve(__dirname, '..');
const outDirs = [
  path.join(root, 'textures/tracks/hexastar'),
  path.join(root, 'textures.full/tracks/hexastar'),
];
for (const d of outDirs) fs.mkdirSync(d, { recursive: true });

console.log('Generating collision.png …');
const colBuf = makeCollision();
for (const d of outDirs) fs.writeFileSync(path.join(d, 'collision.png'), colBuf);

console.log('Generating height.png …');
const hBuf = makeHeight();
for (const d of outDirs) fs.writeFileSync(path.join(d, 'height.png'), hBuf);

// Print spawn info for the Hexastar.js track file.
const outer0 = verts[0];
const inner0 = verts[1];
const dirX = inner0.x - outer0.x;
const dirZ = inner0.z - outer0.z;
const yaw = Math.atan2(dirX, -dirZ); // rotation.y so forward (-Z) → (dirX, dirZ)
console.log('\n--- Spawn config for bkcore/hexgl/tracks/Hexastar.js ---');
console.log(`spawn: { x: ${outer0.x.toFixed(2)}, y: 10, z: ${outer0.z.toFixed(2)} }`);
console.log(`spawnRotation: { x: 0, y: ${yaw.toFixed(4)}, z: 0 }`);
console.log(`checkpoints: list: [${CP_IDS.join(',')}], start: 0, last: 200`);
console.log('Done.');
