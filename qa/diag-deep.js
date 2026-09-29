const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';

// Recursive descent: find the DEEPEST element whose removal removes the
// document's horizontal overflow, then report the ancestor chain.
async function findCulprits(page, width) {
  await page.setViewport({ width, height: 800, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: true });
  return await page.evaluate(() => {
    const de = document.documentElement;
    const base = de.scrollWidth;
    if (base <= de.clientWidth + 1) return { base, vw: de.clientWidth, chain: [] };

    const overflows = () => de.scrollWidth > de.clientWidth + 1;
    // does hiding this element (and descendants) remove overflow?
    const helps = el => {
      // never hide scroll containers: they legitimately hold content
      const prev = el.style.cssText;
      el.style.setProperty('display', 'none', 'important');
      const ok = !overflows();
      el.style.cssText = prev;
      return ok;
    };

    // walk from body down, always choosing a child that helps; record the path
    let node = document.body, path = [];
    while (true) {
      let next = null;
      for (const child of node.children) {
        if (helps(child)) { next = child; break; }
      }
      if (!next) break;
      path.push(next);
      node = next;
      if (path.length > 40) break;
    }
    const describe = el => {
      const cs = getComputedStyle(el);
      const cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 4).join('.');
      const r = el.getBoundingClientRect();
      return {
        sel: el.tagName.toLowerCase() + (cls ? '.' + cls : '') + (el.id ? '#' + el.id : ''),
        w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right),
        disp: cs.display, pos: cs.position, ovf: cs.overflowX, ws: cs.whiteSpace, minW: cs.minWidth, gridCols: cs.gridTemplateColumns,
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60)
      };
    };
    return { base, vw: de.clientWidth, chain: path.map(describe) };
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const pages = JSON.parse(process.argv[2] || '[]');
  for (const [name, urlPath] of pages) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.goto(BASE + urlPath, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 500));
    for (const w of [320, 375, 768]) {
      const res = await findCulprits(page, w);
      if (!res.chain.length) { console.log('OK  ', name, 'w=' + w); continue; }
      console.log('####', name, 'w=' + w, 'docW=' + res.base);
      res.chain.slice(-4).forEach(c => console.log('    ', c.sel, 'w=' + c.w, 'L' + c.left + '-R' + c.right, c.disp, c.pos, 'ovfX=' + c.ovf, 'grid=' + c.gridCols, '|', c.text));
    }
    await page.close();
  }
  await browser.close();
})();
