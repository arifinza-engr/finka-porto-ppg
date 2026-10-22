/**
 * Lint ringan untuk situs statis ini (tanpa dependensi eksternal):
 *  - semua berkas JS harus bisa di-parse
 *  - tidak boleh ada handler inline (onclick=...) di HTML
 *  - id pada HTML harus unik
 *  - tidak boleh ada `var` di JS modern
 *  - berkas JS yang tidak dirujuk di index.html
 *
 * Jalankan: npm run lint
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const read = (file) => fs.readFileSync(path.join(root, file), "utf-8");
const problems = [];

const html = read("index.html");

/* 1. Handler inline */
const inline = [...html.matchAll(/<(button|a|div|span|input)[^>]*\son(click|change|input|keydown|submit)=/gi)];
if (inline.length) {
  problems.push(`Ditemukan ${inline.length} handler inline (onclick dkk) di index.html`);
}

/* 2. id duplikat */
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
if (duplicates.length) {
  problems.push(`id duplikat di index.html: ${[...new Set(duplicates)].join(", ")}`);
}

/* 3. Skrip/style yang dirujuk */
const scriptSrcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
const styleHrefs = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((m) => m[1]);

/* 4. Berkas JS */
const jsFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) walk(rel);
    else if (entry.name.endsWith(".js")) jsFiles.push(rel);
  }
};
walk("js");

for (const file of jsFiles) {
  const src = read(file);

  // Parse check
  try {
    new vm.Script(src, { filename: file });
  } catch (error) {
    problems.push(`${file} — gagal di-parse: ${error.message}`);
  }

  // Tidak ada `var`
  const varUsage = src.match(/(^|[^.\w])var\s+[A-Za-z_$]/g);
  if (varUsage) problems.push(`${file} — gunakan "${varUsage.length} x" kata kunci var`);

  // Harus dirujuk index.html
  if (!scriptSrcs.includes(file)) {
    problems.push(`${file} — tidak dirujuk di index.html`);
  }
}

/* 5. CSS yang dirujuk harus ada & tidak ada CSS yatim */
for (const href of styleHrefs) {
  if (!fs.existsSync(path.join(root, href))) {
    problems.push(`index.html -> CSS hilang: ${href}`);
  }
}
const cssDir = path.join(root, "css");
for (const entry of fs.readdirSync(cssDir)) {
  if (!entry.endsWith(".css")) continue;
  if (!styleHrefs.includes(`css/${entry}`)) {
    problems.push(`css/${entry} — tidak dirujuk di index.html`);
  }
}

/* ------------------------------------------------------------------ */
if (problems.length) {
  console.error("Lint gagal:\n");
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

console.log(
  `OK — ${jsFiles.length} berkas JS, ${styleHrefs.length} berkas CSS, ${ids.length} id unik, tanpa handler inline.`,
);
