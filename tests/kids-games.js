// tests/kids-games.js
// "Children's Games": the category page games-kids.html and the games.html
// filter show exactly the games marked `kids: true` in games-catalog.js.
//
// Checks: the marked set is the agreed list of 20 games; games-kids.html
// shows them all at once and the "Children's Games" chip on
// games.html list exactly these; the home page's tile links there with
// the right count; the old addresses games.html?category=kids and
// index.html#section-kids lead to games-kids.html; each kids card is one
// large Play link and has no rules/history/description; all links answer
// 200; Mau Mau's link there is
// maumau.html?deck=kids and opens with the animal cards chosen; the
// sentence on calm.html links to the page; no page scrolls sideways at
// 600 px or 360 px.
//
// Needs the local server (BASE_URL) and Playwright, like board-sweep.js.
// Run: node tests/kids-games.js

const { chromium } = require("playwright");
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const http = require("http");
const BASE_URL = process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8") + "\nthis.GAMES_CATALOG = GAMES_CATALOG;", ctx);
const marked = ctx.GAMES_CATALOG.filter((g) => g.kids === true).map((g) => g.slug).sort();
const AGREED = ["animalsudoku", "shapesort", "linkpairs", "pairs", "maumau", "oldmaid", "war", "snakesladders", "blockers", "ludo", "fourinarow", "tictactoe", "lightswitch", "tenpairs", "differences", "patternrow", "shadowmatch", "oddone", "bingo", "weidefreunde", "zoowurf", "tieryatzy"].sort();
const fails = [];
const same = (name, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) fails.push(name + ": " + JSON.stringify(got) + ", expected " + JSON.stringify(want)); };
same("marked games", marked, AGREED);

function status(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => { res.resume(); resolve(res.statusCode); }).on("error", () => resolve(0));
  });
}

async function cardsIn(page, sel) {
  return page.$$eval(sel + " .game-select-item", (items) => items.map((it) => ({
    slug: it.getAttribute("data-slug"),
    links: Array.from(it.querySelectorAll(".game-select-actions a")).map((a) => a.getAttribute("href")),
    mainHref: it.querySelector(".game-select-play-link")?.getAttribute("href") || "",
    kidsHref: it.querySelector(".game-kids-play-link")?.getAttribute("href") || ""
  })));
}

// All cards of a paged list: on games.html the pager has buttons
// (data-page), on a category page links (?page=n).
async function allCards(page, sel) {
  const cards = await cardsIn(page, sel);
  for (let k = 0; k < 20; k++) {
    const next = await page.$(".pager .pager-next:not(.pager-off)");
    if (!next) break;
    const isLink = await next.evaluate((n) => n.tagName === "A");
    if (isLink) await Promise.all([page.waitForNavigation({ waitUntil: "networkidle" }), next.click()]);
    else await next.click();
    cards.push(...(await cardsIn(page, sel)));
  }
  return cards;
}

async function checkLinks(where, cards) {
  same(where + ": games", cards.map((c) => c.slug).sort(), AGREED);
  for (const c of cards) {
    const play = c.slug === "maumau" ? "maumau.html?deck=kids" : c.slug + ".html";
    same(where + ": " + c.slug + " icon/name link", c.mainHref, play);
    same(where + ": " + c.slug + " links", c.links, [play, c.slug + "-rules.html", c.slug + "-history.html"]);
    for (const href of c.links) {
      const code = await status(BASE_URL + href);
      if (code !== 200) fails.push(where + ": " + href + " answers " + code);
    }
  }
}

async function checkKidsCards(where, cards) {
  same(where + ": games", cards.map((c) => c.slug).sort(), AGREED);
  for (const c of cards) {
    const play = c.slug === "maumau" ? "maumau.html?deck=kids" : c.slug + ".html";
    same(where + ": " + c.slug + " one-tap link", c.kidsHref, play);
    if (c.links.length) fails.push(where + ": " + c.slug + " has extra action links");
    const code = await status(BASE_URL + play);
    if (code !== 200) fails.push(where + ": " + play + " answers " + code);
  }
}

