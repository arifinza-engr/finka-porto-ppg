/**
 * Smoke test: memuat index.html di jsdom lalu memverifikasi
 * seluruh interaksi utama (navigasi, modal, akordeon, galeri, karya).
 *
 * Jalankan: npm test
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import { stubs } from "./stubs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;
const failures = [];

const check = (name, condition, detail = "") => {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

const section = (title) => console.log(`\n${title}`);

/* ------------------------------------------------------------------ */
/* Muat halaman                                                       */
/* ------------------------------------------------------------------ */
const html = fs.readFileSync(path.join(root, "index.html"), "utf-8");

// Ganti script CDN + link CDN dengan stub lokal
// (iframe eksternal seperti YouTube dibuang agar jsdom tidak tries akses jaringan)
const offline = html
  .replace(/<script src="https:\/\/[^"]+"><\/script>/g, "")
  .replace(/<link[^>]*href="https:\/\/[^"]*"[^>]*>/g, "")
  .replace(/<iframe[\s\S]*?<\/iframe>/g, '<div class="iframe-stub"></div>')
  .replace("</head>", `${stubs}</head>`);

const virtualConsole = new VirtualConsole();
const consoleErrors = [];
virtualConsole.on("jsdomError", (error) => consoleErrors.push(error.message));
virtualConsole.on("error", (...args) => consoleErrors.push(args.join(" ")));

const dom = new JSDOM(offline, {
  url: pathToFileURL(path.join(root, "index.html")).href,
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.scrollTo = () => {};
  },
});

const { window } = dom;
const { document } = window;

// Tunggu seluruh skrip lokal selesai dimuat
await new Promise((resolve) => {
  if (document.readyState === "complete") return resolve();
  window.addEventListener("load", resolve);
  setTimeout(resolve, 8000);
});
await new Promise((resolve) => setTimeout(resolve, 300));

const click = (el) =>
  el?.dispatchEvent(
    new window.MouseEvent("click", { bubbles: true, cancelable: true }),
  );

/** Tunggu satu frame + tick agar animasi/GSAP sempat selesai */
const settle = (ms = 80) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
section("1. Pemuatan modul");
check("Tidak ada error JS saat halaman dimuat", consoleErrors.length === 0, consoleErrors.join(" | "));
check("Namespace Porto terbentuk", typeof window.Porto === "object");
check("Data Semester 1 termuat", Object.keys(window.Porto?.data?.mataKuliahSmt1 ?? {}).length === 6);
check("Data Semester 2 termuat", Object.keys(window.Porto?.data?.mataKuliahSmt2 ?? {}).length === 5);
check("Data karya inovasi termuat", Boolean(window.Porto?.data?.karyaInovasi));
check("Data galeri termuat (48 foto)", (window.Porto?.data?.galleryItems ?? []).length === 48);
check("Tidak ada handler inline onclick tersisa",
  !/<button[^>]*\sonclick=/i.test(html));

/* ------------------------------------------------------------------ */
section("2. Navigasi halaman");
const navGaleri = document.querySelector('[data-nav="5"]');
click(navGaleri);
await settle();
check("Halaman 5 aktif setelah klik nav", document.getElementById("page-5").classList.contains("active"));
check("Halaman 1 tidak aktif lagi", !document.getElementById("page-1").classList.contains("active"));

const navKarya = document.querySelector('[data-nav="9"]');
click(navKarya);
await settle();
check("Halaman 9 aktif", document.getElementById("page-9").classList.contains("active"));

const navHome = document.querySelector('[data-nav="1"]');
click(navHome);
await settle();
check("Kembali ke halaman 1", document.getElementById("page-1").classList.contains("active"));

/* ------------------------------------------------------------------ */
section("3. Dropdown Refleksi & menu mobile");
click(document.getElementById("navRefleksiTrigger"));
check("Dropdown Refleksi terbuka", document.getElementById("navRefleksi").classList.contains("open"));
check("aria-expanded dropdown = true",
  document.getElementById("navRefleksiTrigger").getAttribute("aria-expanded") === "true");
click(document.body);
check("Dropdown tertutup saat klik di luar", !document.getElementById("navRefleksi").classList.contains("open"));

click(document.getElementById("menuButton"));
check("Menu mobile terbuka", !document.getElementById("mobileMenu").classList.contains("hidden"));
click(document.getElementById("menuButton"));
check("Menu mobile tertutup", document.getElementById("mobileMenu").classList.contains("hidden"));

