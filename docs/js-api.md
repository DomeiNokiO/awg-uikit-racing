# ⚡ JS API — AWG-UIKIT-RACING (`window.Awg`)

Semua fungsi tersedia global setelah memuat `awg-core.js`.
Konten hasil AJAX: panggil lagi `AwgSelect.mount()` untuk select; komponen deklaratif lain (dropdown/tabs/accordion/modal) memakai event delegation sehingga **tidak perlu re-init**.

## Util
```js
Awg.esc(str)                 // escape HTML — pakai untuk render data user
Awg.rupiah(15000)            // "Rp 15.000"
Awg.num(15000)               // "15.000"
Awg.$(sel, root?)            // querySelector
Awg.$$(sel, root?)           // [...querySelectorAll]
```

## Tema
```js
Awg.theme.set('dark')        // + persist localStorage('awg-theme')
Awg.theme.toggle(); Awg.theme.get()
// tombol: <button data-awg-theme-toggle>
```

## Sidebar (drawer mobile)
```js
Awg.sidebar.open()/close()/toggle();
// tombol: <button data-awg-menu> ; overlay .awg-overlay menutup otomatis
```

## Toast
```js
Awg.toast('Tersimpan', 'ok');        // tipe: info|ok|warn|bad
Awg.toast('...', 'bad', 6000);       // durasi ms
// posisi .awg-toast-zone auto dibuat; teks pakai textContent → anti-XSS
```

## Modal
```html
<div class="awg-backdrop" id="m1"><div class="awg-modal">
    <div class="awg-modal-head"><h3>Judul</h3><button class="x" data-awg-modal-close="m1">✕</button></div>
    <div class="awg-modal-body">…</div>
    <div class="awg-modal-foot"><button class="awg-btn awg-btn-primary" data-awg-modal-close="m1">Simpan</button></div>
</div></div>
```
```js
Awg.modal.open('m1'); Awg.modal.close('m1');
// tutup via: tombol close, klik backdrop, tombol Esc — body scroll dikunci otomatis
// ukuran: .awg-modal.sm / (default) / .lg ; fullscreen di HP
```

## Drawer (panel samping)
```html
<button data-awg-drawer-open="d1">Detail</button>
<div class="awg-drawer" id="d1">
    <div class="awg-drawer-head">…<button data-awg-drawer-close="d1">✕</button></div>
    <div class="awg-drawer-body">…</div>
    <div class="awg-drawer-foot">…</div>
</div>
```
```js
Awg.drawer.open('d1'); Awg.drawer.close('d1');
```

## Confirm
```js
Awg.confirm('Hapus produk?', 'Tidak bisa kembali.', () => { /* yes */ },
    { yes: 'Ya, hapus', no: 'Batal', danger: true });
// modal + tombol auto-dibuat; Enter-esc handled; danger:false → tombol primary
```

## Dropdown & popover
```html
<button data-awg-drop="m1">Menu</button><div class="awg-dropdown-menu" id="m1">…</div>
<button data-awg-pop="p1">?</button><div class="awg-pop" id="p1">…</div>
```
```js
Awg.dropdown.closeAll();   // paksa tutup
```

## Tabs / pills / segmented / accordion
```html
<div class="awg-tabs awg-tabscope">   <!-- .awg-pills / .awg-seg juga bisa -->
  <button class="awg-tab active" data-awg-tab="a">A</button>
  <button class="awg-tab" data-awg-tab="b">B</button>
  <div data-awg-panel="a">…</div>
  <div data-awg-panel="b" class="awg-hide">…</div>
</div>
```
Event: `document.addEventListener('awg:tab', e => e.detail.tab)`.

## Stepper angka & tags
```html
<div class="awg-stepper"><button data-awg-step="down">−</button><input value="1" min="0" max="99" readonly><button data-awg-step="up">+</button></div>
<div class="awg-tags" data-awg-tags data-awg-max-tags="4"><input placeholder="ketik + Enter"></div>
```
```js
const t = box._awgTags; t.get(); t.add('label'); t.clear();  // onChange: awg:value di box.dataset.value
```

## Validasi & nilai form
```js
Awg.form.validate(form)          // true/false + tandai error (aturan di docs/forms.md)
Awg.form.values(form)            // {nama: 'x', branches[]: '1','2'}
Awg.form.clearErrors(form);
Awg.btnLoading(btn, true);       // spinner; false → pulih
```

## Events global
`awg:theme` · `awg:tab` · `awg:esc` — `document.addEventListener(...)`.

## Anti-XSS: aturan emas
```js
el.textContent = userInput;                  // ✅ selalu
el.innerHTML = `<b>${Awg.esc(userInput)}</b>`; // ✅ bila perlu markup
el.innerHTML = userInput;                    // ❌ jangan pernah
```
