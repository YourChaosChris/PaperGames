// tests/game-families.js
// Game families (games-catalog.js `family`) and duplicates.
//
// Checks: every family has at least two games and is listed in
// GAME_FAMILIES (and every GAME_FAMILIES entry is used); no game appears
// twice in the catalog (same slug, same name key, or the same English or
// German name); game-switcher.js knows the same family for every game;
// every family name exists in all 12 languages; games.html's family
// filter (also games.html?family=...) shows exactly the family's games,
// each card of a family names it; a game's play page lists the other
// members under "Related games", its rules page does not; no sideways
// scrolling at 600 px and 360 px.
//
// Needs the local server (BASE_URL) and Playwright, like kids-games.js.
// Run: node tests/game-families.js

const { chromium } = require("playwright");
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const BASE_URL = process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");
const { loadI18n } = require("./load-i18n.js");

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8") + "\nthis.G = GAMES_CATALOG; this.F = GAME_FAMILIES;", ctx);
const G = ctx.G, F = ctx.F;
const fails = [];

// Families: at least two games each, all listed.
const members = {};
G.forEach((g) => { if (g.family) (members[g.family] = members[g.family] || []).push(g.slug); });
Object.keys(members).forEach((f) => {
  if (members[f].length < 2) fails.push("family " + f + " has only " + members[f].join(", "));
  if (F.indexOf(f) === -1) fails.push("family " + f + " missing from GAME_FAMILIES");
});
F.forEach((f) => { if (!members[f]) fails.push("GAME_FAMILIES lists unused family " + f); });

// No duplicates.
const STRINGS = loadI18n({ texts: false }).STRINGS;
function dupes(label, keyOf) {
  const seen = {};
  G.forEach((g) => {
    const k = keyOf(g);
    if (!k) return;
    if (seen[k]) fails.push("duplicate " + label + " \"" + k + "\": " + seen[k] + " and " + g.slug);
    else seen[k] = g.slug;
  });
}
dupes("slug", (g) => g.slug);
dupes("name key", (g) => g.nameKey);
dupes("English name", (g) => (STRINGS.en[g.nameKey] || g.nameText).toLowerCase());
dupes("German name", (g) => (STRINGS.de[g.nameKey] || "").toLowerCase());

// game-switcher.js agrees.
const sw = fs.readFileSync(path.join(ROOT, "game-switcher.js"), "utf8");
const swFamily = {};
const swSlugs = [];
sw.replace(/\["([a-z0-9]+)", "([a-z0-9_]+)"(?:, "([a-z]+)")?\]/g, (m, slug, key, fam) => { swSlugs.push(slug); swFamily[slug] = fam || null; return m; });
G.forEach((g) => {
  if (swSlugs.indexOf(g.slug) === -1) fails.push("game-switcher.js lacks " + g.slug);
  else if ((g.family || null) !== swFamily[g.slug]) fails.push("game-switcher.js: " + g.slug + " family " + swFamily[g.slug] + ", catalog " + (g.family || null));
});

// Names in every language.
Object.keys(STRINGS).forEach((lang) => {
  ["family_label", "family_filter_all", "related_games_title"].concat(F.map((f) => "family_" + f)).forEach((k) => {
    if (!STRINGS[lang][k]) fails.push(lang + " lacks " + k);
  });
});

(async () => {
  const browser = await chromium.launch({ executablePath: fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined });
  for (const width of [600, 360]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.addInitScript(() => { try { localStorage.setItem("einkchess_lang", "de"); } catch (e) { /* ignore */ } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const wide = async (where) => {
      const sw2 = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw2 > width) fails.push(where + " scrolls sideways at " + width + " px (" + sw2 + ")");
    };

    await page.goto(BASE_URL + "games.html");
    const options = await page.$$eval("#games-family option", (o) => o.map((x) => x.value));
    if (options.length !== F.length + 1) fails.push("family filter has " + options.length + " options, expected " + (F.length + 1));
    for (const f of F) {
      await page.selectOption("#games-family", f);
      const shown = (await page.$$eval("#games-grid .game-select-item", (els) => els.map((e) => e.getAttribute("data-slug")))).sort();
      if (JSON.stringify(shown) !== JSON.stringify(members[f].slice().sort())) fails.push("filter " + f + " shows " + shown.join(", "));
      const lines = await page.$$eval("#games-grid .game-select-family", (els) => els.map((e) => e.textContent));
      const want = "Familie: " + STRINGS.de["family_" + f];
      if (lines.length !== shown.length || lines.some((l) => l !== want)) fails.push("filter " + f + ": family lines " + JSON.stringify(lines));
    }
    await wide("games.html with a family");
    await page.goto(BASE_URL + "games.html?family=sudoku");
    const viaUrl = (await page.$$eval("#games-grid .game-select-item", (els) => els.map((e) => e.getAttribute("data-slug")))).sort();
    if (JSON.stringify(viaUrl) !== JSON.stringify(members.sudoku.slice().sort())) fails.push("games.html?family=sudoku shows " + viaUrl.join(", "));
    // Picking a category chip shows all families again.
    await page.click('#games-category-chips .mode-btn[data-category="puzzles"]');
    if ((await page.$eval("#games-family", (s) => s.value)) !== "all") fails.push("category chip did not reset the family filter");

    for (const g of G) {
      if (width === 360 && !["sudoku", "skat", "chess", "go"].includes(g.slug)) continue;
      await page.goto(BASE_URL + g.slug + ".html");
      const related = await page.$$eval("#related-games .related-games-list a", (as) => as.map((a) => a.getAttribute("href")));
      const want = g.family ? members[g.family].filter((s) => s !== g.slug).map((s) => s + ".html") : [];
      if (JSON.stringify(related) !== JSON.stringify(want)) fails.push(g.slug + ".html related games " + JSON.stringify(related) + ", expected " + JSON.stringify(want));
      if (g.family) {
        const title = await page.$eval("#related-games h2", (h) => h.textContent).catch(() => "");
        if (title !== "Verwandte Spiele") fails.push(g.slug + ".html related title \"" + title + "\"");
        await wide(g.slug + ".html");
      }
    }
    await page.goto(BASE_URL + "sudoku-rules.html");
    if (await page.$("#related-games")) fails.push("sudoku-rules.html shows related games");
    errors.slice(0, 5).forEach((e) => fails.push("page error at " + width + " px: " + e));
    await page.close();
  }
  await browser.close();
  console.log(Object.keys(members).length + " families: " + F.map((f) => f + " (" + members[f].join(", ") + ")").join("; "));
  fails.forEach((f) => console.log("FAIL: " + f));
  console.log("\n=== GAME FAMILIES: " + Object.keys(members).length + " families, " + Object.values(members).reduce((a, b) => a + b.length, 0) + " games in families, " + G.length + " games without duplicates, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})();
