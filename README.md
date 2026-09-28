# 🏁 AWG-UIKIT-RACING

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

*Screenshot diambil dengan Chrome headless (viewport asli) — lihat `docs/screenshots/README.md`.*

| | |
|---|---|
| **Author** | **AWGNET-RACING & AGENT AI TEAM** |
| **Versi** | 1.0.0 |
| **Lisensi** | MIT |
| **Ukuran** | CSS ±5 KB + core JS ±3 KB + select2 ±3 KB (gzip) |
| **Dependensi** | 0 (ikon: FontAwesome opsional via CDN) |

## Fitur utama
- 🎨 **Design tokens** (Inter + slate + biru; `--awg-*`) — light & **dark mode** persist
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

## Mulai cepat
```bash
git clone <repo> && cd awg-uikit-racing
bash scripts/build.sh              # minify → dist/
python3 -m http.server 8877        # buka http://localhost:8877/index.html  (showcase)
```
```html
<link rel="stylesheet" href="/assets/awg-uikit.min.css">
<script src="/assets/awg-core.min.js"></script>
<script src="/assets/awg-select2.min.js"></script>
```

## Dokumentasi
- `docs/getting-started.md` — pasang, dark mode, layout dasar, prinsip
- `docs/components.md` — semua komponen CSS
- `docs/forms.md` — field, kontrol, validasi, integrasi Laravel
- `docs/dropdown.md` — menu, submenu, popover, pola tabel
- `docs/select2.md` — searchable select (single/multi/remote/tag) + API
- `docs/js-api.md` — window.Awg lengkap + aturan anti-XSS
- `adapters/README.md` — resep per stack (PHP/Laravel, Express, Flask, Go, React/Vue/Svelte)
- `templates/blade/` — app shell siap-copy untuk Laravel
- `css/tokens.json` — sumber token untuk tooling (SCSS/Tailwind config/Figma)

## Struktur
```
awg-uikit-racing/
├── css/    awg-uikit.css · tokens.json
├── js/     awg-core.js · awg-select2.js
├── dist/   hasil build (min + sumber)
├── docs/   getting-started · components · forms · dropdown · select2 · js-api
├── templates/blade/  app-shell.blade.php · fk-head pattern
├── adapters/README.md
├── scripts/build.sh
└── index.html   ← showcase interaktif semua komponen
```

## Prefix & konvensi
- Kelas: `awg-*` · Token CSS: `--awg-*` · Atribut: `data-awg-*` · Event: `awg:*` · Global: `window.Awg` / `window.AwgSelect`
- Komponen deklaratif memakai **event delegation** → aman untuk konten yang dirender via AJAX (hanya `AwgSelect.mount()` yang perlu dipanggil ulang)

## Roadmap (v2)
- Paket npm + CDN publik · chart components (sparkline/bar CSS) · virtual scroll pada select2 remote besar · RTL support · date-range picker · komponen DataTable adapter

---
© **AWGNET-RACING & AGENT AI TEAM** — MIT License. Dipakai di Franchise Management & proyek ISP/FTTH tooling.
