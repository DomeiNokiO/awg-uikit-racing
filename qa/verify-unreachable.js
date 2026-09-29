const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// The failsafe html/body{overflow-x:clip} could hide content that is pushed
// outside the viewport, since the page can no longer be scrolled to reach it.
// Test: any TEXT-bearing element whose box escapes the viewport and whose
// ancestors offer no scrolling => genuinely unreachable content = real bug.
const probe = () => {
  const vw = innerWidth;
  const unreachable = [];
  const scrollableAncestor = el => {
    let p = el.parentElement;
    while (p && p !== document.body) {
      const c = getComputedStyle(p);
      if (['auto', 'scroll'].includes(c.overflowX) && p.scrollWidth > p.clientWidth + 2) return p.tagName + '.' + (typeof p.className === 'string' ? p.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
      if (['hidden', 'clip'].includes(c.overflowX) && p.scrollWidth > p.clientWidth + 2) return null; // intentionally truncated here
      p = p.parentElement;
    }
    return false;
  };
  document.querySelectorAll('body *').forEach(el => {
    // only leaf-ish text holders
    const hasOwnText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasOwnText) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
    if (cs.overflowX === 'hidden' || cs.overflowX === 'clip') return; // designed truncation (e.g. .awg-ellipsis)
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.right > vw + 1 || r.left < -1) {
      const scroll = scrollableAncestor(el);
      if (scroll === false) {  // no ancestor can bring it into view
        unreachable.push({
          sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
          text: el.textContent.trim().slice(0, 45),
          left: Math.round(r.left), right: Math.round(r.right), vw
        });
      }
    }
  });
  return unreachable.slice(0, 6);
};

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const pages = ['/index.html', '/landing.html', '/docs.html', '/playground.html',
    '/templates/nms-dashboard.html', '/templates/chat.html', '/templates/invoice.html',
    '/templates/work-order.html', '/templates/admin-dashboard.html', '/templates/profile.html',
    '/templates/settings.html', '/templates/security.html', '/templates/search.html',
    '/templates/billing.html', '/templates/franchise-dashboard.html', '/templates/blade-example.html',
    '/templates/auth/login.html', '/templates/auth/register.html', '/templates/auth/forgot-password.html',
    '/templates/auth/2fa.html', '/templates/errors/403.html', '/templates/errors/404.html',
    '/templates/errors/500.html', '/templates/errors/503.html'];
  let hits = 0;
  for (const u of pages) {
    for (const w of [320, 1440]) {
      const page = await browser.newPage();
      await page.setCacheEnabled(false);
      await page.setViewport({ width: w, height: 800, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 });
      await page.goto(BASE + u, { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(800);
      const r = await page.evaluate(probe);
      if (r.length) { hits++; console.log('UNREACHABLE ' + u + '@' + w + ':', JSON.stringify(r)); }
      await page.close();
    }
  }
  console.log(hits === 0 ? '\nOK: tidak ada konten teks yang tak terjangkau di 24 halaman x 2 viewport' : '\n' + hits + ' halaman punya konten tak terjangkau');
  await browser.close();
})();
