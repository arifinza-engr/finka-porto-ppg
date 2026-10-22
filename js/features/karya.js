/* =========================================================
   PORTOFOLIO PPG — Karya Inovasi (halaman 9 + modal rincian)
   Sumber data: Porto.data.karyaInovasi
   ========================================================= */
window.Porto = window.Porto || {};

Porto.karya = (() => {
  const { escapeHTML, nextFrame } = Porto.util;

  const MODAL_ID = "karyaModal";
  const CONTENT_ID = "karyaModalContent";
  const BODY_ID = "karyaModalBody";

  const data = () => Porto.data.karyaInovasi;

  /* ---------------------------------------------------------
     Renderer
     --------------------------------------------------------- */

  /** Render meta chip (Identitas Karya, dst.) */
  const renderMeta = () =>
    data()
      .meta.map(
        (meta) => `
      <div class="bg-cream/70 border-2 border-navy/15 rounded-xl px-4 py-2">
        <span class="block font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-rust">${escapeHTML(meta.label)}</span>
        <span class="block font-sans text-sm font-semibold text-navy mt-0.5 text-justify">${escapeHTML(meta.value)}</span>
      </div>`,
      )
      .join("");

  /** Render seluruh bagian karya ke dalam modal */
  const renderSections = () =>
    data()
      .sections.map((section) => {
        const accent =
          Porto.data.accents[section.accent] ?? Porto.data.accents.forest;

        const paragraphs = (section.paragraphs ?? [])
          .map(
            (paragraph) =>
              `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(paragraph)}</p>`,
          )
          .join("");

        const list = section.list
          ? `<ul class="space-y-3 mt-4">
            ${section.list
              .map(
                (item) => `
              <li class="flex gap-3">
                <span class="${accent.chip} text-white w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">&#10003;</span>
                <span class="text-justify">${escapeHTML(item)}</span>
              </li>`,
              )
              .join("")}
           </ul>`
          : "";

        return `
        <section id="karya-sec-${section.id}" data-karya-section="${section.id}" class="scroll-mt-6">
          <h3 class="font-serif font-black text-2xl text-navy mb-5 flex items-center">
            <span class="${accent.circle} w-12 h-12 rounded-xl border-2 border-navy flex items-center justify-center mr-4 shadow-sm transform -rotate-3">
              <i class="fas ${section.icon}"></i>
            </span>
            ${escapeHTML(section.title)}
          </h3>
          <div class="bg-cream/50 p-6 rounded-2xl border-2 border-navy shadow-3d-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 w-16 h-16 ${accent.blob} rounded-bl-full -z-10"></div>
            <div class="text-navy/85 font-medium font-sans leading-relaxed text-justify">
              ${paragraphs}${list}
            </div>
          </div>
        </section>`;
      })
      .join("");

  /* ---------------------------------------------------------
     Buka / Tutup
     --------------------------------------------------------- */

  /** Buka modal karya, opsional scroll ke bagian tertentu */
  const open = async (sectionId) => {
    const modal = document.getElementById(MODAL_ID);
    const content = document.getElementById(CONTENT_ID);
    const body = document.getElementById(BODY_ID);
    if (!modal || !content || !body) return;

    document.getElementById("karyaModalBadge").textContent = data().badge;
    document.getElementById("karyaModalTitle").textContent = data().judul;
    document.getElementById("karyaModalSections").innerHTML = renderSections();

    Porto.modal.open(MODAL_ID, { contentId: CONTENT_ID });
    body.scrollTop = 0;

    await nextFrame();

    if (!sectionId) return;
    const target = document.getElementById(`karya-sec-${sectionId}`);
    if (!target) return;

    body.scrollTo({ top: target.offsetTop - 8, behavior: "smooth" });
  };

  /** Tutup modal karya */
  const close = () => {
    Porto.modal.close(MODAL_ID, { contentId: CONTENT_ID, animate: true });
  };

  /* ---------------------------------------------------------
     Isi kartu unggulan di halaman 9
     --------------------------------------------------------- */
  const init = () => {
    // Deteksi dibuka lewat file:// -> pemutar YouTube gagal (error 153),
    // jadi tampilkan catatan berisi cara menjalankannya lewat server lokal.
    const videoBlock = document.getElementById("karyaVideo");
    if (videoBlock && window.location.protocol === "file:") {
      videoBlock.classList.add("is-local-file");
    }

    // Isi meta (Identitas Karya, dst.) pada kartu unggulan
    const metaBox = document.getElementById("karyaMeta");
    if (metaBox) metaBox.innerHTML = renderMeta();

    // Judul & ringkasan diambil dari data agar selalu sinkron dengan modal
    const judulEl = document.getElementById("karyaJudul");
    if (judulEl) judulEl.textContent = data().judul;

    const ringkasanEl = document.getElementById("karyaRingkasan");
    if (ringkasanEl) ringkasanEl.textContent = data().ringkasan;
  };

  return { open, close, init, renderSections, renderMeta };
})();
