# TASK: PURE CODEBASE REFACTORING — CLEAN CODE & MODULAR FILE STRUCTURE

## 1. Tujuan Utama

Lakukan refactoring menyeluruh terhadap codebase yang ada untuk meningkatkan kualitas kode, keterbacaan, maintainability, modularitas, dan kerapian struktur direktori.

**Ini adalah PURE REFACTORING. Bukan redesign, bukan penambahan fitur, bukan migrasi teknologi, dan bukan penulisan ulang aplikasi.**

Tujuan akhir:

- Struktur direktori dan file yang logis, konsisten, dan mudah dipelihara.
- Pemisahan tanggung jawab setiap file secara jelas (Separation of Concerns).
- Data, markup, styling, logika, konfigurasi, dan utilitas dipisahkan sesuai fungsinya.
- Menghilangkan duplikasi kode tanpa mengubah perilaku aplikasi.
- Mempertahankan seluruh tampilan, interaksi, dan fungsi yang sudah ada.

## 2. ATURAN MUTLAK — TIDAK BOLEH DILANGGAR

### A. Dilarang mengubah tampilan (UI/Visual Invariance)

Pertahankan tampilan aplikasi yang ada secara identik.

JANGAN mengubah:

- Warna, font, ukuran teks, spacing, padding, margin, border, radius, shadow, maupun opacity.
- Layout, grid, flexbox, positioning, ukuran komponen, dan responsive breakpoint.
- Animasi, transition, hover, focus, active, disabled, dan loading states.
- Urutan elemen, struktur visual, ikon, gambar, aset, serta konten yang ditampilkan.
- Tampilan pada seluruh viewport desktop, tablet, dan mobile.
- Class CSS/Tailwind, selector, atau aturan styling kecuali benar-benar diperlukan untuk menjaga pemisahan file dan tidak mengubah hasil render.

Jangan melakukan improvisasi desain atau menerapkan preferensi UI/UX baru.

### B. Dilarang mengubah fungsi (Behavioral Invariance)

Semua fungsi yang sudah berjalan wajib tetap berjalan dengan perilaku yang sama.

JANGAN mengubah:

- Business logic, algoritma, kondisi, perhitungan, dan validasi.
- Alur navigasi, routing, event handler, serta interaksi pengguna.
- API endpoint, HTTP method, request/response payload, headers, authentication, dan authorization.
- Format data, nama field, struktur object, serta kontrak API.
- State management, lifecycle, urutan eksekusi, dan side effects.
- Penyimpanan data, localStorage, sessionStorage, cookies, dan mekanisme autentikasi.
- Form submission, modal, dropdown, filter, search, pagination, sorting, dan fitur lainnya.
- Error handling, fallback, serta loading behavior.
- Integrasi backend, database, layanan pihak ketiga, dan environment variables.

Jangan menambahkan fitur, menghapus fitur, mengubah library, atau mengganti framework.

### C. Pertahankan kompatibilitas

- Gunakan stack, bahasa, framework, package manager, dan tooling yang sudah digunakan.
- Pertahankan seluruh public interface dan export yang masih digunakan.
- Pertahankan nama identifier yang menjadi bagian dari kontrak eksternal.
- Perbarui seluruh import, export, asset path, script reference, dan dependency reference setelah pemindahan file.
- Jangan mengubah konfigurasi build kecuali diperlukan secara langsung untuk mendukung pemisahan file.
- Jangan menambahkan dependency baru tanpa kebutuhan teknis yang benar-benar tidak dapat dihindari.

## 3. STRATEGI PEMISAHAN FILE

Audit codebase terlebih dahulu. Identifikasi tanggung jawab setiap file dan kelompokkan kode berdasarkan fungsinya.

Terapkan prinsip berikut:

### A. HTML / Markup

Tempatkan markup pada file HTML atau template/component yang sesuai dengan teknologi yang sudah digunakan.

Untuk aplikasi native HTML/CSS/JavaScript:

