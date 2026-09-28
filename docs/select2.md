# 🔍 Select2 (searchable select) — AWG-UIKIT-RACING

Kotak pilihan ala Select2: pencarian, multi, tagging, remote — tanpa jQuery.
Selalu **sinkron ke `<select>` asli** → submit form Laravel/PHP tetap standard (`name` sama).

## Quick start (deklaratif)
```html
<select name="branch_id" data-awg-select='{"placeholder":"Cari cabang…"}'>
    <option></option>
    <option value="1">PUSAT Jakarta</option>
    <option value="2">Yogyakarta</option>
</select>
```
```html
<!-- multiple + chip -->
<select name="branches[]" multiple data-awg-select='{"max":3,"placeholder":"Pilih…"}'>…</select>

<!-- dengan grup & catatan stok (dari <optgroup>/<option data-awg-note>) -->
<optgroup label="Kering"><option value="gandum" data-awg-note="stok 2">Gandum</option></optgroup>
```
Auto-mount saat load; konten dinamis (modal AJAX) → panggil `AwgSelect.mount()` lagi.

## Programatik
```js
const sel = new AwgSelect(document.querySelector('select[name=branch_id]'), {
    placeholder: 'Cari cabang…',
    allowClear: true,
    onChange: vals => console.log('terpilih:', vals)
});
sel.getValue();          // '2' (single) | ['1','2'] (multiple)
sel.setValue('2');       // set programmatically (string/comma/array)
sel.setOptions([...]);   // ganti katalog data: [{value,text,group?,extra?,disabled?}]
sel.clear(); sel.refresh(); sel.destroy();
```

## Remote / async (user search ala Select2)
```js
new AwgSelect(el, {
    placeholder: 'ketik nama…', minChars: 2,
    source: (q, cb) =>
        fetch('/api/users/search?q=' + encodeURIComponent(q))
            .then(r => r.json())
            .then(rows => cb(rows.map(u => ({ value: u.id, text: u.name, extra: '@' + u.username }))))
});
```
- debounce bawaan 220ms, spinner "Memuat…" otomatis
- item terpilih dari remote tetap tampil walau tidak ada di `<option>` (cache teks)

## Tagging (buat nilai baru)
```html
<select name="labels[]" multiple data-awg-select='{"tags":true}'></select>
```
Ketik → muncul "➕ Tambahkan …" → Enter. Nilai baru ikut ter-submit via `<select>`.

## Opsi penuh
| Opsi | Default | Fungsi |
|---|---|---|
| `multiple` | dari atribut `multiple` | multi pilih (chip) |
| `placeholder` | `Pilih…` | teks kosong (baca juga `data-awg-placeholder`) |
| `allowClear` | `true` | tombol ✕ |
| `search` | `true` | kolom cari (single di panel, multi inline) |
| `tags` | `false` | boleh buat nilai baru |
| `max` | `0` (unlimited) | batas pilihan multiple (lebih → shake) |
| `minChars` | `1` | karakter minimum sebelum `source()` dipanggil |
| `source(q, cb)` | `null` | async data |
| `formatter(item)` | `null` | render custom (WAJIB escape sendiri pakai `Awg.esc`) |
| `onChange(values)` | `null` | callback tiap berubah |
| `noResultText` | `Tidak ada hasil` | saat nol cocok |

## Interaksi keyboard (seperti Select2)
| Tombol | Aksi |
|---|---|
| Enter / Space | buka panel (saat fokus) / pilih item ter-highlight |
| ↓ / ↑ | pindah highlight |
| Esc | tutup panel |
| Backspace (multi, input kosong) | hapus chip terakhir |
| Tik ✕ pada chip | hapus pilihan itu |

## Integrasi validasi
Saat `Awg.form.validate()` gagal pada select required, `<select>` disembunyikan dapat `.is-invalid` → panel trigger ikut merah (MutationObserver). Simpan field wajib sebagai `required` di `<select>`.

## Laravel contoh
```blade
<select name="branch_ids[]" multiple data-awg-select='{"placeholder":"Pilih cabang…"}'>
    @foreach($branches as $b)
        <option value="{{ $b->id }}" @selected(in_array($b->id, old('branch_ids', [])))>{{ $b->name }}</option>
    @endforeach
</select>
```
Controller terima `$request->branch_ids` (array) seperti select biasa.
