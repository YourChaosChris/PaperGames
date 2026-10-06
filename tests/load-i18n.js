// load-i18n.js
// Loads i18n.js and every lang/*.js file into a plain Node VM, the way a
// browser ends up with them once each language has been fetched.
// Returns the context with I18n and STRINGS on it.
//
// loadI18n() also loads the rules/history texts (i18n-text.js and
// lang/xx-text.js), as a rules or history page does. A game page loads
// only the main files: loadI18n({ texts: false }) gives that view, so a
// message is not counted as translated just because a rules page has a
// text that happens to match it.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function loadI18n(opts) {
  const texts = !(opts && opts.texts === false);
  const ctx = {};
  vm.createContext(ctx);
  let src = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
  if (texts) src += "\n;" + fs.readFileSync(path.join(ROOT, "i18n-text.js"), "utf8");
  // Each language's main file first, then its rules/history texts
  // (lang/xx-text.js), which add themselves to the table the main file
  // created - so a language's keys are counted from both files together.
  const files = fs.readdirSync(path.join(ROOT, "lang")).filter((f) => f.endsWith(".js")).sort();
  files.filter((f) => !f.endsWith("-text.js")).concat(texts ? files.filter((f) => f.endsWith("-text.js")) : []).forEach((f) => {
    src += "\n;" + fs.readFileSync(path.join(ROOT, "lang", f), "utf8");
  });
  vm.runInContext(src + ";this.I18n = I18n; this.STRINGS = STRINGS; this.LANGUAGE_ORDER = LANGUAGE_ORDER;", ctx);
  return ctx;
}

module.exports = { loadI18n };
