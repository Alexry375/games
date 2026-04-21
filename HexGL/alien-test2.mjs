import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
const OUT = '/tmp/alien-shots3';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push('CE: ' + msg.text()); });

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

// Helper: click and wait
const click = async (x, y, wait = 500) => { await page.mouse.click(x, y); await page.waitForTimeout(wait); };

// Wait past WaveIntro
await page.waitForTimeout(3500);

// Slot coordinates (center of each)
// size=80, gap=20, totalW=280, startX=560. Slot 0 center = 600, slot 1 = 700, slot 2 = 800.
const SLOT = [[600, 840], [700, 840], [800, 840]];
const SKIP = [1340, 875];

// Mob positions for spanRad=pi/10 (±pi/20 for 2 mobs, -pi/20..+pi/20 for 3, etc.)
// Wave compositions:
// W1: 2 grunts
// W2: 2 grunts + 1 brute
// W3: grunt, sniper, gunner
// W4: brute, medic, grunt, grunt
// W5: brute, sniper, bomber, medic

// Play wave 1: abduct both grunts to fill slots 1-2
const W = 1400, H = 900;
const cx = W * 0.5, cy = H * 2.5, r = H * 2.2;
const mobPos = (angle) => [cx + r * Math.sin(angle), cy - r * Math.cos(angle)];

// W1 mobs at ±pi/20
const [x1, y1] = mobPos(-Math.PI / 20);
const [x2, y2] = mobPos(Math.PI / 20);
console.log('W1 mobs:', x1.toFixed(0), y1.toFixed(0), 'and', x2.toFixed(0), y2.toFixed(0));

await click(x1, y1, 700);
await page.screenshot({ path: `${OUT}/w1-abduct-1.png` });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/w1-after-enemy.png` });
await click(x2, y2, 700);
await page.screenshot({ path: `${OUT}/w1-abduct-2.png` });
await page.waitForTimeout(2500);  // enemy turn (no mobs left) + wave cleared + wave 2 intro
await page.screenshot({ path: `${OUT}/w2-intro-wait.png` });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/w2-playerturn.png` });

// Wave 2: 3 mobs. Select slot 0 (pistol), kill grunts
await click(SLOT[0][0], SLOT[0][1], 400);  // select pistol
await page.screenshot({ path: `${OUT}/w2-slot0-selected.png` });

// Wave 2 has 2 grunts + 1 brute. We need to find positions.
// Order in array: from spawnWave angle spread: -pi/20, 0, +pi/20 → but plan WAVES[1] = ['grunt', 'grunt', 'brute']
// So grunt at -pi/20, grunt at 0, brute at +pi/20
const [gx1, gy1] = mobPos(-Math.PI / 20);
const [gx2, gy2] = mobPos(0);
const [bx, by] = mobPos(Math.PI / 20);
console.log('W2 mob pos:', gx1, gx2, bx);

await click(gx1, gy1, 800);  // fire pistol at left grunt → kill
await page.screenshot({ path: `${OUT}/w2-after-fire-grunt1.png` });
await page.waitForTimeout(2000);  // enemy turn (2 grunts + brute fire)
await page.screenshot({ path: `${OUT}/w2-after-enemy.png` });

// Abduct the middle grunt (can't since slots full? we have 2 slots used) Actually slot 0 has pistol, slot 1 has pistol, slot 2 empty.
// Abduct middle grunt to fill slot 2
await click(gx2, gy2, 800);
await page.screenshot({ path: `${OUT}/w2-abduct-grunt2.png` });
await page.waitForTimeout(2000);

// Select slot 1 pistol, fire at brute (brute hp=4)
await click(SLOT[1][0], SLOT[1][1], 400);
await click(bx, by, 800);
await page.screenshot({ path: `${OUT}/w2-fire-at-brute.png` });
await page.waitForTimeout(3500);

await page.screenshot({ path: `${OUT}/final.png` });

await browser.close();
console.log('\nERRORS:', errors.length ? errors : '(none)');
