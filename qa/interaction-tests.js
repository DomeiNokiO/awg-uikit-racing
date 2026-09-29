const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8099';
const CHROME = '/root/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Real interaction tests: drive the live components and assert observable behaviour.
const results = [];
const t = (name, pass, detail) => { results.push({ name, pass, detail: detail === undefined ? '' : String(detail).slice(0, 160) }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' :: ' + String(detail).slice(0, 140) : '')); };

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const mk = async (vp) => {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport(vp || { width: 1280, height: 900, deviceScaleFactor: 1 });
    return page;
  };

  // ---------- 1. Awg globals present ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(900);
    const g = await page.evaluate(() => Object.keys(window).filter(k => /^Awg/.test(k)).sort());
    t('semua global Awg* terpasang', ['Awg', 'AwgChart', 'AwgDate', 'AwgMap', 'AwgPalette', 'AwgSelect', 'AwgTable', 'AwgTour', 'AwgWizard'].every(k => g.includes(k)), g.join(','));
    await page.close();
  }

  // ---------- 2. ICC icons actually paint ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(900);
    const icons = await page.evaluate(() => {
      const out = { total: 0, empty: [], scrollbar: [] };
      const visuallyHidden = el => {
        let p = el;
        while (p && p !== document.body) {
          const cs = getComputedStyle(p);
          if (cs.display === 'none' || cs.visibility === 'hidden') return true;
          p = p.parentElement;
        }
        return false;
      };
      document.querySelectorAll('svg.awg-ic > use').forEach(u => {
        out.total++;
        if (visuallyHidden(u)) return;               // hidden panels/icons are legitimate
        // Ikon kebab vertikal (ic-ellipsis) memang sangat sempit (~1-2px @16px),
        // jadi baru dianggap rusak kalau KEDUA sisi nyaris nol.
        const box = u.getBoundingClientRect();
        if (box.width < 2 && box.height < 2) out.empty.push(u.getAttribute('href'));
      });
      return out;
    });
    t('ikon terlihat (bukan 0x0)', icons.empty.length === 0, icons.total + ' ikon, kosong: ' + [...new Set(icons.empty)].slice(0, 6).join(' '));
    await page.close();
  }

  // ---------- 3. Toast ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(700);
    const r = await page.evaluate(async () => {
      Awg.toast('uji toast', 'ok', 3000);
      await new Promise(r => setTimeout(r, 200));
      const zone = document.querySelector('.awg-toast-zone');
      const item = zone && zone.querySelector('.awg-toast');
      return { zone: !!zone, item: !!item, text: item ? item.textContent : '', hasBar: !!(item && item.querySelector('.bar, .awg-toast-bar, [class*=bar]')) };
    });
    t('Awg.toast menampilkan pesan', r.item && r.text.includes('uji toast'), JSON.stringify(r));
    await page.close();
  }

  // ---------- 4. Modal + drawer ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(700);
    const r = await page.evaluate(async () => {
      Awg.modal.open('demoModal');
      await new Promise(r => setTimeout(r, 350));
      const m = document.getElementById('demoModal');
      const open = m.classList.contains('open') || getComputedStyle(m).display !== 'none';
      Awg.modal.close('demoModal');
      return { open, bodyLockedWhileOpen: false };
    });
    t('Awg.modal.open/close jalan', r.open, JSON.stringify(r));
    const d = await page.evaluate(async () => {
      document.querySelector('[data-awg-drawer-open="demoDrawer"]').click();
      await new Promise(r => setTimeout(r, 400));
      const el = document.getElementById('demoDrawer');
      return { open: el.classList.contains('open') };
    });
    t('drawer terbuka lewat klik', d.open, JSON.stringify(d));
    await page.close();
  }

  // ---------- 5. DataTable search + sort + paging ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1200);
    const r = await page.evaluate(async () => {
      const tbl = document.getElementById('nodesTable');
      const before = tbl.querySelectorAll('tbody tr').length;
      const search = tbl.parentElement.querySelector('input[type=search]') || document.querySelector('.awg-dt-search input');
      let afterSearch = null, afterSort = null;
      if (search) {
        search.value = 'core';
        search.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 500));
        afterSearch = tbl.querySelectorAll('tbody tr').length;
      }
      const th = tbl.querySelector('thead th');
      if (th) { th.click(); await new Promise(r => setTimeout(r, 300)); afterSort = tbl.querySelectorAll('tbody tr').length; }
      return { before, afterSearch, afterSort, hasSearch: !!search, rows: tbl.querySelectorAll('tbody tr').length };
    });
    t('DataTable: pencarian menyaring baris', r.afterSearch !== null && r.afterSearch !== r.before, JSON.stringify(r));
    t('DataTable: klik header tidak menghilangkan baris', r.afterSort !== null && r.afterSort > 0, JSON.stringify(r));
    await page.close();
  }

  // ---------- 6. Tabs ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(900);
    const r = await page.evaluate(async () => {
      const scope = document.querySelector('[data-awg-tabs]');
      const tabs = [...scope.querySelectorAll('[data-awg-tab]')];
      const first = tabs[0].dataset.awgTab, second = tabs[1].dataset.awgTab;
      const panelOf = id => document.querySelector('[data-awg-panel="' + id + '"]');
      const beforeVis = getComputedStyle(panelOf(first)).display !== 'none';
      tabs[1].click();
      await new Promise(r => setTimeout(r, 300));
      return { n: tabs.length, beforeVis, secondVisible: getComputedStyle(panelOf(second)).display !== 'none', firstHidden: getComputedStyle(panelOf(first)).display === 'none', secondActive: tabs[1].classList.contains('active') };
    });
    t('Tabs: klik tab menukar panel', r.secondVisible && r.secondActive, JSON.stringify(r));
    await page.close();
  }

  // ---------- 7. Wizard ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(900);
    const r = await page.evaluate(async () => {
      const w = document.querySelector('[data-awg-wizard]');
      if (!w) return { none: true };
      const panes = [...w.querySelectorAll('[data-awg-wpane]')];
      const vis = () => panes.map(p => getComputedStyle(p).display !== 'none');
      const v0 = vis();
      const next = w.querySelector('[data-awg-wnext]');
      if (next) { next.click(); await new Promise(r => setTimeout(r, 350)); }
      const v1 = vis();
      return { panes: panes.length, v0, v1, instance: !!w._awgWizard };
    });
    t('Wizard: tombol Lanjut pindah pane', r.panes > 1 && JSON.stringify(r.v0) !== JSON.stringify(r.v1), JSON.stringify(r));
    await page.close();
  }

  // ---------- 8. Select2 (searchable select) ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);
    const r = await page.evaluate(async () => {
      const sel = document.querySelector('select[data-awg-select], #remoteSel');
      if (!sel) return { none: true, count: document.querySelectorAll('.awg-select-wrap, .awg-sel').length };
      const wrapCount = document.querySelectorAll('.awg-sel').length;
      const opts = sel.options.length;
      // pick the 2nd real option programmatically and check the native select value follows
      const target = [...sel.options].find(o => o.value);
      if (!target) return { wrapCount, opts, noOptions: true };
      const inst = sel._awgSel || sel._awgSelect;
      if (inst && inst.setValue) inst.setValue(target.value);
      await new Promise(r => setTimeout(r, 250));
      return { wrapCount, opts, nativeValue: sel.value, expected: target.value, hasInstance: !!inst };
    });
    t('Select2: kontrol ter-mount & nilai sinkron ke <select>', r.wrapCount > 0 && (r.noOptions || r.nativeValue === r.expected), JSON.stringify(r));
    await page.close();
  }

  // ---------- 9. Charts render real SVG ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1400);
    const r = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('[data-awg-chart]')];
      const painted = nodes.filter(n => n.querySelector('svg') && n.querySelector('svg').getBoundingClientRect().height > 20);
      return { total: nodes.length, painted: painted.length, firstChildren: nodes[0] ? nodes[0].children.length : 0 };
    });
    t('Charts: setiap chart menggambar SVG', r.total > 0 && r.painted === r.total, JSON.stringify(r));
    await page.close();
  }

  // ---------- 10. Wizard/datepicker: datepicker opens and picks ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1100);
    const r = await page.evaluate(async () => {
      const inp = document.querySelector('input[data-awg-date]');
      if (!inp) return { none: true };
      inp.focus(); inp.click();
      await new Promise(r => setTimeout(r, 350));
      const pop = document.querySelector('.awg-dp');
      let value = null, iso = null;
      const cell = pop && [...pop.querySelectorAll('.awg-dp-cell')].find(c => !c.classList.contains('other') && !c.disabled);
      if (cell) { cell.click(); await new Promise(r => setTimeout(r, 400)); value = inp.value; iso = inp.dataset.iso; }
      return { pop: !!pop, cells: pop ? pop.querySelectorAll('.awg-dp-cell').length : 0, value, iso, closed: !document.querySelector('.awg-dp') };
    });
    t('Datepicker: panel terbuka & tanggal terpilih', r.pop && (r.none || (r.value && r.iso && r.closed)), JSON.stringify(r));
    await page.close();
  }

  // ---------- 11. Maps (Leaflet lokal) + leaflet assets ----------
  {
    const page = await mk();
    const failed = [];
    await page.on('requestfailed', r => failed.push(r.url()));
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1800);
    const r = await page.evaluate(() => {
      const map = document.getElementById('nodeMap');
      const hasTiles = !!(map && map.querySelector('.leaflet-tile-pane'));
      const markers = map ? map.querySelectorAll('.leaflet-marker-icon, .awg-pin, svg.leaflet-marker-icon').length : 0;
      return { leaflet: typeof window.L !== 'undefined', hasTiles, markers, h: map ? Math.round(map.getBoundingClientRect().height) : 0 };
    });
    t('Maps: Leaflet lokal aktif + marker tampil', r.leaflet && r.hasTiles && r.markers > 0 && r.h > 100, JSON.stringify(r));
    await page.close();
  }

  // ---------- 12. Kanban drag + lightbox + upload + tour + palette ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1200);
    const r = await page.evaluate(async () => {
      const out = {};
      // palette
      AwgPalette.init([{ label: 'Tes Perintah', hint: 'x', icon: 'ic-search', action: () => { window.__paletteHit = true; } }]);
      const pb = document.querySelector('[data-awg-palette]');
      if (pb) { pb.click(); await new Promise(r => setTimeout(r, 300)); }
      const pal = document.querySelector('.awg-palette, .awg-pal-box, [class*=palette]');
      out.paletteOpen = !!pal && getComputedStyle(pal).display !== 'none';
      out.paletteExists = !!pal;
      // lightbox
      const img = document.querySelector('[data-awg-lightbox]');
      if (img) {
        img.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        img.click();
        await new Promise(r => setTimeout(r, 450));
      }
      const lbEl = document.querySelector('.awg-lightbox');
      out.lightbox = !!lbEl;
      out.lightboxImg = lbEl && lbEl.querySelector('img') ? lbEl.querySelector('img').getAttribute('src') : null;
      const lbx = document.querySelector('.awg-lightbox .awg-lb-x');
      if (lbx) { lbx.click(); await new Promise(r => setTimeout(r, 250)); }
      out.lightboxClosed = !document.querySelector('.awg-lightbox');
      // kanban instance
      const kb = document.querySelector('[data-awg-kanban]');
      out.kanbanCards = kb ? kb.querySelectorAll('.awg-kb-card').length : 0;
      // upload zone
      const up = document.querySelector('[data-awg-upload]');
      out.uploadZone = up ? !!up.querySelector('.awg-upload-zone') : false;
      // tree
      const tr = document.querySelector('[data-awg-tree]');
      out.treeBoxes = tr ? tr.querySelectorAll('input[type=checkbox]').length : 0;
      return out;
    });
    t('Lightbox terbuka saat gambar diklik', r.lightbox === true && !!r.lightboxImg, JSON.stringify(r));
    t('Lightbox tertutup lewat tombol X', r.lightboxClosed === true, JSON.stringify(r));
    t('Kanban punya kartu ter-render', r.kanbanCards > 0, JSON.stringify(r));
    t('Upload zone ter-render', r.uploadZone === true, JSON.stringify(r));
    t('Treeview punya checkbox', r.treeBoxes > 0, JSON.stringify(r));
    await page.close();
  }

  // ---------- 13. Tour ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);
    const r = await page.evaluate(async () => {
      const btn = document.querySelector('button[onclick*="startDemoTour"], [data-awg-tour-demo]');
      if (btn) { btn.click(); } else if (window.startDemoTour) { window.startDemoTour(); }
      await new Promise(r => setTimeout(r, 600));
      const card = document.querySelector('.awg-tour-card, .awg-tour');
      return { exists: !!card, text: card ? card.textContent.slice(0, 60) : '' };
    });
    t('Tour: overlay langkah pertama tampil', r.exists, JSON.stringify(r));
    await page.close();
  }

  // ---------- 14. Theme toggle persists ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(800);
    const r = await page.evaluate(async () => {
      const hasApi = typeof Awg.theme.toggle === 'function';
      Awg.theme.set('light');
      await new Promise(r => setTimeout(r, 200));
      const light = document.documentElement.dataset.theme;
      Awg.theme.toggle();
      await new Promise(r => setTimeout(r, 200));
      const afterToggle = document.documentElement.dataset.theme;
      const stored = localStorage.getItem('awg-theme');
      return { hasApi, light, afterToggle, stored };
    });
    t('Theme: Awg.theme.toggle() ada, transisi light->dark, tersimpan', r.hasApi && r.light === 'light' && r.afterToggle === 'dark' && r.stored === 'dark', JSON.stringify(r));
    await page.close();
  }

  // ---------- 15. Form validation ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(900);
    const r = await page.evaluate(async () => {
      const form = document.querySelector('form[data-awg-validate]');
      if (!form) return { none: true };
      const ok1 = Awg.form.validate(form);           // empty required -> false
      const req = form.querySelector('[required]');
      if (req) { req.value = 'x'; }
      const vals = Awg.form.values(form);
      return { invalidWhenEmpty: ok1 === false, hasRequired: !!req, keys: Object.keys(vals).length };
    });
    t('Validasi: form kosong ditolak, values() mengembalikan data', r.invalidWhenEmpty && (r.none || r.keys > 0), JSON.stringify(r));
    await page.close();
  }

  // ---------- 16. XSS safety: toast escapes markup ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(800);
    const r = await page.evaluate(async () => {
      Awg.toast('<img src=x onerror=window.__xss=1>', 'bad', 1000);
      await new Promise(r => setTimeout(r, 400));
      return { xss: !!window.__xss, injectedImg: !!document.querySelector('.awg-toast-zone img') };
    });
    t('Anti-XSS: toast tidak mengeksekusi HTML', r.xss === false && r.injectedImg === false, JSON.stringify(r));
    await page.close();
  }

  // ---------- 16b. REGRESSION: month nav must move exactly ONE month ----------
  {
    const page = await mk();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1100);
    const r = await page.evaluate(async () => {
      const inp = document.querySelector('input[data-awg-min="2026-09-26"]');
      inp.click(); await new Promise(r => setTimeout(r, 400));
      const pop = document.querySelector('.awg-dp');
      const head = () => pop.querySelector('.awg-dp-head b').textContent.trim();
      const start = head();
      pop.querySelector('[data-nav="1"]').click();
      await new Promise(r => setTimeout(r, 300));
      const next = head();
      pop.querySelector('[data-nav="-1"]').click();
      await new Promise(r => setTimeout(r, 300));
      const back = head();
      return { start, next, back };
    });
    const oneForward = r.start === 'September 2026' && r.next === 'Oktober 2026';
    t('Datepicker: klik "bulan berikutnya" maju tepat 1 bulan', oneForward && r.back === r.start, JSON.stringify(r));
    await page.close();
  }

  // ---------- 17. Mobile drawer navigation from a template ----------
  {
    const page = await mk({ width: 360, height: 720, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(BASE + '/templates/nms-dashboard.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(900);
    const r = await page.evaluate(async () => {
      const btn = document.querySelector('[data-awg-menu]');
      const sb = document.querySelector('.awg-sidebar');
      const before = sb.getBoundingClientRect().left;
      btn && btn.click();
      await new Promise(r => setTimeout(r, 500));
      const after = sb.getBoundingClientRect().left;
      const open = document.body.classList.contains('awg-sidebar-open');
      return { hasBtn: !!btn, before: Math.round(before), after: Math.round(after), open };
    });
    t('Sidebar mobile: tombol menu menggeser drawer', r.hasBtn && r.after > r.before, JSON.stringify(r));
    await page.close();
  }

  // ---------- 18. Error pages keep icons/branding ----------
  {
    const page = await mk();
    await page.goto(BASE + '/templates/errors/404.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(600);
    const r = await page.evaluate(() => {
      const empties = [...document.querySelectorAll('svg.awg-ic > use')].filter(u => { const b = u.getBoundingClientRect(); return b.width < 2 || b.height < 2; }).map(u => u.getAttribute('href'));
      return { icons: document.querySelectorAll('svg.awg-ic').length, empty: [...new Set(empties)] };
    });
    t('Halaman error: semua ikon tampil', r.empty.length === 0, JSON.stringify(r));
    await page.close();
  }

  await browser.close();
  const fails = results.filter(r => !r.pass);
  console.log('\n== INTERACTION SUMMARY ==');
  console.log('passed:', results.length - fails.length, '/', results.length);
  fails.forEach(f => console.log('FAILED:', f.name, '::', f.detail));
  require('fs').writeFileSync(process.env.QA_OUT ? require('path').join(process.env.QA_OUT, 'interaction.json') : '/tmp/interaction.json', JSON.stringify(results, null, 2));
})();
