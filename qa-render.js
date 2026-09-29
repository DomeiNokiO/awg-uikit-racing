const puppeteer = require('puppeteer-core');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8099';
const VIEWPORTS = {
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1 },
  mobile: { width: 375, height: 812, deviceScaleFactor: 2, isMobile: true }
};

const pages = [
  ['landing', '/landing.html'],
  ['docs', '/docs.html'],
  ['nms-dashboard', '/templates/nms-dashboard.html'],
  ['chat', '/templates/chat.html'],
  ['work-order', '/templates/work-order.html'],
  ['invoice', '/templates/invoice.html'],
  ['search', '/templates/search.html']
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const out = [];
  for (const [name, urlPath] of pages) {
    const page = await browser.newPage();
    const errors = [];
    const failed = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('requestfailed', req => failed.push({ url: req.url().replace(BASE, ''), reason: req.failure()?.errorText }));

    // desktop
    await page.setViewport(VIEWPORTS.desktop);
    await page.goto(BASE + urlPath, { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(800);
    const desk = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
    await page.screenshot({ path: `/root/.hermes/cache/scratch/screenshots/${name}-desktop.png`, fullPage: false });

    // mobile
    await page.setViewport(VIEWPORTS.mobile);
    await page.goto(BASE + urlPath, { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(800);
    const mob = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
    await page.screenshot({ path: `/root/.hermes/cache/scratch/screenshots/${name}-mobile.png`, fullPage: true });

    out.push({ name, desktop: desk, mobile: mob, errors, failed });
    await page.close();
  }

  await browser.close();
  fs.writeFileSync('/tmp/render-audit.json', JSON.stringify(out, null, 2));
  console.log('done');
})();
