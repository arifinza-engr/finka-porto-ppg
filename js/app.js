// State management
      let currentPage = 1;

      // Navigation Function with animation reset
      function goToPage(pageNumber) {
        const currentEl = document.getElementById(`page-${currentPage}`);
        const nextEl = document.getElementById(`page-${pageNumber}`);

        // Remove active from current
        currentEl.classList.remove("active");

        // Update state
        currentPage = pageNumber;

        // Update navbar active state
        updateNavbarActive(pageNumber);

        // Reset animation by triggering reflow
        void nextEl.offsetWidth;

        // Add active to new page
        nextEl.classList.add("active");

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      // Update navbar active state
      function updateNavbarActive(pageNumber) {
        document.querySelectorAll(".nav-item").forEach((item) => {
          if (item.dataset.page === String(pageNumber)) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      }

      // Toggle Mobile Menu
      function toggleMobileMenu() {
        const menu = document.getElementById("mobileMenu");
        const icon = document.getElementById("menuIcon");
        menu.classList.toggle("hidden");
        if (menu.classList.contains("hidden")) {
          icon.className = "fas fa-bars text-navy";
        } else {
          icon.className = "fas fa-times text-navy";
        }
      }

      // Accordion Toggle for Page 3
      function toggleSection(id) {
        const content = document.getElementById(`content-${id}`);
        const icon = document.getElementById(`icon-${id}`);

        if (content.classList.contains("hidden")) {
          // Close all others
          ["tujuan", "inspirasi", "visi", "misi"].forEach((sec) => {
            const el = document.getElementById(`content-${sec}`);
            if (el) {
              el.classList.add("hidden");
              document.getElementById(`icon-${sec}`).style.transform =
                "rotate(0deg)";
            }
          });
          // Open clicked
          content.classList.remove("hidden");
          icon.style.transform = "rotate(180deg)";
        } else {
          content.classList.add("hidden");
          icon.style.transform = "rotate(0deg)";
        }
      }

      // Data Mata Kuliah
      function escapeHTML(text) {
        return String(text)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function renderParagraphs(paragraphs) {
        return paragraphs
          .map((p) => `<p class="mb-4">${escapeHTML(p)}</p>`)
          .join("");
      }

      function render4C(topics, key, label, icon) {
        return topics
          .map((topic, index) => {
            const paragraphs = topic.sections[key] || [];
            return `<section class="mb-6 last:mb-0">
                    <h5 class="font-bold text-base sm:text-lg text-navy mb-3 flex items-start gap-2">
                        <span class="bg-white border-2 border-navy rounded-lg px-2 py-1 text-xs sm:text-sm shrink-0">${index + 1}</span>
                        <span>${escapeHTML(topic.title)}</span>
                    </h5>
                    <div class="pl-0 sm:pl-10 text-navy/80 font-medium text-sm leading-relaxed">${renderParagraphs(paragraphs)}</div>
                </section>`;
          })
          .join("");
      }

      function renderArtifacts(artifacts, driveLink) {
        return artifacts
          .map(
            (
              a,
              index,
            ) => `<section class="mb-6 last:mb-0 rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
                <a href="${driveLink || "#"}" target="_blank" rel="noopener noreferrer" class="group block" ${driveLink ? "" : 'aria-disabled="true"'}>
                    <h5 class="font-bold text-base sm:text-lg text-cream mb-3 flex items-start gap-2">
                        <span class="bg-terracotta text-white border border-white/40 rounded-lg px-2 py-1 text-xs sm:text-sm shrink-0">${index + 1}</span>
                        <span class="flex-1 group-hover:text-mustard transition-colors">${escapeHTML(a.title)}</span>
                        <span class="text-mustard text-xs sm:text-sm whitespace-nowrap"><i class="fab fa-google-drive"></i> Buka</span>
                    </h5>
                    <div class="pl-0 sm:pl-10 text-cream/90 font-medium text-sm leading-relaxed">${renderParagraphs(a.paragraphs)}</div>
                </a>
            </section>`,
          )
          .join("");
      }

      function renderFinal(paragraphs) {
        return renderParagraphs(paragraphs);
      }

      function openModal(subjectTitle) {
        document.getElementById("modalTitle").innerText = subjectTitle;
        const data = mataKuliahData[subjectTitle];
        if (!data) {
          alert("Data refleksi mata kuliah tidak ditemukan.");
          return;
        }

        document.getElementById("modal-connection").innerHTML = render4C(
          data.topics,
          "connection",
          "Connection",
          "link",
        );
        document.getElementById("modal-challenge").innerHTML = render4C(
          data.topics,
          "challenge",
          "Challenge",
          "triangle-exclamation",
        );
        document.getElementById("modal-concept").innerHTML = render4C(
          data.topics,
          "concept",
          "Concept",
          "lightbulb",
        );
        document.getElementById("modal-change").innerHTML = render4C(
          data.topics,
          "change",
          "Change",
          "sync-alt",
        );
        document.getElementById("modal-artefak").innerHTML = renderArtifacts(
          data.artefak,
          data.artefakLink,
        );
        document.getElementById("modal-akhir").innerHTML =
          `<div class="mb-4 font-bold text-lg text-forest">${escapeHTML(data.akhirTitle)}</div>` +
          renderFinal(data.akhir);

        const artifactLink = document.getElementById("modal-artefak-link");
        if (data.artefakLink && data.artefakLink.startsWith("http")) {
          artifactLink.href = data.artefakLink;
          artifactLink.classList.remove("opacity-50", "pointer-events-none");
          artifactLink.innerHTML =
            '<i class="fab fa-google-drive"></i> Buka Artefak di Google Drive';
        } else {
          artifactLink.href = "#";
          artifactLink.classList.add("opacity-50", "pointer-events-none");
          artifactLink.innerHTML =
            '<i class="fab fa-google-drive"></i> Tempel Link Google Drive Dahulu';
        }

        const modal = document.getElementById("subjectModal");
        const content = document.getElementById("modalContent");
        modal.classList.remove("hidden");
        setTimeout(() => {
          content.classList.remove("scale-95");
          content.classList.add("scale-100");
        }, 10);
        document.body.style.overflow = "hidden";
      }

      function closeModal() {
        const modal = document.getElementById("subjectModal");
        const content = document.getElementById("modalContent");

        content.classList.remove("scale-100");
        content.classList.add("scale-95");

        setTimeout(() => {
          modal.classList.add("hidden");
          document.body.style.overflow = "auto";
        }, 300);
      }

      // Close on outside click
      document
        .getElementById("subjectModal")
        .addEventListener("click", function (e) {
          if (e.target === this) closeModal();
        });
    