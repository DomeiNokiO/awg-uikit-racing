# Security Policy — AWG-UIKIT-RACING

## Melaporkan kerentanan

Buka **GitHub Security Advisory** (tab Security → Report a vulnerability) atau hubungi maintainer via GitHub issue **tanpa detail teknis payload** untuk koordinasi. Jangan buat issue publik untuk kerentanan yang belum dipatch.

Respons target: konfirmasi 3×24 jam, patch untuk temuan High/Critical dalam 7 hari.

## Mitigasi keamanan bawaan

UI kit ini berisi sanitizer aktif berikut. **Jangan dilepas** saat memodifikasi:

| Mekanisme | Lokasi | Fungsi |
|---|---|---|
| `Awg.esc()` | `js/awg-core.js` | Escape HTML (`& < > " '`) untuk toast, modal, tag input |
| `esc()` | `js/awg-widgets.js`, template dashboard | Escape konten palette, upload, cart |
| `_esc()` | `js/awg-charts.js` | Escape label/seri pada tooltip chart |
| `Awg_esc()` | `js/awg-select2.js` | Escape opsi, chip, hasil pencarian |
| `csvField()` | `templates/admin-dashboard.html` | Netralkan formula injection (`= + - @`) + quoting RFC 4180 pada export CSV |
| `safePopupText()` | `js/awg-maps.js` | Buang tag HTML/`javascript:`/event handler dari popup peta (mitigasi Leaflet CVE-2025-69993 pada ≤1.9.4) |

## Panduan untuk consumer (aplikasi yang memakai kit ini)

1. **Data user yang dirender ke HTML wajib lewat `esc()`** — komponen hanya meng-escape data yang lewat jalurnya; jika Anda membangun string HTML sendiri, Anda bertanggung jawab atas escaping.
2. **Jangan pass HTML mentah ke opsi `formatter` select2 / `popup` peta dari input user** tanpa sanitasi sisi Anda.
3. **Export CSV**: selalu gunakan `csvField()` pattern untuk field yang bisa memuat teks user.
4. **Leaflet**: kit menyertakan `safePopupText()`; jika upgrade Leaflet >1.9.4, ini tetap aman dipertahankan.
5. Jalankan `npm test` di CI Anda — test mencakup regresi semua sanitizer di atas.

## Versi yang didukung

| Versi | Didukung |
|---|---|
| 1.4.x | ✅ |
| < 1.4 | ❌ (upgrade) |
