const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('http://localhost:8000/?godmode=1');
  await page.waitForTimeout(500);
  await page.evaluate(() => document.getElementById('start').click());
  await page.waitForTimeout(300);
  await page.evaluate(() => document.getElementById('step-2').click());
  // Wait for the race to actually start (countdown ~4s).
  await page.waitForTimeout(6000);

  async function run(label, dir, seconds) {
    await page.evaluate((d) => { window.__aiTest = d; }, dir);
    const start = await page.evaluate(() => {
      const p = window.hexGL.components.shipControls.dummy.position;
      return { x: p.x, z: p.z };
    });
    await page.waitForTimeout(seconds * 1000);
    const end = await page.evaluate(() => {
      const p = window.hexGL.components.shipControls.dummy.position;
      return { x: p.x, z: p.z };
    });
    console.log(`${label}: dx=${(end.x - start.x).toFixed(0)}  dz=${(end.z - start.z).toFixed(0)}`);
    // Reset ship
    await page.evaluate(() => {
      window.hexGL.components.shipControls.reset(
        window.hexGL.track.spawn, window.hexGL.track.spawnRotation);
    });
    await page.waitForTimeout(300);
  }

  await run('straight', 'straight', 2);
  await run('keyLEFT ', 'left',     2);
  await run('straight', 'straight', 2);
  await run('keyRIGHT', 'right',    2);

  await browser.close();
})();
