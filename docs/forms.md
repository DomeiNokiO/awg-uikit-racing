# 🧾 Forms — AWG-UIKIT-RACING

## Anatomi field standar
```html
<div class="awg-field">
    <label class="awg-label">Nama <span class="req">*</span></label>
    <input class="awg-input" name="nama" required>
    <div class="awg-error"></div>      <!-- auto diisi saat validasi gagal -->
    <div class="awg-help">petunjuk opsional</div>
</div>
```

## Kontrol
| Elemen | Kelas/cara |
|---|---|
| Text / email / password | `.awg-input` |
| Textarea | `.awg-textarea` |
| Select native | `.awg-select` (untuk searchable → lihat `docs/select2.md`) |
| Input group | `.awg-input-group` + `.awg-addon` / `.awg-addon-btn` |
| Floating label | `.awg-float` (input `placeholder=" "`) |
| Switch | `.awg-switch` > input + `.track` |
| Checkbox/radio inline | `.awg-check` / `.awg-radio` |
| Stepper angka | `.awg-stepper` + `data-awg-step="up/down"` |
| Tags | `.awg-tags[data-awg-tags][data-awg-max-tags=n]` + `<input>` |
| File dropzone | `.awg-file` (drag & click) + `.awg-file-list > .awg-file-item` |
| OTP/code | `.awg-otp` (JS auto buat 6 kotak, auto-advance) |
| Range | `.awg-range` |

## Validasi deklaratif (core JS)
```html
<form data-awg-validate novalidate onsubmit="/* server-side */">
    <input required data-msg-required="Nama wajib diisi">
    <input data-awg-email>
    <input data-awg-number data-awg-min="100" data-awg-max="999999">
    <input type="password" data-awg-pass>
    <input type="password" data-awg-pass-confirm>   <!-- harus sama -->
    <button type="submit">Simpan</button>
</form>
```
Aturan aktif: `required`, email regex, number, min/max, pass min 8 char, konfirmasi pass, checkbox required ("Wajib dicentang"). Gagal → `.is-invalid` + `.awg-error.show` + fokus field pertama + toast.

## API
```js
Awg.form.validate(formEl)  // → true/false (plus mark error)
Awg.form.showError(inp, 'msg'); Awg.form.clearErrors(formEl);
Awg.form.values(formEl)    // → object FormData (array bila multi)
Awg.btnLoading(btn, true, 'Simpan…');  // lalu false selesai
```

## Integrasi server-side (PHP/Laravel)
```html
<input class="awg-input {{ $errors->has('nama') ? 'is-invalid' : '' }}" name="nama">
<div class="awg-error {{ $errors->has('nama') ? 'show' : '' }}">{{ $errors->first('nama') }}</div>
```
Flash: `<div class="awg-alert ok">{{ session('status') }}</div>`.

## Contoh form login (single card)
```html
<div class="awg-card" style="max-width:400px;margin:3rem auto"><div class="awg-card-body">
    <form data-awg-validate novalidate method="post">
        <div class="awg-field"><label class="awg-label">Email</label><input class="awg-input" type="email" name="email" required data-awg-email><div class="awg-error"></div></div>
        <div class="awg-field"><label class="awg-label">Password</label><input class="awg-input" type="password" name="password" required><div class="awg-error"></div></div>
        <button class="awg-btn awg-btn-primary awg-btn-block awg-mt-2">Masuk</button>
    </form>
</div></div>
```
