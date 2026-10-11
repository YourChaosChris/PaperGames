// tests/new-games-order.js
// Home page "New Games" and games.html "Newest first": the newest game
// first, also among games published on the same day (games-catalog.js
// `added` carries the time of the commit that brought the game).
//
// Checks: every `added` is "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM"; the home
// list (GamesRender.newGames, as on 11 Oct 2026) has 8 games in the order
// they were added - Pairs to Ten, Bridge, Canasta, Schafkopf, Skat,
// Poker, 17 and 4, Path Blockers; the full newest-first order never has
// an older game before a newer one.
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
vm.runInContext(fs.readFileSync(path.join(ROOT, "games-render.js"), "utf8"), ctx);
const cat = ctx.GAMES_CATALOG, GR = ctx.GamesRender;
const fails = [];

cat.forEach((g) => {
  if (!/^\d{4}-\d\d-\d\d(T\d\d:\d\d)?$/.test(g.added || "")) fails.push(g.slug + ": bad added " + g.added);
});
const now = Date.parse("2026-10-11T12:00:00");
const home = GR.newGames(cat, 8, 60, now).map((g) => g.slug);
const want = ["tenpairs", "bridge", "canasta", "schafkopf", "skat", "poker", "blackjack", "blockers"];
if (JSON.stringify(home) !== JSON.stringify(want)) fails.push("home list " + JSON.stringify(home) + ", expected " + JSON.stringify(want));
const all = cat.slice().sort(GR.compareNewest);
for (let i = 1; i < all.length; i++) {
  if ((all[i - 1].added || "") < (all[i].added || "")) fails.push("older before newer: " + all[i - 1].slug + " / " + all[i].slug);
}
// Games of one commit: the later catalog entry first.
const same = all.filter((g) => g.added === "2026-09-27T21:03").map((g) => g.slug);
if (JSON.stringify(same) !== JSON.stringify(["killersudoku", "numberblocks", "calcudoku"])) fails.push("same commit order " + JSON.stringify(same));
// Outside the 60 days nothing shows.
if (GR.newGames(cat, 8, 60, Date.parse("2027-06-01T00:00:00")).length) fails.push("old games still new");

if (fails.length) {
  console.log(fails.join("\n"));
  console.log("=== NEW GAMES ORDER: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== NEW GAMES ORDER: home shows " + home.join(", ") + "; " + all.length + " games in order, 0 failures ===");
