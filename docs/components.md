# 📦 Komponen CSS — AWG-UIKIT-RACING

Semua kelas berprefix `awg-`. Ikon contoh memakai sprite lokal `assets/icons.svg` (`<svg class="awg-ic"><use href="assets/icons.svg#ic-*"/></svg>`).

## Buttons
| Kelas | Keterangan |
|---|---|
| `.awg-btn` + varian `.awg-btn-primary/-ghost/-soft/-danger/-success/-dark` | tombol dasar |
| `.awg-btn-sm` / `.awg-btn-lg` / `.awg-btn-block` / `.awg-btn-icon` | ukuran & bentuk |
| `.awg-btn-group` | tombol menempel (toolbar) |
| `.awg-btn-loading` (via `Awg.btnLoading(btn,true)`) | spinner + disable |
| `disabled` / `.disabled` | state mati |

```html
<button class="awg-btn awg-btn-primary"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-plus"></use></svg> Tambah</button>
```

## Badges & status
```html
<span class="awg-badge ok"><span class="dot"></span>Aktif</span>
<!-- varian: (default) .ok .warn .bad .info .gray .solid -->
```

## Chips (filter aktif/hapus)
```html
<span class="awg-chip">Filter <span class="x">✕</span></span>
<span class="awg-chip active"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-check"></use></svg> Aktif saja</span>
```

## Avatars
```html
<span class="awg-avatar">WG<i class="status"></i></span>   <!-- sm/lg/.square/status dot -->
<div class="awg-avatar-group"><span class="awg-avatar sm">A</span><span class="awg-avatar sm more">+5</span></div>
```

## Cards
```html
<div class="awg-card">
    <div class="awg-card-head">Judul <span class="h-sub">sub</span>
        <div class="h-actions"><button class="awg-btn awg-btn-ghost awg-btn-sm">Aksi</button></div>
    </div>
    <div class="awg-card-body">isi</div>
    <div class="awg-card-foot">tombol</div>
</div>
<!-- .awg-card.flat = tanpa shadow -->
```

## Stat (kartu angka dashboard)
```html
<div class="awg-card"><div class="awg-stat">
    <div class="ico ok"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-receipt"></use></svg></div>
    <div><div class="num">312</div><div class="lbl">Transaksi</div><div class="trend up">▲ 8%</div></div>
</div></div>
```
`.ico` varian: (brand) `.ok .warn .bad .info` · `.trend.up/.down`

## Lists
```html
<div class="awg-list">
    <div class="awg-list-item"><span class="awg-avatar sm">G</span>
        <div class="li-main"><div class="li-title">Nama</div><div class="li-sub">ket</div></div>
        <span class="awg-badge bad">Kritis</span>
    </div>
</div>
```

## Tables
```html
<div class="awg-table-wrap"><table class="awg-table striped compact sticky">
    <thead><tr><th>Kolom</th><th class="t-num">Jumlah</th></tr></thead>
    <tbody><tr><td>…</td><td class="t-num">45.000</td></tr></tbody>
    <tfoot><tr><td colspan="1">Total</td><td class="t-num">240.000</td></tr></tfoot>
</table></div>
```
- `.t-end` rata kanan · `.t-num` rata kanan + tabular figures
- `.striped` selang-seling · `.compact` padding kecil · `.sticky` header nempel saat scroll
- `.awg-table-wrap` memberi scroll horizontal di layar kecil

## Alert / Toast / Empty / Spinner / Progress / Skeleton / Tooltip
```html
<div class="awg-alert ok"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-check-circle"></use></svg> Pesan <button class="x" onclick="this.parentElement.remove()">✕</button></div>
Awg.toast('Tersimpan', 'ok');            <!-- info|ok|warn|bad -->
Awg.toast('Timeout', 'bad', { ms: 8000, pauseOnHover: true });  // progress bar, swipe dismiss, hover pause
<div class="awg-empty"><span class="ico"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-folder"></use></svg></span><b>Kosong</b><span class="awg-small">…</span></div>
<span class="awg-spinner sm"></span> <!-- .lg -->
<div class="awg-progress ok striped"><span style="width:100%"></span></div>
<div class="awg-skel text" style="width:60%"></div> <!-- .rect .circle .h1 .h2 .avatar .card .wave -->
<span data-awg-tip="teks tooltip">hover</span>
```

## Skeleton loader (JS)
```js
AwgSkeleton.show('#card', 'card');   // replace content with skeleton variant
AwgSkeleton.hide('#card');           // restore original content
AwgSkeleton.replace('#list', 'text'); // overwrite without backup
```

## Timeline
```html
<!-- Vertical -->
<div class="awg-timeline" data-awg-timeline>
    <div class="awg-tl-item done"><span class="awg-tl-title">Selesai</span><span class="awg-tl-sub">08.14</span></div>
    <div class="awg-tl-item"><span class="awg-tl-title">Proses</span></div>
    <div class="awg-tl-item pending"><span class="awg-tl-title">Menunggu</span></div>
</div>
<!-- Horizontal -->
<div class="awg-timeline horizontal" data-awg-timeline="horizontal">...</div>
```
API: `new AwgTimeline(el, { horizontal: true }); timeline.mark(index, 'done'|'bad'|'pending');`

