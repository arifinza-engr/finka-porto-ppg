/* =========================================================
   PORTOFOLIO PPG — Manajer Modal generik
   Menangani: buka/tutup, scroll lock, focus trap, Escape, fokus kembali.
   ========================================================= */
window.Porto = window.Porto || {};

Porto.modal = (() => {
  const { $, getFocusable } = Porto.util;

  /** Modal yang sedang terbuka (stack) */
  const stack = [];

  /** Penutup kustom per modal (mis. animasi fade sebelum hide) */
  const closeHandlers = new Map();

  const topModal = () => stack[stack.length - 1] ?? null;

  /** Kunci scroll body */
  const lockScroll = () => {
    document.body.style.overflow = "hidden";
  };

  /** Lepas kunci scroll bila tidak ada modal terbuka */
  const unlockScroll = () => {
    if (!stack.length) document.body.style.overflow = "";
  };

  /**
   * Buka modal.
   * @param {string} modalId - id elemen modal
   * @param {{contentId?: string, onOpen?: Function, focus?: Element}} options
   */
  const open = (modalId, { contentId, onOpen, focus } = {}) => {
    const modal = document.getElementById(modalId);
    if (!modal) return null;

    const restoreTarget =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    lockScroll();

    // Cegah duplikasi entri modal yang sama
    if (!stack.some((entry) => entry.modal === modal)) {
      stack.push({ modal, restoreTarget });
    }

    // Konten modal diberi efek "masuk" (skala 95% -> 100%)
    const content = contentId ? document.getElementById(contentId) : null;
    if (content) {
      content.classList.remove("scale-95");
      content.classList.add("scale-100");
    }

    onOpen?.(modal);

    // Fokuskan elemen yang diminta, atau elemen fokus pertama di dalam modal
    Porto.util.nextFrame().then(() => {
      const target = focus ?? getFocusable(modal)[0] ?? modal;
      target?.focus?.();
    });

    return modal;
  };

  /**
   * Tutup modal.
   * @param {string} modalId
   * @param {{contentId?: string, animate?: boolean, delay?: number}} options
   */
  const close = (modalId, { contentId, animate = false, delay = 300 } = {}) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const finalize = () => {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");

      const index = stack.findIndex((entry) => entry.modal === modal);
      if (index >= 0) {
        const [entry] = stack.splice(index, 1);
        entry.restoreTarget?.focus?.();
      }
      unlockScroll();
    };

    if (!animate) {
      finalize();
      return;
    }

    const content = contentId ? document.getElementById(contentId) : null;
    if (content) {
      content.classList.remove("scale-100");
      content.classList.add("scale-95");
    }
    setTimeout(finalize, delay);
  };

  /** Tutup modal paling atas (dipakai tombol Escape) */
  const closeTop = () => {
    const entry = topModal();
    if (!entry) return false;

    const modalId = entry.modal.id;
    const custom = closeHandlers.get(modalId);
    if (custom) {
      custom();
      return true;
    }

    const content = entry.modal.querySelector("[data-modal-content]");
    close(modalId, {
      contentId: content?.id,
      animate: Boolean(content),
    });
    return true;
  };

  /** Daftarkan penutup kustom untuk sebuah modal */
  const registerClose = (modalId, handler) => {
    closeHandlers.set(modalId, handler);
  };

  /** Escape menutup modal teratas */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && stack.length) {
      event.preventDefault();
      closeTop();
    }
  });

  /** Focus trap: Tab tidak boleh keluar dari modal teratas */
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const entry = topModal();
    if (!entry) return;

    const items = getFocusable(entry.modal);
    if (!items.length) {
      event.preventDefault();
      entry.modal.focus?.();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !entry.modal.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /** Klik pada backdrop (elemen modal itu sendiri / layer gelap) menutup modal */
  const bindBackdrop = (modalId, onClose, { backdropId } = {}) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        onClose();
        return;
      }
      if (backdropId && event.target.id === backdropId) {
        onClose();
      }
    });
  };

  const isOpen = (modalId) =>
    stack.some((entry) => entry.modal.id === modalId);

  return {
    open,
    close,
    closeTop,
    bindBackdrop,
    registerClose,
    isOpen,
    $,
  };
})();