- HTML berisi struktur dan markup.
- Hindari inline CSS.
- Hindari inline JavaScript.
- Pertahankan ID, class, atribut, data attributes, dan urutan elemen yang diperlukan oleh kode yang sudah ada.

Jika menggunakan React, Vue, atau framework berbasis component, jangan memaksakan semua markup menjadi HTML terpisah. Gunakan pola component yang sesuai dengan framework tersebut.

### B. CSS / Styling

Pisahkan styling ke file CSS yang sesuai.

Contoh:

- `styles/main.css`
- `styles/components/`
- `styles/pages/`
- `styles/utilities/`

Ketentuan:

- Pertahankan seluruh deklarasi CSS dan urutan cascade yang berpengaruh.
- Pertahankan specificity selector.
- Pertahankan media queries, keyframes, pseudo-elements, dan pseudo-classes.
- Hindari perubahan nama class atau ID.
- Jangan menggabungkan atau memindahkan CSS secara sembarangan jika berisiko mengubah cascade.
- Pertahankan seluruh styling framework dan utility classes yang sudah digunakan.

### C. JavaScript / Application Logic

Pisahkan JavaScript berdasarkan tanggung jawabnya, bukan sekadar memindahkan seluruh kode ke satu file besar.

Contoh pembagian:

- `js/main.js` — entry point dan inisialisasi.
- `js/modules/` — modul fungsional.
- `js/services/` — komunikasi API dan integrasi eksternal.
- `js/utils/` — fungsi utilitas murni.
- `js/constants/` — konstanta aplikasi.
- `js/config/` — konfigurasi aplikasi yang aman untuk client.
- `js/data/` — data statis.
- `js/components/` — kode komponen atau interaksi UI jika sesuai dengan arsitektur saat ini.

Jangan membuat file baru hanya demi memenuhi contoh struktur tersebut. Buat file berdasarkan kebutuhan nyata dan batas tanggung jawab yang jelas.

Hindari:

- Satu file JavaScript yang menampung seluruh aplikasi.
- Modul yang terlalu kecil tanpa alasan yang jelas.
- Circular dependencies.
- Global variables yang tidak diperlukan.
- Duplikasi fungsi yang memiliki tanggung jawab sama.
- Ketergantungan antarfile yang terlalu erat.
- Mengubah urutan inisialisasi atau eksekusi script.

Gunakan native ES Modules (`import` / `export`) apabila lingkungan dan konfigurasi proyek mendukungnya tanpa mengubah perilaku aplikasi.

### D. Data dan Konstanta

Pisahkan data statis dari kode logika.

Gunakan:

- `.json` untuk data yang benar-benar berupa data serializable.
- `.js` atau `.ts` untuk konstanta dan data yang membutuhkan ekspresi, fungsi, atau tipe.
- Modul konfigurasi khusus untuk konfigurasi aplikasi.

Contoh:

- `data/navigation.json`
- `data/content.json`
- `js/constants.js`
- `js/config.js`

Ketentuan:

- Pertahankan isi, tipe, urutan, dan struktur data.
- Jangan memindahkan semua object ke JSON jika data tersebut membutuhkan fungsi, nilai dinamis, atau referensi modul.
- Jangan menaruh secret, API key privat, atau kredensial server ke file yang dapat diakses browser.
- Jangan memindahkan business logic ke file data.

### E. Asset dan File Pendukung

Kelompokkan aset sesuai jenis dan penggunaan aktual, misalnya:

- `assets/images/`
- `assets/icons/`
- `assets/fonts/`

Jangan mengganti, mengompres, mengedit, atau menghapus aset dalam tugas ini.

Jika aset dipindahkan, perbarui semua referensi dengan benar dan pastikan URL, relative path, serta mekanisme pemuatan tetap berfungsi.

## 4. STANDAR CLEAN CODE

Terapkan prinsip berikut tanpa mengubah perilaku aplikasi:

