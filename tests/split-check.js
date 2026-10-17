#!/usr/bin/env node
// split-check.js
// PaperGames loads only what a page needs: base.css plus css/<game>.css
// (rules for one game's pages), and for rules and history pages the texts
// of that game only (text/<lang>/<slug>.js). There is no build step, so
// this check guarantees that the split lost nothing:
//
//  1. every page links base.css, and css/<slug>.css when that file exists;
//     every linked sheet exists; no page still links style.css;
//  2. no rule in css/<slug>.css could be needed by a page outside that
//     game: a rule whose class/id names (all of them) are found in the HTML
//     or in a script of a page of another game belongs in base.css;
//  3. every css/ and text/ file is known to sw.js (offline), and every
//     marked rules/history page has its game's text file in all 12 languages
//     (the key-by-key check is in static-checks.js and i18n-messages.js).
//
// No server or browser needed.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const problems = [];
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

const htmls = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
const gameSlugs = new Set([...read("games-catalog.js").matchAll(/slug:\s*"([a-z0-9]+)"/g)].map((m) => m[1]));
const slugOf = (h) => {
  const s = h.replace(/(-rules|-history)?\.html$/, "");
  return gameSlugs.has(s) ? s : null;
};
const cssFiles = fs.readdirSync(path.join(ROOT, "css")).filter((f) => f.endsWith(".css"));
const cssSlugs = new Set(cssFiles.map((f) => f.replace(/\.css$/, "")));

// 1. links
const wordCache = {};
const words = (f) => wordCache[f] || (wordCache[f] = new Set(read(f).match(/[\w-]+/g) || []));
const pageWords = {};
let linked = 0;
for (const h of htmls) {
  const t = read(h);
  const sheets = [...t.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  if (/http-equiv="refresh"/i.test(t) || /^google/.test(h)) continue;
  if (sheets.includes("style.css")) problems.push(h + " still links style.css");
  if (!sheets.length) { if (/<body/.test(t) && !/lightsout|abalone|connectfour/.test(h)) problems.push(h + " links no stylesheet"); continue; }
  if (sheets[0] !== "base.css") problems.push(h + " must link base.css first");
  const slug = slugOf(h);
  const want = slug && cssSlugs.has(slug) ? ["base.css", "css/" + slug + ".css"] : ["base.css"];
  if (JSON.stringify(sheets) !== JSON.stringify(want)) problems.push(h + " links " + sheets.join(", ") + ", expected " + want.join(", "));
  sheets.forEach((s) => { if (!fs.existsSync(path.join(ROOT, s))) problems.push(h + " links missing " + s); });
  linked++;
  const srcs = [...t.matchAll(/<script[^>]*\ssrc="([^"?]+)/g)].map((m) => m[1]).filter((s) => fs.existsSync(path.join(ROOT, s)));
  pageWords[h] = [words(h)].concat(srcs.map(words));
}

// 2. no rule that another game's page could need
const tokensOf = (sel) => {
  const out = [];
  const re = /([.#])(-?[_a-zA-Z][\w-]*)|\[\s*([\w-]+)/g;
  let m;
  const clean = sel.replace(/\\./g, "");
  while ((m = re.exec(clean))) out.push(m[2] || m[3]);
  return out;
};
let checkedRules = 0;
for (const f of cssFiles) {
  const slug = f.replace(/\.css$/, "");
  const css = read("css/" + f).replace(/\/\*[\s\S]*?\*\//g, "");
  const seen = new Set();
  // selectors: text before each "{" (also inside @media), minus at-rules
  const re = /(@[^{};]*)\{|([^{}@;]+)\{/g;
  let m;
  while ((m = re.exec(css))) {
    if (m[1]) continue;
    const prelude = m[2].trim();
    if (!prelude || /^[\d.]+%$/.test(prelude)) continue;
    prelude.split(/,(?![^(]*\))/).forEach((s) => {
      const key = s.trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      const tk = tokensOf(key);
      checkedRules++;
      if (!tk.length) { problems.push("css/" + f + ": selector without class or id belongs in base.css: " + key); return; }
      for (const h of Object.keys(pageWords)) {
        if ((slugOf(h) || "*") === slug) continue;
        if (tk.every((t) => pageWords[h].some((w) => w.has(t)))) {
          problems.push("css/" + f + ": '" + key + "' could be needed by " + h + " (move to base.css)");
          break;
        }
      }
    });
  }
}

// 3. sw.js knows every file
const sw = read("sw.js");
const shell = new Set((/const APP_SHELL = \[([\s\S]*?)\];/.exec(sw)[1].match(/"([^"]*)"/g) || []).map((q) => q.slice(1, -1)));
const lazy = /const TEXT_LAZY = \[([\s\S]*?)\];/.exec(sw);
const lazySet = new Set(lazy ? (lazy[1].match(/"([^"]*)"/g) || []).map((q) => q.slice(1, -1)) : []);
const known = (p) => shell.has(p) || lazySet.has(p);
cssFiles.forEach((f) => { if (!shell.has("css/" + f)) problems.push("sw.js APP_SHELL lacks css/" + f); });
if (!shell.has("base.css")) problems.push("sw.js APP_SHELL lacks base.css");
const langs = fs.readdirSync(path.join(ROOT, "text")).sort();
let textFiles = 0;
for (const l of langs) {
  for (const f of fs.readdirSync(path.join(ROOT, "text", l)).filter((x) => x.endsWith(".js"))) {
    textFiles++;
    if (!known("text/" + l + "/" + f)) problems.push("sw.js does not know text/" + l + "/" + f);
  }
}
for (const h of htmls) {
  const m = /<html[^>]*\sdata-i18n-text="([^"]*)"/.exec(read(h));
  if (!m) continue;
  for (const l of langs) if (!fs.existsSync(path.join(ROOT, "text", l, m[1] + ".js"))) problems.push(h + ": text/" + l + "/" + m[1] + ".js is missing");
}

if (problems.length) {
  problems.slice(0, 40).forEach((p) => console.log("FAIL: " + p));
  if (problems.length > 40) console.log("... and " + (problems.length - 40) + " more");
  console.log("\n" + problems.length + " SPLIT CHECK FAILURE(S)");
  process.exit(1);
}
console.log(`OK: ${linked} pages link base.css (+ their game sheet), ${cssFiles.length} game sheets (${checkedRules} selectors) used by their own game only, ${textFiles} text files known to sw.js`);
console.log("ALL SPLIT CHECKS PASS");