/* ------------------------------------------------------------------ */
section("4. Akordeon (Arah Langkahku)");
click(document.querySelector('[data-action="toggle-section"][data-section="tujuan"]'));
const tujuan = document.getElementById("content-tujuan");
check("Bagian 'tujuan' terbuka", !tujuan.classList.contains("hidden"));
check("aria-expanded trigger tujuan = true",
  document.getElementById("trigger-tujuan").getAttribute("aria-expanded") === "true");
click(document.querySelector('[data-action="toggle-section"][data-section="misi"]'));
await settle();
check("Membuka 'misi' menutup 'tujuan'", tujuan.classList.contains("hidden"));
check("Bagian 'misi' terbuka", !document.getElementById("content-misi").classList.contains("hidden"));

/* ------------------------------------------------------------------ */
section("5. Modal refleksi mata kuliah");
click(document.querySelector('[data-action="open-subject-modal"]'));
const subjectModal = document.getElementById("subjectModal");
check("Modal mata kuliah terbuka", !subjectModal.classList.contains("hidden"));
check("Judul modal terisi", document.getElementById("modalTitle").textContent.length > 3);
check("Bagian Connection terisi", document.getElementById("modal-connection").innerHTML.includes("<p"));
check("Bagian Artefak terisi", document.getElementById("modal-artefak").innerHTML.includes("<section"));
check("Bagian Refleksi Akhir terisi", document.getElementById("modal-akhir").innerHTML.length > 20);
check("Tautan artefak aktif", document.getElementById("modal-artefak-link").href.startsWith("http"));
click(document.querySelector('[data-action="close-subject-modal"]'));
await new Promise((r) => setTimeout(r, 400));
check("Modal mata kuliah tertutup", subjectModal.classList.contains("hidden"));

click(document.querySelector('[data-action="open-subject-modal-smt2"]'));
check("Modal Semester 2 terbuka", !subjectModal.classList.contains("hidden"));
check("Modal SMT2 menampilkan isi Connection", document.getElementById("modal-connection").innerHTML.includes("<p"));
document.getElementById("subjectModal").click();
await new Promise((r) => setTimeout(r, 400));
check("Modal ditutup lewat klik backdrop", subjectModal.classList.contains("hidden"));

/* ------------------------------------------------------------------ */
section("6. Galeri foto");
click(document.querySelector('[data-nav="5"]'));
await new Promise((r) => setTimeout(r, 400));
const items = document.querySelectorAll("#galleryGrid .g-item");
check("Grid galeri ter-render", items.length === 48, `jumlah item = ${items.length}`);
check("Counter galeri = 48", document.getElementById("galleryCount").textContent === "48");

items[0].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 200));
const galleryModal = document.getElementById("galleryModal");
check("Lightbox galeri terbuka", !galleryModal.classList.contains("hidden"));
check("Filmstrip ter-render (48 thumb)", document.querySelectorAll("#galleryFilmstrip .g-thumb").length === 48);

click(document.querySelector('[data-action="gallery-next"]'));
await settle(150);
check("Counter lightbox maju ke 2", document.getElementById("galleryCounter").textContent === "2");
click(document.querySelector('[data-action="gallery-prev"]'));
await settle(150);
check("Counter lightbox kembali ke 1", document.getElementById("galleryCounter").textContent === "1");

click(document.querySelector('[data-action="close-gallery-modal"]'));
await new Promise((r) => setTimeout(r, 500));
check("Lightbox galeri tertutup", galleryModal.classList.contains("hidden"));

// Klik di luar gambar (area gelap) -> menutup preview
items[0].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 200));
document
  .getElementById("galleryStage")
  .dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 500));
check("Klik di luar gambar menutup preview", galleryModal.classList.contains("hidden"));

// Filter
click(document.querySelector('#galleryFilters .g-filter[data-filter="2"]'));
await new Promise((r) => setTimeout(r, 600));
check("Filter SMT 2 menyisakan 21 foto",
  document.querySelectorAll("#galleryGrid .g-item").length === 21,
  `jumlah = ${document.querySelectorAll("#galleryGrid .g-item").length}`);
click(document.querySelector('#galleryFilters .g-filter[data-filter="all"]'));
await new Promise((r) => setTimeout(r, 600));
check("Filter 'Semua' mengembalikan 48 foto",
  document.querySelectorAll("#galleryGrid .g-item").length === 48);

