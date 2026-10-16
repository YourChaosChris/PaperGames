const fs = require("fs");
const vm = require("vm");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8") + "\nthis.catalog = GAMES_CATALOG;", ctx);
const search = require(path.join(ROOT, "search-core.js"));
const catalog = ctx.catalog;
const checks = [
  ["Karten", ["klondike", "freecell", "durak"]], ["cards", ["klondike", "freecell", "durak"]],
  ["Kinder", catalog.filter((g) => g.kids === true).map((g) => g.slug)], ["kids", catalog.filter((g) => g.kids === true).map((g) => g.slug)],
  ["Wuerfel", ["yatzy", "ludo"]], ["Würfel", ["yatzy", "ludo"]], ["wuerfel", ["yatzy", "ludo"]], ["dice", ["yatzy", "ludo"]],
  ["solitaire", ["klondike", "freecell", "spidersolitaire"]]
];
let count = 0;
for (const lang of ["de", "en"]) {
  for (const [query, expected] of checks) {
    const hits = catalog.filter((g) => search.matches(g, query, {
      name: g.nameText,
      description: g.descText,
      family: g.family || "",
      category: g.category
    })).map((g) => g.slug);
    console.log(`${lang} ${query}: ${hits.join(", ")}`);
    for (const slug of expected) if (!hits.includes(slug)) throw new Error(`${lang} ${query}: missing ${slug}`);
    count++;
  }
}
if (search.normalize("WÜRFEL, Éléphant, Straße") !== "wuerfel, elephant, strasse") throw new Error("accent/umlaut normalization failed");
console.log(`Search keywords pass: ${count} query-language checks`);
