/* =========================================================
   PORTOFOLIO PPG — Lightbox Galeri Karya Inovasi
   Dua set foto: Perlengkapan & Dokumentasi.
   Sumber data: Porto.data.karyaFoto
   ========================================================= */
window.Porto = window.Porto || {};

Porto.karyaGallery = (() => {
  const { $, escapeHTML, loadImage } = Porto.util;

  const MODAL_ID = "karyaGalleryModal";

  const sets = () => Porto.data.karyaFoto;

  let activeSet = "perlengkapan";
  let activeIndex = 0;

  /* ---------------------------------------------------------
     Utilitas
     --------------------------------------------------------- */
  const srcOf = (set, file) =>
    `assets/karya-inovasi/${set}/${encodeURIComponent(file)}`;

  const currentItems = () => sets()[activeSet]?.items ?? [];

  /* ---------------------------------------------------------
     Lightbox
     --------------------------------------------------------- */
  const open = (set, index = 0) => {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    activeSet = sets()[set] ? set : "perlengkapan";
    activeIndex = Math.max(0, Math.min(index, currentItems().length - 1));

    Porto.modal.open(MODAL_ID);

    loadKaryaPhoto();
    renderKaryaStrip();

    const backdrop = document.getElementById("karyaGalleryBackdrop");
    if (backdrop && typeof gsap !== "undefined") {
      gsap.fromTo(
        backdrop,
        { opacity: 0 },
        { opacity: 1, duration: 0.35 },
      );
    }
  };

  const close = () => {
    Porto.modal.close(MODAL_ID);
  };

  const loadKaryaPhoto = async () => {
    const set = sets()[activeSet];
    const item = currentItems()[activeIndex];
    const img = document.getElementById("karyaGalleryImage");
    if (!img || !item) return;

    // Update info lebih dulu agar UI responsif (gambar menyusul)
    const counter = document.getElementById("karyaGalleryCounter");
    const total = document.getElementById("karyaGalleryTotal");
    const badge = document.getElementById("karyaGalleryBadge");
    const caption = document.getElementById("karyaGalleryCaption");
    const prevBtn = document.getElementById("karyaGalleryPrev");
    const nextBtn = document.getElementById("karyaGalleryNext");

    if (counter) counter.textContent = activeIndex + 1;
    if (total) total.textContent = currentItems().length;
    if (badge) {
      badge.textContent = set.label;
      badge.className =
        "rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white " +
        (set.accent === "terracotta" ? "bg-terracotta" : "bg-forest");
    }
    if (caption) {
      caption.textContent = `${item.t} — ${activeIndex + 1} dari ${currentItems().length}`;
    }

    const atStart = activeIndex === 0;
    const atEnd = activeIndex === currentItems().length - 1;

    if (prevBtn) {
      prevBtn.style.opacity = atStart ? "0.35" : "1";
      prevBtn.style.pointerEvents = atStart ? "none" : "auto";
    }
    if (nextBtn) {
      nextBtn.style.opacity = atEnd ? "0.35" : "1";
      nextBtn.style.pointerEvents = atEnd ? "none" : "auto";
    }

    await loadImage(img, srcOf(activeSet, item.f));

    if (typeof gsap !== "undefined") {
      gsap.fromTo(
        img,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" },
      );
    }
  };

  const renderKaryaStrip = () => {
    const strip = document.getElementById("karyaGalleryStrip");
    if (!strip) return;

    strip.innerHTML = currentItems()
      .map(
        (item, index) => `
      <button class="g-thumb shrink-0 ${index === activeIndex ? "is-active" : ""}" data-index="${index}" title="${escapeHTML(item.t)}" aria-label="${escapeHTML(item.t)}">
        <img src="${srcOf(activeSet, item.f)}" alt="${escapeHTML(item.t)}" loading="lazy" decoding="async" />
      </button>`,
      )
      .join("");

    strip.querySelectorAll(".g-thumb").forEach((thumb) => {
      const select = () => {
        activeIndex = Number(thumb.dataset.index);
        loadKaryaPhoto();
        syncKaryaStrip();
      };
      thumb.addEventListener("click", select);
      thumb.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      });
    });

    syncKaryaStrip();
  };

  const syncKaryaStrip = () => {
    const strip = document.getElementById("karyaGalleryStrip");
    if (!strip) return;

    strip.querySelectorAll(".g-thumb").forEach((thumb) => {
      thumb.classList.toggle(
        "is-active",
        Number(thumb.dataset.index) === activeIndex,
      );
    });

    const active = strip.querySelector(".g-thumb.is-active");
    active?.scrollIntoView?.({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const next = () => {
    if (activeIndex < currentItems().length - 1) {
      activeIndex += 1;
      loadKaryaPhoto();
      syncKaryaStrip();
    }
  };

  const prev = () => {
    if (activeIndex > 0) {
      activeIndex -= 1;
      loadKaryaPhoto();
      syncKaryaStrip();
    }
  };

  /* ---------------------------------------------------------
     Inisialisasi
     --------------------------------------------------------- */
  const init = () => {
    Porto.modal.bindBackdrop(MODAL_ID, close, {
      backdropId: "karyaGalleryBackdrop",
    });

    // Klik pada area gelap di luar gambar -> tutup preview
    const shell = document.getElementById("karyaGalleryShell");
    shell?.addEventListener("click", (event) => {
      const target = event.target;
      const isOutsideImage =
        target.id === "karyaGalleryShell" || target.id === "karyaGalleryStage";
      if (isOutsideImage) close();
    });

    document.addEventListener("keydown", (event) => {
      if (!Porto.modal.isOpen(MODAL_ID)) return;
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    });
  };

  return { open, close, next, prev, init, $ };
})();
