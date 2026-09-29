const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const targets = process.argv.slice(2);

// definitive culprit hunt: for each offending element, hide it briefly and see
// whether the document's horizontal scroll width shrinks. The FIRST element
// (shallowest) whose removal fixes it is the true container to fix.
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  for (const t of targets) {
    const [name, urlPath] = t.split('=');
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 320, height: 640, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.goto(BASE + urlPath, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 700));
    const res = await page.evaluate(() => {
      const de = document.documentElement;
      const base = de.scrollWidth;
      const vw = de.clientWidth;
      // candidates: elements whose right edge exceeds viewport
      const cands = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.right > vw + 1) {
          let d = 0, p = el; while (p && p !== document.body) { d++; p = p.parentElement; }
          cands.push({ el, d, right: Math.round(r.right), sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '') });
        }
      });
      // test in ascending depth order
      cands.sort((a, b) => a.d - b.d);
      const culprits = [];
      for (const c of cands) {
        const prev = c.el.style.cssText;
        // try overflow clip first (less destructive than display:none)
        c.el.style.setProperty('overflow-x', 'clip', 'important');
        const afterClip = de.scrollWidth;
        c.el.style.cssText = prev;
        if (afterClip < base) { culprits.push({ sel: c.sel, d: c.d, right: c.right, fix: 'overflow-x:clip', became: afterClip }); continue; }
        c.el.style.setProperty('display', 'none', 'important');
        const afterHide = de.scrollWidth;
        c.el.style.cssText = prev;
        if (afterHide < base) culprits.push({ sel: c.sel, d: c.d, right: c.right, fix: 'display:none', became: afterHide });
      }
      return { base, vw, count: cands.length, culprits: culprits.slice(0, 8) };
    });
    console.log('####', name, 'vw=' + res.vw, 'docW=' + res.base, 'candidates=' + res.count);
    res.culprits.forEach(c => console.log('    d' + c.d, c.sel, 'right=' + c.right, '->', c.fix, '=', c.became));
    if (!res.culprits.length) console.log('    (no single-element fix found)');
    await page.close();
  }
  await browser.close();
})();
