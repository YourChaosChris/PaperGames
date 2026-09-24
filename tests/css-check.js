#!/usr/bin/env node
// css-check.js
// Loads style.css in a real browser (rather than a separate CSS-parser
// dependency in a project that otherwise has none) and confirms it
// parses into a non-trivial stylesheet with no console errors - catches
// the kind of stray brace/typo that would otherwise only surface as a
// mysteriously unstyled page.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");

(async () => {
  const css = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

  await page.setContent(`<!DOCTYPE html><html><head><style>${css}</style></head><body></body></html>`);
  const ruleCount = await page.evaluate(() => {
    const sheet = document.styleSheets[0];
    return sheet ? sheet.cssRules.length : 0;
  });

  await browser.close();

  if (errors.length) {
    console.log("FAIL: console errors while parsing style.css:", errors.slice(0, 5));
    process.exit(1);
  }
  if (ruleCount < 100) {
    console.log(`FAIL: style.css parsed into suspiciously few rules (${ruleCount}) - likely a stray brace cut it short`);
    process.exit(1);
  }
  console.log(`OK: style.css parses cleanly (${ruleCount} rules, no console errors)`);
})();
