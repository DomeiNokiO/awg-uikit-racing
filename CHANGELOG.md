# Changelog

Semua perubahan penting pada `awg-uikit-racing` akan didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/), dan proyek ini menggunakan [Semantic Versioning](https://semver.org/lang/id/).

## [Unreleased]

### Fixed

- **Panel notifikasi tidak bisa dibuka (NMS & Chat)**: `AwgNotif.init()` dipanggil dua kali (auto-init + panggilan eksplisit di template) sehingga tombol bell punya **dua** listener klik — satu klik membuka lalu langsung menutup panel. `init()` kini idempoten (`btn._awgNotifWired`). Terverifikasi via CDP: 1 listener.
- **Panel notifikasi keluar layar di HP**: dengan panel ber-anchor ke tombol bell (`right: 0`, lebar 288–380px), tombol yang berada di tengah baris membuat panel meleset ke kiri (`left ≈ -43px` di 320px). Di ≤576px `.awg-notif-wrap` dibuat `position: static` sehingga panel ber-anchor ke `.awg-topbar` dan dibentangkan penuh dengan margin.
- **Baris header panel notifikasi tumpang tindih**: tombol "Tandai dibaca" menimpa judul di layar sempit. `.awg-notif-head` kini `flex-wrap: wrap` + `gap`.
- **Nav dokumentasi tidak ter-style**: `docs.html` mengirim token literal `class="awg-nav-link{active}"` (placeholder template yang tidak pernah disubstitusi) sehingga 9 link hanya `<a>` inline tanpa padding/hover dan state aktif tidak pernah menyala. Diganti `awg-nav-link`.
- **`Awg.theme.toggle()` tidak ada** padahal didokumentasikan (`docs/js-api.md`, `docs/getting-started.md`) dan dipakai command palette → `TypeError`. Ditambahkan sebagai alias `cycle()`.
- **Datepicker: "bulan berikutnya" melompat 2 bulan**: `open()` sudah memanggil `bind()`, lalu wrapper di bawahnya memasang listener klik kedua pada elemen yang sama. Wrapper ganda dihapus.
- **Datepicker: `TypeError: Cannot read properties of null (reading 'focus')`** saat panel ditutup cepat (Escape / klik luar) sebelum `requestAnimationFrame` pertama jalan — `close()` sudah men-`null`-kan `this.pop`. Kini memakai referensi lokal + guard.
- **Lightbox (tiga regresi dari refactor markup ikon)**
  - ikon X ganda (satu `<svg>` nyasar di luar tombol) sehingga `figure` terdorong keluar pusat viewport; posisi fig sekarang tepat di tengah.
  - panah "sebelumnya" kehilangan rotasi 180° (chevron menunjuk arah salah). Rotasi dipindah ke ikon dalam agar tidak menimpa `transform: translateY(-50%)` tombolnya.
  - kelas `.icon` (zona upload) dan `.file-ico` (thumbnail file) hilang saat markup dipindah ke helper `ic()`; `ic(name, cls)` kini menerima kelas tambahan.
- **8 ikon dipakai tapi tidak ada di sprite** (`ic-arrow-left`, `ic-mail`, `ic-map`, `ic-monitor`, `ic-pie-chart`, `ic-shield`, `ic-smartphone`, `ic-user`) → tampil kosong. Ditambahkan ke `assets/icons.svg` (80 → 88 simbol).
- **Overflow horizontal di 320px** pada toolbar `.awg-flex` (tanpa wrap), `.play-stage` (tanpa scroll), nav landing, dan grid `.awg-pos`; plus jaring pengaman `html, body { overflow-x: clip }` sebagai *failsafe*.
- **Teks dokumen terpotong di layar sempit**: token panjang (path, `Bootstrap/jQuery/Tailwind/FontAwesome`) meluber keluar paragraf lalu terpotong. Ditambahkan `overflow-wrap: break-word` pada `p, li, td, th, .doc-body` dan `overflow-wrap: anywhere` untuk `<code>` inline.

### Added

- **Template Notifikasi di `templates/chat.html`**: halaman chat sebelumnya punya tombol bell **tanpa** panel (tombol mati). Panel notifikasi kini lengkap dengan tab filter dan "tandai dibaca", sama seperti NMS.
- **Suite QA berbasis browser** (`qa/`): render 24 halaman × 4 viewport (320/375/768/1440), uji interaksi 25 skenario (toast, modal, drawer, DataTable, tabs, wizard, select2, chart, datepicker, peta, lightbox, kanban, upload, treeview, tour, anti-XSS, tema), audit DOM (tumpang tindih/kliping/overflow), verifikasi ikon & konsol. Jalankan: `npm run qa`, `npm run qa:console`, `npm run qa:icons`, `npm run qa:dom`.

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
