# AWG-UIKIT-RACING — Adapter Cepat (per stack)

Semuanya cuma butuh 2 file: `awg-uikit.css` + `awg-core.js` (+ `awg-select2.js` bila pakai select).

## PHP plain
```php
<?php $v = '1.0.0'; ?>
<link rel="stylesheet" href="/assets/awg-uikit.css?v=<?= $v ?>">
<!-- sebelum </body> -->
<script src="/assets/awg-core.js?v=<?= $v ?>"></script>
<script src="/assets/awg-select2.js?v=<?= $v ?>"></script>
```
Flash message → `<?= $msg ? '<div class="awg-alert ok">'.$msg.'</div>' : '' ?>`

## Laravel / Blade
- Shell lengkap: `templates/blade/app-shell.blade.php` (copy ke `resources/views/layouts/awg.blade.php`)
- Letakkan `dist/*` di `public/assets/` atau jalankan lewat Vite
- XSS: render data user → `Awg.esc()` (JS) / Blade `{{ }}` otomatis escape (PHP)
- Select2: `<select name="branch_ids[]" multiple data-awg-select='{...}'>` — submit dapat `$request->branch_ids` array

## Node.js — Express + EJS
```js
app.use('/assets', express.static(path.join(__dirname,'node_modules/awg-uikit-racing/dist')));
```
```html
<link rel="stylesheet" href="/assets/awg-uikit.min.css">
<script src="/assets/awg-core.min.js"></script>
```

## Python — Flask / FastAPI (Jinja2)
```python
app.static_folder = 'node_modules/awg-uikit-racing/dist'   # atau salin
```
```html
<link rel="stylesheet" href="{{ url_for('static', filename='awg-uikit.min.css') }}">
```

## Go — html/template + Gin
```go
r.Static("/assets", "./dist")
```

## React / Vue / Svelte
CSS prefixed `awg-*` tidak bentrok dengan utility framework.
`window.Awg` dipakai sekali di layout root:
```js
import 'awg-uikit-racing/dist/awg-uikit.min.css';
import 'awg-uikit-racing/dist/awg-core.min.js';
```
Komponen React: panggil `Awg.toast(...)` / `Awg.confirm(...)` dari event; markup tetap pakai kelas `awg-*`.

## jQuery lama (proyek legacy)
Tidak konflik — semua init vanilla. Kalau perlu integrasi:
```js
$.fn.awgSelect = function(o){ new AwgSelect(this[0], o||{}); return this; };
```

## Design tokens untuk tooling
`css/tokens.json` — konsumsi langsung:
```js
const t = require('awg-uikit-racing/css/tokens.json');
// tailwind.config.js
theme: { colors: { brand: t.color.brand.value }, borderRadius: { md: t.radius.md } }
```

## Catatan
- Konten yang dirender via AJAX (dropdown/tabs/modal/accordion) TIDAK perlu re-init (delegasi).
- Select2 di konten dinamis: panggil `AwgSelect.mount()` setelah sisip HTML.
- Font Awesome opsional; tanpa FA, ikon bisa diganti SVG inline.
