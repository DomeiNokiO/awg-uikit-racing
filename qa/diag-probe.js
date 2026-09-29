const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  for (const [name, urlPath] of [['index', '/index.html'], ['docs', '/docs.html'], ['blade', '/templates/blade-example.html']]) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 320, height: 640, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.goto(BASE + urlPath, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 700));
    const out = await page.evaluate(() => {
      const de = document.documentElement;
      const measure = () => de.scrollWidth;
      const base = measure();
      const trials = [];
      const trySel = (label, sel, how) => {
        const els = [...document.querySelectorAll(sel)];
        const prev = els.map(e => e.style.cssText);
        els.forEach(e => { if (how === 'hide') e.style.setProperty('display', 'none', 'important'); else e.style.setProperty('overflow-x', 'clip', 'important'); });
        const now = measure();
        els.forEach((e, i) => e.style.cssText = prev[i]);
        trials.push({ label, sel, n: els.length, how, now, delta: base - now });
      };
      trySel('drawer', '.awg-drawer', 'hide');
      trySel('overlay', '.awg-overlay', 'hide');
      trySel('sidebar', '.awg-sidebar', 'hide');
      trySel('card-head', '.awg-card-head', 'hide');
      trySel('all pre', 'pre', 'clip');
      trySel('all table', 'table', 'clip');
      trySel('all code', 'code', 'clip');
      trySel('awg-content', '.awg-content', 'clip');
      trySel('body', 'body', 'clip');
      // multiple combos
      const combos = [['.awg-drawer', '.awg-card-head'], ['.awg-drawer', 'pre'], ['.awg-card-head', 'pre'], ['.awg-drawer', '.awg-card-head', 'pre']];
      combos.forEach(c => {
        const els = c.flatMap(s => [...document.querySelectorAll(s)]);
        const prev = els.map(e => e.style.cssText);
        els.forEach(e => e.style.setProperty('display', 'none', 'important'));
        const now = measure();
        els.forEach((e, i) => e.style.cssText = prev[i]);
        trials.push({ label: 'combo ' + c.join('+'), n: els.length, now, delta: base - now });
      });
      // what is the html/body min-width / any element with fixed px width > vw
      const fixedWide = [];
      document.querySelectorAll('body *').forEach(el => {
        const cs = getComputedStyle(el);
        const w = parseFloat(cs.width);
        if ((cs.minWidth !== 'auto' && parseFloat(cs.minWidth) > 320) || (w > 320 && cs.position === 'static' && cs.display !== 'flex' && cs.display !== 'grid' && cs.display !== 'inline')) {
          fixedWide.push(el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 3).join('.') : '') + ' w=' + Math.round(w) + ' minW=' + cs.minWidth);
        }
      });
      return { base, trials: trials.filter(t => t.delta > 0 || t.label.startsWith('combo')), fixedWide: fixedWide.slice(0, 12) };
    });
    console.log('####', name, 'docW=' + out.base);
    out.trials.forEach(t => console.log('   ', t.label, 'n=' + t.n, '-> docW=' + t.now, 'delta=' + t.delta));
    console.log('   fixedWide:', out.fixedWide);
    await page.close();
  }
  await browser.close();
})();
