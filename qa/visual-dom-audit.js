const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Vision-free visual QA: catch the things a screenshot would show as "broken".
const probe = () => {
  const out = { clipped: [], overlap: [], lostText: [], scrollables: 0, docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  const visible = el => {
    // tahan diri dari false positive: cek opacity/visibility SEMUA leluhur,
    // karena panel notifikasi tertutup tetap punya opacity:0 di induknya.
    let p = el;
    while (p && p !== document.documentElement) {
      const cs = getComputedStyle(p);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
      if (cs.pointerEvents === 'none' && p !== el) return false;
      p = p.parentElement;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  // 1. content clipped with no way to scroll (real "cut off" bug)
  document.querySelectorAll('body *').forEach(el => {
    const cs = getComputedStyle(el);
    const clips = ['hidden', 'clip'].includes(cs.overflowX);
    if (clips && el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
      const sel = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
      out.clipped.push({ sel, scrollW: el.scrollWidth, clientW: el.clientWidth, hidden: el.scrollWidth - el.clientWidth });
    }
    if (['auto', 'scroll'].includes(cs.overflowX) && el.scrollWidth > el.clientWidth + 2) out.scrollables++;
  });
  // 2. text that spills outside its own parent's box (visually broken)
  document.querySelectorAll('body *').forEach(el => {
    if (!el.childNodes.length) return;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!hasText || !visible(el)) return;
    const pr = el.parentElement && el.parentElement.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (!pr) return;
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX === 'visible') {
      const sel = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
      out.lostText.push({ sel, scrollW: el.scrollWidth, clientW: el.clientWidth, text: el.textContent.trim().slice(0, 40) });
    }
  });
  // 3. horizontal overlap between sibling buttons/links (tapped-target collisions)
  const rects = [];
  document.querySelectorAll('a, button').forEach(el => { if (visible(el)) rects.push({ el, r: el.getBoundingClientRect() }); });
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i].r, b = rects[j].r;
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 4 && oy > 4) {
        const t1 = rects[i].el.textContent.trim().slice(0, 20), t2 = rects[j].el.textContent.trim().slice(0, 20);
        if (t1 && t2) out.overlap.push({ a: t1, b: t2, ox: Math.round(ox), oy: Math.round(oy) });
      }
    }
  }
  out.overlap = out.overlap.slice(0, 8);
  out.clipped = out.clipped.slice(0, 8);
  out.lostText = out.lostText.slice(0, 8);
  return out;
};

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const pages = [
    ['index', '/index.html'], ['landing', '/landing.html'], ['docs', '/docs.html'], ['playground', '/playground.html'],
    ['nms', '/templates/nms-dashboard.html'], ['franchise', '/templates/franchise-dashboard.html'], ['admin', '/templates/admin-dashboard.html'],
    ['invoice', '/templates/invoice.html'], ['chat', '/templates/chat.html'], ['work-order', '/templates/work-order.html'],
    ['auth-login', '/templates/auth/login.html'], ['err-404', '/templates/errors/404.html'], ['blade', '/templates/blade-example.html']
  ];
  for (const [name, url] of pages) {
    for (const w of [320, 375, 1440]) {
      const page = await browser.newPage();
      await page.setCacheEnabled(false);
      await page.setViewport({ width: w, height: w < 500 ? 640 : 900, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: true });
      await page.goto(BASE + url, { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(900);
      const r = await page.evaluate(probe);
      const bad = r.clipped.length || r.lostText.length || r.overlap.length || r.docOverflow > 1;
      console.log((bad ? 'ISSUE ' : 'ok    ') + name + '@' + w, 'ovf=' + r.docOverflow, 'scrollable=' + r.scrollables, 'clipped=' + r.clipped.length, 'lostText=' + r.lostText.length, 'overlap=' + r.overlap.length);
      if (r.clipped.length) r.clipped.forEach(c => console.log('        CLIPPED', c.sel, c.hidden + 'px'));
      if (r.lostText.length) r.lostText.forEach(c => console.log('        LOST-TEXT', c.sel, c.hidden + 'px', '|', c.text));
      if (r.overlap.length) r.overlap.forEach(c => console.log('        OVERLAP', c.a, '<->', c.b, c.ox + 'x' + c.oy));
      await page.close();
    }
  }
  await browser.close();
})();
