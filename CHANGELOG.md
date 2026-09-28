# Changelog

Semua perubahan penting pada `awg-uikit-racing` akan didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/), dan proyek ini menggunakan [Semantic Versioning](https://semver.org/lang/id/).

## [Unreleased]

## [1.4.0] - 2026-09-28

### Added

- **Notification Center**: dropdown notifikasi dari ikon bell, badge unread, filter tipe (`Tagihan` / `Tiket` / `Sistem`), tandai sudah dibaca, dan navigasi ke entitas asal.
- **Halaman Chat/Pesan (`templates/chat.html`)**: percakapan antara customer service, pelanggan, dan teknisi ISP. Ada list thread status, template balas cepat, dan layout responsif.
- **Detail Work Order (`templates/work-order.html`)**: detail tiket gangguan lapangan, hitung mundur SLA, timeline status, penugasan teknisi, serta modal eskalasi dan penyelesaian.
- **Detail Invoice Cetak (`templates/invoice.html`)**: invoice A4-ready dengan `@media print`, rincian tagihan layanan internet, mockup QRIS, dan tombol cetak langsung dari halaman billing.
- **Gauge/Meter SVG (`js/awg-widgets.js`)**: komponen meter jarum/arc khusus ISP untuk SNR (dB), RSSI (dBm), dan utilisasi bandwidth (%). Tema-aware dan tanpa library eksternal.
- **Template Email Transaksional (`templates/email/`)**: empat template HTML ramah email client — reset password, invoice terbit, selamat datang pelanggan, dan penugasan teknisi.
- **Landing Page Produk (`landing.html`)**: halaman showcase siap jual: hero, live stats, tier harga (`Single` / `Agency` / `Extended`), dan FAQ lisensi.
- **Dokumentasi Terintegrasi (`docs.html`)**: reader dokumen markdown lokal (`docs/*.md`) dengan live search, tanpa CDN.
- **Tri-Mode Theme & Density Toggle**: tema terang, gelap, atau ikuti sistem lewat `prefers-color-scheme`, plus toggle densitas tabel (`cozy` vs `compact`).
- **Pencarian Global (`templates/search.html`)**: halaman hasil pencarian instan untuk pelanggan, ODP, tiket, dan tagihan.
- **Security & Production Guard**: mitigasi DOM XSS, sanitasi formula CSV RFC 4180, safe popup maps, test suite 20 assertion (`npm test`), dan CI GitHub Actions.
- Build ESM (`dist/awg-uikit.mjs`) dan CJS (`dist/awg-uikit.cjs`) serta file deklarasi TypeScript (`*.d.ts`).

### Changed

- `package.json` versi dinaikkan ke `1.4.0`.
- Sinkronisasi versi di `README.md`, badge versi, dan `Awg.version = '1.4.0'` di runtime core.

## [1.3.0] - 2026-09-27

### Added

- **3 Dashboard Siap Pakai**: NMS/ISP Dashboard (`templates/nms-dashboard.html`), Franchise/Kasir POS (`templates/franchise-dashboard.html`), dan Admin CRUD (`templates/admin-dashboard.html`).
- **Suite Autentikasi**: login, register, lupa password, dan verifikasi 2FA di `templates/auth/`.
- **Halaman Pengguna & Akun**: profil, pengaturan akun, tagihan/billing, dan keamanan/sesi aktif di `templates/`.
- **Halaman Error Standar**: 404 Not Found, 500 Server Error, dan 503 Maintenance di `templates/errors/`.
- **Peta Offline Mandiri** (`js/awg-maps.js`): fallback SVG vektor untuk topologi jaringan dan ODP saat koneksi internet tile tidak tersedia.

## [1.0.0] - 2026-09-26

### Added

- Struktur repositori awal awg-uikit-racing.
- Token desain dan stylesheet dasar `css/awg-uikit.css`.