async function noSideScroll(page, name) {
  for (const width of [600, 360]) {
    await page.setViewportSize({ width, height: 800 });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 0) fails.push(name + " at " + width + " px scrolls sideways by " + over + " px");
  }
  await page.setViewportSize({ width: 632, height: 840 });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 632, height: 840 } });
  await page.addInitScript(() => { try { localStorage.setItem("einkchess_lang", "de"); } catch (e) {} });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // Home page tile, the category page and the old addresses.
  await page.goto(BASE_URL + "index.html", { waitUntil: "networkidle" });
  same("home tile", await page.$eval('.category-tile[href="games-kids.html"]', (a) => a.textContent), "Kinderspiele" + AGREED.length + " Spiele");
  await noSideScroll(page, "index.html");
  await page.goto(BASE_URL + "games-kids.html", { waitUntil: "networkidle" });
  same("kids page heading", await page.$eval("h1", (h) => h.textContent), "Kinderspiele");
  await noSideScroll(page, "games-kids.html");
  const kidsCards = await allCards(page, "#cat-grid");
  await checkKidsCards("games-kids.html", kidsCards);
  same("kids page has no pager", await page.$eval("#cat-pager", (el) => el.classList.contains("hidden")), true);
  same("kids page has no descriptions", await page.$$eval("#cat-grid .game-select-desc", (els) => els.length), 0);
  same("kids page has no rules/history links", await page.$$eval("#cat-grid .game-select-actions", (els) => els.length), 0);
  const tapSizes = await page.$$eval("#cat-grid .game-kids-card", (cards) => cards.map((card) => {
    const link = card.querySelector(".game-kids-play-link").getBoundingClientRect();
    const star = card.querySelector(".favorite-toggle").getBoundingClientRect();
    return { link: [link.width, link.height], star: [star.width, star.height] };
  }));
  if (tapSizes.some((s) => s.link[0] < 44 || s.link[1] < 44 || s.star[0] < 44 || s.star[1] < 44)) fails.push("kids page has a tap target below 44 px");
  await page.goto(BASE_URL + "games.html?category=kids", { waitUntil: "networkidle" });
  same("games.html?category=kids leads to", page.url().replace(BASE_URL, ""), "games-kids.html");
  await page.goto(BASE_URL + "index.html#section-kids", { waitUntil: "networkidle" });
  same("index.html#section-kids leads to", page.url().replace(BASE_URL, ""), "games-kids.html");

  // games.html: the chip by hand, over all pages.
  await page.goto(BASE_URL + "games.html", { waitUntil: "networkidle" });
  const all = (await allCards(page, "#games-grid")).length;
  same("all games listed", all, ctx.GAMES_CATALOG.length);
  await page.goto(BASE_URL + "games.html", { waitUntil: "networkidle" });
  await page.click('#games-category-chips .mode-btn[data-category="kids"]');
  await checkLinks("games.html chip", await allCards(page, "#games-grid"));
  await page.click('#games-category-chips .mode-btn[data-category="kids"]');
  await page.selectOption("#games-sort", "type");
  same("games.html chip, sort by type", (await allCards(page, "#games-grid")).map((c) => c.slug).sort(), AGREED);
  await page.click('#games-category-chips .mode-btn[data-category="kids"]');
  await page.selectOption("#games-sort", "newest");
  same("games.html chip, newest first", (await allCards(page, "#games-grid")).map((c) => c.slug).sort(), AGREED);
  await noSideScroll(page, "games.html (children's games)");
  await page.click('#games-category-chips .mode-btn[data-category="all"]');
  same("back to all", (await allCards(page, "#games-grid")).length, all);

  // Mau Mau from the children's games: animal cards chosen.
  await page.goto(BASE_URL + "maumau.html?deck=kids", { waitUntil: "networkidle" });
  same("maumau deck", await page.$eval("#maumau-deck", (s) => s.value), "kids");
  await page.goto(BASE_URL + "maumau.html", { waitUntil: "networkidle" });
  same("maumau deck remembered", await page.$eval("#maumau-deck", (s) => s.value), "kids");

  // Calm play page.
  await page.goto(BASE_URL + "calm.html", { waitUntil: "networkidle" });
  same("calm link", await page.$$eval('a[href="games-kids.html"]', (a) => a.map((x) => x.textContent)), ["Kinderspiele"]);
  await noSideScroll(page, "calm.html");

  if (errors.length) fails.push("page errors: " + errors.join(" | "));
  await browser.close();
  if (fails.length) {
    console.log(fails.join("\n"));
    console.log("=== KIDS GAMES: " + fails.length + " failure(s) ===");
    process.exit(1);
  }
  console.log("=== KIDS GAMES: " + AGREED.length + " games on games-kids.html and in the filter, all links 200, 0 failures ===");
})();
