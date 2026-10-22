/* =========================================================
   PORTOFOLIO PPG — Accordion "Arah Langkahku" (Page 3)
   Hanya satu bagian terbuka pada satu waktu.
   ========================================================= */
window.Porto = window.Porto || {};

Porto.accordion = (() => {
  const { $ } = Porto.util;

  /** ID bagian yang boleh dibuka bersamaan (hanya satu) */
  const SECTIONS = ["tujuan", "inspirasi", "visi", "misi"];

  const getContent = (id) => document.getElementById(`content-${id}`);
  const getIcon = (id) => document.getElementById(`icon-${id}`);
  const getTrigger = (id) => document.getElementById(`trigger-${id}`);

  /** Tutup sebuah bagian dengan animasi */
  const collapse = (id) => {
    const content = getContent(id);
    const icon = getIcon(id);
    if (!content || content.classList.contains("hidden")) return;

    const finish = () => {
      content.classList.add("hidden");
      content.style.height = "";
      content.style.opacity = "";
    };

    if (typeof gsap === "undefined" || Porto.util.prefersReducedMotion()) {
      finish();
    } else {
      // Jaring pengaman agar bagian tetap tertutup walau callback
      // animasi tidak pernah dipanggil browser.
      Porto.util.animateTo(
        content,
        {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        finish,
        400,
      );
    }

    if (icon) icon.style.transform = "rotate(0deg)";
    getTrigger(id)?.setAttribute("aria-expanded", "false");
  };

  /** Buka sebuah bagian dengan animasi */
  const expand = (id) => {
    const content = getContent(id);
    const icon = getIcon(id);
    if (!content) return;

    content.classList.remove("hidden");
    if (typeof gsap === "undefined" || Porto.util.prefersReducedMotion()) {
      content.style.height = "";
      content.style.opacity = "";
    } else {
      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" },
      );
    }

    if (icon) icon.style.transform = "rotate(180deg)";
    getTrigger(id)?.setAttribute("aria-expanded", "true");
  };

  /** Toggle sebuah bagian */
  const toggle = (id) => {
    const content = getContent(id);
    if (!content) return;

    if (content.classList.contains("hidden")) {
      // Tutup bagian lain agar hanya satu yang terbuka
      SECTIONS.forEach((section) => {
        if (section !== id) collapse(section);
      });
      expand(id);
    } else {
      collapse(id);
    }
  };

  return { toggle, expand, collapse, SECTIONS, $ };
})();
