const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const fs = require('fs');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const pages = ['/index.html', '/landing.html', '/docs.html', '/playground.html',
  '/templates/nms-dashboard.html', '/templates/chat.html', '/templates/invoice.html',
  '/templates/work-order.html', '/templates/admin-dashboard.html', '/templates/profile.html',
  '/templates/settings.html', '/templates/security.html', '/templates/search.html',
  '/templates/billing.html', '/templates/franchise-dashboard.html', '/templates/blade-example.html',
  '/templates/auth/login.html', '/templates/auth/register.html', '/templates/auth/forgot-password.html',
  '/templates/auth/2fa.html', '/templates/errors/403.html', '/templates/errors/404.html',
  '/templates/errors/500.html', '/templates/errors/503.html'];

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const broken = {};
  const checked = new Set();
  for (const u of pages) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.goto(BASE + u, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(500);
    // collect every internal href/src referenced in static markup
    const refs = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('a[href], link[href], script[src], img[src], use').forEach(el => {
        const v = el.getAttribute('href') || el.getAttribute('src');
        if (v) out.push(v);
      });
      return out;
    });
    const dir = path.posix.dirname(u);
    for (const r of refs) {
      if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(r)) continue;
      const file = r.split('#')[0].split('?')[0];
      if (!file) continue;
      // normalize relative to page dir
      const norm = path.posix.normalize(path.posix.join(dir, file));
      const key = norm;
      if (checked.has(key)) continue;
      checked.add(key);
      const disk = path.join('/root/awg-uikit-racing', norm.replace(/^\//, ''));
      let ok = fs.existsSync(disk);
      if (ok) {
        // for svg sprites also verify the fragment id exists
        const frag = r.split('#')[1];
        if (frag && norm.endsWith('.svg')) {
          const txt = fs.readFileSync(disk, 'utf8');
          if (!txt.includes('id="' + frag + '"')) { ok = false; if (!broken[u]) broken[u] = []; broken[u].push(r + '  <- fragmen #' + frag + ' tidak ada'); continue; }
        }
      }
      if (!ok) { if (!broken[u]) broken[u] = []; broken[u].push(r + ' -> ' + norm); }
    }
    await page.close();
  }
  console.log('referensi internal diperiksa:', checked.size);
  const k = Object.keys(broken);
  if (!k.length) console.log('OK: tidak ada link/aset internal yang rusak di 24 halaman');
  else k.forEach(p => console.log('BROKEN di ' + p + ':\n  ' + broken[p].join('\n  ')));
  await browser.close();
})();
