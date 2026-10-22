/* =========================================================
   PORTOFOLIO PPG — Utilitas DOM & helpers umum
   Namespace global: window.Porto
   ========================================================= */
window.Porto = window.Porto || {};

Porto.util = (() => {
  /** QuerySelector singkat */
  const $ = (selector, root = document) => root.querySelector(selector);

  /** QuerySelectorAll -> Array */
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  /** Escape teks agar aman disisipkan ke innerHTML */
  const escapeHTML = (text) =>
    String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  /** Batasi nilai antara min & max */
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  /** Pengguna meminta pengurangan animasi? */
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Jalankan fn saat DOM siap (aman dipanggil sebelum/sesudah DOMContentLoaded) */
  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  /** Set src gambar secara async; resolve true bila berhasil dimuat.
   *  Ada batas waktu agar UI tidak menggantung bila gambar gagal dimuat. */
  const loadImage = (img, src, timeout = 15000) =>
    new Promise((resolve) => {
      if (!img) return resolve(false);
      if (img.getAttribute("src") === src) return resolve(true);

      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onError);
        resolve(ok);
      };
      const onLoad = () => finish(true);
      const onError = () => finish(false);
      const timer = setTimeout(() => finish(false), timeout);

      img.addEventListener("load", onLoad, { once: true });
      img.addEventListener("error", onError, { once: true });
      img.src = src;
    });

  /** Muat gambar di latar belakang (preload) */
  const preloadImage = (src) =>
    new Promise((resolve) => {
      const pre = new Image();
      pre.onload = () => resolve(true);
      pre.onerror = () => resolve(false);
      pre.src = src;
    });

  /** Elemen yang dapat menerima fokus di dalam sebuah container */
  const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(", ");

  const getFocusable = (root) =>
    $$(FOCUSABLE_SELECTOR, root).filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
    );

  /** Tunggu frame berikutnya (dipakai untuk transisi GSAP).
   *  Ada jaring pengaman bila requestAnimationFrame tidak berjalan
   *  (mis. tab tidak aktif atau browser headless). */
  const nextFrame = () =>
    new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      requestAnimationFrame(done);
      setTimeout(done, 120);
    });

  /**
   * Jalankan animasi GSAP lalu `onDone`.
   * `onDone` dijamin tetap dipanggil meski callback animasi tidak
   * pernah tiba (mis. requestAnimationFrame dijeda browser), sehingga
   * perpindahan halaman tidak pernah menggantung.
   */
  const animateTo = (target, vars, onDone, fallbackMs = 600) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      onDone?.();
    };
    const timer = setTimeout(finish, fallbackMs);

    if (typeof gsap === "undefined") {
      finish();
      return;
    }
    gsap.to(target, { ...vars, onComplete: finish });
  };

  return {
    $,
    $$,
    escapeHTML,
    clamp,
    prefersReducedMotion,
    onReady,
    loadImage,
    preloadImage,
    getFocusable,
    nextFrame,
    animateTo,
  };
})();
