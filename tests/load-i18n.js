// load-i18n.js
// Loads i18n.js together with every lang/*.js file into a plain Node VM,
// the way a browser ends up with them once each language has been
// fetched. Returns the context with I18n and STRINGS on it.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function loadI18n() {
  const ctx = {};
  vm.createContext(ctx);
  let src = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
  fs.readdirSync(path.join(ROOT, "lang")).filter((f) => f.endsWith(".js")).sort().forEach((f) => {
    src += "\n;" + fs.readFileSync(path.join(ROOT, "lang", f), "utf8");
  });
  vm.runInContext(src + ";this.I18n = I18n; this.STRINGS = STRINGS; this.LANGUAGE_ORDER = LANGUAGE_ORDER;", ctx);
  return ctx;
}

module.exports = { loadI18n };
