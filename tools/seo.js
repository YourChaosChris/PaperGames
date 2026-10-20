#!/usr/bin/env node
// tools/seo.js
// Gives every real page its own address per language for search engines
// (page.html?lang=de and so on) and rebuilds sitemap.xml. Run it again
// whenever a page or a game is added:
//
//   node tools/seo.js
//
// For each page (not the redirect stubs, not the Google verification file):
//  - the fixed <link rel="canonical"> is replaced by a generated block:
//    a tiny inline script that sets the canonical address (with ?lang=xx
//    when the page was opened that way) and <html lang> at once, plus the
//    hreflang links to all 12 languages and x-default. The hreflang list
//    is the same for every language version, so it is plain HTML; only the
//    canonical depends on the address, and leaving it out of the HTML
//    means the delivered and the rendered page never disagree about it.
//  - the same block starts with the old-browser check from
//    tools/old-browser.js, so it is the first script of every page.
//  - <title> and <meta name="description"> get data-seo-title and
//    data-seo-desc: which i18n keys translate them. i18n.js uses them only
//    when the page was opened with ?lang=xx.
//  - sitemap.xml lists every page once, at the address without parameter,
//    with lastmod (date of the last commit of the file) and xhtml:link
//    alternates to the 12 languages. The ?lang= addresses are NOT listed
//    as own <url> entries (that made the file 7.5 MB with 4264 addresses
//    and Search Console could not fetch it); they are reached through
//    the alternates, and their canonical points to themselves.
//  - the number of games (texts write it as {games}) is taken from
//    games-catalog.js: GAME_COUNT in i18n.js, and every static English
//    copy of such a text in the pages, manifest.json and README.md.
//
// No dependencies; plain Node.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const BASE = "https://yourchaoschris.github.io/PaperGames/";

function loadStrings() {
  const ctx = {};
  vm.createContext(ctx);
  let src = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
  // English rules/history texts: one file per game (text/en/<slug>.js).
  fs.readdirSync(path.join(ROOT, "text", "en")).filter((f) => f.endsWith(".js")).sort().forEach((f) => {
    src += "\n;" + fs.readFileSync(path.join(ROOT, "text", "en", f), "utf8");
  });
  vm.runInContext(src + ";this.STRINGS = STRINGS; this.LANGUAGE_ORDER = LANGUAGE_ORDER;", ctx);
  return ctx;
}

function loadCatalog() {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8") + ";this.GAMES_CATALOG = GAMES_CATALOG;", ctx);
  return ctx.GAMES_CATALOG;
}

// Pages that are neither a game nor its rules or history page: their own
// title and description keys (seo_title_<name>, seo_desc_<name>).
const OTHER_PAGES = ["index", "about", "games", "guide", "devices", "impressum", "datenschutz", "stats", "history", "calm",
  "games-new", "games-popular", "games-cards", "games-kids", "games-strategy", "games-race", "games-puzzles", "games-party", "games-favorites"];

function isStub(html, file) {
  return /http-equiv="refresh"/i.test(html) || /^google[0-9a-f]+\.html$/.test(file);
}

function realPages() {
  return fs.readdirSync(ROOT).filter((f) => f.endsWith(".html")).sort()
    .filter((f) => !isStub(fs.readFileSync(path.join(ROOT, f), "utf8"), f));
}

// Which keys translate a page's title and description.
function seoSpec(file, html, en, catalog) {
  const name = file.replace(/\.html$/, "");
  // Keys use "_" where the file name has "-" (games-kids -> seo_title_games_kids).
  if (OTHER_PAGES.indexOf(name) !== -1) return { title: "full:seo_title_" + name.replace(/-/g, "_"), desc: "key:seo_desc_" + name.replace(/-/g, "_") };
  const game = catalog.find((g) => g.slug === name);
  if (game) return { title: "game:" + game.nameKey, desc: "key:" + game.descKey };
  const h1 = (html.match(/<h1[^>]*data-i18n="([a-z0-9_]+)"/) || [])[1];
  // The renamed region puzzle keeps its established translation keys so
  // saved UI language data and its 12-language copy remain shared.
  if (h1 && name.indexOf("noneighbors-") === 0 && /-(rules|history)$/.test(name)) {
    const suffix = /-(rules|history)$/.exec(name)[1];
    const title = "numberblocks_" + suffix + "_title";
    const intro = "numberblocks_" + suffix + "_intro";
    return { title: "key:" + title, desc: en[intro] !== undefined ? "key:" + intro : null };
  }
  if (h1 && /-(rules|history)$/.test(name)) {
    const intro = h1.replace(/_title$/, "_intro");
    return { title: "key:" + h1, desc: en[intro] !== undefined ? "key:" + intro : null };
  }
  return null;
}

