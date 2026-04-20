// Charge la page HexGL et dump toutes les erreurs / warnings de la console.
// Usage: node tools/capture-console.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}\n${err.stack || ''}`));
  page.on('requestfailed', req =>
    logs.push(`[requestfailed] ${req.url()} — ${req.failure()?.errorText}`)
  );

  try {
    await page.goto('http://localhost:8000/?godmode=1', { waitUntil: 'load', timeout: 15000 });
    // Click through the start UI to trigger game init
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const s1 = document.getElementById('start'); if (s1) s1.click();
    });
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const s2 = document.getElementById('step-2'); if (s2) s2.click();
    });
    // Long observation window for watching the AI drive.
    for (let t = 0; t < 180; t++) {
      await page.waitForTimeout(1000);
      const snap = await page.evaluate(() => {
        const h = window.hexGL;
        if (!h || !h.gameplay) return null;
        const sc = h.components.shipControls;
        return {
          lap: h.gameplay.lap,
          prev: h.gameplay.previousCheckPoint,
          step: h.gameplay.step,
          result: h.gameplay.result && h.gameplay.result,
          x: sc.dummy.position.x.toFixed(0),
          z: sc.dummy.position.z.toFixed(0),
          speed: sc.getRealSpeed(100),
          shield: sc.getShield(100),
          dest: sc.destroyed,
          keyL: sc.key.left, keyR: sc.key.right, keyF: sc.key.forward,
          dbg: window.__aiDbg
        };
      });
      logs.push(`[t=${t+1}s] ${JSON.stringify(snap)}`);
      if (t % 10 === 9) await page.screenshot({ path: `tools/ai-t${t+1}.png` });
      if (snap && snap.step === 100) { logs.push('[finished]'); break; }
    }
  } catch (e) {
    logs.push(`[script-error] ${e.message}`);
  }

  console.log(logs.slice(0, 80).join('\n'));
  console.log(`\n--- total log lines: ${logs.length} ---`);
  await browser.close();
})();
