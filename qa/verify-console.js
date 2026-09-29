const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const pages = ['/index.html', '/landing.html', '/docs.html', '/playground.html',
  '/templates/nms-dashboard.html', '/templates/chat.html', '/templates/invoice.html',
  '/templates/work-order.html', '/templates/admin-dashboard.html', '/templates/profile.html',
  '/templates/settings.html', '/templates/security.html', '/templates/search.html',
  '/templates/billing.html', '/templates/franchise-dashboard.html', '/templates/blade-example.html',
  '/templates/auth/login.html', '/templates/auth/register.html',
  '/templates/auth/forgot-password.html', '/templates/auth/2fa.html', '/templates/errors/403.html', '/templates/errors/404.html',
  '/templates/errors/500.html', '/templates/errors/503.html'];

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  let problems = 0;
  for (const u of pages) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1280, height: 900 });
    const errs = [], failed = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('requestfailed', r => {
      const u = r.url();
      if (/openstreetmap|tile\.|\.png\?/.test(u) && !u.includes(BASE)) return;   // tile eksternal (egress diblokir di sandbox)
      failed.push(u.replace(BASE, '') + ' :: ' + (r.failure() || {}).errorText);
    });
    page.on('response', r => { if (r.status() >= 400) failed.push('HTTP ' + r.status() + ' ' + r.url().replace(BASE, '')); });
    await page.goto(BASE + u, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(900);
    // also exercise the notif + palette + datepicker + lightbox on each page where present
    await page.evaluate(async () => {
      const b = document.querySelector('[data-awg-notif-btn]'); if (b) { b.click(); await new Promise(r => setTimeout(r, 300)); b.click(); }
      const p = document.querySelector('[data-awg-palette]'); if (p) { p.click(); await new Promise(r => setTimeout(r, 300)); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); }
      const d = document.querySelector('input[data-awg-date]'); if (d) { d.click(); await new Promise(r => setTimeout(r, 250)); d.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); }
      const t = document.querySelector('[data-awg-theme-toggle]'); if (t) { t.click(); await new Promise(r => setTimeout(r, 150)); t.click(); }
    });
    await sleep(400);
    const bad = errs.length || failed.length;
    if (bad) problems++;
    console.log((bad ? 'ISSUE ' : 'ok    ') + u + (bad ? '  errors=' + JSON.stringify(errs.slice(0, 3)) + ' failed=' + JSON.stringify(failed.slice(0, 3)) : ''));
    await page.close();
  }
  console.log('\npages with problems: ' + problems + ' / ' + pages.length);
  await browser.close();
})();
