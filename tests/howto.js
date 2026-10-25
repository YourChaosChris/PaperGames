#!/usr/bin/env node
// The shared picture explanation (howto.js): every game that uses it loads
// the script before its app, calls Howto.init with four steps, and has the
// step sentences in all 12 languages; the file is part of the offline shell.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const LANGS = ["en", "de", "fr", "es", "it", "nl", "pl", "uk", "ru", "ja", "zh", "ar"];
const GAMES = { bingo: "bingo", steckwuerfeln: "sw", klappenkasten: "kk", zoowurf: "zw", weidefreunde: "wf", linkpairs: "linkpairs", oldmaid: "oldmaid", snakesladders: "snakesladders" };
const files = (l) => (l === "en" ? ["i18n.js"] : ["lang/" + l + ".js"]).map((f) => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n");
const text = {};
LANGS.forEach((l) => { text[l] = files(l); });
const failures = [];
const has = (l, key) => new RegExp("^    " + key + ": ", "m").test(text[l]);
const shell = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
if (!shell.includes('"howto.js"')) failures.push("sw.js: howto.js is not in APP_SHELL");
let keys = 0;
for (const [game, prefix] of Object.entries(GAMES)) {
  const html = fs.readFileSync(path.join(ROOT, game + ".html"), "utf8");
  const a = html.indexOf('<script src="howto.js"></script>');
  if (a < 0 || a > html.indexOf('<script src="' + game + '-app.js"></script>')) failures.push(game + ".html: howto.js must load before the app");
  const app = fs.readFileSync(path.join(ROOT, game + "-app.js"), "utf8");
  if (!app.includes("Howto.init(")) failures.push(game + "-app.js: no Howto.init call");
  for (let i = 1; i <= 4; i++) {
    const key = prefix + "_howto_" + i;
    if (!app.includes('"' + key + '"')) failures.push(game + "-app.js: step " + i + " (" + key + ") missing");
    LANGS.forEach((l) => { keys++; if (!has(l, key)) failures.push(key + " missing in " + l); });
  }
}
// Short sentences (task 116): at most 8 words, in Japanese and Chinese at
// most 24 characters, for the games added then.
const SHORT = ["linkpairs", "oldmaid", "snakesladders"];
SHORT.forEach((game) => {
  for (let i = 1; i <= 4; i++) {
    const key = GAMES[game] + "_howto_" + i;
    LANGS.forEach((l) => {
      const m = new RegExp("^    " + key + ": (\"(?:[^\"\\\\]|\\\\.)*\")", "m").exec(text[l]);
      if (!m) return;
      const v = JSON.parse(m[1]);
      const long = l === "ja" || l === "zh" ? v.length > 24 : v.split(/\s+/).filter(Boolean).length > 8;
      if (long) failures.push(key + " in " + l + " is too long: " + v);
    });
  }
});
["howto_title", "howto_show", "howto_hide"].forEach((key) => LANGS.forEach((l) => { keys++; if (!has(l, key)) failures.push(key + " missing in " + l); }));
if (failures.length) {
  console.error("Howto checks failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("Howto pass: " + Object.keys(GAMES).length + " games, " + keys + " texts in 12 languages.");
