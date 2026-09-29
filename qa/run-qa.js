const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
const OUT = process.env.QA_OUT || '/root/.hermes/cache/scratch/qa';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  tablet:  { width: 768,  height: 1024, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  mobile:  { width: 375,  height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  small:   { width: 320,  height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
};

const pages = [
  ['index',              '/index.html'],
  ['landing',            '/landing.html'],
  ['docs',               '/docs.html'],
  ['playground',         '/playground.html'],
  ['nms-dashboard',      '/templates/nms-dashboard.html'],
  ['franchise-dashboard','/templates/franchise-dashboard.html'],
  ['admin-dashboard',    '/templates/admin-dashboard.html'],
  ['chat',               '/templates/chat.html'],
  ['work-order',         '/templates/work-order.html'],
  ['invoice',            '/templates/invoice.html'],
  ['billing',            '/templates/billing.html'],
  ['profile',            '/templates/profile.html'],
  ['search',            '/templates/search.html'],
  ['security',           '/templates/security.html'],
  ['settings',           '/templates/settings.html'],
  ['blade-example',      '/templates/blade-example.html'],
  ['auth-login',         '/templates/auth/login.html'],
  ['auth-register',      '/templates/auth/register.html'],
  ['auth-forgot',        '/templates/auth/forgot-password.html'],
  ['auth-2fa',           '/templates/auth/2fa.html'],
  ['err-403',            '/templates/errors/403.html'],
  ['err-404',            '/templates/errors/404.html'],
  ['err-500',            '/templates/errors/500.html'],
  ['err-503',            '/templates/errors/503.html']
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ignoreFail = u => /openstreetmap\.org|tile\.|basemaps\.|fonts\.googleapis/.test(u);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const report = [];
  for (const [name, urlPath] of pages) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    const errors = [], failed = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('requestfailed', r => { if (!ignoreFail(r.url())) failed.push(r.url().replace(BASE, '') + ' :: ' + (r.failure() && r.failure().errorText)); });
    page.on('response', r => { if (r.status() >= 400 && !ignoreFail(r.url())) failed.push(r.status() + ' ' + r.url().replace(BASE, '')); });

    const rec = { name, url: urlPath, viewports: {}, errors, failed };
    const allErrors = new Set(), allFailed = new Set();

    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      errors.length = 0; failed.length = 0;
      await page.setViewport(vp);
      try {
        await page.goto(BASE + urlPath, { waitUntil: 'networkidle2', timeout: 30000 });
      } catch (e) {
        rec.viewports[vpName] = { navError: String(e.message).slice(0, 200) };
        allErrors.add('nav: ' + e.message.slice(0, 120));
        continue;
      }
      await sleep(700);
      const info = await page.evaluate(() => {
        const de = document.documentElement;
        // horizontal overflow: elements wider than viewport
        const vw = de.clientWidth;
        const overflow = [];
        document.querySelectorAll('body *').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > vw + 2 || r.left < -2)) {
            const cls = (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0, 3).join('.') : '';
            overflow.push(el.tagName.toLowerCase() + (cls ? '.' + cls : '') + ' [' + Math.round(r.left) + '..' + Math.round(r.right) + ']');
          }
        });
        // icon health: every <use> that points at the sprite should resolve
        const uses = [...document.querySelectorAll('svg.awg-ic use')];
        const badUse = uses.filter(u => {
          const h = u.getAttribute('href') || u.getAttribute('xlink:href') || '';
          return !h.includes('icons.svg');
        }).map(u => u.getAttribute('href'));
        // does the sprite document actually contain the referenced ids?
        const spriteIds = (() => {
          try {
            const cur = [...uses].map(u => (u.getAttribute('href') || '').split('#')[1]).filter(Boolean);
            return cur;
          } catch (e) { return []; }
        })();
        // count empty-rendered icons: <use> whose parent svg has zero painted size
        let zeroSized = 0;
        uses.forEach(u => { const s = u.ownerSVGElement; if (s) { const b = s.getBoundingClientRect(); if (b.width === 0 || b.height === 0) zeroSized++; } });
        return {
          docW: de.scrollWidth, viewW: vw, docH: de.scrollHeight,
          overflowX: de.scrollWidth - vw,
          overflowSample: overflow.slice(0, 6),
          overflowCount: overflow.length,
          uses: uses.length,
          badUseHref: [...new Set(badUse)].slice(0, 5),
          zeroSizedIcons: zeroSized,
          iconRefs: [...new Set(spriteIds)].length,
          title: document.title,
          bodyText: (document.body.innerText || '').length
        };
      });
      // does the sprite fetch the right URL?
      const spriteFetch = await page.evaluate(() => {
        const u = document.querySelector('svg.awg-ic use');
        if (!u) return null;
        const href = u.getAttribute('href') || '';
        return href;
      });
      rec.viewports[vpName] = Object.assign({ spriteHref: spriteFetch }, info);
      errors.forEach(e => allErrors.add(vpName + ' ' + e));
      failed.forEach(f => allFailed.add(vpName + ' ' + f));
      await page.screenshot({ path: path.join(OUT, name + '-' + vpName + '.png'), fullPage: (vpName === 'mobile' || vpName === 'small') });
    }
    rec.errorsAll = [...allErrors];
    rec.failedAll = [...allFailed];
    report.push(rec);
    await page.close();
    console.log('[ok]', name, 'overflow:', Object.entries(rec.viewports).map(([k, v]) => k + '=' + (v.overflowX ?? 'n/a')).join(' '));
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  const bad = report.filter(r => r.errorsAll.length || r.failedAll.length || Object.values(r.viewports).some(v => (v.overflowX || 0) > 2));
  console.log('\n== SUMMARY ==');
  console.log('pages:', report.length, 'clean:', report.length - bad.length, 'issues:', bad.length);
  bad.forEach(r => console.log(' !', r.name, 'err:', r.errorsAll.slice(0, 3), 'failed:', r.failedAll.slice(0, 3)));
})();
