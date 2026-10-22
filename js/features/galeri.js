/* =========================================================
   PORTOFOLIO PPG — Galeri Foto (grid ringan + filter + lightbox)
   Sumber data: Porto.data.galleryItems
   ========================================================= */
window.Porto = window.Porto || {};

Porto.gallery = (() => {
  const { $, $$, loadImage, preloadImage } = Porto.util;

  const MODAL_ID = "galleryModal";
  const SEM2_START = 27; // foto indeks 28 ke atas = semester 2

  const items = () => Porto.data.galleryItems ?? [];

  let galleryFilter = "all";
  let currentImageIndex = 0;
  let galleryReady = false;
  let resizeTimer = null;
  let zoomed = false;

  /* ---------------------------------------------------------
     Utilitas
     --------------------------------------------------------- */
  const isSemester2 = (index) => index >= SEM2_START;

  const getVisibleItems = () => {
    const all = items().map((item, index) => ({ ...item, i: index }));
    if (galleryFilter === "1") return all.filter((item) => !isSemester2(item.i));
    if (galleryFilter === "2") return all.filter((item) => isSemester2(item.i));
    return all;
  };

  const srcOf = (item) => (item ? `assets/gallery/${item.f}` : null);

  /* ---------------------------------------------------------
     Render grid (CSS grid sederhana — ringan, tanpa hitung ulang JS)
     --------------------------------------------------------- */
  const renderGallery = () => {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    const visibleItems = getVisibleItems();

    grid.innerHTML = visibleItems
      .map(
        (item) => `
        <figure
          class="g-item"
          data-index="${item.i}"
          role="button"
          tabindex="0"
          aria-label="Foto ${item.i + 1}"
        >
          <img
            src="${srcOf(item)}"
            alt="Galeri ${item.i + 1}"
            loading="lazy"
            decoding="async"
          />
          <span class="g-badge">${isSemester2(item.i) ? "SMT 2" : "SMT 1"}</span>
        </figure>`,
      )
      .join("");

    const counter = document.getElementById("galleryCount");
    if (counter) counter.textContent = visibleItems.length;
  };

  /* ---------------------------------------------------------
     Filter
     --------------------------------------------------------- */
  const moveFilterIndicator = () => {
    const wrap = document.getElementById("galleryFilters");
    const indicator = document.getElementById("filterIndicator");
    if (!wrap || !indicator) return;

    const active = wrap.querySelector(".g-filter.is-active");
    if (!active) return;

    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
  };

  const setGalleryFilter = (filter) => {
    if (galleryFilter === filter) return;
    galleryFilter = filter;

    $$("#galleryFilters .g-filter").forEach((btn) => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    moveFilterIndicator();
    renderGallery();
  };

  /* ---------------------------------------------------------
     Lightbox
     --------------------------------------------------------- */
  const open = (index) => {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    currentImageIndex = index;
    Porto.modal.open(MODAL_ID);

    const backdrop = document.getElementById("galleryBackdrop");
    if (backdrop && typeof gsap !== "undefined") {
      gsap.fromTo(
        backdrop,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" },
      );
    }

    loadLightboxImage(index, 1);
    renderFilmstrip();
    updateNavButtons();
  };

  const loadLightboxImage = async (index, direction = 1) => {
    const img = document.getElementById("galleryImage");
    const loader = document.getElementById("galleryLoader");
    const item = items()[index];
    if (!img || !item) return;

    // Update info lebih dulu agar UI responsif (gambar menyusul)
    const counter = document.getElementById("galleryCounter");
    const total = document.getElementById("galleryTotal");
    const semester = document.getElementById("gallerySemester");
    const caption = document.getElementById("galleryCaption");
    const smt = isSemester2(index);

    if (counter) counter.textContent = index + 1;
    if (total) total.textContent = items().length;
    if (semester) {
      semester.textContent = smt ? "SMT 2" : "SMT 1";
      semester.className = `rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white ${
        smt ? "bg-terracotta" : "bg-forest"
      }`;
    }
    if (caption) {
      caption.textContent = `Foto ${index + 1} dari ${items().length} — ${
        smt ? "Semester 2" : "Semester 1"
      }`;
    }

    loader?.classList.remove("hidden");
    loader?.classList.add("grid");

    await loadImage(img, srcOf(item));

    loader?.classList.add("hidden");
    loader?.classList.remove("grid");

    if (typeof gsap !== "undefined") {
      gsap.fromTo(
        img,
        { opacity: 0, scale: 0.94, x: direction * 26 },
        { opacity: 1, scale: 1, x: 0, duration: 0.55, ease: "power3.out" },
      );
    }

    // Preload gambar tetangga
    preloadImage(srcOf(items()[index + 1]));
    preloadImage(srcOf(items()[index - 1]));
  };

  const close = () => {
    const modal = document.getElementById(MODAL_ID);
    const backdrop = document.getElementById("galleryBackdrop");
    const img = document.getElementById("galleryImage");
    if (!modal) return;

    const finalize = () => {
      Porto.modal.close(MODAL_ID);
      if (img) {
        img.style.opacity = "";
        img.style.transform = "";
      }
    };

    if (typeof gsap === "undefined") {
      finalize();
      return;
    }

    gsap.to(img, {
      opacity: 0,
      scale: 0.94,
      duration: 0.25,
      ease: "power2.in",
    });

    // Jaring pengaman: lightbox tetap tertutup walau callback
    // animasi tidak pernah dipanggil browser.
    Porto.util.animateTo(
      backdrop,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      },
      finalize,
      450,
    );
  };

  const next = () => {
    if (currentImageIndex < items().length - 1) {
      currentImageIndex += 1;
      loadLightboxImage(currentImageIndex, 1);
      updateNavButtons();
      syncFilmstrip();
    }
  };

  const prev = () => {
    if (currentImageIndex > 0) {
      currentImageIndex -= 1;
      loadLightboxImage(currentImageIndex, -1);
      updateNavButtons();
      syncFilmstrip();
    }
  };

  const updateNavButtons = () => {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (!prevBtn || !nextBtn) return;

    const atStart = currentImageIndex === 0;
    const atEnd = currentImageIndex === items().length - 1;

    const apply = () => {
      prevBtn.style.pointerEvents = atStart ? "none" : "auto";
      nextBtn.style.pointerEvents = atEnd ? "none" : "auto";
      prevBtn.style.opacity = atStart ? "0.3" : "1";
      nextBtn.style.opacity = atEnd ? "0.3" : "1";
    };

    if (typeof gsap === "undefined") {
      apply();
      return;
    }

    // Jaring pengaminanya: status tombol tetap ter-update walau callback
    // animasi tidak pernah dipanggil browser.
    Porto.util.animateTo(
      [prevBtn, nextBtn],
      {
        opacity: 1,
        duration: 0.3,
      },
      apply,
      400,
    );
  };

  /* ---------------------------------------------------------
     Filmstrip
     --------------------------------------------------------- */
  let filmstripReady = false;

  const renderFilmstrip = () => {
    const strip = document.getElementById("galleryFilmstrip");
    if (!strip) return;

    // Bangun hanya sekali; buka berikutnya cukup menyinkronkan status aktif.
    if (filmstripReady) {
      syncFilmstrip();
      return;
    }
    filmstripReady = true;

    strip.innerHTML = items()
      .map(
        (item, index) => `
      <div class="g-thumb ${index === currentImageIndex ? "is-active" : ""}" data-index="${index}" title="Foto ${index + 1}" role="button" tabindex="0" aria-label="Foto ${index + 1}">
        <img src="${srcOf(item)}" alt="" loading="lazy" decoding="async" />
      </div>`,
      )
      .join("");

    strip.querySelectorAll(".g-thumb").forEach((thumb) => {
      const select = () => {
        currentImageIndex = Number(thumb.dataset.index);
        loadLightboxImage(currentImageIndex, 1);
        updateNavButtons();
        syncFilmstrip();
      };
      thumb.addEventListener("click", select);
      thumb.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      });
    });

    syncFilmstrip();
  };

  const syncFilmstrip = () => {
    const strip = document.getElementById("galleryFilmstrip");
    if (!strip) return;

    strip.querySelectorAll(".g-thumb").forEach((thumb) => {
      thumb.classList.toggle(
        "is-active",
        Number(thumb.dataset.index) === currentImageIndex,
      );
    });

    const active = strip.querySelector(".g-thumb.is-active");
    active?.scrollIntoView?.({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  /* ---------------------------------------------------------
     Interaksi: zoom & swipe
     --------------------------------------------------------- */
  const bindImageInteraction = (img, stage) => {
    img.addEventListener("click", (event) => {
      event.stopPropagation();
      zoomed = !zoomed;

      if (zoomed) {
        const rect = img.getBoundingClientRect();
        const originX = ((event.clientX - rect.left) / rect.width) * 100;
        const originY = ((event.clientY - rect.top) / rect.height) * 100;

        if (typeof gsap !== "undefined") {
          gsap.to(img, {
            scale: 1.9,
            transformOrigin: `${originX}% ${originY}%`,
            duration: 0.5,
            ease: "power3.out",
          });
        }
        stage.style.overflow = "auto";
      } else {
        if (typeof gsap !== "undefined") {
          gsap.to(img, { scale: 1, duration: 0.4, ease: "power2.out" });
        }
        stage.style.overflow = "hidden";
      }
    });

    let touchX = null;
    let touchY = null;

    stage.addEventListener(
      "touchstart",
      (event) => {
        touchX = event.changedTouches[0].clientX;
        touchY = event.changedTouches[0].clientY;
      },
      { passive: true },
    );

    stage.addEventListener(
      "touchend",
      (event) => {
        if (touchX === null) return;
        const deltaX = event.changedTouches[0].clientX - touchX;
        const deltaY = event.changedTouches[0].clientY - touchY;

        if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) next();
          else prev();
        }
        touchX = null;
        touchY = null;
      },
      { passive: true },
    );
  };

  /* ---------------------------------------------------------
     Hero & scroll (disederhanakan: tanpa GSAP/ScrollTrigger)
     --------------------------------------------------------- */
  const initScroll = () => {};
  const killScroll = () => {};

  /* ---------------------------------------------------------
     Inisialisasi
     --------------------------------------------------------- */
  const init = () => {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    if (!galleryReady) {
      galleryReady = true;

      // Filter
      $$("#galleryFilters .g-filter").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.classList.contains("is-active")));
        btn.addEventListener("click", () => setGalleryFilter(btn.dataset.filter));
      });

      // Klik & keyboard pada grid (event delegation)
      grid.addEventListener("click", (event) => {
        const item = event.target.closest(".g-item");
        if (item) open(Number(item.dataset.index));
      });

      grid.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const item = event.target.closest(".g-item");
        if (!item) return;
        event.preventDefault();
        open(Number(item.dataset.index));
      });

      // Klik di luar modal -> tutup
      Porto.modal.bindBackdrop(MODAL_ID, close, {
        backdropId: "galleryBackdrop",
      });

      // Klik pada area gelap di luar gambar -> tutup preview
      const shell = document.getElementById("galleryShell");
      shell?.addEventListener("click", (event) => {
        const target = event.target;
        const isOutsideImage =
          target.id === "galleryShell" ||
          target.id === "galleryStage" ||
          target.id === "galleryFrame";
        if (isOutsideImage) close();
      });

      // Zoom gambar + swipe
      const img = document.getElementById("galleryImage");
      const stage = document.getElementById("galleryStage");
      if (img && stage) bindImageInteraction(img, stage);

      // Resize -> perbarui posisi penanda filter
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(moveFilterIndicator, 180);
      });

      // Navigasi keyboard
      document.addEventListener("keydown", (event) => {
        if (!Porto.modal.isOpen(MODAL_ID)) return;
        if (event.key === "ArrowLeft") prev();
        if (event.key === "ArrowRight") next();
      });
    }

    renderGallery();
    moveFilterIndicator();
  };

  return {
    init,
    open,
    close,
    next,
    prev,
    renderGallery,
    initScroll,
    killScroll,
    $,
  };
})();
