#!/usr/bin/env node
// Source-level guard for the shared game header and its visible home link.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const failures = [];

const switcher = fs.readFileSync(path.join(ROOT, "game-switcher.js"), "utf8");
const block = switcher.match(/var GAMES = \[([\s\S]*?)\n  \];/);
if (!block) throw new Error("game-switcher.js: could not find the game list");
const games = [...block[1].matchAll(/\["([a-z0-9]+)",/g)].map((match) => match[1]);
const exceptions = {};

for (const slug of games) {
  const file = path.join(ROOT, `${slug}.html`);
  if (!fs.existsSync(file)) {
    failures.push(`${slug}.html: game page is missing`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  if (!/<script src="(?:[^"]*-app|app)\.js"><\/script>/.test(html)) {
    failures.push(`${slug}.html: catalog entry is not a real game page or needs a documented exception`);
  }
  if (!html.includes('<script src="game-frame.js"></script>')) {
    if (!exceptions[slug]) failures.push(`${slug}.html: missing game-frame.js`);
  }
}

const frame = fs.readFileSync(path.join(ROOT, "game-frame.js"), "utf8");
for (const required of [
  'home.href = "index.html"',
  'home.setAttribute("data-i18n", "nav_home")',
  'home.className = "site-nav-link game-home-link"',
  'panel.insertBefore(home, panel.firstElementChild)',
  '#mode-offline, #mode-offline-ai, #mode-ai',
  "#new-game-btn, [id^='start-'][id$='-game']",
  "#status, #board-info, [id$='-status']",
  "#result, #game-result, [id$='-result']"
]) {
  if (!frame.includes(required)) failures.push(`game-frame.js: missing shared frame behavior ${required}`);
}

const style = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");
const homeStyle = style.match(/\.game-page \.game-home-link\s*\{([^}]*)\}/);
if (!homeStyle || !/min-height:\s*44px/.test(homeStyle[1])) failures.push("style.css: home link must be at least 44 px high");
if (!homeStyle || !/color:\s*#000/.test(homeStyle[1]) || !/background:\s*#fff/.test(homeStyle[1])) failures.push("style.css: home link must be black on white");
if (!homeStyle || !/animation:\s*none/.test(homeStyle[1]) || !/transition:\s*none/.test(homeStyle[1])) failures.push("style.css: home link must not animate");
if (!/\[dir="rtl"\] \.game-page \.game-home-link\s*\{[^}]*margin-right:\s*0;[^}]*margin-left:\s*4px;/s.test(style)) {
  failures.push("style.css: home link needs physical RTL margin overrides");
}
if (!fs.readFileSync(path.join(ROOT, "sw.js"), "utf8").includes('"game-frame.js"')) failures.push("sw.js: game-frame.js is missing from APP_SHELL");
for (const [slug, reason] of Object.entries(exceptions)) if (!reason.trim()) failures.push(`${slug}: exception needs a reason`);

if (failures.length) {
  console.error("Game frame checks failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log(`Game frame pass: ${games.length} real game pages have the shared visible home link; ${Object.keys(exceptions).length} documented exceptions.`);
