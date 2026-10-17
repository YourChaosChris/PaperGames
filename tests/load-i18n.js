// load-i18n.js
// Loads i18n.js and every lang/*.js file into a plain Node VM, the way a
// browser ends up with them once each language has been fetched.
// Returns the context with I18n and STRINGS on it.
//
// loadI18n() also loads the rules/history texts (text/<lang>/<slug>.js,
// every game), as a rules or history page does for its own game. A game
// page loads only the main files: loadI18n({ texts: false }) gives that
// view, so a message is not counted as translated just because a rules
// page has a text that happens to match it. loadI18n({ slug: "chess" })
// loads the texts of that one game only, the view of chess-rules.html.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function loadI18n(opts) {
  const texts = !(opts && opts.texts === false);
  const ctx = {};
  vm.createContext(ctx);
  let src = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
  const files = fs.readdirSync(path.join(ROOT, "lang")).filter((f) => f.endsWith(".js")).sort();
  files.forEach((f) => {
    src += "\n;" + fs.readFileSync(path.join(ROOT, "lang", f), "utf8");
  });
  if (texts) {
    // English first, then each language: they add themselves to the table
    // the main files created.
    const langs = ["en"].concat(files.map((f) => f.replace(/\.js$/, "")));
    langs.forEach((l) => {
      const dir = path.join(ROOT, "text", l);
      if (!fs.existsSync(dir)) return;
      fs.readdirSync(dir).filter((f) => f.endsWith(".js") && (!opts || !opts.slug || f === opts.slug + ".js")).sort().forEach((f) => {
        src += "\n;" + fs.readFileSync(path.join(dir, f), "utf8");
      });
    });
  }
  vm.runInContext(src + ";this.I18n = I18n; this.STRINGS = STRINGS; this.LANGUAGE_ORDER = LANGUAGE_ORDER;", ctx);
  return ctx;
}

module.exports = { loadI18n };