// The old-browser check (tools/old-browser.js) as one line: comment lines
// dropped, the other lines trimmed and joined. It is the first script of
// every page (task 103).
function oldBrowserScript() {
  return fs.readFileSync(path.join(__dirname, "old-browser.js"), "utf8").split("\n")
    .map((l) => l.trim()).filter((l) => l && l.indexOf("//") !== 0).join("");
}

function headBlock(file, langs) {
  const url = BASE + file;
  const list = JSON.stringify(langs);
  const script = "(function(){var b=" + JSON.stringify(url) + ",L=" + list + ",m=/[?&]lang=([a-z]{2})(?:&|$)/.exec(location.search)," +
    "l=m&&L.indexOf(m[1])>=0?m[1]:\"\",c=document.createElement(\"link\");c.rel=\"canonical\";c.href=b+(l?\"?lang=\"+l:\"\");" +
    "document.head.appendChild(c);if(l){document.documentElement.lang=l;document.documentElement.dir=l===\"ar\"?\"rtl\":\"ltr\"}})();";
  const lines = ["  <!-- seo: generated by tools/seo.js - canonical set by the script, see there -->",
    "  <script>" + oldBrowserScript() + "</script>", "  <script>" + script + "</script>"];
  langs.forEach((l) => lines.push('  <link rel="alternate" hreflang="' + l + '" href="' + url + "?lang=" + l + '">'));
  lines.push('  <link rel="alternate" hreflang="x-default" href="' + url + '">');
  lines.push("  <!-- /seo -->");
  return lines.join("\n");
}

function updatePage(file, spec, langs) {
  const p = path.join(ROOT, file);
  let html = fs.readFileSync(p, "utf8");
  const block = headBlock(file, langs);
  if (/<!-- seo: generated by tools\/seo\.js[\s\S]*?<!-- \/seo -->/.test(html)) {
    html = html.replace(/  <!-- seo: generated by tools\/seo\.js[\s\S]*?<!-- \/seo -->/, block);
  } else if (/^\s*<link rel="canonical"[^>]*>\s*$/m.test(html)) {
    html = html.replace(/^\s*<link rel="canonical"[^>]*>\s*$/m, block);
  } else {
    html = html.replace(/(<meta charset="UTF-8">)/, "$1\n" + block);
  }
  // The language from ?lang=xx also hides the page until it is translated
  // (the same flash guard as for a saved or browser language).
  html = html.replace('(localStorage.getItem("einkchess_lang")||navigator.language||"en")',
    '((/[?&]lang=([a-z]{2})(?:&|$)/.exec(location.search)||[])[1]||localStorage.getItem("einkchess_lang")||navigator.language||"en")');
  if (spec) {
    html = html.replace(/<title(?: data-seo-title="[^"]*")?>/, '<title data-seo-title="' + spec.title + '">');
    html = html.replace(/<meta name="description"(?: data-seo-desc="[^"]*")? content=/,
      '<meta name="description"' + (spec.desc ? ' data-seo-desc="' + spec.desc + '"' : "") + " content=");
  }
  html = syncSocialTags(html);
  fs.writeFileSync(p, html);
}

// og:/twitter: title and description must describe the same page as
// <title> and <meta name="description">. They were once copied from another
// game's page by hand (oddone, patternrow, shadowmatch said "Shape Sort" or
// "Sorting Puzzles"). A title that only extends the page title (for example
// "Chess Rules - how to play | PaperGames") is kept.
function syncSocialTags(html) {
  const attr = (v) => v.replace(/"/g, "&quot;");
  const t = /<title[^>]*>([^<]*)<\/title>/.exec(html);
  const d = /<meta name="description"[^>]*? content="([^"]*)"/.exec(html);
  if (t) {
    const title = t[1];
    const stem = title.split(" | ")[0];
    ["property=\"og:title\"", "name=\"twitter:title\""].forEach((k) => {
      const re = new RegExp("(<meta " + k + " content=\")([^\"]*)(\")");
      const m = re.exec(html);
      if (m && m[2] !== title && m[2].indexOf(stem) !== 0) html = html.replace(re, (all, a, b, c) => a + attr(title) + c);
    });
  }
  if (d) {
    ["property=\"og:description\"", "name=\"twitter:description\""].forEach((k) => {
      const re = new RegExp("(<meta " + k + " content=\")([^\"]*)(\")");
      if (re.test(html)) html = html.replace(re, (all, a, b, c) => a + d[1] + c);
    });
  }
  return html;
}

