# 🏁 AWG-UIKIT-RACING

[![CI](https://github.com/DomeiNokiO/awg-uikit-racing/actions/workflows/ci.yml/badge.svg)](https://github.com/DomeiNokiO/awg-uikit-racing/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-1.4.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

**Design system standalone** yang di-ekstrak dari UI dashboard Franchise Management (Frences).
Murni CSS + vanilla JS — **tanpa Bootstrap, tanpa jQuery** — bisa dipakai di PHP, Laravel,
Node.js, Python, Go, Ruby, React/Vue/Svelte, atau bahasa apa pun yang menghasilkan HTML.

## 📸 Preview

| Desktop (light) | Dark mode |
|---|---|
| ![Desktop](docs/screenshots/shot01-desktop.png) | ![Dark](docs/screenshots/shot06-dark.png) |

| Select2 — search + highlight | Select2 — multiple chips |
|---|---|
| ![Select2 single](docs/screenshots/shot02-select2-open.png) | ![Select2 multi](docs/screenshots/shot03-select2-multi.png) |

| Dropdown + submenu 2-level | Modal + select2 di dalamnya |
|---|---|
| ![Dropdown](docs/screenshots/shot04-dropdown-submenu.png) | ![Modal](docs/screenshots/shot05-modal-select.png) |

| Mobile 320px (0 scroll) | Mobile — sidebar drawer |
|---|---|
| ![Mobile 320](docs/screenshots/shot07-mobile320.png) | ![Drawer](docs/screenshots/shot08-mobile-drawer.png) |

|| Charts NMS — desktop | Charts NMS — dark mode | Charts — tooltip crosshair |
|---|---|---|
| ![Charts](docs/screenshots/shot09-charts-desktop.png) | ![Charts dark](docs/screenshots/shot10-charts-dark.png) | ![Tooltip](docs/screenshots/shot11-chart-tooltip.png) |

|| **DataTable + bulk** | **Datepicker** | **Command palette ⌘K** |
|---|---|---|
| ![DataTable](docs/screenshots/shot14-dt-desktop.png) | ![Datepicker](docs/screenshots/shot16-dp-desktop.png) | ![Palette](docs/screenshots/shot13-palette-desktop.png) |

|| **Wizard stepper** | **Treeview permission** | **Kanban drag-drop** |
|---|---|---|
| ![Wizard](docs/screenshots/shot17-wizard-desktop.png) | ![Treeview](docs/screenshots/shot18-treeview-desktop.png) | ![Kanban](docs/screenshots/shot19-kanban-desktop.png) |

||| **Lightbox** | **Maps — Leaflet lokal** | **Mobile 320px — Datepicker** |
|---|---|---|---|
| ![Lightbox](docs/screenshots/shot20-lightbox-desktop.png) | ![Maps desktop](docs/screenshots/shot31-maps-desktop.svg) | ![DP mobile](docs/screenshots/shot24-dp-mobile.png) |

|| **Maps di HP 320px** | Charts di HP 320px |
|---|---|
| ![Maps mobile](docs/screenshots/shot32-maps-mobile.png) | ![Charts mobile](docs/screenshots/shot09-charts-mobile.png) |

*Screenshot diambil dengan Chrome headless (viewport asli) — lihat `docs/screenshots/README.md`.*

| | |
|---|---|
| **Author** | **AWGNET-RACING & AGENT AI TEAM** |
| **Versi** | 1.4.0 |
| **Lisensi** | MIT |
| **Ukuran** | CSS ±10 KB + core ±3.5 KB + select2 ±3.6 KB + charts ±3.8 KB + datatable ±2.7 KB + datepicker ±2.5 KB + widgets ±3.7 KB + maps ±1.5 KB (gzip) |
| **Dependensi** | 0 — font Inter + ikon SVG self-hosted, tanpa CDN |

## Fitur & Changelog Rilis

### 🚀 v1.4.0 — Premium Upgrade (Wave 1–3) & Production Infrastructure
- 🔔 **Notification Center** (`templates/assets/awg-notif-chat.js`): Dropdown notifikasi dari ikon bell, filter tab (Semua/Tagihan/Tiket/Sistem), tandai sudah dibaca, navigasi entitas.
- 💬 **Halaman Chat/Pesan** (`templates/chat.html`): Komunikasi operasional ISP (CS ↔ Pelanggan, Teknisi), thread status, template pesan instan, layout responsif.
- ⚡ **Detail Work Order** (`templates/work-order.html`): Manajemen alur tiket gangguan lapangan, timer SLA, riwayat timeline, penugasan teknisi, modal eskalasi & penyelesaian.
- 🧾 **Detail Invoice Cetak** (`templates/invoice.html`): Desain cetak A4-ready (`@media print`), rincian biaya langganan, mockup QRIS, integrasi tombol cetak dari billing.
- ⏱️ **Gauge/Meter SVG** (`js/awg-widgets.js`): Komponen jarum/arc meter untuk SNR (dB), RSSI (dBm), dan Bandwidth (%), tema-aware tanpa library chart eksternal.
- 📧 **Template Email Transaksional** (`templates/email/`): 4 template HTML ramah email client (reset password, invoice terbit, selamat datang, penugasan teknisi).
- 🌐 **Landing Page Produk** (`landing.html`): Halaman etalase produk siap jual dengan hero, live stats, pricing tier (Single/Agency/Extended), dan FAQ lisensi.
- 📚 **Dokumentasi Terintegrasi** (`docs.html`): Viewer dokumentasi responsif membaca dokumen markdown lokal (`docs/*.md`) dengan live search.
- 🌓 **Tri-Mode Theme & Density Toggle**: Mode terang / gelap / ikuti sistem (OS `prefers-color-scheme`), serta toggle densitas data (`cozy` vs `compact`).
- 🔍 **Pencarian Global** (`templates/search.html`): Halaman hasil pencarian instan untuk pelanggan, ODP, tiket, dan tagihan.
- 🛡️ **Security & Production Guard**: Mitigasi DOM XSS, sanitasi CSV formula RFC 4180, safe popup maps, test suite 20 assertion (`npm test`), dan CI workflow GitHub Actions hijau.

### 📦 v1.3.0 — Halaman Template Lengkap & Offline Maps Fallback
- 📊 **3 Dashboard Siap Pakai**: NMS/ISP Dashboard (`nms-dashboard.html`), Franchise/Kasir POS (`franchise-dashboard.html`), Admin CRUD (`admin-dashboard.html`).
- 🔐 **Suite Autentikasi**: Login, Register, Lupa Password, dan Verifikasi 2FA (`templates/auth/`).
- ⚙️ **Halaman Pengguna & Akun**: Profil, Pengaturan Akun, Tagihan/Billing, dan Keamanan/Sesi (`templates/`).
- 🚫 **Halaman Error**: 404 Not Found, 500 Server Error, dan 503 Maintenance (`templates/errors/`).
- 🗺️ **Peta Offline Mandiri** (`js/awg-maps.js`): Fallback SVG vektor instan untuk topologi jaringan & ODP saat koneksi tile internet offline.

### 🧩 v1.2.x — Widget Lengkap & Aksesibilitas
- 🗂️ **DataTable** (`awg-datatable.js`): pencarian, sort kolom, pagination, checkbox massal, format status/chip/lokasi, rows-per-page, event `awg:bulk`
- 📅 **Datepicker** (`awg-datepicker.js`): single & range, format Indonesia, batas min/max, navigasi keyboard (arrow / PgUp / PgDn / Enter / Esc), tombol *Hari ini* / *Bersihkan*
- 🧙 **Wizard** (`awg-widgets.js`): stepper bertahap dengan validasi per panel (bisa dimatikan), callback maju/mundur
- 🌳 **Treeview checkbox** untuk permission/hierarki: centang anak-ibu otomatis, collapse/expand, event `awg:tree`
- ⌨️ **Command palette** `Ctrl/Cmd+K`: cari perintah, filter realtime, keyboard ↑↓ Enter Esc
- 🏗️ **Kanban** drag-drop native HTML5: pindah kartu antar kolom, keyboard kiri/kanan, event `awg:kanban`
- 🖼️ **Lightbox** gambar: group swipe, navigasi panah, Escape tutup
- 🗺️ **Maps** (`awg-maps.js`): integrasi Leaflet mandiri + adapter Google Maps & MapLibre. Focus trap accessibility (A11y) pada modal dan drawer.

## Fitur utama
- 🎨 **Design tokens** (Inter + slate + biru; `--awg-*`) — light & **dark mode** persist
- 🔤 **Font & ikon 100% lokal** — Inter woff2 (5 bobot) + sprite SVG ±60 ikon (`assets/icons.svg`), nol request keluar
- 📊 **Charts/NMS** (`awg-charts.js`): line/area multi-seri + crosshair tooltip, bar, donut, gauge zona ambang — SVG murni, tema-aware, live-update 2 dtk, responsif
- 📐 **App shell**: sidebar gelap + drawer mobile + topbar blur + grid + utilitas
- 🧩 **40+ komponen**: buttons, badges, chips, avatars, cards, stats, lists, tables
  (striped/compact/sticky/tfoot), alerts, toasts, empty-state, spinner, progress,
  skeleton, tooltip, popover, timeline, accordion, steps wizard, divider, tile kasir
- 📂 **Dropdown** menu + submenu 2 level + posisi (.left/.up) + integrasi baris tabel
- 🔍 **Select2-style** (`awg-select2.js`): searchable single/multi, option groups,
  **remote/async** dengan debounce, **tagging**, clearable, max-pick, keyboard penuh,
  **sinkron ke `<select>` asli** (form submit tetap standard)
- 🧾 **Forms**: input/select/textarea, input-group, floating label, switch, checkbox/radio,
  stepper, tags input, file dropzone (drag & drop), OTP auto-advance, range,
  **validasi deklaratif** (`data-awg-validate` + aturan `data-awg-email/number/min/max/pass`)
- 💬 **Overlays**: modal (sm/lg/fullscreen-HP), drawer panel, confirm dialog (API callback)
- 🖨️ Print stylesheet · 📱 Responsif teruji 320px+ · ♿ target sentuh 44px, aria pada combobox
- 🧩 **Komponen baru v1.2**: DataTable, Datepicker, Wizard, Treeview, Command Palette, Kanban, Lightbox

## Mulai cepat
```bash
git clone <repo> && cd awg-uikit-racing
bash scripts/build.sh              # minify → dist/
python3 -m http.server 8877        # buka http://localhost:8877/index.html  (showcase)
```
```html
<link rel="stylesheet" href="/assets/awg-uikit.min.css">
<script src="/assets/awg-core.min.js"></script>
<script src="/assets/awg-select2.min.js"></script>   <!-- opsional -->
<script src="/assets/awg-charts.min.js"></script>
<script src="/assets/awg-datatable.min.js"></script>
<script src="/assets/awg-datepicker.min.js"></script>
<script src="/assets/awg-widgets.min.js"></script>
<!-- deploy: salin folder dist/ (sudah berisi fonts/ + assets/icons.svg) ke public/assets/ -->
```

## Dokumentasi
- `docs/getting-started.md` — pasang, dark mode, layout dasar, prinsip, font/ikon lokal
- `docs/components.md` — semua komponen CSS
- `docs/charts.md` — grafik NMS: line/area/bar/donut/gauge + pola polling real-time
- `docs/forms.md` — field, kontrol, validasi, integrasi Laravel
- `docs/dropdown.md` — menu, submenu, popover, pola tabel
- `docs/select2.md` — searchable select (single/multi/remote/tag) + API
- `docs/js-api.md` — window.Awg / window.AwgChart / window.AwgSelect + aturan anti-XSS
- `adapters/README.md` — resep per stack (PHP/Laravel, Express, Flask, Go, React/Vue/Svelte)
- `templates/blade/` — app shell siap-copy untuk Laravel
- `css/tokens.json` — sumber token untuk tooling (SCSS/Tailwind config/Figma)

## Struktur
```
awg-uikit-racing/
├── css/    awg-uikit.css · tokens.json
├── js/     awg-core.js · awg-select2.js · awg-charts.js · awg-datatable.js · awg-datepicker.js · awg-widgets.js
├── fonts/  inter-{400..800}.woff2   (self-hosted)
├── assets/ icons.svg                 (sprite ±60 ikon)
├── dist/   hasil build (min + sumber + fonts/ + assets/)
├── docs/   getting-started · components · charts · forms · dropdown · select2 · js-api
├── templates/blade/  awg-layout · example-crud
├── adapters/README.md
├── scripts/build.sh
└── index.html   ← showcase interaktif semua komponen (termasuk dashboard NMS live)
```

## Prefix & konvensi
- Kelas: `awg-*` · Token CSS: `--awg-*` · Atribut: `data-awg-*` · Event: `awg:*` · Global: `window.Awg` / `window.AwgSelect`
- Komponen deklaratif memakai **event delegation** → aman untuk konten yang dirender via AJAX (hanya `AwgSelect.mount()` yang perlu dipanggil ulang)

## Roadmap (v2)
- Paket npm + CDN publik · virtual scroll pada select2/DataTable remote besar · RTL support · adapter Laravel Livewire

---
© **AWGNET-RACING & AGENT AI TEAM** — MIT License. Dipakai di Franchise Management & proyek ISP/FTTH tooling.