## Accordion
```html
<div class="awg-acc-item open">
    <button class="awg-acc-head">Pertanyaan <svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-chevron-right chev"></use></svg></button>
    <div class="awg-acc-body">Jawaban…</div>
</div>
```
Buka/tutup otomatis (delegated di core JS).

## Divider / Kbd / Tile / Steps
```html
<div class="awg-divider">LABEL</div>
<span class="awg-kbd">Ctrl</span>
<div class="awg-grid cols-4"><button class="awg-tile"><b>Es Kopi</b><span class="price">Rp 15.000</span></button></div>
<div class="awg-steps">
    <div class="awg-step done"><div class="s-label">Produk</div></div>
    <div class="awg-step active"><div class="s-label">Resep</div></div>
    <div class="awg-step"><div class="s-label">Harga</div></div>
</div>
```

## Tipografi & utilitas
```
.awg-h1…h4 .awg-muted .awg-small .awg-tiny .awg-mono .awg-strong .awg-num .awg-ellipsis
.awg-mt-0…3 .awg-mb-0…3 .awg-p-2 .awg-p-3 .awg-gap-sm/-gap/-gap-lg
.awg-text-c .awg-text-r .awg-w-full .awg-hide .awg-flex-1 .awg-fade-in .awg-scroll-y
.awg-hide-xs (sembunyi <576px) .awg-hide-sm-up (sembunyi ≥576px)
```

## Print
```html
<button class="no-print">Tidak ikut tercetak</button>
```
`@media print` menyembunyikan shell, melepas shadow/padding — tinggal `window.print()`.

## Breadcrumb
```html
<nav aria-label="Breadcrumb"><ol class="awg-breadcrumb">
  <li><a href="#">NMS</a><span class="sep">/</span></li>
  <li><a href="#dashboard">Dashboard</a><span class="sep">/</span></li>
  <li class="active" aria-current="page">core-rtr-01</li>
</ol></nav>
```

## Pagination
```html
<div class="awg-pagination" id="pager"></div>
<script>new AwgPagination('#pager', { total: 142, per: 10, current: 1, onChange: p => console.log(p) });</script>
```
Menghasilkan tombol prev/next, ellipsis, active page, dan info hasil.

## Tabs variants
```html
<!-- default underline -->
<div class="awg-tabs" data-awg-tabs>
  <button class="awg-tab active" data-awg-tab="a">Trafik</button>
  <button class="awg-tab" data-awg-tab="b">Alert</button>
</div>
<div data-awg-panel="a">A</div>
<div data-awg-panel="b" class="awg-hide">B</div>

<!-- pill -->
<div class="awg-tabs pill" data-awg-tabs>...</div>

<!-- vertical underline -->
<div class="awg-tabscope vertical">
  <div class="awg-tabs vertical" data-awg-tabs>...</div>
  <div class="awg-tabpanels">...</div>
</div>
```

## Upload grid
```html
<div class="awg-upload-grid" data-awg-upload='{"accept":"image/*,.pdf","maxFiles":8}'></div>
```
Atribut `data-awg-upload` menerima JSON: `multiple`, `maxSize`, `maxFiles`, `accept`, `url`, `autoUpload`.
API: `new AwgUpload(el, { onAdd, onProgress, onDone, onRemove })`.

## Copy to clipboard
```html
<div class="awg-code"><code id="cmd">ssh ...</code>
  <button class="awg-copy" data-awg-copy="#cmd">Salin</button>
</div>
<!-- atau -->
<button class="awg-copy" data-value="OTO-C320-01-SN" data-awg-copy="">Salin</button>
```
Global fallback: `Awg.copy('teks').then(() => ...)`.

## Inline-edit table cells
```html
<table class="awg-table" data-awg-editable>
  <tr>
    <td><span class="awg-editable" data-awg-name="cust" data-awg-editable="text">Budi</span></td>
    <td><span class="awg-editable" data-awg-name="status" data-awg-editable="select" data-awg-options="Aktif,Suspended,Nonaktif">Aktif</span></td>
  </tr>
</table>
```
Event: `awg:edit` dengan `{ el, name, oldValue, newValue }`. `preventDefault()` akan membatalkan perubahan teks.



## Tour / Onboarding overlay
```html
<button id="btn1">Aksi 1</button>
<script>
new AwgTour([
    { target: '#btn1', title: 'Selamat datang', text: 'Ini highlight elemen pertama.' },
    { target: '#btn2', title: 'Langkah 2', text: 'Navigasi via tombol atau keyboard.' }
]).start();
</script>
```
Opsi: `onStep`, `onEnd`, `onSkip`, `labels: { next, prev, finish, skip }`. Status: `tour.next()`, `tour.prev()`, `tour.end()`.
