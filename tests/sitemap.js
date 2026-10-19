// tests/sitemap.js - sitemap.xml: valid, slim, every address answers 200.
// Usage: PORT=8010 node tests/sitemap.js   (needs a server on PORT, as the other page tests)
const fs = require("fs");
const path = require("path");
const http = require("http");
const ROOT = path.join(__dirname, "..");
const BASE = "https://yourchaoschris.github.io/PaperGames/";
const PORT = process.env.PORT || 8010;
let fails = 0;
function check(ok, msg) { if (!ok) { fails++; console.log("FAIL: " + msg); } }
const xml = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
check(xml.length < 1000000, "size " + xml.length + " >= 1 MB");
check(/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset [^>]*>/.test(xml) && /<\/urlset>\s*$/.test(xml), "not a urlset document");
const blocks = xml.split("<url>").slice(1);
check(blocks.length > 0 && blocks.length < 500, "URL count " + blocks.length + " not in 1..499");
check((xml.match(/<\/url>/g) || []).length === blocks.length, "unbalanced <url>");
const seen = new Set();
const locs = [];
blocks.forEach((b) => {
  const loc = (/<loc>([^<]+)<\/loc>/.exec(b) || [])[1];
  if (!loc) return check(false, "entry without loc");
  check(loc.indexOf(BASE) === 0, "foreign address " + loc);
  check(loc.indexOf("?") === -1, "parameter address listed: " + loc);
  check(!seen.has(loc), "duplicate " + loc);
  seen.add(loc); locs.push(loc);
  check(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(b), "no valid lastmod: " + loc);
  check((b.match(/hreflang="/g) || []).length === 13, "hreflang count != 13: " + loc);
  check(/hreflang="x-default" href="[^"]+"/.test(b), "no x-default: " + loc);
});
check(xml.indexOf("&") === -1 || !/&(?!amp;)/.test(xml), "unescaped &");
const robots = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
check(robots.indexOf("Sitemap: " + BASE + "sitemap.xml") !== -1, "robots.txt does not point to the sitemap");
function get(p) {
  return new Promise((res) => http.get({ host: "127.0.0.1", port: PORT, path: "/" + p }, (r) => { r.resume(); r.on("end", () => res(r.statusCode)); }).on("error", () => res(0)));
}
(async () => {
  const bad = [];
  for (let i = 0; i < locs.length; i += 20) {
    const part = locs.slice(i, i + 20);
    const codes = await Promise.all(part.map((l) => get(l.slice(BASE.length))));
    codes.forEach((c, j) => { if (c !== 200) bad.push(part[j] + " -> " + c); });
  }
  check(bad.length === 0, "not 200: " + bad.slice(0, 5).join(", "));
  console.log("sitemap: " + locs.length + " URLs, " + xml.length + " bytes");
  console.log(fails ? "sitemap FAILED (" + fails + ")" : "sitemap OK");
  process.exit(fails ? 1 : 0);
})();
