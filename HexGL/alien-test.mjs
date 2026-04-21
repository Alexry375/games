import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
const OUT = '/tmp/alien-shots2';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push('CE: ' + msg.text()); });

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/01-waveintro.png` });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/02-playerturn.png` });

// New spanRad = pi/10 → mobs at ±pi/20 ≈ ±9°. radiusRel=2.2, h=900 → r=1980
// x_offset at ±pi/20 = 1980 * sin(pi/20) = 309. So mobs at x=391 and x=1009
// y = cy - r*cos(pi/20) = 2250 - 1980*0.988 = 292
const x1 = 391, y1 = 292;
const x2 = 1009, y2 = 292;
console.log(`Mobs expected at (${x1},${y1}) and (${x2},${y2})`);

await page.mouse.click(x1, y1);
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/03-after-abduct.png` });
await page.waitForTimeout(2200);
await page.screenshot({ path: `${OUT}/04-after-enemy-turn.png` });

// slot 0 click: slotRect w=80 gap=20, totalW=280, startX=560, slot0 center = 600
await page.mouse.click(600, 840);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/05-slot-selected.png` });
await page.mouse.click(x2, y2);
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/06-after-fire.png` });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/07-wave2-intro.png` });
await page.waitForTimeout(2200);
await page.screenshot({ path: `${OUT}/08-wave2-playerturn.png` });

await browser.close();
console.log('\nERRORS:', errors.length ? errors : '(none)');
