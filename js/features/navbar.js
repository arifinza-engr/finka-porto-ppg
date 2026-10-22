/* =========================================================
   PORTOFOLIO PPG — Navbar
   Dropdown "Refleksi" (desktop) & submenu (mobile), menu mobile.
   ========================================================= */
window.Porto = window.Porto || {};

Porto.nav = (() => {
  const { $ } = Porto.util;

  const getDropdown = () => document.getElementById("navRefleksi");
  const getTrigger = () => document.getElementById("navRefleksiTrigger");
  const getChevron = () => document.getElementById("navRefleksiChevron");
  const getMobileMenu = () => document.getElementById("mobileMenu");
  const getMenuIcon = () => document.getElementById("menuIcon");
  const getMobileTrigger = () => document.getElementById("refleksiMobileTrigger");
  const getMobileSubmenu = () => document.getElementById("refleksiMobileSubmenu");
  const getMobileChevron = () => document.getElementById("refleksiMobileChevron");
  const getMenuButton = () => document.getElementById("menuButton");

  /** Buka/tutup dropdown "Refleksi" (desktop) */
  const toggleDropdown = () => {
    const dropdown = getDropdown();
    if (!dropdown) return;
    const isOpen = dropdown.classList.toggle("open");
    getTrigger()?.setAttribute("aria-expanded", String(isOpen));
  };

  /** Tutup dropdown "Refleksi" (desktop) */
  const closeDropdown = () => {
    const dropdown = getDropdown();
    if (!dropdown) return;
    dropdown.classList.remove("open");
    getTrigger()?.setAttribute("aria-expanded", "false");
  };

  /** Buka/tutup submenu "Refleksi" (mobile) */
  const toggleMobileSubmenu = () => {
    const submenu = getMobileSubmenu();
    if (!submenu) return;

    const willOpen = submenu.style.display === "none";
    submenu.style.display = willOpen ? "flex" : "none";
    getMobileChevron()?.classList.toggle("rotate-180", willOpen);
    getMobileTrigger()?.setAttribute("aria-expanded", String(willOpen));
  };

  /** Buka/tutup menu mobile */
  const toggleMobileMenu = () => {
    const menu = getMobileMenu();
    const icon = getMenuIcon();
    if (!menu) return;

    const isHidden = menu.classList.toggle("hidden");
    if (icon) {
      icon.className = isHidden
        ? "fas fa-bars text-navy"
        : "fas fa-times text-navy";
    }
    menu.setAttribute("aria-hidden", String(isHidden));
    getMenuButton()?.setAttribute("aria-expanded", String(!isHidden));
    return !isHidden;
  };

  /** Tutup menu mobile (dipakai setelah memilih halaman) */
  const closeMobileMenu = () => {
    const menu = getMobileMenu();
    const icon = getMenuIcon();
    if (!menu || menu.classList.contains("hidden")) return;

    menu.classList.add("hidden");
    if (icon) icon.className = "fas fa-bars text-navy";
    menu.setAttribute("aria-hidden", "true");
    getMenuButton()?.setAttribute("aria-expanded", "false");
  };

  /** Inisialisasi perilaku navbar */
  const init = () => {
    // Klik di luar dropdown menutup dropdown
    document.addEventListener("click", (event) => {
      const dropdown = getDropdown();
      if (dropdown && !dropdown.contains(event.target)) {
        closeDropdown();
      }
    });

    // Cursor keluar dari dropdown menutup dropdown
    const dropdown = getDropdown();
    if (dropdown) {
      dropdown.addEventListener("mouseleave", closeDropdown);
    }

    // Escape menutup dropdown
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeDropdown();
    });

    // Status awal untuk pembaca layar
    getTrigger()?.setAttribute("aria-expanded", "false");
    getMobileTrigger()?.setAttribute("aria-expanded", "false");
    getMobileMenu()?.setAttribute("aria-hidden", "true");
  };

  return {
    toggleDropdown,
    closeDropdown,
    toggleMobileSubmenu,
    toggleMobileMenu,
    closeMobileMenu,
    init,
    $,
  };
})();
