# Changelog

Semua perubahan penting pada `awg-uikit-racing` akan didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/), dan proyek ini menggunakan [Semantic Versioning](https://semver.org/lang/id/).

## [Unreleased]

## [1.4.0] - 2026-09-28

### Added
- **Notification Center**: Dropdown notifikasi dari ikon bell, unread badge, filter tipe (Tagihan/Tiket/Sistem), dan tandai dibaca.
- **Halaman Chat/Pesan (`templates/chat.html`)**: UI perpesanan CS ↔ Pelanggan/Teknisi ISP dengan template balasan instan.
- **Detail Work Order (`templates/work-order.html`)**: Detail tiket gangguan FTTH, SLA tracker, timeline status, dan aksi eskalasi/penyelesaian.
- **Detail Invoice Cetak (`templates/invoice.html`)**: Template tagihan cetak A4-ready (`@media print`) dan integrasi tombol cetak dari billing.
- **Gauge/Meter SVG (`js/awg-widgets.js`)**: Komponen jarum arc meter responsif tema-aware untuk SNR, RSSI, dan utilisasi bandwidth.
- **Template Email Transaksional (`templates/email/`)**: 4 template email ramah client (Reset Password, Invoice, Welcome, Tech Dispatch).
- **Landing Page Produk (`landing.html`)**: Etalase produk siap jual dengan hero, fitur, pricing tier, dan FAQ lisensi.
- **Dokumentasi Terintegrasi (`docs.html`)**: Reader docs markdown lokal mandiri dengan live search tanpa CDN.
- **Tri-Mode Theme & Density Toggle**: Mode Light/Dark/System otomatis sinkron OS, serta mode data Cozy vs Compact.
- **Pencarian Global (`templates/search.html`)**: Halaman hasil pencarian instan multi-entitas aplikasi.
- **Infrastruktur & Keamanan**: Test suite 20 regression guard (`test/run-tests.js`), mitigasi DOM XSS, sanitasi formula CSV RFC 4180, safe popup maps, file `LICENSE` (MIT), `SECURITY.md`, dan CI GitHub Actions.
- Build ESM (`dist/awg-uikit.mjs`) dan CJS (`dist/awg-uikit.cjs`) serta file deklarasi TypeScript (`*.d.ts`).

### Changed
- `package.json` versi dinaikkan ke `1.4.0`.
- Sinkronisasi versi di `README.md`, badge versi, dan `Awg.version = '1.4.0'` di runtime core.

## [1.3.0] - 2026-09-27

### Added
- 3 Dashboard template operasional: NMS/ISP Dashboard, Franchise POS Dashboard, dan Admin CRUD Dashboard.
- Halaman Autentikasi lengkap: Login, Register, Lupa Password, dan Verifikasi 2FA (`templates/auth/`).
- Halaman Pengguna: Profil, Pengaturan, Tagihan/Billing, dan Keamanan/Sesi.
- Halaman Error standar: 404 Not Found, 500 Server Error, dan 503 Maintenance.
- Fallback peta offline SVG mandiri pada `awg-maps.js`.

## [1.0.0] - 2026-09-26

### Added
- Struktur repositori awal awg-uikit-racing.
- Token desain dan stylesheet dasar `css/awg-uikit.css`.
