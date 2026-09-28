# 🧩 Widget Lanjutan — AWG-UIKIT-RACING v1.2

File: `js/awg-datatable.js`, `js/awg-datepicker.js`, `js/awg-widgets.js`.
Semua 100% vanilla JS, tanpa CDN, framework-agnostic.

## DataTable (`AwgTable`)
```html
<table class="awg-table awg-dt" id="nodesTable" data-source='[{"id":"n1","nama":"Router-01","status":"ok"}]'>
  <thead><tr><th data-col="id">ID</th><th data-col="nama">Nama</th><th data-col="status" data-fmt="badge">Status</th></tr></thead>
</table>
```
Kolom otomatis dibuat. Format bawaan: `badge`, `chip`, `status`, `date`, `ip`, `link`, `number`.
Event: `awg:bulk` saat tombol bulk diklik — `e.detail.ids` dan `e.detail.table`.
API: `table.setSearch(q)`, `table.sort(col)`, `table.page(n)`, `table.reload(data)`.

## Datepicker (`AwgDate`)
```html
<input class="awg-input" data-awg-date readonly placeholder="Pilih tanggal">
<input class="awg-input" data-awg-date data-awg-min="2026-09-01" data-awg-max="2026-12-31" readonly>
<!-- range -->
<input class="awg-input" data-awg-date data-awg-range="laporan" readonly placeholder="Dari">
<input class="awg-input" data-awg-date data-awg-range="laporan" readonly placeholder="Sampai">
```
Event: `awg:date` dengan `detail.iso`. Global `AwgDate.iso(input)`.
Keyboard: ↑↓←→ pindah hari, PgUp/PgDn bulan, Enter pilih, Esc tutup.

## Wizard (`AwgWizard`)
```html
<div data-awg-wizard data-awg-wizard-validate="false">
  <div class="awg-steps"><div class="awg-step" data-awg-wstep>1</div>...</div>
  <div data-awg-wpane>konten 1</div><div data-awg-wpane>konten 2</div>
  <button data-awg-wprev>Kembali</button><button data-awg-wnext>Lanjut</button><button data-awg-wfinish>Selesai</button>
</div>
```
API: `wizard.next()`, `wizard.prev()`, `wizard.goto(i)`, `wizard.finish()`. Event: `awg:wizard`.

## Treeview (`AwgTree`)
```html
<div data-awg-tree><ul><li><label><input type="checkbox" value="a"> A</label><ul>...</ul></li></ul></div>
```
Centang anak mengikuti induk, induk jadi indeterminate, collapse via `.awg-tree-tgl`.
API: `tree.checked()`, `tree.set([...])`. Event: `awg:tree`.

## Command Palette (`AwgPalette`)
```js
AwgPalette.init([
  { label:'Buka Chart', hint:'§08', icon:'ic-chart', action:() => document.getElementById('charts').scrollIntoView() }
]);
```
Shortcut `Ctrl/Cmd+K`, filter live, keyboard ↑↓ Enter Esc.

## Kanban (`AwgKanban`)
```html
<div data-awg-kanban><div class="awg-kb-col" data-kb="open"><h4>Open <span class="n">0</span></h4>
  <div class="awg-kb-list"><div class="awg-kb-card" data-kb-id="t1" draggable="true">...</div></div>
</div>...</div>
```
Event: `awg:kanban` detail state `{open:[], progress:[], done:[]}`. API: `kanban.state()`.

## Lightbox (`AwgLightbox`)
```html
<img data-awg-lightbox="galeri" src="a.jpg" alt="A">
<img data-awg-lightbox="galeri" src="b.jpg" alt="B">
```
Klik gambar → lightbox dengan group swipe, ← → Esc.

## Auto-mount & AJAX
Semua komponen auto-mount saat DOM siap. Setelah konten dinamis dimuat, panggil:
```js
AwgTable.mount(); AwgDate.mount(); AwgWidgets.mount();
```


## Skeleton, Timeline & Tour
| Widget | Cara pakai |
|---|---|
| Skeleton | `AwgSkeleton.show(sel, 'card\|text')` / `AwgSkeleton.hide(sel)` |
| Timeline | `<div data-awg-timeline="horizontal">...</div>` → `AwgTimeline.mark(idx, 'done')` |
| Tour | `new AwgTour([{target:'#el', title:'...', text:'...'}]).start()` |
