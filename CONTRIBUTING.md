# Contributing

Terima kasih atas minat Anda untuk berkontribusi pada **awg-uikit-racing**.

## Cara Berkontribusi

1. **Fork** repositori dan buat branch fitur (`git checkout -b fitur/nama-fitur`).
2. **Edit** file sumber di `js/` atau `css/`; jangan edit file di `dist/` secara manual karena dibuild otomatis.
3. **Jalankan build** agar `dist/` selalu sinkron:
   ```bash
   npm run build
   ```
4. **Uji** perubahan Anda menggunakan `playground.html` atau `index.html`.
   ```bash
   npm run serve
   # buka http://localhost:8877/playground.html
   ```
5. **Pastikan tidak ada CDN** pada HTML, template, docs, maupun kode sumber. Semua font dan ikon harus self-hosted.
6. **Tulis/Perbarui** `CHANGELOG.md` untuk perubahan yang penting.
7. **Commit** dengan pesan yang jelas dan push ke branch Anda.

## Standar Kode

- Gunakan prefix `awg-` untuk class CSS.
- Komponen JS bersifat vanilla, tanpa dependency framework.
- Semua label UI yang terlihat pengguna gunakan Bahasa Indonesia.
- Komentar kode dan dokumentasi API dalam Bahasa Inggris.
- Setiap file sumber harus menyertakan header author **AWGNET-RACING & AGENT AI TEAM**.

## Melapor Bug

Jika menemukan bug, buka *issue* dengan menyertakan:
- Versi `awg-uikit-racing`.
- Browser/OS.
- Langkah reproduksi.
- Screenshot atau cuplikan log jika memungkinkan.

## Release

- Naikkan versi di `package.json` sesuai SemVer.
- Perbarui `CHANGELOG.md` dengan tanggal rilis.
- Jalankan `npm run build` dan `npm pack --dry-run` untuk memverifikasi artifact.
- Jangan *publish* atau *push* tanpa persetujuan maintainer.

## Lisensi

Dengan berkontribusi, Anda setuju bahwa kontribusi Anda akan dilisensikan di bawah [MIT License](LICENSE).
