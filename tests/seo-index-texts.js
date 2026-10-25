// tests/seo-index-texts.js
// Title and description of the home page (seo_title_index, seo_desc_index)
// exist in all 12 languages, are not empty and hold {games}. They do not
// name Kindle or Kobo (not tested, the older browsers there do not run the
// games); the description names the tested readers Tolino, Boox and
// PocketBook (task 114). The static English <title> and description of
// index.html are the English texts with the current game count.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LANGS = ["en", "de", "fr", "es", "it", "nl", "pl", "uk", "ru", "ja", "zh", "ar"];
const NOT_PROMISED = ["Kindle", "Kobo"];
const TESTED = ["Tolino", "Boox", "PocketBook"];
let failed = 0;
function check(ok, msg) { if (!ok) { failed++; console.log("FAIL: " + msg); } }


const all = {};
LANGS.forEach((l) => {
  const src = fs.readFileSync(path.join(ROOT, l === "en" ? "i18n.js" : "lang/" + l + ".js"), "utf8");
  ["seo_title_index", "seo_desc_index"].forEach((k) => {
    const m = new RegExp("\\b" + k + ": (\"(?:[^\"\\\\]|\\\\.)*\")").exec(src);
    check(!!m, l + ": key " + k + " missing");
    if (!m) return;
    const v = JSON.parse(m[1]);
    all[l + "." + k] = v;
    check(v.trim().length > 10, l + ": " + k + " empty");
    check(v.indexOf("{games}") !== -1, l + ": " + k + " without {games}");
    NOT_PROMISED.forEach((b) => check(v.indexOf(b) === -1, l + ": " + k + " names " + b + " (not tested)"));
    if (k === "seo_desc_index") TESTED.forEach((b) => check(v.indexOf(b) !== -1, l + ": " + k + " without " + b));
    if (k === "seo_title_index") check(v.length <= 60, l + ": title too long (" + v.length + ")");
    if (k === "seo_desc_index") check(v.length <= 175, l + ": description too long (" + v.length + ")");
  });
});
const n = Number(/const GAME_COUNT = (\d+);/.exec(fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8"))[1]);
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const title = /<title[^>]*>([^<]*)<\/title>/.exec(html)[1].replace(/&amp;/g, "&");
const desc = /<meta name="description"[^>]* content="([^"]*)"/.exec(html)[1];
check(title === all["en.seo_title_index"].replace("{games}", n), "static <title> differs from the English text: " + title);
check(desc === all["en.seo_desc_index"].replace("{games}", n), "static description differs from the English text");
check(title.length <= 60,"English title too long (" + title.length + ")");
check(desc.length <= 160, "English description too long (" + desc.length + ")");
const ld = /"description": "([^"]*)"/.exec(html)[1];
check(ld === desc, "JSON-LD description differs from the meta description");
console.log("title " + title.length + " chars, description " + desc.length + " chars");
console.log(failed ? failed + " problem(s)" : "seo-index-texts OK (12 languages)");
process.exit(failed ? 1 : 0);
