/* =========================================================
   PORTOFOLIO PPG — Refleksi Pengalaman Belajar & RTL (halaman 8)
   Card grid + modal, mengikuti gaya Refleksi 1, Refleksi 2,
   dan Karya Inovasi.
   Sumber data: Porto.data.refleksiRtl
   ========================================================= */
window.Porto = window.Porto || {};

Porto.refleksiRtl = (() => {
  const { escapeHTML } = Porto.util;

  const MODAL_ID = "rtlModal";
  const CONTENT_ID = "rtlModalContent";
  const BODY_ID = "rtlModalBody";
  const SECTIONS_ID = "rtlModalSections";
  const GRID_ID = "rtlCards";

  const data = () => Porto.data.refleksiRtl;

  const accentOf = (name) =>
    Porto.data.accents[name] ?? Porto.data.accents.forest;

  /** Cari item (pertanyaan / langkah) berdasarkan id */
  const findItem = (id) => {
    for (const indikator of data()?.indikator ?? []) {
      const item = indikator.items.find((entry) => entry.id === id);
      if (item) return { indikator, item };
    }
    return null;
  };

  /* ---------------------------------------------------------
     Kartu (identik dengan kartu Refleksi 1/2 & Karya Inovasi)
     --------------------------------------------------------- */
  const renderCard = (item) => {
    const accent = accentOf(item.accent);
    const badge = item.number
      ? `<span class="font-serif font-black text-xl leading-none">${item.number}</span>`
      : `<i class="fas ${item.icon} text-xl"></i>`;

    return `
          <button
            data-action="open-rtl-modal" data-section="${item.id}"
            class="btn-3d bg-white border-4 border-navy p-6 rounded-3xl shadow-3d-md hover:-translate-y-3 transition-all duration-300 text-left flex flex-col justify-between group relative overflow-hidden"
          >
            <div
              class="absolute -right-4 -top-4 w-20 h-20 ${accent.soft} rounded-full group-hover:scale-150 transition-transform duration-500 z-0"
            ></div>
            <div class="relative z-10">
              <div
                class="w-12 h-12 ${accent.circle} rounded-full flex items-center justify-center mb-4 border-2 border-navy shadow-sm transform group-hover:rotate-12 transition-transform"
              >
                ${badge}
              </div>
              <h3 class="font-serif font-bold text-xl text-navy mb-2">
                ${escapeHTML(item.cardTitle)}
              </h3>
            </div>
            <div
              class="text-sm font-bold font-sans ${accent.text} mt-4 ${accent.soft} inline-block px-3 py-1 rounded-full relative z-10 w-fit"
            >
              ${item.number ? "Lihat Langkah" : "Buka Refleksi"}
              <i class="fas fa-arrow-right ml-1"></i>
            </div>
          </button>`;
  };

  /** Render seluruh indikator + grid kartunya */
  const renderCards = () => {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    grid.innerHTML = (data()?.indikator ?? [])
      .map((indikator) => {
        const columns = indikator.columns ?? 3;
        const gridClass =
          columns === 2
            ? "grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto perspective-1000"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full perspective-1000";

        return `
        <!-- ===== ${escapeHTML(indikator.label)}: ${escapeHTML(indikator.title)} ===== -->
        <div class="w-full">
          <div class="w-full text-center mb-6">
            <h3 class="font-serif font-black text-2xl sm:text-3xl text-navy inline-block relative">
              ${escapeHTML(indikator.title)}
            </h3>
            <p class="text-navy/70 font-medium font-sans mt-3">
              ${escapeHTML(indikator.subtitle)}
            </p>
          </div>

          <div class="${gridClass}">
            ${indikator.items.map(renderCard).join("")}
          </div>
        </div>`;
      })
      .join("");
  };

  /* ---------------------------------------------------------
     Modal
     --------------------------------------------------------- */
  const renderModalContent = (indikator, item) => {
    const accent = accentOf(item.accent);

    const badge = item.number
      ? `<span class="inline-flex items-center justify-center w-8 h-8 ${accent.circle} rounded-full border-2 border-navy font-serif font-black text-sm">${item.number}</span>`
      : `<i class="fas ${item.icon} text-xl"></i>`;

    return `
        <section>
          <div class="flex items-start gap-4 mb-5">
            <span
              class="${accent.circle} w-12 h-12 rounded-xl border-2 border-navy flex items-center justify-center shadow-sm transform -rotate-3 shrink-0"
            >
              ${badge}
            </span>
            <div>
              <span class="block font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-rust">
                ${escapeHTML(indikator.label)}
              </span>
              <h3 class="font-serif font-black text-xl sm:text-2xl text-navy leading-snug mt-1">
                ${escapeHTML(item.title)}
              </h3>
            </div>
          </div>

          <div class="bg-cream/50 p-6 rounded-2xl border-2 border-navy shadow-3d-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 w-16 h-16 ${accent.blob} rounded-bl-full -z-10"></div>
            <div
              class="bg-cream/60 border-l-4 ${accent.bar} rounded-r-xl px-4 py-3 mb-4 inline-block"
            >
              <span class="font-sans font-bold text-xs tracking-widest uppercase text-rust">
                ${item.number ? "Langkah RTL" : "Pertanyaan"}
              </span>
            </div>
            <p class="text-navy/90 font-sans font-semibold leading-relaxed text-justify mb-4">
              ${escapeHTML(item.question)}
            </p>
            <span class="block font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-rust mb-3">
              Uraian Jawaban
            </span>
            <div class="text-navy/85 font-medium font-sans leading-relaxed text-justify space-y-4">
              ${item.paragraphs
                .map((paragraph) => `<p class="mb-0">${escapeHTML(paragraph)}</p>`)
                .join("")}
            </div>
          </div>
        </section>`;
  };

  /** Buka modal refleksi/RTL */
  const open = (itemId) => {
    const found = findItem(itemId);
    if (!found) {
      console.warn("[refleksiRtl] item tidak ditemukan:", itemId);
      return;
    }

    const { indikator, item } = found;

    const badge = document.getElementById("rtlModalBadge");
    const title = document.getElementById("rtlModalTitle");
    const sections = document.getElementById(SECTIONS_ID);
    if (!badge || !title || !sections) return;

    badge.textContent = indikator.label;
    title.textContent = indikator.title;
    sections.innerHTML = renderModalContent(indikator, item);

    Porto.modal.open(MODAL_ID, { contentId: CONTENT_ID });

    const body = document.getElementById(BODY_ID);
    if (body) body.scrollTop = 0;
  };

  /** Tutup modal */
  const close = () => {
    Porto.modal.close(MODAL_ID, { contentId: CONTENT_ID, animate: true });
  };

  /* ---------------------------------------------------------
     Inisialisasi
     --------------------------------------------------------- */
  const init = () => {
    renderCards();
    Porto.modal.bindBackdrop(MODAL_ID, close);
  };

  return { init, open, close, renderCards };
})();
