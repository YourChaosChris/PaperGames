#!/usr/bin/env node
// tools/print-sheets.js
// Builds the downloadable files that are not part of the offline app:
//   downloads/*.pdf  worksheets for schools and the one-page guide to print
//                    (from the HTML that tools/print-sheets.py writes)
//   press/*.png      screenshots and the logo for the press page
//   press/papergames-logo.svg
// None of these files is in APP_SHELL: they are only fetched when someone
// opens them.
//
//   python3 tools/print-sheets.py /tmp/pg-print
//   (python3 -m http.server 8049 &)      # site root, for the screenshots
//   NODE_PATH=$(npm root -g) node tools/print-sheets.js /tmp/pg-print 8049

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const SRC = process.argv[2] || "/tmp/pg-print";
const PORT = process.argv[3] || "8049";
const ROOT = path.join(__dirname, "..");
const SHOTS = [
  ["home", "index.html"],
  ["chess", "chess.html"],
  ["checkers", "checkers.html"],
  ["sudoku", "sudoku.html"],
  ["klondike", "klondike.html"],
  ["games", "games.html"],
];

(async () => {
  fs.mkdirSync(path.join(ROOT, "downloads"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "press"), { recursive: true });
  const browser = await chromium.launch();

  // PDFs
  const pdfPage = await browser.newPage();
  const names = fs.readdirSync(SRC).filter((f) => f.endsWith(".html")).sort();
  for (const f of names) {
    await pdfPage.goto("file://" + path.join(SRC, f));
    const out = path.join(ROOT, "downloads", "papergames-" + f.replace(/\.html$/, ".pdf"));
    await pdfPage.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log("pdf", path.basename(out));
  }

  // Screenshots, e-ink portrait size, English, light theme
  const ctx = await browser.newContext({ viewport: { width: 758, height: 1024 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem("einkchess_lang", "en"); } catch (e) {} });
  const page = await ctx.newPage();
  for (const [name, url] of SHOTS) {
    await page.goto("http://localhost:" + PORT + "/" + url + "?lang=en", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const out = path.join(ROOT, "press", "papergames-" + name + ".png");
    await page.screenshot({ path: out });
    console.log("png", path.basename(out));
  }

  // Logo: the brand icon from the page header
  const svg = await page.evaluate(() => {
    const el = document.querySelector(".brand-icon");
    const c = el.cloneNode(true);
    c.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    c.removeAttribute("class");
    c.removeAttribute("aria-hidden");
    c.removeAttribute("focusable");
    c.setAttribute("width", "512");
    c.setAttribute("height", "512");
    return c.outerHTML;
  });
  fs.writeFileSync(path.join(ROOT, "press", "papergames-logo.svg"), svg + "\n");
  const logo = await browser.newPage({ viewport: { width: 512, height: 512 } });
  await logo.setContent("<html><body style=\"margin:0;background:#fff\">" + svg + "</body></html>");
  await logo.screenshot({ path: path.join(ROOT, "press", "papergames-logo.png"), omitBackground: false });
  console.log("logo ok");
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
