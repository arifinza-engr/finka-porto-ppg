/* =========================================================
   PORTOFOLIO PPG — Modal Refleksi Mata Kuliah (Semester 1 & 2)
   Sumber data: Porto.data.mataKuliahSmt1 / Porto.data.mataKuliahSmt2
   ========================================================= */
window.Porto = window.Porto || {};

Porto.subjectModal = (() => {
  const { escapeHTML } = Porto.util;

  const MODAL_ID = "subjectModal";
  const CONTENT_ID = "modalContent";

  /* ---------------------------------------------------------
     Renderer
     --------------------------------------------------------- */

  /** Render daftar paragraf aman (anti HTML injection) */
  const renderParagraphs = (paragraphs = []) =>
    paragraphs
      .map((paragraph) => `<p class="mb-4">${escapeHTML(paragraph)}</p>`)
      .join("");

  /** Render 4C (Connection / Challenge / Concept / Change) per topik */
  const render4C = (topics = [], key) =>
    topics
      .map((topic, index) => {
        const paragraphs = topic.sections?.[key] ?? [];
        return `<section class="mb-6 last:mb-0">
              <h5 class="font-bold text-base sm:text-lg text-navy mb-3 flex items-start gap-2">
                  <span class="bg-white border-2 border-navy rounded-lg px-2 py-1 text-xs sm:text-sm shrink-0">${index + 1}</span>
                  <span>${escapeHTML(topic.title)}</span>
              </h5>
              <div class="pl-0 sm:pl-10 text-navy/80 font-medium text-sm leading-relaxed text-justify">${renderParagraphs(paragraphs)}</div>
          </section>`;
      })
      .join("");

  /** Render daftar artefak (tautan Google Drive) */
  const renderArtifacts = (artifacts = [], driveLink) =>
    artifacts
      .map(
        (artifact, index) => `<section class="mb-6 last:mb-0 rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
          <a href="${driveLink || "#"}" target="_blank" rel="noopener noreferrer" class="group block" ${driveLink ? "" : 'aria-disabled="true"'}>
              <h5 class="font-bold text-base sm:text-lg text-cream mb-3 flex items-start gap-2">
                  <span class="bg-terracotta text-white border border-white/40 rounded-lg px-2 py-1 text-xs sm:text-sm shrink-0">${index + 1}</span>
                  <span class="flex-1 group-hover:text-mustard transition-colors">${escapeHTML(artifact.title)}</span>
                  <span class="text-mustard text-xs sm:text-sm whitespace-nowrap"><i class="fab fa-google-drive"></i> Buka</span>
              </h5>
              <div class="pl-0 sm:pl-10 text-cream/90 font-medium text-sm leading-relaxed text-justify">${renderParagraphs(artifact.paragraphs)}</div>
          </a>
      </section>`,
      )
      .join("");

  /** Render refleksi akhir */
  const renderFinal = (paragraphs = []) => renderParagraphs(paragraphs);

  /* ---------------------------------------------------------
     Tautan artefak
     --------------------------------------------------------- */
  const updateArtifactLink = (link) => {
    const anchor = document.getElementById("modal-artefak-link");
    if (!anchor) return;

    if (link && link.startsWith("http")) {
      anchor.href = link;
      anchor.classList.remove("opacity-50", "pointer-events-none");
      anchor.innerHTML =
        '<i class="fab fa-google-drive"></i> Buka Artefak di Google Drive';
    } else {
      anchor.href = "#";
      anchor.classList.add("opacity-50", "pointer-events-none");
      anchor.innerHTML =
        '<i class="fab fa-google-drive"></i> Tempel Link Google Drive Dahulu';
    }
  };

  /* ---------------------------------------------------------
     Buka / Tutup
     --------------------------------------------------------- */

  /** Modal refleksi Semester 1 (berbasis topik) */
  const open = (subjectTitle) => {
    const data = Porto.data.mataKuliahSmt1?.[subjectTitle];
    if (!data) {
      console.warn("[subjectModal] data tidak ditemukan:", subjectTitle);
      return;
    }

    document.getElementById("modalTitle").innerText = subjectTitle;

    document.getElementById("modal-connection").innerHTML = render4C(
      data.topics,
      "connection",
    );
    document.getElementById("modal-challenge").innerHTML = render4C(
      data.topics,
      "challenge",
    );
    document.getElementById("modal-concept").innerHTML = render4C(
      data.topics,
      "concept",
    );
    document.getElementById("modal-change").innerHTML = render4C(
      data.topics,
      "change",
    );
    document.getElementById("modal-artefak").innerHTML = renderArtifacts(
      data.artefak,
      data.artefakLink,
    );
    document.getElementById("modal-akhir").innerHTML =
      `<div class="mb-4 font-bold text-lg text-forest">${escapeHTML(data.akhirTitle)}</div>` +
      renderFinal(data.akhir);

    updateArtifactLink(data.artefakLink);

    Porto.modal.open(MODAL_ID, { contentId: CONTENT_ID });
  };

  /** Modal refleksi Semester 2 (isi tunggal, bukan per topik) */
  const openSmt2 = (subjectTitle) => {
    const data = Porto.data.mataKuliahSmt2?.[subjectTitle];
    if (!data) {
      console.warn("[subjectModal] data tidak ditemukan:", subjectTitle);
      return;
    }

    document.getElementById("modalTitle").innerText = subjectTitle;

    document.getElementById("modal-connection").innerHTML =
      `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(data.sections.connection)}</p>`;
    document.getElementById("modal-challenge").innerHTML =
      `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(data.sections.challenge)}</p>`;
    document.getElementById("modal-concept").innerHTML =
      `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(data.sections.concept)}</p>`;
    document.getElementById("modal-change").innerHTML =
      `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(data.sections.change)}</p>`;
    document.getElementById("modal-artefak").innerHTML =
      `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(data.artefak)}</p>`;

    document.getElementById("modal-akhir").innerHTML =
      `<div class="mb-4 font-bold text-lg text-forest">Refleksi Akhir</div>` +
      `<p class="mb-4 text-justify">${escapeHTML(data.akhir)}</p>` +
      `<p class="text-justify">${escapeHTML(data.refleksiAkhir)}</p>`;

    updateArtifactLink(data.artefakLink);

    Porto.modal.open(MODAL_ID, { contentId: CONTENT_ID });
  };

  /** Tutup modal */
  const close = () => {
    Porto.modal.close(MODAL_ID, { contentId: CONTENT_ID, animate: true });
  };

  /** Inisialisasi: klik backdrop menutup modal */
  const init = () => {
    Porto.modal.bindBackdrop(MODAL_ID, close);
  };

  return { open, openSmt2, close, init };
})();
