const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const targets = process.argv.slice(2);

// find the TRUE culprits: elements sticking out of the viewport that are NOT
// contained by any scrollable/clipping ancestor (so they really widen the page)
const probe = () => {
  const vw = document.documentElement.clientWidth;
  const contained = el => {
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') return true;
      p = p.parentElement;
    }
    return false;
  };
  const rows = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    if (r.right <= vw + 1) return;
    if (contained(el)) return;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' && r.width >= vw) return;   // overlays/backdrops follow doc width
    const cls = (typeof el.className === 'string' ? el.className : '').split(/\s+/).filter(Boolean).slice(0, 4).join('.');
    rows.push({
      sel: el.tagName.toLowerCase() + (cls ? '.' + cls : '') + (el.id ? '#' + el.id : ''),
      left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
      depth: (() => { let d = 0, p = el; while (p && p !== document.body) { d++; p = p.parentElement; } return d; })(),
      pos: cs.position, disp: cs.display, ws: cs.whiteSpace, minW: cs.minWidth, wCss: cs.width,
      txt: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50)
    });
  });
  return { vw, docW: document.documentElement.scrollWidth, rows };
};

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  for (const t of targets) {
    const [name, urlPath] = t.split('=');
    for (const vp of [{ n: 'small', w: 320, h: 640 }, { n: 'mobile', w: 375, h: 812 }, { n: 'tablet', w: 768, h: 1024 }]) {
      const page = await browser.newPage();
      await page.setCacheEnabled(false);
      await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1, isMobile: vp.w < 768, hasTouch: true });
      await page.goto(BASE + urlPath, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 600));
      const out = await page.evaluate(probe);
      if (out.docW - out.vw <= 1) { console.log('OK  ', name, vp.n, 'docW=' + out.docW); }
      else {
        console.log('#####', name, vp.n, 'vw=' + out.vw, 'docW=' + out.docW, '(+' + (out.docW - out.vw) + ')');
        out.rows.sort((a, b) => b.depth - a.depth).slice(0, 8).forEach(r =>
          console.log('   d' + r.depth, r.sel, 'w=' + r.w, 'L' + r.left + '-R' + r.right, r.pos, r.disp, 'ws=' + r.ws, 'minW=' + r.minW, '|', r.txt));
      }
      await page.close();
    }
  }
  await browser.close();
})();
