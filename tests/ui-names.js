#!/usr/bin/env node
// Source-level guard for the shared names on game controls and core status lines.
const fs = require("fs");
const path = require("path");
const { loadI18n } = require("./load-i18n");
const ROOT = path.join(__dirname, "..");
const languages = ["en", "de", "fr", "es", "it", "nl", "pl", "uk", "ru", "ja", "zh", "ar"];
const staleStrings = [
  "2 Player (local)", "vs Computer", "Local hotseat", "Two on one device",
  "Several on one device", "Same device", "2 players on one device", "Play vs computer",
  "Gegen Computer", "2 Spieler (lokal)", "Lokal (abwechselnd)",
  "Zu zweit an einem Gerät", "Mehrere an einem Gerät", "Am selben Gerät"
];
const oldModeKeys = [
  "mode_two_player", "vs_computer", "ludo_mode_hotseat", "cd_mode_hotseat",
  "vl_mode_hotseat", "fv_mode_hotseat", "domino_mode_hotseat", "maumau_mode_hotseat",
  "chess_mode_two_player", "chess_mode_computer"
];
const failures = [];
const { STRINGS } = loadI18n({ texts: false });
const canonical = {
  ui_mode_computer: { en: "Against the computer", de: "Gegen den Computer" },
  ui_mode_two_player: { en: "Two players, one device", de: "Zu zweit an einem Gerät" },
  ui_new_game: { en: "New game", de: "Neues Spiel" },
  ui_new_puzzle: { en: "New puzzle", de: "Neues Rätsel" },
  ui_status_your_turn: { en: "Your turn.", de: "Du bist dran." },
  ui_status_computer_turn: { en: "The computer is taking its turn.", de: "Der Computer ist dran." },
  ui_status_you_win: { en: "You win.", de: "Du gewinnst." },
  ui_status_computer_wins: { en: "The computer wins.", de: "Der Computer gewinnt." }
};
for (const lang of languages) {
  const strings = STRINGS[lang];
  for (const [key, expected] of Object.entries(canonical)) {
    if (!strings || !strings[key]) failures.push(`${lang}: missing ${key}`);
    else if (lang === "en" || lang === "de") if (strings[key] !== expected[lang]) failures.push(`${lang}: ${key} expected ${expected[lang]}, got ${strings[key]}`);
  }
  for (const key of oldModeKeys) {
    if (strings && strings[key] !== strings[key === "vs_computer" || key === "chess_mode_computer" ? "ui_mode_computer" : "ui_mode_two_player"]) {
      failures.push(`${lang}: legacy ${key} does not match its shared name`);
    }
  }
  if (strings && strings.new_game !== strings.ui_new_game) failures.push(`${lang}: new_game differs from ui_new_game`);
}
const files = [];
for (const name of fs.readdirSync(ROOT)) {
  if (name.endsWith(".html") || (name.endsWith(".js") && /-app\.js$/.test(name))) files.push(path.join(ROOT, name));
}
for (const name of fs.readdirSync(path.join(ROOT, "lang"))) if (/^[a-z]{2}\.js$/.test(name)) files.push(path.join(ROOT, "lang", name));
files.push(path.join(ROOT, "i18n.js"));
const controlRe = /data-i18n="([^"]+)"/g;
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);
  if (/\.html$/.test(file)) {
    for (const match of source.matchAll(controlRe)) {
      if (oldModeKeys.includes(match[1])) failures.push(`${rel}: uses old mode key ${match[1]}`);
    }
    for (const m of source.matchAll(/<button\b[^>]*id="start-[^"]*-game"[^>]*data-i18n="([^"]+)"/g)) {
      if (!["ui_new_game", "ui_new_puzzle", "ab_new_hero"].includes(m[1])) failures.push(`${rel}: start button uses ${m[1]}`);
    }
    if (/<option\s+value="0"[^>]*data-i18n="(?:mode_two_player|ui_mode_two_player)"/.test(source)) failures.push(`${rel}: two-player mode remains in level selection`);
  }
  if (/\.html$/.test(file) || /-app\.js$/.test(file) || rel === "quick-rules.js") {
    for (const stale of staleStrings) if (source.includes(stale)) failures.push(`${rel}: stale label ${JSON.stringify(stale)}`);
  }
}
const quickRules = fs.readFileSync(path.join(ROOT, "quick-rules.js"), "utf8");
if (/data-i18n",\s*"new_game"|I18n\.t\("new_game"\)/.test(quickRules)) failures.push("quick-rules.js: dynamic start control uses legacy new_game key");
if (failures.length) {
  console.error("UI name checks failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log(`UI names pass: ${languages.length} languages, ${files.filter((f) => f.endsWith(".html")).length} game and page sources.`);
