const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    recordVideo: { dir: 'tools/recordings', size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('[err]', m.text()); });
  await page.goto('http://localhost:8000/?godmode=1');
  await page.waitForTimeout(400);
  await page.evaluate(() => document.getElementById('start').click());
  await page.waitForTimeout(200);
  await page.evaluate(() => document.getElementById('step-2').click());
  await page.waitForTimeout(20000); // 20s of race
  await ctx.close();
  await browser.close();
  console.log('done');
})();
