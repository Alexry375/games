import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';

const URL = 'http://localhost:5173/';
const OUT = '/tmp/v1-shots';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push('CONSOLE.ERROR: ' + msg.text());
});

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/01-waveintro.png` });

await page.waitForTimeout(2200);
await page.screenshot({ path: `${OUT}/02-playerturn-wave1.png` });

// Skip player turn
await page.mouse.click(1300, 870);  // skip button
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/03-after-skip.png` });

await browser.close();

console.log('\n=== ERRORS ===');
if (errors.length === 0) console.log('(none)');
else errors.forEach((e) => console.log('  ' + e));
console.log(`\nScreenshots in ${OUT}/`);
