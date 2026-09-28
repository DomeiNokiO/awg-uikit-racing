# Changelog

Semua perubahan penting pada `awg-uikit-racing` akan didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/), dan proyek ini menggunakan [Semantic Versioning](https://semver.org/lang/id/).

## [Unreleased]

## [1.4.0] - 2026-09-28

### Added
- Build ESM (`dist/awg-uikit.mjs`) dan CJS (`dist/awg-uikit.cjs`) untuk seluruh modul JS.
- File deklarasi TypeScript (`*.d.ts`) untuk setiap modul JS dan entry bundel (`js/awg-uikit.d.ts`).
- `playground.html` untuk eksplorasi interaktif prop komponen.
- Konfigurasi `exports` di `package.json` mendukung `import`, `require`, dan `types`.
- `CHANGELOG.md` dan `CONTRIBUTING.md`.

### Changed
- `package.json` versi dinaikkan ke `1.4.0`.
- `main` sekarang mengarah ke `dist/awg-uikit.cjs`, `module` ke `dist/awg-uikit.mjs`, dan `types` ke `js/awg-uikit.d.ts`.
- Script `build` menjalankan minifikasi CSS/JS *dan* pembuatan bundle ESM/CJS.

### Fixed
- Dist path rewrite untuk font-face tetap dipertahankan saat build.

## [1.3.0] - 2026-09-27

### Added
- Komponen CSS/JS lengkap untuk dashboard NMS: sidebar, modal, drawer, toast, tabs, accordion, dll.
- Komponen kustom: Select2-style, Charts SVG, DataTable, Datepicker, Wizard, Treeview, Command Palette, Kanban, Lightbox, Maps adapter.
- Dokumentasi awal di `README.md` dan `docs/`.
- Script build ke `dist/` dengan minifikasi CSS/JS.

## [1.0.0] - 2026-09-26

### Added
- Struktur repositori awal awg-uikit-racing.
- Token desain dan stylesheet dasar `css/awg-uikit.css`.
