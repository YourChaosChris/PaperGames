// tests/new-games-order.js
// Home page "New Games" and games.html "Newest first": the newest game
// first, also among games published on the same day (games-catalog.js
// `added` carries the time of the commit that brought the game).
//
// Checks: every `added` is "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM"; "New
// Games" (GameCategories.games("new"), as on 17 Oct 2026) has exactly
// GameCategories.NEW_MAX = 10 games, the 10 newest, newest first - Loosen
// Games" (GameCategories.games("new"), as on 11 Oct 2026) has exactly
// GameCategories.NEW_MAX = 10 games, the 10 newest, newest first - Continue the Pattern, Loosen
// the Rings, Cat Places, Matchstick Puzzles, Tangram, Turn the Rings,
// Arrows, Adventure Book, Forest Village, Fairy-Tale Villains, Card Duel;
// Games" (GameCategories.games("new"), as on 11 Oct 2026) has exactly
// GameCategories.NEW_MAX = 10 games, the 10 newest, newest first - Sternjagd,
// Steckwuerfeln, Klappenkasten, Loosen the Rings, Cat Places, Matchstick
// Puzzles, Tangram, Turn the Rings, Arrows, Adventure Book;
// a game older than 60 days is not new even among the 10 newest; the
// full newest-first order never has an older game before a newer one.
//
// Run: node tests/new-games-order.js

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const ctx = { window: {}, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8") + "\nthis.GAMES_CATALOG = GAMES_CATALOG;", ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "games-render.js"), "utf8") + "\nthis.GamesRender = GamesRender;", ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "game-categories.js"), "utf8") + "\nthis.GameCategories = GameCategories;", ctx);
const cat = ctx.GAMES_CATALOG, GR = ctx.GamesRender, GC = ctx.GameCategories;
const fails = [];

cat.forEach((g) => {
  if (!/^\d{4}-\d\d-\d\d(T\d\d:\d\d)?$/.test(g.added || "")) fails.push(g.slug + ": bad added " + g.added);
});
const now = Date.parse("2026-10-17T20:00:00");
if (GC.NEW_MAX !== 10) fails.push("NEW_MAX " + GC.NEW_MAX);
const home = GC.games("new", cat, now).map((g) => g.slug);
const all0 = cat.slice().sort(GR.compareNewest).map((g) => g.slug);
const want = all0.slice(0, 10);
if (JSON.stringify(want.slice(0, 8)) !== JSON.stringify(["tieryatzy", "zoowurf", "weidefreunde", "kleeberg", "sternjagd", "steckwuerfeln", "klappenkasten", "oddone"])) fails.push("newest eight " + JSON.stringify(want.slice(0, 8)));
if (JSON.stringify(home) !== JSON.stringify(want)) fails.push("home list " + JSON.stringify(home) + ", expected " + JSON.stringify(want));
const all = cat.slice().sort(GR.compareNewest);
for (let i = 1; i < all.length; i++) {
  if ((all[i - 1].added || "") < (all[i].added || "")) fails.push("older before newer: " + all[i - 1].slug + " / " + all[i].slug);
}
// Games of one commit: the later catalog entry first.
const same = all.filter((g) => g.added === "2026-09-27T21:03").map((g) => g.slug);
if (JSON.stringify(same) !== JSON.stringify(["killersudoku", "noneighbors", "calcudoku"])) fails.push("same commit order " + JSON.stringify(same));
// Outside the 60 days nothing shows; inside, the 60 days still cut the
// list short (a day after the 10th newest game turned 60 days old, it is
// gone, the 9 newer ones stay if they are younger).
if (GC.games("new", cat, Date.parse("2027-06-01T00:00:00")).length) fails.push("old games still new");
const tenth = cat.find((g) => g.slug === want[9]);
const later = Date.parse(tenth.added.slice(0, 10) + "T00:00:00") + 61 * 864e5;
const cut = GC.games("new", cat, later).map((g) => g.slug);
if (cut.indexOf(want[9]) !== -1) fails.push("a game older than 60 days is still new");
if (cut.some((s, i) => s !== want[i])) fails.push("cut list not the newest first: " + cut.join(","));

if (fails.length) {
  console.log(fails.join("\n"));
  console.log("=== NEW GAMES ORDER: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== NEW GAMES ORDER: home shows " + home.join(", ") + "; " + all.length + " games in order, 0 failures ===");
