import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
await page.goto('http://localhost:5173/?showcase=bg', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: '/tmp/bg-01-violet.png' });
// cycle palettes
for (let i = 0; i < 4; i++) {
  await page.click('canvas');
  await page.waitForTimeout(600);
}
await page.screenshot({ path: '/tmp/bg-02-volcanic.png' });
await page.click('canvas');
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/bg-03-ice.png' });
await browser.close();
console.log('ERRORS:', errors.length ? errors.join('\n') : '(none)');
