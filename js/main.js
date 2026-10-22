/* =========================================================
   PORTOFOLIO PPG — Entry point
   Menghubungkan seluruh modul (router, nav, aksi, fitur).
   ========================================================= */
window.Porto = window.Porto || {};

Porto.app = (() => {
  const { onReady } = Porto.util;

  /** Halaman yang memuat galeri foto */
  const GALLERY_PAGE = 5;

  /** Inisialisasi seluruh aplikasi */
  const bootstrap = () => {
    // Navbar (dropdown "Refleksi", menu mobile)
    Porto.nav.init();

    // Dispatcher aksi (pengganti handler inline onclick)
    Porto.actions.init();

    // Penutup kustom agar Escape konsisten dengan tombol tutup
    Porto.modal.registerClose("galleryModal", () => Porto.gallery.close());
    Porto.modal.registerClose("karyaGalleryModal", () =>
      Porto.karyaGallery.close(),
    );
    Porto.modal.registerClose("subjectModal", () => Porto.subjectModal.close());
    Porto.modal.registerClose("karyaModal", () => Porto.karya.close());
    Porto.modal.registerClose("rtlModal", () => Porto.refleksiRtl.close());

    // Halaman Karya Inovasi: isi kartu unggulan dari data
    Porto.karya.init();

    // Halaman Refleksi & RTL: susun kartu indikator dari data
    Porto.refleksiRtl.init();

    // Modal refleksi mata kuliah: klik backdrop menutup modal
    Porto.subjectModal.init();

    // Lightbox karya
    Porto.karyaGallery.init();

    // Galeri: inisialisasi saat halaman galeri dibuka
    Porto.router.onPageShown((pageNumber) => {
      if (pageNumber === GALLERY_PAGE) {
        // nextFrame() punya jaring pengaman bila requestAnimationFrame
        // tidak berjalan (mis. tab tidak aktif).
        Porto.util.nextFrame().then(() => {
          Porto.gallery.init();
          Porto.gallery.initScroll();
        });
      } else {
        Porto.gallery.killScroll();
      }
    });

    // Status menu aktif untuk halaman pertama
    Porto.router.updateNavbarActive(Porto.router.getCurrentPage());
  };

  const init = () => onReady(bootstrap);

  return { init, bootstrap };
})();

// Jalankan setelah seluruh modul termuat
Porto.app.init();
