const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// The previous run flagged sidebar text at x ~ -252 on 320px. That is the
// off-canvas drawer. Proof they are reachable: tap the menu button and check
// the same elements land inside the viewport.
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const pages = ['/templates/search.html', '/templates/billing.html', '/templates/franchise-dashboard.html',
    '/templates/blade-example.html', '/templates/settings.html', '/templates/profile.html'];
  for (const u of pages) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 320, height: 800, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.goto(BASE + u, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(900);
    const r = await page.evaluate(async () => {
      const links = [...document.querySelectorAll('.awg-sidebar .awg-nav-link')];
      const before = links.slice(0, 3).map(l => Math.round(l.getBoundingClientRect().left));
      const btn = document.querySelector('[data-awg-menu]');
      if (!btn) return { noBtn: true };
      btn.click();
      await new Promise(r => setTimeout(r, 600));
      const after = links.slice(0, 3).map(l => Math.round(l.getBoundingClientRect().left));
      const inView = links.filter(l => { const b = l.getBoundingClientRect(); return b.left >= -1 && b.right <= innerWidth + 1; }).length;
      const side = document.querySelector('.awg-sidebar');
      const sb = side.getBoundingClientRect();
      return { before, after, totalLinks: links.length, inViewAfterTap: inView, sideLeft: Math.round(sb.left), sideRight: Math.round(sb.right), overlayVisible: !!document.querySelector('.awg-overlay.show, .awg-overlay.active') };
    });
    console.log(u + ' -> ' + JSON.stringify(r));
    await page.close();
  }
  await browser.close();
})();
