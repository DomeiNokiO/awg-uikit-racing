/* AWG-UIKIT-RACING — test keamanan & util murni (node, tanpa dependency)
   Jalankan: node test/run-tests.js   (exit code 0 = semua lolos)          */
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function t(name, fn) {
    try { fn(); pass++; console.log(`  ok  ${name}`); }
    catch (e) { fail++; console.error(`FAIL  ${name}\n      ${e.message}`); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function extractFn(src, name) {
    const m = src.match(new RegExp('function ' + name + '\\([^)]*\\)\\s*\\{', 'g'));
    if (!m) throw new Error(`function ${name}() tidak ditemukan`);
    // ambil blok seimbang pertama
    const start = src.indexOf(m[0]);
    let depth = 0, i = start + m[0].length - 1;
    for (; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (!depth) break; }
    }
    return src.slice(start, i + 1);
}

/* ---------- 1. esc() di template dashboards ---------- */
const admin = fs.readFileSync(path.join(ROOT, 'templates/admin-dashboard.html'), 'utf8');
const franchise = fs.readFileSync(path.join(ROOT, 'templates/franchise-dashboard.html'), 'utf8');
const adminEsc = extractFn(admin, 'esc');
const esc = new Function('return ' + adminEsc.replace(/^function esc/, 'function esc'))();

t('esc(): <script> di-escape', () => {
    assert(!esc('<script>alert(1)</script>').includes('<'), 'tag lolos');
});
t('esc(): single-quote attr breakout diblokir', () => {
    assert(!esc("' onmouseover='x").includes("'"), 'single quote lolos');
});
t('esc(): double-quote attr breakout diblokir', () => {
    assert(!esc('"><img onerror=x>').includes('">'), 'double quote lolos');
});
t('esc(): karakter biasa tidak berubah', () => {
    assert(esc('Budi Santoso 123 <b>abc@mail.id</b>') === 'Budi Santoso 123 &lt;b&gt;abc@mail.id&lt;/b&gt;');
});
t('esc(): null/undefined → string kosong', () => {
    assert(esc(null) === '' && esc(undefined) === '');
});
t('franchise renderCart memakai esc(it.name)', () => {
    assert(franchise.includes("esc(it.name)"), 'renderCart belum escape nama item');
});

/* ---------- 2. csvField() anti formula injection ---------- */
const csvSrc = extractFn(admin, 'csvField');
const csvField = new Function('return ' + csvSrc.replace(/^function csvField/, 'function csvField'))();

t('csvField: =HYPERLINK dinetralkan', () => {
    const out = csvField('=HYPERLINK("http://evil","WIN")');
    assert(out.startsWith('"\'='), 'prefix hilang: ' + out);
});
t('csvField: +SUM / -1 / @cmd dinetralkan', () => {
    for (const p of ['+SUM(A1)', '-2+3', '@import url', "=cmd|' /C calc'!A0"]) {
        const out = csvField(p);
        assert(out.includes("'" + p[0]), 'payload ' + p + ' lolos: ' + out);
    }
});
t('csvField: teks normal tidak diubah', () => {
    assert(csvField('Budi') === 'Budi' && csvField('2026-09-28') === '2026-09-28');
});
t('csvField: koma & kutip di-quote RFC4180', () => {
    assert(csvField('a,b') === '"a,b"');
    assert(csvField('has "q"') === '"has ""q"""');
});
t('exportUsers memakai csvField', () => {
    assert(admin.includes('.map(csvField)'), 'exportUsers belum pakai csvField');
});

/* ---------- 3. safePopupText() anti Leaflet popup XSS ---------- */
const maps = fs.readFileSync(path.join(ROOT, 'js/awg-maps.js'), 'utf8');
const popSrc = extractFn(maps, 'safePopupText');
const safePopupText = new Function('return ' + popSrc.replace(/^function safePopupText/, 'function safePopupText'))();

t('safePopupText: tag & handler dibuang, teks diselamatkan', () => {
    const out = safePopupText('<img src=x onerror=alert(1)> ODC-01');
    assert(!out.includes('onerror') && !out.includes('<'), 'payload lolos');
    assert(out.includes('ODC-01'), 'teks asli hilang');
});
t('safePopupText: javascript: dibuang', () => {
    assert(!safePopupText('<a href="javascript:alert(2)">x</a>').includes('javascript:'));
});
t('bindPopup semua sink memakai safePopupText', () => {
    // buang komentar blok agar bindPopup() di docstring tidak ikut ter-match
    const code = maps.replace(/\/\*[\s\S]*?\*\//g, '');
    const calls = code.match(/bindPopup\(([^)]*)\)/g) || [];
    assert(calls.length >= 2, 'bindPopup tidak ditemukan');
    for (const c of calls) assert(c.includes('safePopupText'), 'sink tanpa sanitizer: ' + c);
});

/* ---------- 4. esc() library JS include single-quote ---------- */
for (const [file, label] of [
    ['js/awg-core.js', 'Awg.esc'], ['js/awg-widgets.js', 'widgets esc'],
    ['js/awg-charts.js', 'charts _esc'], ['js/awg-select2.js', 'select2 Awg_esc'],
]) {
    t(`${label}: charset esc mencakup single-quote`, () => {
        const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
        assert(/\[&<>"'\]/.test(s), `${label} belum escape single-quote`);
    });
}

/* ---------- 5. konsistensi dist vs src ---------- */
t('dist sinkron dengan src', () => {
    for (const f of ['awg-core', 'awg-maps', 'awg-widgets', 'awg-charts', 'awg-select2']) {
        const s = fs.statSync(path.join(ROOT, `js/${f}.js`));
        const d = fs.statSync(path.join(ROOT, `dist/${f}.js`));
        assert(d.mtimeMs >= s.mtimeMs, `dist/${f}.js lebih lama dari src — jalankan npm run build`);
    }
});

/* ---------- 6. halaman utama ada & seimbang ---------- */
t('semua template HTML ada', () => {
    for (const f of ['templates/nms-dashboard.html', 'templates/franchise-dashboard.html',
        'templates/admin-dashboard.html', 'templates/auth/login.html', 'templates/auth/register.html',
        'templates/auth/forgot-password.html', 'templates/auth/2fa.html']) {
        assert(fs.existsSync(path.join(ROOT, f)), f + ' hilang');
    }
});

/* ---------- ringkasan ---------- */
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
