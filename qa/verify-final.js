const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });

  // 1) chat.html notification panel now works
  for (const w of [1280, 320]) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(BASE + '/templates/chat.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1400);
    const r = await page.evaluate(async () => {
      const btn = document.querySelector('[data-awg-notif-btn]');
      const panel = document.querySelector('.awg-notif-panel');
      const out = { hasPanel: !!panel };
      if (!panel) return out;
      btn.click(); await new Promise(r => setTimeout(r, 450));
      out.opened = panel.classList.contains('open');
      out.items = panel.querySelectorAll('.awg-notif-item').length;
      out.badgeText = document.querySelector('[data-awg-notif-count]').textContent;
      out.badgeVisible = !document.querySelector('[data-awg-notif-count]').hidden;
      const pr = panel.getBoundingClientRect();
      out.rect = [Math.round(pr.left), Math.round(pr.right)];
      out.inViewport = pr.left >= -1 && pr.right <= innerWidth + 1;
      const tabs = [...panel.querySelectorAll('[data-filter]')];
      tabs[1].click(); await new Promise(r => setTimeout(r, 300));
      out.filtered = panel.querySelectorAll('.awg-notif-item').length;
      tabs[0].click(); await new Promise(r => setTimeout(r, 250));
      panel.querySelector('[data-awg-notif-mark]').click();
      await new Promise(r => setTimeout(r, 300));
      out.unreadAfterMark = panel.querySelectorAll('.awg-notif-item.unread').length;
      document.body.click(); await new Promise(r => setTimeout(r, 250));
      out.closed = !panel.classList.contains('open');
      return out;
    });
    console.log(`CHAT@${w}:`, JSON.stringify(r), 'errors:', JSON.stringify(errs.slice(0, 2)));
    await page.close();
  }

  // 2) icon sprite integrity across pages: every <use href> must resolve
  const pages = ['/index.html', '/landing.html', '/docs.html', '/playground.html',
    '/templates/nms-dashboard.html', '/templates/chat.html', '/templates/invoice.html',
    '/templates/work-order.html', '/templates/admin-dashboard.html', '/templates/profile.html',
    '/templates/settings.html', '/templates/security.html', '/templates/search.html',
    '/templates/billing.html', '/templates/franchise-dashboard.html', '/templates/blade-example.html',
    '/templates/auth/login.html', '/templates/auth/register.html', '/templates/auth/forgot.html',
    '/templates/auth/2fa.html', '/templates/errors/403.html', '/templates/errors/404.html',
    '/templates/errors/500.html', '/templates/errors/503.html'];
  const sprite = new Set();
  const page0 = await browser.newPage();
  await page0.goto(BASE + '/assets/icons.svg', { waitUntil: 'domcontentloaded' });
  const ids = await page0.evaluate(() => [...document.querySelectorAll('symbol')].map(s => s.id));
  ids.forEach(i => sprite.add(i));
  console.log('sprite symbols:', ids.length);
  await page0.close();

  let allMissing = {};
  for (const u of pages) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(BASE + u, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(700);
    const missing = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('use').forEach(us => {
        let h = us.getAttribute('href') || us.getAttribute('xlink:href') || '';
        if (!h.includes('#')) return;
        const id = h.split('#')[1];
        // check the symbol exists in the referenced file
        out.push({ id, file: h.split('#')[0] });
      });
      return out;
    });
    // fetch each referenced sprite and check ids
    const fileMap = {};
    for (const m of missing) { if (!fileMap[m.file]) fileMap[m.file] = await page.evaluate(async f => {
      try { const r = await fetch(f); const t = await r.text(); return [...t.matchAll(/<symbol[^>]*id="([^"]+)"/g)].map(x => x[1]); } catch (e) { return null; }
    }, m.file); }
    const bad = [...new Set(missing.filter(m => { const l = fileMap[m.file]; return !l || !l.includes(m.id); }).map(m => m.file + '#' + m.id))];
    if (bad.length) allMissing[u] = bad;
    const empties = await page.evaluate(() => {
      const vis = el => { let p = el; while (p && p !== document.documentElement) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false; p = p.parentElement; } return true; };
      return [...document.querySelectorAll('svg.awg-ic > use')].filter(u => { if (!vis(u)) return false; const b = u.getBoundingClientRect(); return b.width < 2 && b.height < 2; }).map(u => u.getAttribute('href'));
    });
    if (empties.length) allMissing[u] = (allMissing[u] || []).concat(['EMPTY-RENDER: ' + [...new Set(empties)].join(', ')]);
    await page.close();
  }
  console.log('icon problems:', Object.keys(allMissing).length === 0 ? 'NONE — all pages resolve every icon' : JSON.stringify(allMissing, null, 1));
  await browser.close();
})();
