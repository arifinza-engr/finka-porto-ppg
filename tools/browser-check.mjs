/**
 * Menjalankan tools/browser-check.html di Chrome headless lalu
 * mencetak hasil verifikasinya.
 *
 * Jalankan: npm run test:browser
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const PORT = 8765;
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((candidate) =>
  fs.existsSync(candidate),
);

if (!chrome) {
  console.error(
    "Chrome/Edge tidak ditemukan. Set variabel lingkungan CHROME_PATH atau pasang Google Chrome.",
  );
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Server statis sederhana                                             */
/* ------------------------------------------------------------------ */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(root, url === "/" ? "index.html" : url);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end("Not found");
    return;
  }
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
  });
  fs.createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(PORT, resolve));

/* ------------------------------------------------------------------ */
/* Jalankan Chrome headless                                            */
/* ------------------------------------------------------------------ */
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "porto-chrome-"));
const domFile = path.join(profileDir, "dom.html");
const domFd = fs.openSync(domFile, "w");

const chromeProcess = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1400,1000",
    "--virtual-time-budget=30000",
    "--dump-dom",
    `http://localhost:${PORT}/tools/browser-check.html`,
  ],
  { stdio: ["ignore", domFd, "ignore"] },
);

// Chrome tidak selalu keluar sendiri setelah --dump-dom (terutama saat
// dijalankan dari proses lain), jadi DOM dibaca dari file lalu Chrome
// dihentikan setelah isinya lengkap.
const waitForDom = async (timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const content = fs.readFileSync(domFile, "utf-8");
    if (content.includes("</html>")) return content;
    await new Promise((r) => setTimeout(r, 500));
  }
  return fs.readFileSync(domFile, "utf-8");
};

const dom = await waitForDom(60000);

chromeProcess.kill();
fs.closeSync(domFd);
server.close();

if (!dom.trim()) {
  console.error("Chrome tidak menghasilkan DOM. Pastikan Chrome terpasang & jaringan CDN dapat diakses.");
  fs.rmSync(profileDir, { recursive: true, force: true });
  process.exit(1);
}

const report = dom.match(/<div id="report">([\s\S]*?)<\/div>\s*<iframe/);

if (!report) {
  console.error("Laporan verifikasi tidak ditemukan pada DOM.");
  console.error(dom.slice(0, 2000));
  process.exit(1);
}

const text = report[1]
  .replace(/<[^>]+>/g, "\n")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

text.forEach((line) => console.log(line));

const failed = text.filter((line) => line.startsWith("FAIL")).length;
console.log("=".repeat(52));
fs.rmSync(profileDir, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
