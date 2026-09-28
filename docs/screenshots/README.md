# Screenshot Bukti Responsif & Komponen

Diambil dengan Chrome headless (CDP) — viewport asli, bukan resize manual.

| File | Viewport | Bukti |
|---|---|---|
| shot01-desktop.png | 1360×900 | Showcase penuh (sidebar, cards, forms) |
| shot02-select2-open.png | 1360×900 | Select2 single: panel terbuka, cari "solo", highlight <mark> |
| shot03-select2-multi.png | 1360×900 | Select2 multiple: 2 chip + panel opsi terbuka |
| shot04-dropdown-submenu.png | 1360×900 | Dropdown + submenu 2-level (hover, Excel/PDF) |
| shot05-modal-select.png | 1360×900 | Modal form + select2 tag di dalamnya |
| shot06-dark.png | 1360×900 | Dark mode penuh |
| shot07-mobile320.png | 320×700 (iPhone SE) | 0 scroll horizontal, grid 1 kolom, sidebar drawer tertutup |
| shot08-mobile-drawer.png | 320×700 | Sidebar drawer terbuka + overlay |

Terverifikasi numerik (JS di halaman): `scrollWidth == clientWidth` di 320px,
sidebar `translateX(-264px)`, `.awg-menu-btn` tampil, grid-cols-4 → 1 kolom.
