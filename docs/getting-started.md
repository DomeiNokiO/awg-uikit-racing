# 🚀 Getting Started — AWG-UIKIT-RACING

> Design system standalone dari UI Franchise Management.
> Author: **AWGNET-RACING & AGENT AI TEAM** · License: MIT

## Prinsip desain
1. **Zero dependency** — hanya CSS + vanilla JS. Tidak butuh Bootstrap/jQuery/Tailwind.
2. **Prefix `awg-`** — semua kelas, token (`--awg-*`), dan atribut (`data-awg-*`) memakai prefix sehingga tidak pernah bentrok dengan library lain.
3. **Deklatif dulu, API belakangan** — komponen aktif lewat atribut `data-awg-*`; fungsi JS (`Awg.*`) tersedia bila butuh kontrol penuh.
4. **Mobile-first responsif** — diuji dari viewport 320px; modal jadi fullscreen di HP, tombol min. 44px.
5. **Aman** — semua API yang menyisipkan teks pakai `textContent`/escape; render data user manual → selalu lewat `Awg.esc()`.

## Pemasangan (semua bahasa/stack)
```html
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/awg-uikit.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css">
    <script>/* anti-flash dark mode */
    try{const t=localStorage.getItem('awg-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
</head>
<body>
    <!-- … konten … -->
    <script src="/assets/awg-core.min.js"></script>
    <script src="/assets/awg-select2.min.js"></script>   <!-- opsional, hanya jika pakai select2 -->
</body>
</html>
```
Font Awesome dipakai untuk ikon (opsional — kalau tidak mau CDN, ganti dengan SVG/ikon sendiri; kelas tetap jalan).

## Struktur folder
```
css/   awg-uikit.css + tokens.json
js/    awg-core.js (semua interaksi) + awg-select2.js (searchable select)
dist/  hasil build minify siap deploy
templates/blade/  app shell Laravel
adapters/README.md  cara integrasi per stack
docs/  dokumentasi komponen & API
```

## Build ulang
```bash
bash scripts/build.sh
# → dist/awg-uikit.min.css  (±5 KB gzip)
# → dist/awg-core.min.js    (±3 KB gzip)
# → dist/awg-select2.min.js (±3 KB gzip)
```

## Dark mode
```html
<html data-theme="dark">            <!-- manual -->
<button data-awg-theme-toggle>      <!-- otomatis + persist (localStorage) -->
Awg.theme.set('dark'); Awg.theme.toggle();
```

## Layout dasar
```html
<div class="awg-app">
    <aside class="awg-sidebar"> … </aside>
    <div class="awg-overlay"></div>
    <div class="awg-main">
        <header class="awg-topbar">
            <button class="awg-menu-btn" data-awg-menu><i class="fa-solid fa-bars"></i></button>
            <div class="awg-crumbs"><b>Judul</b></div>
        </header>
        <div class="awg-content"> … </div>
    </div>
</div>
```
Di <992px sidebar otomatis jadi drawer (tombol `data-awg-menu` muncul sendiri — tidak perlu JS tambahan).

## Grid & ritme
```html
<div class="awg-grid cols-4">…</div>   <!-- cols-2/3/4/1-2/2-1 -->
<div class="awg-flex between wrap">…</div>
<span class="awg-mt-2 awg-mb-1 awg-gap">…</span>
```

## Lanjut baca
- `docs/components.md` — semua komponen CSS
- `docs/forms.md` — form lengkap
- `docs/dropdown.md` — dropdown menu & submenu
- `docs/select2.md` — searchable select (single/multi/remote/tag)
- `docs/js-api.md` — window.Awg + window.AwgSelect
