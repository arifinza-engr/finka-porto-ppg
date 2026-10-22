/* =========================================================
   PORTOFOLIO PPG — Router halaman (SPA sederhana)
   Halaman 1..9, transisi GSAP, sinkronisasi status navbar.
   ========================================================= */
window.Porto = window.Porto || {};

Porto.router = (() => {
  const { $ } = Porto.util;

  /** Halaman yang sedang aktif */
  let currentPage = 1;

  /** Listener yang dipanggil setiap kali halaman tampil */
  const listeners = new Set();

  /** Halaman turunan Refleksi (menu induk "Refleksi" ikut aktif) */
  const REFLEKSI_PAGES = [4, 7, 8, 9];

  /** Perbarui tampilan menu aktif */
  const updateNavbarActive = (pageNumber) => {
    document.querySelectorAll(".nav-item").forEach((item) => {
      const isActive = item.dataset.page === String(pageNumber);
      item.classList.toggle("active", isActive);
      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    // Menu induk "Refleksi" aktif saat salah satu submenunya dipilih
    const trigger = document.getElementById("navRefleksiTrigger");
    if (trigger) {
      trigger.classList.toggle("active", REFLEKSI_PAGES.includes(pageNumber));
    }
  };

  /** Navigasi ke halaman tertentu */
  const goToPage = (pageNumber) => {
    const target = Number(pageNumber);
    const currentEl = document.getElementById(`page-${currentPage}`);
    const nextEl = document.getElementById(`page-${target}`);
    if (!nextEl) return;

    // Navigasi ke halaman yang sama: cukup scroll ke atas
    if (currentEl === nextEl) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const reducedMotion = Porto.util.prefersReducedMotion();

    const showPage = () => {
      if (currentEl) {
        currentEl.classList.remove("active");
        currentEl.style.opacity = "";
        currentEl.style.transform = "";
      }

      currentPage = target;
      updateNavbarActive(target);

      nextEl.classList.add("active");

      if (reducedMotion || typeof gsap === "undefined") {
        nextEl.style.opacity = "";
        nextEl.style.transform = "";
      } else {
        gsap.fromTo(
          nextEl,
          { opacity: 0, y: 30, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" },
        );
      }

      // Beri tahu modul lain (mis. galeri) bahwa halaman aktif
      listeners.forEach((listener) => {
        try {
          listener(target);
        } catch (error) {
          console.error("[router] listener gagal:", error);
        }
      });
    };

    if (!currentEl || reducedMotion || typeof gsap === "undefined") {
      showPage();
    } else {
      // Jaring pengaman: perpindahan halaman tetap terjadi walau
      // callback animasi tidak pernah dipanggil browser.
      Porto.util.animateTo(
        currentEl,
        {
          opacity: 0,
          y: -30,
          scale: 0.98,
          duration: 0.3,
          ease: "power2.inOut",
        },
        showPage,
        450,
      );
    }

    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Daftarkan listener "halaman tampil" */
  const onPageShown = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  const getCurrentPage = () => currentPage;

  return { goToPage, updateNavbarActive, onPageShown, getCurrentPage, $ };
})();
