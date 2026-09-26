#!/usr/bin/env node
// static-checks.js
// Fast, dependency-free checks that don't need a browser or a running
// server: every .js file parses, every HTML page is a real document (or
// one of the known exceptions), all 11 languages in i18n.js carry the
// exact same set of keys, and no data-i18n/data-i18n-attr reference
// anywhere - in a static .html file or in markup a script builds at
// runtime (e.g. settings-menu.js's modal) - points at a key that
// doesn't exist. This is exactly the set of checks that have been
// re-run by hand from a scratch script every time this project's UI
// changed; keeping them here means `node tests/static-checks.js` is
// the whole thing, and it stays in sync with the codebase instead of
// living in a throwaway file.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

// Real pages only - excludes the Google Search Console verification
// stub (a bare text file with an .html extension, not a document) and
// the meta-refresh redirect stubs left at the pre-rename URLs for
// Othello/Connect Four/Onitama/Quoridor (see the trademark-safe rename
// in git history) - those intentionally have no <head>/scripts/i18n.
const REDIRECT_STUB_PREFIXES = ["othello", "connectfour", "onitama", "quoridor"];
const NON_DOCUMENT_FILES = new Set(["google5b539baba76c839b.html"]);

function isRedirectStub(file) {
  return REDIRECT_STUB_PREFIXES.some((p) => file === p + ".html" || file.startsWith(p + "-"));
}

function listFiles(ext) {
  return fs.readdirSync(ROOT).filter((f) => f.endsWith(ext));
}

let failures = 0;
function fail(msg) {
  console.log("FAIL: " + msg);
  failures++;
}
function ok(msg) {
  console.log("OK: " + msg);
}

// 1. Every .js file must parse.
function checkJsSyntax() {
  const files = listFiles(".js");
  let bad = [];
  for (const f of files) {
    try {
      execFileSync(process.execPath, ["--check", path.join(ROOT, f)], { stdio: "pipe" });
    } catch (e) {
      bad.push(f + ": " + e.stderr.toString().split("\n").slice(0, 3).join(" "));
    }
  }
  if (bad.length) {
    bad.forEach((b) => fail("JS syntax - " + b));
  } else {
    ok(`JS syntax clean (${files.length} files)`);
  }
}

// 2. Every real HTML page should at least look like a document.
function checkHtmlWellFormed() {
  const files = listFiles(".html");
  let bad = [];
  let checked = 0;
  for (const f of files) {
    if (NON_DOCUMENT_FILES.has(f) || isRedirectStub(f)) continue;
    checked++;
    const content = fs.readFileSync(path.join(ROOT, f), "utf8");
    if (!/^<!DOCTYPE html>/i.test(content)) bad.push(f + ": missing <!DOCTYPE html>");
    if (!/<\/html>\s*$/i.test(content.trim())) bad.push(f + ": missing closing </html>");
  }
  if (bad.length) {
    bad.forEach((b) => fail("HTML - " + b));
  } else {
    ok(`HTML well-formed (${checked} real pages, ${files.length - checked} stubs skipped)`);
  }
}

// 3. i18n.js: parse the STRINGS object and require every language to
// carry the exact same key set as English (missing keys silently fall
// back to English at runtime instead of erroring, so this is the only
// thing that would otherwise catch a forgotten translation).
// Every language in LANGUAGE_ORDER must have its lang/<code>.js file.
function loadStrings() {
  const ctx = require("./load-i18n").loadI18n();
  const missing = ctx.LANGUAGE_ORDER.filter((code) => !ctx.STRINGS[code]);
  if (missing.length) throw new Error("no lang/<code>.js for: " + missing.join(", "));
  return ctx.STRINGS;
}

// Languages still being translated: they may leave out the texts that
// only appear on the rules/history pages and the legal pages (those fall
// back to English), but everything a player sees while playing - the
// interface, game messages, screen-reader labels - must be there.
const PARTIAL_LANGS = ["ar"];