/* ------------------------------------------------------------------ */
section("7. Karya Inovasi");
click(document.querySelector('[data-nav="9"]'));
await new Promise((r) => setTimeout(r, 300));
check("Meta karya ter-render", document.getElementById("karyaMeta").innerHTML.includes("Identitas Karya"));
check("Video YouTube karya terpasang", html.includes("Mc_lAABpjXM") && html.includes("youtube-nocookie"));
check("Judul karya sinkron dengan data",
  document.getElementById("karyaJudul").textContent === window.Porto.data.karyaInovasi.judul);

click(document.querySelector('[data-action="open-karya"]'));
await new Promise((r) => setTimeout(r, 300));
const karyaModal = document.getElementById("karyaModal");
check("Modal karya terbuka", !karyaModal.classList.contains("hidden"));
check("8 bagian karya ter-render", document.querySelectorAll("[data-karya-section]").length === 8);
check("Judul modal karya terisi", document.getElementById("karyaModalTitle").textContent.length > 20);
click(document.querySelector('[data-action="close-karya-modal"]'));
await new Promise((r) => setTimeout(r, 400));
check("Modal karya tertutup", karyaModal.classList.contains("hidden"));

click(document.querySelector('[data-action="open-karya-gallery"][data-set="dokumentasi"]'));
await new Promise((r) => setTimeout(r, 300));
check("Lightbox karya terbuka", !document.getElementById("karyaGalleryModal").classList.contains("hidden"));
check("Badge set = Dokumentasi", document.getElementById("karyaGalleryBadge").textContent === "Dokumentasi");
check("Strip foto karya ter-render (7 thumb)",
  document.querySelectorAll("#karyaGalleryStrip .g-thumb").length === 7);
click(document.querySelector('[data-action="karya-gallery-next"]'));
await settle(150);
check("Counter karya maju ke 2", document.getElementById("karyaGalleryCounter").textContent === "2");
click(document.querySelector('[data-action="close-karya-gallery"]'));
await new Promise((r) => setTimeout(r, 300));
check("Lightbox karya tertutup", document.getElementById("karyaGalleryModal").classList.contains("hidden"));

/* ------------------------------------------------------------------ */
section("8. Refleksi & RTL (halaman 8)");
click(document.querySelector('[data-nav="8"]'));
await settle();
check("Halaman 8 aktif", document.getElementById("page-8").classList.contains("active"));
const rtlCards = document.querySelectorAll("#rtlCards [data-action='open-rtl-modal']");
check("5 kartu RTL ter-render (2 pertanyaan + 3 langkah)", rtlCards.length === 5, `jumlah = ${rtlCards.length}`);
check("Terdiri dari 2 indikator", document.querySelectorAll("#rtlCards h3").length >= 2);

click(document.querySelector('[data-action="open-rtl-modal"][data-section="pendidikan-indonesia"]'));
await settle();
const rtlModal = document.getElementById("rtlModal");
check("Modal Refleksi & RTL terbuka", !rtlModal.classList.contains("hidden"));
check("Badge indikator terisi", document.getElementById("rtlModalBadge").textContent === "Indikator 1");
check("Judul modal terisi", document.getElementById("rtlModalTitle").textContent.length > 5);
check("Uraian jawaban ter-render", document.getElementById("rtlModalSections").innerHTML.includes("<p"));
click(document.querySelector('[data-action="close-rtl-modal"]'));
await new Promise((r) => setTimeout(r, 400));
check("Modal Refleksi & RTL tertutup", rtlModal.classList.contains("hidden"));

click(document.querySelector('[data-action="open-rtl-modal"][data-section="langkah-2"]'));
await settle();
check("Modal langkah RTL terbuka", !rtlModal.classList.contains("hidden"));
check("Badge indikator 2", document.getElementById("rtlModalBadge").textContent === "Indikator 2");
document.getElementById("rtlModal").click();
await new Promise((r) => setTimeout(r, 400));
check("Modal RTL ditutup lewat backdrop", rtlModal.classList.contains("hidden"));

/* ------------------------------------------------------------------ */
section("9. Error runtime");
check("Tidak ada error JS tambahan setelah semua interaksi",
  consoleErrors.length === 0, consoleErrors.join(" | "));

/* ------------------------------------------------------------------ */
console.log(`\n${"=".repeat(52)}`);
console.log(`HASIL: ${passed} lulus, ${failed} gagal`);
if (failures.length) {
  console.log("\nKegagalan:");
  failures.forEach((f) => console.log(` - ${f}`));
}
console.log("=".repeat(52));

window.close();
process.exit(failed ? 1 : 0);
