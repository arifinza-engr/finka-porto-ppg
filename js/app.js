// State management
let currentPage = 1;

// Navigation Function with GSAP animation
function goToPage(pageNumber) {
  const currentEl = document.getElementById(`page-${currentPage}`);
  const nextEl = document.getElementById(`page-${pageNumber}`);

  // Animate out current page
  gsap.to(currentEl, {
    opacity: 0,
    y: -30,
    scale: 0.98,
    duration: 0.3,
    ease: "power2.inOut",
    onComplete: () => {
      currentEl.classList.remove("active");
      currentEl.style.opacity = "";
      currentEl.style.transform = "";

      // Update state
      currentPage = pageNumber;
      updateNavbarActive(pageNumber);

      // Show and animate in new page
      nextEl.classList.add("active");
      gsap.fromTo(
        nextEl,
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" },
      );
    },
  });

  // Scroll to top
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

  // Menu induk "Refleksi" aktif saat salah satu submenunya dipilih
  const trigger = document.getElementById("navRefleksiTrigger");
  if (trigger) {
    if ([4, 7, 8, 9].includes(pageNumber)) {
      trigger.classList.add("active");
    } else {
      trigger.classList.remove("active");
    }
  }
}

// Dropdown "Refleksi" (desktop)
function toggleRefleksiDropdown() {
  const dropdown = document.getElementById("navRefleksi");
  if (dropdown) {
    dropdown.classList.toggle("open");
  }
}

function closeRefleksiDropdown() {
  const dropdown = document.getElementById("navRefleksi");
  if (dropdown) {
    dropdown.classList.remove("open");
  }
}

// Submenu "Refleksi" (mobile)
function toggleRefleksiMobile() {
  const submenu = document.getElementById("refleksiMobileSubmenu");
  const chevron = document.getElementById("refleksiMobileChevron");
  if (!submenu) return;

  const willOpen = submenu.style.display === "none";
  submenu.style.display = willOpen ? "flex" : "none";
  if (chevron) {
    chevron.classList.toggle("rotate-180", willOpen);
  }
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

// Accordion Toggle for Page 3 with GSAP
function toggleSection(id) {
  const content = document.getElementById(`content-${id}`);
  const icon = document.getElementById(`icon-${id}`);

  if (content.classList.contains("hidden")) {
    // Close all others with GSAP
    ["tujuan", "inspirasi", "visi", "misi"].forEach((sec) => {
      const el = document.getElementById(`content-${sec}`);
      const icoEl = document.getElementById(`icon-${sec}`);
      if (el && !el.classList.contains("hidden")) {
        gsap.to(el, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            el.classList.add("hidden");
            el.style.height = "";
            el.style.opacity = "";
          },
        });
        if (icoEl) icoEl.style.transform = "rotate(0deg)";
      }
    });
    // Open clicked with GSAP
    content.classList.remove("hidden");
    gsap.fromTo(
      content,
      { height: 0, opacity: 0 },
      { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" },
    );
    icon.style.transform = "rotate(180deg)";
  } else {
    // Close with GSAP
    gsap.to(content, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        content.classList.add("hidden");
        content.style.height = "";
        content.style.opacity = "";
      },
    });
    icon.style.transform = "rotate(0deg)";
  }
}


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
              <div class="pl-0 sm:pl-10 text-navy/80 font-medium text-sm leading-relaxed text-justify">${renderParagraphs(paragraphs)}</div>
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
              <div class="pl-0 sm:pl-10 text-cream/90 font-medium text-sm leading-relaxed text-justify">${renderParagraphs(a.paragraphs)}</div>
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

