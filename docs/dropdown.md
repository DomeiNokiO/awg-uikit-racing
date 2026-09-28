# 📂 Dropdown — AWG-UIKIT-RACING

## Menu standar (paling umum: ⋮ / "Aksi" / avatar)
```html
<div class="awg-dropdown">
    <button class="awg-btn awg-btn-ghost" data-awg-drop="menu1">
        <svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-sliders"></use></svg> Aksi <svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-chevron-down"></use></svg>
    </button>
    <div class="awg-dropdown-menu" id="menu1">
        <div class="awg-dropdown-title">Cabang</div>
        <button class="awg-dropdown-item"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-eye"></use></svg> Lihat</button>
        <button class="awg-dropdown-item active"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-check"></use></svg> Edit <span class="right">Ctrl+E</span></button>
        <button class="awg-dropdown-item" disabled><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-power"></use></svg> Hapus</button>
        <div class="awg-dropdown-sep"></div>
        <button class="awg-dropdown-item danger"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-trash"></use></svg> Hapus permanen</button>
    </div>
</div>
```
**Cara kerja:** tombol `data-awg-drop="ID"` → menu dengan `id="ID"`. Klik luar / pilih item → tertutup otomatis (kecuali item submenu).

## Modifier posisi
- `.awg-dropdown-menu.left` — rata kiri (untuk tombol ikon di kolom tabel)
- `.awg-dropdown-menu.up` — membuka ke atas

## Submenu 2 level (hover)
```html
<div class="awg-dropdown-sub">
    <button class="awg-dropdown-item"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-share"></use></svg> Ekspor</button>
    <div class="awg-dropdown-menu">
        <button class="awg-dropdown-item">Excel</button>
        <button class="awg-dropdown-item">PDF</button>
    </div>
</div>
```

## Dalam baris tabel (contoh)
```html
<div class="awg-dropdown">
    <button class="awg-btn awg-btn-ghost awg-btn-sm awg-btn-icon" data-awg-drop="row3">⋮</button>
    <div class="awg-dropdown-menu left" id="row3">
        <button class="awg-dropdown-item">Detail</button>
    </div>
</div>
```
Hati-hati: kalau tabel punya `overflow: hidden`, menu bisa terpotong — bungkus dengan `.awg-table-wrap` saja, dan gunakan `.up` bila dekat bawah layar.

## Popover (bukan menu, konten informasi)
```html
<button class="awg-btn awg-btn-ghost" data-awg-pop="pop1">?</button>
<div class="awg-pop" id="pop1"><h4>Judul</h4><p>Teks bantuan…</p></div>
```

## Checklist aksesibilitas
- Pemicu harus `<button>`; item di dalam menu juga `<button>` (bukan `<a>` polos) agar keyboard enter jalan
- Satu level dropdown cukup; jangan lebih dari 2 level
