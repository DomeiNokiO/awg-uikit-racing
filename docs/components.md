# 📦 Komponen CSS — AWG-UIKIT-RACING

Semua kelas berprefix `awg-`. Ikon contoh memakai FontAwesome 6 (opsional).

## Buttons
| Kelas | Keterangan |
|---|---|
| `.awg-btn` + varian `.awg-btn-primary/-ghost/-soft/-danger/-success/-dark` | tombol dasar |
| `.awg-btn-sm` / `.awg-btn-lg` / `.awg-btn-block` / `.awg-btn-icon` | ukuran & bentuk |
| `.awg-btn-group` | tombol menempel (toolbar) |
| `.awg-btn-loading` (via `Awg.btnLoading(btn,true)`) | spinner + disable |
| `disabled` / `.disabled` | state mati |

```html
<button class="awg-btn awg-btn-primary"><i class="fa-solid fa-plus"></i> Tambah</button>
```

## Badges & status
```html
<span class="awg-badge ok"><span class="dot"></span>Aktif</span>
<!-- varian: (default) .ok .warn .bad .info .gray .solid -->
```

## Chips (filter aktif/hapus)
```html
<span class="awg-chip">Filter <span class="x">✕</span></span>
<span class="awg-chip active"><i class="fa-solid fa-check"></i> Aktif saja</span>
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
    <div class="ico ok"><i class="fa-solid fa-receipt"></i></div>
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
<div class="awg-alert ok"><i class="fa-solid fa-circle-check"></i> Pesan <button class="x" onclick="this.parentElement.remove()">✕</button></div>
Awg.toast('Tersimpan', 'ok');            <!-- info|ok|warn|bad -->
<div class="awg-empty"><span class="ico"><i class="fa-regular fa-folder-open"></i></span><b>Kosong</b><span class="awg-small">…</span></div>
<span class="awg-spinner sm"></span> <!-- .lg -->
<div class="awg-progress ok striped"><span style="width:100%"></span></div>
<div class="awg-skel text" style="width:60%"></div> <!-- .rect .circle -->
<span data-awg-tip="teks tooltip">hover</span>
```

## Timeline
```html
<div class="awg-timeline">
    <div class="awg-tl-item done"><b class="awg-small">Selesai</b><div class="awg-tiny awg-muted">08.14</div></div>
    <div class="awg-tl-item"><b class="awg-small">Proses</b></div>
    <div class="awg-tl-item pending"><b class="awg-small">Menunggu</b></div>
</div>
```

## Accordion
```html
<div class="awg-acc-item open">
    <button class="awg-acc-head">Pertanyaan <i class="fa-solid fa-chevron-right chev"></i></button>
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
