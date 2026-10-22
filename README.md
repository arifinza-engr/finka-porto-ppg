# Portofolio Seminar PPG — Reffinka Meisya Iftianingrum

Situs statis (HTML + Tailwind CDN + GSAP) berisi portofolio Seminar PPG:
refleksi mata kuliah semester 1 & 2, galeri foto kegiatan, dan karya inovasi
media pembelajaran.

Situs **tidak membutuhkan build step**. Cukup buka `index.html` (protokol
`file://` sudah berfungsi) atau layani lewat HTTP statis apa pun.

---

## Struktur Berkas

```
index.html                  — satu-satunya halaman; seluruh isi 9 "halaman" di dalamnya
css/
  base.css                  — body/latar, kontainer halaman, animasi, dekorasi, fokus & reduced-motion
  navbar.css                — navbar, dropdown "Refleksi", menu mobile
  gallery.css               — grid galeri (layout justify), filter, filmstrip, badge, zoom
js/
  config.js                 — konfigurasi Tailwind (warna, font, shadow)
  core/
    dom.js                  — utilitas DOM ($, $$, escapeHTML, loadImage, animateTo, nextFrame)
    modal.js                — manajer modal generik (stack, scroll lock, focus trap, Escape)
    router.js                — navigasi antar halaman + status navbar
    actions.js              — dispatcher aksi terpusat (event delegation data-action / data-nav)
  data/
    accents.js              — palet warna aksen (dipakai bersama semua kartu)
    mata-kuliah-smt1.js     — data refleksi 4C semester 1 (6 mata kuliah)
    mata-kuliah-smt2.js     — data refleksi 4C semester 2 (5 mata kuliah)
    refleksi-rtl.js         — data Refleksi Pengalaman Belajar & RTL (2 indikator, 5 butir)
    karya-inovasi.js        — data karya inovasi + daftar foto
    galeri.js               — 48 foto galeri + rasio aspek (untuk layout justify)
  features/
    navbar.js               — dropdown "Refleksi" & menu mobile
    accordion.js            — akordeon "Arah Langkahku" (halaman 3)
    subject-refleksi.js     — modal refleksi mata kuliah (semester 1 & 2)
    galeri.js               — grid galeri, filter, lightbox, zoom, swipe
    karya.js                — modal rincian karya inovasi
    karya-galeri.js         — lightbox foto karya (perlengkapan & dokumentasi)
    refleksi-rtl.js         — kartu & modal Refleksi Pengalaman Belajar & RTL (halaman 8)
  main.js                   — entry point: menyatukan seluruh modul
tools/
  smoke-test.mjs            — uji fungsional di jsdom (51 pemeriksaan)
  browser-check.html/.mjs   — uji di Chrome headless sungguhan (33 pemeriksaan)
  check-assets.mjs          — memastikan seluruh path asset tersedia
  lint.mjs                  — lint ringan: parse JS, id unik, tanpa handler inline
  stubs.mjs                 — stub GSAP/ScrollTrigger/IntersectionObserver untuk jsdom
```

## Konvensi

- **Namespace global tunggal** `window.Porto` — tanpa polusi global.
  Data di `Porto.data`, logika di `Porto.<fitur>`, utilitas di `Porto.util`.
- **Tanpa handler inline.** Semua tombol memakai `data-nav` (navigasi) atau
  `data-action` (aksi lain) dan ditangani oleh delegasi event tunggal di
  `js/core/actions.js`.
- **Modul klasik (bukan ES module)** agar tetap jalan pada protokol `file://`.
  Urutan `<script>` di `index.html` menentukan urutan pemuatan.
- **Animasi aman.** GSAP dipakai untuk visual, tetapi perpindahan state
  (ganti halaman, buka/tutup modal) dijamin tetap berjalan lewat
  `Porto.util.animateTo()` yang memiliki jaring pengaman waktu.

## Menjalankan Pemeriksaan

```bash
npm install          # hanya butuh jsdom (devDependency)
npm test             # uji fungsional di jsdom (62 pemeriksaan)
npm run lint         # lint ringan
npm run check        # validasi path asset
npm run test:browser # uji di Chrome headless (44 pemeriksaan, butuh Chrome terpasang)
```

## Aksesibilitas

- Skip link "Lewati ke konten utama" + landmark `<main>`.
- Modal: `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap,
  pengembalian fokus ke pemicu, dan tombol **Escape** untuk menutup.
- Dropdown/menu/akordeon memakai `aria-expanded` & `aria-controls`.
- Menu aktif memakai `aria-current="page"`.
- Indikator fokus `:focus-visible` serta dukungan `prefers-reduced-motion`.

## Konsistensi Gaya antar Halaman

Empat halaman di bawah menu **Refleksi** memakai satu bahasa visual yang sama:

| Halaman | Isi | Interaksi |
|---|---|---|
| Refleksi Semester 1 | 6 kartu mata kuliah | klik kartu → modal 4C + artefak |
| Refleksi Semester 2 | 5 kartu mata kuliah | klik kartu → modal 4C + artefak |
| Refleksi dan RTL | 5 kartu (2 indikator + 3 langkah RTL) | klik kartu → modal pertanyaan & uraian jawaban |
| Karya Inovasi | kartu unggulan + 8 kartu bagian | klik kartu → modal rincian karya |

Semua memakai komponen kartu yang sama
(`btn-3d bg-white border-4 border-navy rounded-3xl shadow-3d-md hover:-translate-y-3`
+ dekorasi blob + ikon lingkaran + chip berlabel), dan palet warnanya
dipusatkan di `js/data/accents.js`.

## Catatan Isi

- Paragraf refleksi masih memuat satu kata Inggris yang belum diterjemahkan
  pada bagian **Masalah** karya inovasi (`...belum berani Participating secara
  aktif`) — perlu diperbaiki ke bahasa Indonesia.
- Foto galeri dimuat lazy; rasio aspek tiap foto (`ar`) di `js/data/galeri.js`
  menentukan tinggi baris pada layout justify.