function openModalSmt2(subjectTitle) {
  document.getElementById("modalTitle").innerText = subjectTitle;
  const data = mataKuliahDataSmt2[subjectTitle];
  if (!data) {
    alert("Data refleksi mata kuliah tidak ditemukan.");
    return;
  }

  // Render 4C sections for Semester 2 (single content, not topics)
  document.getElementById("modal-connection").innerHTML =
    `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(data.sections.connection)}</p>`;
  document.getElementById("modal-challenge").innerHTML =
    `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(data.sections.challenge)}</p>`;
  document.getElementById("modal-concept").innerHTML =
    `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(data.sections.concept)}</p>`;
  document.getElementById("modal-change").innerHTML =
    `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(data.sections.change)}</p>`;

  // Render artifact section
  document.getElementById("modal-artefak").innerHTML =
    `<p class="mb-4 last:mb-0 text-justify">${escapeHTML(data.artefak)}</p>`;

  // Render final reflection
  document.getElementById("modal-akhir").innerHTML =
    `<div class="mb-4 font-bold text-lg text-forest">Refleksi Akhir</div>` +
    `<p class="mb-4 text-justify">${escapeHTML(data.akhir)}</p>` +
    `<p class="text-justify">${escapeHTML(data.refleksiAkhir)}</p>`;

  // Update artifact link
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

// Gallery Functions
const galleryImages = [
  "1.jpeg",
  "2.jpeg",
  "3.jpeg",
  "4.jpeg",
  "5.jpeg",
  "6.jpeg",
  "7.jpeg",
  "8.jpeg",
  "9.jpeg",
  "10.jpeg",
  "11.jpeg",
  "12.jpeg",
  "13.jpeg",
  "14.jpeg",
  "15.jpeg",
  "16.jpeg",
  "17.jpeg",
  "18.jpeg",
  "19.jpeg",
  "20.jpeg",
  "21.jpeg",
  "22.jpeg",
  "23.jpeg",
  "24.jpeg",
  "25.jpeg",
  "26.jpeg",
  "27.jpeg",
  "28.jpeg",
  "29.jpeg",
  "30.jpeg",
  "31.jpeg",
  "32.jpeg",
  "33.jpeg",
  "34.jpeg",
  "35.jpeg",
  "36.jpeg",
  "37.jpeg",
  "38.jpeg",
  "39.jpeg",
  "40.jpeg",
  "41.jpeg",
  "42.jpeg",
  "43.jpeg",
  "44.jpeg",
  "45.jpeg",
  "46.jpeg",
  "47.jpeg",
  "48.jpeg",
];
const semester2StartIndex = 27; // Index where semester 2 images start (0-based index 27 = image 28)
let currentImageIndex = 0;

function openGalleryModal(index) {
  currentImageIndex = index;
  const modal = document.getElementById("galleryModal");
  const img = document.getElementById("galleryImage");
  const counter = document.getElementById("galleryCounter");
  const semesterBadge = document.getElementById("gallerySemester");

  img.src = `assets/gallery/${galleryImages[index]}`;
  counter.textContent = `${index + 1} / ${galleryImages.length}`;

  // Update semester badge
  const isSemester2 = index >= semester2StartIndex;
  if (isSemester2) {
    semesterBadge.textContent = "SMT 2";
    semesterBadge.className =
      "bg-terracotta text-white text-xs font-bold px-2 py-1 rounded-full";
  } else {
    semesterBadge.textContent = "SMT 1";
    semesterBadge.className =
      "bg-forest text-white text-xs font-bold px-2 py-1 rounded-full";
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  updateNavButtons();

  // GSAP animation for modal
  gsap.fromTo(
    modal,
    { opacity: 0 },
    { opacity: 1, duration: 0.3, ease: "power2.out" },
  );
  gsap.fromTo(
    img,
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
  );
}

function closeGalleryModal() {
  const modal = document.getElementById("galleryModal");
  const img = document.getElementById("galleryImage");

  gsap.to([modal, img], {
    opacity: 0,
    scale: 0.9,
    duration: 0.2,
    ease: "power2.in",
    onComplete: () => {
      modal.classList.add("hidden");
      modal.style.opacity = "";
      img.style.opacity = "";
      img.style.transform = "";
      document.body.style.overflow = "auto";
    },
  });
}

function nextImage() {
  if (currentImageIndex < galleryImages.length - 1) {
    const img = document.getElementById("galleryImage");
    gsap.to(img, {
      opacity: 0,
      x: -30,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        currentImageIndex++;
        updateGalleryImage();
        gsap.fromTo(
          img,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
        );
      },
    });
  }
}

function prevImage() {
  if (currentImageIndex > 0) {
    const img = document.getElementById("galleryImage");
    gsap.to(img, {
      opacity: 0,
      x: 30,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        currentImageIndex--;
        updateGalleryImage();
        gsap.fromTo(
          img,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
        );
      },
    });
  }
}

function updateGalleryImage() {
  const img = document.getElementById("galleryImage");
  const counter = document.getElementById("galleryCounter");

  img.src = `assets/gallery/${galleryImages[currentImageIndex]}`;
  counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
  updateNavButtons();
}

function updateNavButtons() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.style.opacity = currentImageIndex === 0 ? "0.3" : "1";
  prevBtn.style.pointerEvents = currentImageIndex === 0 ? "none" : "auto";
  nextBtn.style.opacity =
    currentImageIndex === galleryImages.length - 1 ? "0.3" : "1";
  nextBtn.style.pointerEvents =
    currentImageIndex === galleryImages.length - 1 ? "none" : "auto";
}

// Close gallery on outside click
document
  .getElementById("galleryModal")
  .addEventListener("click", function (e) {
    if (e.target === this) closeGalleryModal();
  });

// Generate gallery grid from array
function generateGallery() {
  const grid = document.getElementById("galleryGrid");
  let html = "";
  galleryImages.forEach((filename, index) => {
    const isSemester2 = index >= semester2StartIndex;
    const badge = isSemester2
      ? `<div class="absolute top-2 right-2 bg-terracotta text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">SMT 2</div>`
      : `<div class="absolute top-2 right-2 bg-forest text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">SMT 1</div>`;

    html += `
      <div
        class="relative group overflow-hidden rounded-2xl border-4 ${isSemester2 ? "border-terracotta" : "border-navy"} shadow-3d-md aspect-square cursor-pointer hover:scale-105 transition-transform duration-300 gallery-item"
        onclick="openGalleryModal(${index})"
      >
        <img
          src="assets/gallery/${filename}"
          alt="Galeri ${index + 1}"
          class="w-full h-full object-cover"
        />
        ${badge}
        <div
          class="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
        >
          <span class="text-white font-bold text-sm"> Foto ${index + 1}</span>
        </div>
      </div>
    `;
  });
  grid.innerHTML = html;
}

// Generate gallery on page load
generateGallery();

// Initial page load animation
gsap.from("#page-1", {
  opacity: 0,
  y: 30,
  scale: 0.98,
  duration: 0.8,
  ease: "power2.out",
});

// Keyboard navigation for gallery
document.addEventListener("keydown", function (e) {
  const galleryModal = document.getElementById("galleryModal");
  if (!galleryModal.classList.contains("hidden")) {
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "Escape") closeGalleryModal();
  }
});

// Dropdown "Refleksi": tutup saat klik di luar atau kursor keluar
document.addEventListener("click", function (e) {
  const dropdown = document.getElementById("navRefleksi");
  if (dropdown && !dropdown.contains(e.target)) {
    closeRefleksiDropdown();
  }
});

const refleksiDropdown = document.getElementById("navRefleksi");
if (refleksiDropdown) {
  refleksiDropdown.addEventListener("mouseleave", closeRefleksiDropdown);
}