function documentOnlyKeys(STRINGS) {
  const docPage = (f) => /-(rules|history)\.html$/.test(f) || ["history.html", "impressum.html", "datenschutz.html"].indexOf(f) !== -1;
  const usedDoc = new Set();
  const usedElsewhere = new Set();
  listFiles(".html").concat(listFiles(".js").filter((f) => f !== "i18n.js")).forEach((f) => {
    const src = fs.readFileSync(path.join(ROOT, f), "utf8");
    const set = docPage(f) ? usedDoc : usedElsewhere;
    (src.match(/[a-z0-9]+(?:_[a-z0-9]+)+/g) || []).forEach((k) => { if (STRINGS.en[k] !== undefined) set.add(k); });
  });
  return new Set([...usedDoc].filter((k) => !usedElsewhere.has(k) || /^(impressum|privacy)_/.test(k)));
}

function checkI18nParity(STRINGS) {
  const langs = Object.keys(STRINGS);
  const enKeys = new Set(Object.keys(STRINGS.en));
  const docOnly = documentOnlyKeys(STRINGS);
  let bad = [];
  for (const lang of langs) {
    if (lang === "en") continue;
    const keys = new Set(Object.keys(STRINGS[lang]));
    const partial = PARTIAL_LANGS.indexOf(lang) !== -1;
    const missing = [...enKeys].filter((k) => !keys.has(k) && !(partial && docOnly.has(k)));
    const extra = [...keys].filter((k) => !enKeys.has(k));
    if (missing.length) bad.push(`${lang} missing ${missing.length} key(s): ${missing.slice(0, 5).join(", ")}`);
    if (extra.length) bad.push(`${lang} has ${extra.length} extra key(s): ${extra.slice(0, 5).join(", ")}`);
  }
  if (bad.length) {
    bad.forEach((b) => fail("i18n parity - " + b));
  } else {
    ok(`i18n parity: ${langs.length} languages, ${enKeys.size} keys each` +
      (PARTIAL_LANGS.length ? ` (${PARTIAL_LANGS.join(", ")}: rules/history/legal texts fall back to English)` : ""));
  }
}

// 4. No data-i18n/data-i18n-attr reference - in static markup or in a
// script that builds markup at runtime (rules-link.js, settings-menu.js,
// achievements.js, ...) - may point at a key i18n.js doesn't have.
// A real key is a plain identifier. A handful of .js files build
// data-i18n="<expr>" from a runtime variable rather than a literal key
// (e.g. games-render.js's card template), which this can't validate -
// skip anything that isn't a plain identifier instead of flagging it.
const KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function extractRefs(content) {
  const refs = [];
  let m;
  const plain = /data-i18n=\\?"([^"\\]+)\\?"/g;
  while ((m = plain.exec(content))) if (KEY_RE.test(m[1])) refs.push(m[1]);
  const attr = /data-i18n-attr=\\?"([^"\\]+)\\?"/g;
  while ((m = attr.exec(content))) {
    for (const pair of m[1].split(",")) {
      const key = (pair.split(":")[1] || "").trim();
      if (KEY_RE.test(key)) refs.push(key);
    }
  }
  return refs;
}

function checkOrphanRefs(STRINGS) {
  const enKeys = new Set(Object.keys(STRINGS.en));
  // i18n.js itself is the definitions file, not a consumer - its own
  // format-documenting comment (data-i18n-attr="title:some_key,...")
  // isn't a real reference to validate.
  const files = listFiles(".html").concat(listFiles(".js").filter((f) => f !== "i18n.js"));
  let bad = {};
  for (const f of files) {
    const content = fs.readFileSync(path.join(ROOT, f), "utf8");
    for (const key of extractRefs(content)) {
      if (!enKeys.has(key)) (bad[f] = bad[f] || new Set()).add(key);
    }
  }
  const badFiles = Object.keys(bad);
  if (badFiles.length) {
    badFiles.forEach((f) => fail(`orphaned i18n ref in ${f}: ${[...bad[f]].join(", ")}`));
  } else {
    ok(`no orphaned data-i18n/data-i18n-attr references (${files.length} files scanned)`);
  }
}

checkJsSyntax();
checkHtmlWellFormed();
const STRINGS = loadStrings();
checkI18nParity(STRINGS);
checkOrphanRefs(STRINGS);

console.log("");
if (failures) {
  console.log(`${failures} STATIC CHECK FAILURE(S)`);
  process.exit(1);
} else {
  console.log("ALL STATIC CHECKS PASS");
}
