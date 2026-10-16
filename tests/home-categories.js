// tests/home-categories.js
// The short home page and the category pages (game-categories.js).
//
// Checks:
//  1. Home page height: at 600 x 800 at most one screen without started
//     games and favorites, at most two with 3 started games and 8
//     favorites (of which 6 are shown, plus "All favorites (8)"); the
//     heights at 360 x 640 are printed. "Continue Playing" shows at most
//     3 games, "My Favorites" at most 6; every entry is compact (name,
//     Play, star - no rules or history link). The tiles name every
//     category page with its number of games.
//  2. Every category page: at most 12 games per page, "Page n of m",
//     "New Games" exactly the 10 newest of the last 60 days, newest first,
//     every game of the category exactly once over all pages (compared
//     with games-catalog.js), the page number in the address survives a
//     reload, a "Back to home" link on top.
//  3. games.html: 12 per page, all games once over all pages; a search
//     and a category chip work over all pages and start again on page 1.
//  4. Old addresses lead to the new pages: index.html#section-popular,
//     #section-new, #section-kids and games.html?category=strategy.
//  5. No page scrolls sideways at 600 px or 360 px; no page errors.
//
// Needs the local server (BASE_URL) and Playwright. Run:
//   node tests/home-categories.js

const { chromium } = require("playwright");
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const BASE_URL = process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");
const EXEC = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8") + "\nthis.GAMES_CATALOG = GAMES_CATALOG;", ctx);
const CAT = ctx.GAMES_CATALOG.filter((g) => !(g.hideInLangs && g.hideInLangs.indexOf("de") !== -1));
const NOW = Date.now();
const WANT = {
  // The 10 newest of the last 60 days, newest first (games of one commit:
  // the later catalog entry first).
  new: CAT.filter((g) => g.added && Date.parse(g.added.slice(0, 10) + "T00:00:00") >= NOW - 60 * 864e5)
    .sort((a, b) => b.added.localeCompare(a.added) || (a.added.length > 10 ? ctx.GAMES_CATALOG.indexOf(b) - ctx.GAMES_CATALOG.indexOf(a) : 0))
    .slice(0, 10),
  popular: CAT.filter((g) => g.popular === true),
  kids: CAT.filter((g) => g.kids === true),
  strategy: CAT.filter((g) => g.category === "strategy"),
  race: CAT.filter((g) => g.category === "race"),
  puzzles: CAT.filter((g) => g.category === "puzzles"),
  party: CAT.filter((g) => g.category === "party")
};
const FAVS = ["chess", "go", "sudoku", "pairs", "skat", "villains", "hex", "mahjong"];
const RECENT = ["chess", "reversi", "forestvillage", "go"];

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const report = [];

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC });
  const errors = [];

  // --- 1. home page -------------------------------------------------------
  for (const [W, H] of [[600, 800], [360, 640]]) {
    for (const data of [false, true]) {
      const c = await browser.newContext({ viewport: { width: W, height: H } });
      await c.addInitScript(([data, favs, recent]) => {
        try {
          localStorage.clear();
          localStorage.setItem("einkchess_lang", "de");
          if (data) {
            localStorage.setItem("einkchess_favorites", JSON.stringify(favs));
            recent.forEach((s) => localStorage.setItem("einkchess_save_" + s, "{}"));
          }
        } catch (e) { /* ignore */ }
      }, [data, FAVS, RECENT]);
      const page = await c.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(BASE_URL + "index.html", { waitUntil: "networkidle" });
      const r = await page.evaluate(() => ({
        h: document.documentElement.scrollHeight,
        w: document.documentElement.scrollWidth,
        cont: document.querySelectorAll("#continue-grid .game-select-item").length,
        fav: document.querySelectorAll("#favorites-grid .game-select-item").length,
        more: document.getElementById("favorites-more").classList.contains("hidden") ? "" : document.getElementById("favorites-more").textContent,
        extraLinks: document.querySelectorAll("#continue-grid a, #favorites-grid a").length - document.querySelectorAll("#continue-grid .game-select-item, #favorites-grid .game-select-item").length,
        tiles: [...document.querySelectorAll(".category-tile")].map((a) => a.getAttribute("href") + "=" + a.querySelector(".category-tile-count").textContent)
      }));
      report.push(W + " x " + H + (data ? ", 3 started games + 6 favorites" : ", no data") + ": " + r.h + " px (" + (r.h / H).toFixed(2) + " screens)");
      check(r.w <= W, "home at " + W + " px scrolls sideways (" + r.w + ")");
      if (W === 600) check(r.h <= (data ? 2 * H : H), "home at 600 x 800 " + (data ? "with" : "without") + " data is " + r.h + " px high");
      check(r.extraLinks === 0, "home entries have more than one link each");
      if (data) {
        check(r.cont === 3, "continue shows " + r.cont + " games, expected 3");
        check(r.fav === 6, "favorites show " + r.fav + " games, expected 6");
        check(r.more === "Alle Favoriten (8)", "favorites link reads \"" + r.more + "\"");
      } else {
        check(r.cont === 0 && r.fav === 0 && r.more === "", "empty home shows entries");
        const want = Object.keys(WANT).map((k) => "games-" + k + ".html=" + WANT[k].length + " Spiele").concat(["games.html=" + CAT.length + " Spiele"]);
        check(JSON.stringify(r.tiles) === JSON.stringify(want), "tiles " + JSON.stringify(r.tiles) + ", expected " + JSON.stringify(want));
      }
      await c.close();
    }
  }

  // --- 2. category pages ------------------------------------------------------
  const c = await browser.newContext({ viewport: { width: 600, height: 900 } });
  await c.addInitScript(() => { try { localStorage.setItem("einkchess_lang", "de"); } catch (e) { /* ignore */ } });
  const page = await c.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  const slugs = (sel) => page.$$eval(sel + " .game-select-item", (els) => els.map((e) => e.getAttribute("data-slug")));
  const wide = async (where) => {
    for (const w of [600, 360]) {
      await page.setViewportSize({ width: w, height: 900 });
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > w) fails.push(where + " scrolls sideways at " + w + " px");
    }
    await page.setViewportSize({ width: 600, height: 900 });
  };
  for (const id of Object.keys(WANT)) {
    const want = WANT[id].map((g) => g.slug).sort();
    // The kids page lists every kids game on one page (task 97).
    const pages = id === "kids" ? 1 : Math.max(1, Math.ceil(want.length / 12));
    const seen = [];
    for (let n = 1; n <= pages; n++) {
      await page.goto(BASE_URL + "games-" + id + ".html" + (n > 1 ? "?page=" + n : ""), { waitUntil: "networkidle" });
      const s = await slugs("#cat-grid");
      check(s.length <= (id === "kids" ? 20 : 12), id + " page " + n + " shows " + s.length + " games");
      seen.push(...s);
      const now = await page.$eval("#cat-pager", (p) => (p.querySelector(".pager-now") || { textContent: "" }).textContent);
      check(pages === 1 ? now === "" : now === "Seite " + n + " von " + pages, id + " page " + n + ": pager \"" + now + "\"");
      check(await page.$eval(".about-back-top a", (a) => a.getAttribute("href")) === "index.html", id + ": no back link on top");
      if (n === 1) await wide("games-" + id + ".html");
    }
    check(JSON.stringify(seen.slice().sort()) === JSON.stringify(want), id + ": pages show " + seen.length + " games (" + new Set(seen).size + " different), expected " + want.length);
    if (id === "new") {
      check(seen.length <= 10, "new: " + seen.length + " games, at most 10 allowed");
      check(JSON.stringify(seen) === JSON.stringify(WANT.new.map((g) => g.slug)), "new: not the 10 newest, newest first: " + seen.join(","));
    }
    report.push("games-" + id + ".html: " + want.length + " games on " + pages + " page(s), each once");
    if (pages > 1) {
      await page.goto(BASE_URL + "games-" + id + ".html?page=2", { waitUntil: "networkidle" });
      await page.reload({ waitUntil: "networkidle" });
      check((await page.$eval(".pager-now", (p) => p.textContent)) === "Seite 2 von " + pages, id + ": page 2 lost on reload");
    }
  }
  await page.goto(BASE_URL + "games-favorites.html", { waitUntil: "networkidle" });
  check(!(await page.$eval("#cat-empty", (e) => e.classList.contains("hidden"))), "favorites page without favorites shows no hint");

  // --- 3. games.html -------------------------------------------------------------
  await page.goto(BASE_URL + "games.html", { waitUntil: "networkidle" });
  const all = [];
  for (let k = 0; k < 20; k++) {
    const s = await slugs("#games-grid");
    check(s.length <= 12, "games.html shows " + s.length + " games on one page");
    all.push(...s);
    const next = await page.$("#games-pager .pager-next:not(.pager-off)");
    if (!next) break;
    await next.click();
  }
  check(all.length === CAT.length && new Set(all).size === CAT.length, "games.html pages show " + all.length + " games, expected " + CAT.length);
  check(/[?&]page=\d+/.test(page.url()), "games.html keeps no page number in the address");
  await page.fill("#games-search", "s");
  const hits = CAT.filter((g) => /s/i.test(g.nameText)).length;
  check((await page.$eval("#games-pager", (p) => (p.querySelector(".pager-now") || { textContent: "1" }).textContent)).indexOf("Seite 1") === 0 || hits <= 12, "a search does not start on page 1");
  await page.fill("#games-search", "");
  await page.click('#games-category-chips .mode-btn[data-category="puzzles"]');
  const puz = [];
  for (let k = 0; k < 10; k++) {
    puz.push(...(await slugs("#games-grid")));
    const next = await page.$("#games-pager .pager-next:not(.pager-off)");
    if (!next) break;
    await next.click();
  }
  check(JSON.stringify(puz.sort()) === JSON.stringify(WANT.puzzles.map((g) => g.slug).sort()), "games.html puzzles chip over all pages: " + puz.length + " games");
  report.push("games.html: " + CAT.length + " games on " + Math.ceil(CAT.length / 12) + " pages, each once");
  await wide("games.html");

  // --- 4. old addresses -------------------------------------------------------------
  for (const [from, to] of [["index.html#section-popular", "games-popular.html"], ["index.html#section-new", "games-new.html"], ["index.html#section-kids", "games-kids.html"], ["games.html?category=strategy", "games-strategy.html"]]) {
    await page.goto(BASE_URL + from, { waitUntil: "networkidle" });
    check(page.url() === BASE_URL + to, from + " leads to " + page.url().replace(BASE_URL, "") + ", expected " + to);
  }

  await browser.close();
  errors.slice(0, 5).forEach((e) => fails.push("page error: " + e));
  console.log(report.join("\n"));
  if (fails.length) {
    fails.slice(0, 30).forEach((f) => console.log("FAIL: " + f));
    console.log("=== HOME AND CATEGORY PAGES: " + fails.length + " failure(s) ===");
    process.exit(1);
  }
  console.log("=== HOME AND CATEGORY PAGES: 0 failures ===");
})();
