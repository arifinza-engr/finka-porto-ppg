/**
 * Stub GSAP / ScrollTrigger / IntersectionObserver
 * agar situs bisa diuji di jsdom tanpa jaringan & tanpa browser.
 */
export const stubs = `
<script>
  // --- GSAP ---
  // Meniru API yang dipakai situs; onComplete dipanggil异步 (async)
  // supaya alur transisi teruji seperti di browser sungguhan.
  const animate = function (targets, vars) {
    if (vars && typeof vars.onComplete === "function") {
      setTimeout(function () { vars.onComplete(); }, 0);
    }
    return { onComplete: null, kill: function () {} };
  };
  window.gsap = {
    to: animate,
    from: animate,
    fromTo: animate,
    set: animate,
    killTweensOf: function () {},
  };

  window.ScrollTrigger = {
    create: function () { return { kill: function () {} }; },
    refresh: function () {},
    kill: function () {},
  };

  // --- IntersectionObserver ---
  window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    observe(el) { this.callback([{ isIntersecting: true, target: el }], this); }
    unobserve() {}
    disconnect() {}
  };

  // --- Media queries ---
  window.matchMedia = window.matchMedia || function (query) {
    return {
      matches: false, media: query,
      addListener() {}, removeListener() {},
      addEventListener() {}, removeEventListener() {},
    };
  };

  // --- Layout dummy (jsdom tidak punya layout engine) ---
  Object.defineProperty(window.HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() { return 1000; },
  });
  Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() { return 100; },
  });
  Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() { return 40; },
  });
  Object.defineProperty(window.HTMLElement.prototype, "offsetTop", {
    configurable: true,
    get() { return 0; },
  });
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.HTMLElement.prototype.scrollTo = function () {};
  window.scrollTo = function () {};
</script>
`;