- Single Responsibility Principle.
- Separation of Concerns.
- DRY (Don't Repeat Yourself), secara konservatif.
- Kode yang mudah dibaca dan dipahami.
- Penamaan yang konsisten dan deskriptif.
- Fungsi memiliki tanggung jawab yang jelas.
- Minimalkan nesting yang tidak diperlukan jika penyederhanaannya terbukti ekuivalen.
- Hindari magic numbers dan magic strings dengan menggunakan konstanta apabila aman.
- Hapus dead code hanya setelah dipastikan tidak digunakan melalui dynamic references, event bindings, konfigurasi, maupun integrasi eksternal.
- Hapus import yang benar-benar tidak digunakan.
- Pertahankan komentar yang masih relevan dan perbaiki hanya komentar yang sudah tidak akurat.
- Hindari abstraksi berlebihan, premature optimization, dan overengineering.

Jangan melakukan perubahan algoritma atau penyederhanaan logika apabila kesetaraan perilakunya tidak dapat dipastikan.

## 5. STANDAR STRUKTUR PROYEK

Gunakan struktur yang mengikuti stack dan kebutuhan aktual proyek.

Sebagai referensi, untuk aplikasi native HTML/CSS/JavaScript sederhana:

project/
├── index.html
├── assets/
│ ├── images/
│ ├── icons/
│ └── fonts/
├── css/
│ ├── main.css
│ └── components/
├── js/
│ ├── main.js
│ ├── modules/
│ ├── services/
│ ├── utils/
│ ├── constants/
│ └── data/
├── tests/
└── README.md

Struktur tersebut hanya referensi, bukan template wajib.

Jika proyek menggunakan React + Vite + TypeScript, NestJS, atau framework lain, gunakan struktur modular yang idiomatis untuk stack tersebut. Jangan mencampur konvensi arsitektur yang tidak sesuai.

Utamakan struktur yang sederhana, mudah dinavigasi, dan tidak mempersulit pengembangan.

## 6. WORKFLOW WAJIB

Kerjakan secara bertahap.

### Tahap 1 — Audit

Sebelum mengubah file:

1. Periksa seluruh struktur direktori.
2. Identifikasi framework, entry point, build system, dan dependency.
3. Petakan hubungan import/export serta dependensi antarmodul.
4. Identifikasi inline CSS, inline JavaScript, data statis yang bercampur dengan logic, duplikasi kode, dan file yang terlalu besar.
5. Identifikasi seluruh fitur, route, event, API integration, dan behavior penting.
6. Periksa script test, lint, typecheck, dan build yang tersedia.
7. Catat kondisi awal dan potensi risiko refactoring.

Jangan langsung memindahkan file tanpa memahami dependensinya.

### Tahap 2 — Buat Rencana

Susun rencana perubahan yang mencakup:

- File yang akan dipertahankan.
- File yang akan dibuat.
- File yang akan dipecah atau dipindahkan.
- Alasan setiap perubahan.
- Semua import, export, path, dan referensi yang terdampak.
- Risiko terhadap visual rendering dan runtime behavior.

Pilih perubahan dengan risiko paling rendah terlebih dahulu.

### Tahap 3 — Refactoring Bertahap

1. Buat perubahan secara incremental.
2. Pisahkan concern tanpa mengubah implementasi logika.
3. Perbarui seluruh referensi file yang terdampak.
4. Pertahankan urutan eksekusi, CSS cascade, event binding, dan kontrak data.
5. Hindari perubahan tidak terkait.
6. Jangan melakukan redesign atau refactoring tambahan di luar ruang lingkup.
7. Periksa hasil setiap kelompok perubahan sebelum melanjutkan.

Jika ditemukan area yang berisiko mengubah fungsi atau tampilan, pertahankan implementasi awal dan laporkan area tersebut.

### Tahap 4 — Verifikasi

Setelah refactoring:

1. Jalankan build, test, lint, dan typecheck yang tersedia.
2. Pastikan tidak ada import atau asset path yang rusak.
3. Past