function oldPriorities() {
  const out = {};
  try {
    const xml = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
    const re = /<loc>([^<?]+)<\/loc>\s*(?:<lastmod>[^<]*<\/lastmod>\s*)?<priority>([0-9.]+)<\/priority>/g;
    let m;
    while ((m = re.exec(xml))) out[m[1]] = m[2];
  } catch (e) { /* first run */ }
  return out;
}

function lastmod(file) {
  try {
    const d = require("child_process").execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  } catch (e) { /* no git: fall back to the file time */ }
  return fs.statSync(path.join(ROOT, file)).mtime.toISOString().slice(0, 10);
}

function sitemap(pages, langs) {
  const prio = oldPriorities();
  const out = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
  pages.forEach((file) => {
    const url = BASE + file;
    const p = prio[url] || (file === "index.html" ? "1.0" : "0.6");
    const alts = langs.map((l) => '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + url + "?lang=" + l + '"/>')
      .concat(['    <xhtml:link rel="alternate" hreflang="x-default" href="' + url + '"/>']);
    out.push("  <url>", "    <loc>" + url.replace(/&/g, "&amp;") + "</loc>", "    <lastmod>" + lastmod(file) + "</lastmod>", "    <priority>" + p + "</priority>");
    alts.forEach((a) => out.push(a));
    out.push("  </url>");
  });
  out.push("</urlset>", "");
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), out.join("\n"));
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Writes the number of games everywhere a text means it. The English
// texts with {games} are matched with any number in its place, in plain
// form and as the pages escape them (&#x27; for ').
function updateGameCount(en, count) {
  const i18nPath = path.join(ROOT, "i18n.js");
  const i18nSrc = fs.readFileSync(i18nPath, "utf8");
  fs.writeFileSync(i18nPath, i18nSrc.replace(/const GAME_COUNT = \d+;/, "const GAME_COUNT = " + count + ";"));
  const patterns = [];
  Object.keys(en).forEach((k) => {
    const v = en[k];
    if (typeof v !== "string" || v.indexOf("{games}") === -1) return;
    [v, v.replace(/'/g, "&#x27;")].forEach((form) => {
      const parts = form.split("{games}");
      patterns.push(new RegExp("(" + escapeRe(parts[0]) + ")\\d+(" + escapeRe(parts[1]) + ")", "g"));
    });
  });
  // Only the number in the place of {games} changes (a text may hold
  // other digits, e.g. &#x27;).
  const fill = (s) => patterns.reduce((acc, re) => acc.replace(re, "$1" + count + "$2"), s);
  fs.readdirSync(ROOT).filter((f) => f.endsWith(".html")).forEach((f) => {
    const p = path.join(ROOT, f), src = fs.readFileSync(p, "utf8"), out = fill(src);
    if (out !== src) fs.writeFileSync(p, out);
  });
  ["manifest.json", "README.md"].forEach((f) => {
    const p = path.join(ROOT, f), src = fs.readFileSync(p, "utf8");
    const out = src.replace(/(collection of )\d+( classic board, strategy, and puzzle games)/g, "$1" + count + "$2");
    if (out !== src) fs.writeFileSync(p, out);
  });
}

function main() {
  const { STRINGS, LANGUAGE_ORDER } = loadStrings();
  const en = STRINGS.en;
  const catalog = loadCatalog();
  const pages = realPages();
  const problems = [];
  pages.forEach((file) => {
    const html = fs.readFileSync(path.join(ROOT, file), "utf8");
    const spec = seoSpec(file, html, en, catalog);
    if (!spec) problems.push(file + ": no title/description keys");
    else {
      const tk = spec.title.split(":")[1];
      if (en[tk] === undefined) problems.push(file + ": missing key " + tk);
      if (!spec.desc) problems.push(file + ": no description key");
      else if (en[spec.desc.split(":")[1]] === undefined) problems.push(file + ": missing key " + spec.desc.split(":")[1]);
    }
    updatePage(file, spec, LANGUAGE_ORDER);
  });
  sitemap(pages, LANGUAGE_ORDER);
  updateGameCount(en, catalog.length);
  console.log("seo: " + pages.length + " pages, sitemap with " + pages.length + " addresses, " + catalog.length + " games");
  problems.forEach((p) => console.log("  problem: " + p));
  process.exit(problems.length ? 1 : 0);
}

main();
