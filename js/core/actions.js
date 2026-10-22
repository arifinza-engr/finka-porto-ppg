/* =========================================================
   PORTOFOLIO PPG — Dispatcher aksi terpusat (event delegation)
   Semua tombol interaktif memakai atribut data-* sehingga
   tidak ada lagi handler inline (onclick="...") di HTML.
   ========================================================= */
window.Porto = window.Porto || {};

Porto.actions = (() => {
  /** Peta aksi -> handler */
  const registry = {
    "toggle-refleksi": () => Porto.nav.toggleDropdown(),
    "toggle-refleksi-mobile": () => Porto.nav.toggleMobileSubmenu(),
    "toggle-mobile-menu": () => Porto.nav.toggleMobileMenu(),
    "toggle-section": (el) => Porto.accordion.toggle(el.dataset.section),
    "open-subject-modal": (el) => Porto.subjectModal.open(el.dataset.subject),
    "open-subject-modal-smt2": (el) =>
      Porto.subjectModal.openSmt2(el.dataset.subject),
    "close-subject-modal": () => Porto.subjectModal.close(),
    "open-gallery-modal": (el) =>
      Porto.gallery.open(Number(el.dataset.index ?? 0)),
    "close-gallery-modal": () => Porto.gallery.close(),
    "gallery-prev": () => Porto.gallery.prev(),
    "gallery-next": () => Porto.gallery.next(),
    "open-karya-gallery": (el) =>
      Porto.karyaGallery.open(el.dataset.set, Number(el.dataset.index ?? 0)),
    "close-karya-gallery": () => Porto.karyaGallery.close(),
    "karya-gallery-prev": () => Porto.karyaGallery.prev(),
    "karya-gallery-next": () => Porto.karyaGallery.next(),
    "open-karya": (el) => Porto.karya.open(el.dataset.section),
    "close-karya-modal": () => Porto.karya.close(),
    "open-rtl-modal": (el) => Porto.refleksiRtl.open(el.dataset.section),
    "close-rtl-modal": () => Porto.refleksiRtl.close(),
  };

  /** Daftarkan aksi kustom (dipakai oleh modul lain bila perlu) */
  const register = (name, handler) => {
    registry[name] = handler;
  };

  /** Klik pada elemen ber-atribut data-nav / data-action */
  const handleClick = (event) => {
    // Navigasi halaman
    const navEl = event.target.closest("[data-nav]");
    if (navEl) {
      event.preventDefault();
      Porto.router.goToPage(Number(navEl.dataset.nav));

      if (navEl.hasAttribute("data-close-refleksi")) {
        Porto.nav.closeDropdown();
      }
      if (navEl.hasAttribute("data-close-mobile")) {
        Porto.nav.closeMobileMenu();
      }
      return;
    }

    // Aksi umum
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;

    const handler = registry[actionEl.dataset.action];
    if (!handler) return;

    event.preventDefault();
    handler(actionEl);
  };

  const init = () => {
    document.addEventListener("click", handleClick);
  };

  return { init, register, registry };
})();
