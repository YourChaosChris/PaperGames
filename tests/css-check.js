#!/usr/bin/env node
// css-check.js
// Loads base.css and every css/<game>.css in a real browser (rather than a separate CSS-parser
// dependency in a project that otherwise has none) and confirms it
// parses into a non-trivial stylesheet with no console errors - catches
// the kind of stray brace/typo that would otherwise only surface as a
// mysteriously unstyled page.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");

(async () => {
  // base.css plus one small css/<game>.css per game (see tests/split-check.js
  // for the check that every page links the sheets it needs).
  const files = ["base.css"].concat(fs.readdirSync(path.join(ROOT, "css")).filter((f) => f.endsWith(".css")).sort().map((f) => "css/" + f));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

  let total = 0;
  let baseRules = 0;
  const odd = [];
  for (const f of files) {
    const css = fs.readFileSync(path.join(ROOT, f), "utf8");
    await page.setContent(`<!DOCTYPE html><html><head><style>${css}</style></head><body></body></html>`);
    const n = await page.evaluate(() => {
      const sheet = document.styleSheets[0];
      return sheet ? sheet.cssRules.length : 0;
    });
    total += n;
    if (f === "base.css") baseRules = n;
    // A stray brace swallows the rest of a file: the browser then reports
    // fewer top-level rules than the file has "{" at depth 0.
    let depth = 0, top = 0;
    const bare = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
    for (const c of bare) { if (c === "{") { if (depth === 0) top++; depth++; } else if (c === "}") depth--; }
    if (depth !== 0 || top !== n) odd.push(`${f} (braces ${top}/${n}, depth ${depth})`);
  }

  await browser.close();

  if (errors.length) {
    console.log("FAIL: console errors while parsing the stylesheets:", errors.slice(0, 5));
    process.exit(1);
  }
  if (odd.length) {
    console.log("FAIL: stylesheet(s) with unbalanced or swallowed rules: " + odd.join("; "));
    process.exit(1);
  }
  if (baseRules < 100 || total < 1000) {
    console.log(`FAIL: stylesheets parsed into suspiciously few rules (base ${baseRules}, all ${total}) - likely a stray brace cut one short`);
    process.exit(1);
  }
  console.log(`OK: base.css and ${files.length - 1} game stylesheets parse cleanly (${total} rules, base ${baseRules}, no console errors)`);
})();
