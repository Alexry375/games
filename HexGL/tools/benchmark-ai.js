const { chromium } = require('playwright');
(async () => {
  const N_RUNS = 2;
  const MAX_SEC = 60;
  const results = [];

  for (let run = 0; run < N_RUNS; run++) {
    const browser = await chromium.launch();
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('http://localhost:8000/?godmode=1');
    await page.waitForTimeout(400);
    await page.evaluate(() => document.getElementById('start').click());
    await page.waitForTimeout(200);
    await page.evaluate(() => document.getElementById('step-2').click());
    await page.waitForTimeout(5000); // countdown

    let maxPrev = 0, lap = 1, destroyedAt = null, lastStep = 0;
    for (let t = 0; t < MAX_SEC; t++) {
      await page.waitForTimeout(1000);
      const s = await page.evaluate(() => {
        const h = window.hexGL;
        if (!h || !h.gameplay) return null;
        const sc = h.components.shipControls;
        return { lap: h.gameplay.lap, prev: h.gameplay.previousCheckPoint,
                 step: h.gameplay.step, dest: sc.destroyed };
      });
      if (!s) continue;
      if (s.prev > maxPrev) maxPrev = s.prev;
      if (s.lap > lap) lap = s.lap;
      lastStep = s.step;
      if (s.dest && destroyedAt === null) destroyedAt = t + 1;
      if (s.step === 100 || s.dest) break;
    }
    results.push({ run: run + 1, destroyedAt, maxPrev, lap, lastStep });
    console.log(`run ${run+1}: survived=${destroyedAt ?? '>90'}s  maxCP=${maxPrev}/2  lap=${lap}  step=${lastStep}`);
    await browser.close();
  }

  const cps = results.map(r => r.maxPrev);
  const surv = results.map(r => r.destroyedAt ?? MAX_SEC);
  console.log(`\nAverage survival: ${(surv.reduce((a,b)=>a+b,0)/N_RUNS).toFixed(1)}s`);
  console.log(`Max checkpoint reached: ${Math.max(...cps)}/2 (${(Math.max(...cps)/2*100).toFixed(0)}% of one lap)`);
})();
