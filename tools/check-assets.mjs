/**
 * Memeriksa bahwa seluruh asset yang dirujuk (HTML & JS) benar-benar ada.
 * Jalankan: npm run check
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const read = (file) => fs.readFileSync(path.join(root, file), "utf-8");
const exists = (rel) => fs.existsSync(path.join(root, rel));

const problems = [];

/* ------------------------------------------------------------------ */
/* 1. Tag <link>/<script>/<img> di index.html                          */
/* ------------------------------------------------------------------ */
const html = read("index.html");

const referenced = [
  ...[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]),
  ...[...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map((m) => m[1]),
  ...[...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]),
];

for (const ref of referenced) {
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith("data:")) continue;
  if (!exists(ref)) problems.push(`index.html -> asset hilang: ${ref}`);
}

/* ------------------------------------------------------------------ */
/* 2. Path gambar yang dibangun di JS                                  */
/* ------------------------------------------------------------------ */
const jsFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) walk(rel);
    else if (entry.name.endsWith(".js")) jsFiles.push(rel);
  }
};
walk("js");

// Pola: `assets/...` atau `assets/.../${...}` di dalam string
const assetPatterns = [
  /["'`]\s*assets\/[^"'`]*?\$\{[^}]+\}[^"'`]*["'`]/g,
  /["'`]\s*assets\/[^"'`\s]*["'`]/g,
];

for (const file of jsFiles) {
  const src = read(file);
  for (const pattern of assetPatterns) {
    for (const match of src.matchAll(pattern)) {
      const raw = match[0].replace(/["'`]/g, "").trim();
      if (raw.includes("${")) {
        // Path dinamis: ambil bagian prefix sebelum ekspresi
        const prefix = raw.split("${")[0].replace(/\/$/, "");
        if (!exists(prefix)) {
          problems.push(`${file} -> folder hilang: ${prefix}`);
        }
        continue;
      }
      if (!exists(raw)) problems.push(`${file} -> asset hilang: ${raw}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* 3. File foto karya inovasi yang dirujuk di data                     */
/* ------------------------------------------------------------------ */
const karyaData = read("js/data/karya-inovasi.js");
for (const match of karyaData.matchAll(/f:\s*"([^"]+\.jpeg)"/g)) {
  const file = match[1];
  const found = [
    `assets/karya-inovasi/perlengkapan/${file}`,
    `assets/karya-inovasi/dokumentasi/${file}`,
  ].some(exists);
  if (!found) problems.push(`js/data/karya-inovasi.js -> foto hilang: ${file}`);
}

/* ------------------------------------------------------------------ */
/* 4. Foto galeri yang dirujuk di data                                 */
/* ------------------------------------------------------------------ */
const galeriData = read("js/data/galeri.js");
for (const match of galeriData.matchAll(/f:\s*"([^"]+\.jpeg)"/g)) {
  const file = match[1];
  if (!exists(`assets/gallery/${file}`)) {
    problems.push(`js/data/galeri.js -> foto hilang: assets/gallery/${file}`);
  }
}

/* ------------------------------------------------------------------ */
if (problems.length) {
  console.error("Ditemukan masalah asset:\n");
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

console.log(`OK — ${referenced.length} referensi HTML & ${jsFiles.length} berkas JS diperiksa, semua asset tersedia.`);
