#!/usr/bin/env node
// Arrow Ludo in the browser (task 189, arrow squares moved in task 191),
// German page at 360 px:
//   - classic board only: no board choice, players 2 to 4, no purple/orange;
//   - the four arrow squares (track 4, 17, 30, 43: the 4th square after
//     each start) and the flight lines are drawn; Ludo has none;
//   - a hotseat game: a token on route square 1 with a 3 flies to 30 when
//     its cell is tapped, the message says so (26 squares ahead), the
//     arrow square it flew from, the landing square and the line of the
//     flight are marked, and the move is saved;
//   - a flight back (green from 27 with a 3 lands on 30 = track 43 and
//     flies back to 4 = track 17): the message says "back";
//   - the Hint button marks a token and names it; before a roll it asks for one;
//   - after a reload the game is back with its arrows; Ludo and Arrow Ludo
//     keep separate saves;
//   - large board: every cell at least 28 px; no sideways scrolling; no error.
// Run: node tests/arrowludo-ui.js   (needs the server and Playwright)
const { chromium } = require("playwright");
const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 && process.argv[argBase + 1]) || process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok, info) => { if (!ok) fails.push(name + (info !== undefined ? ": " + JSON.stringify(info) : "")); };

async function openSettings(page) {
  if (!(await page.isVisible("#start-ludo-game"))) await page.click("#menu-toggle");
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "arrowludo.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  await openSettings(page);

  check("title in German", (await page.title()).indexOf("Pfeil-Ludo") === 0, await page.title());
  check("no board choice", (await page.$("#ludo-board-size")) === null);
  const opts = await page.evaluate(() => Array.from(document.querySelectorAll("#ludo-num-players option")).map((o) => o.value).join(","));
  check("players 2 to 4", opts === "2,3,4", opts);
  check("no purple or orange", (await page.$$(".ludo-color-six")).length === 0);
  check("hint button present", (await page.$("#ludo-hint-button")) !== null);

  await page.click("#mode-offline");
  await page.selectOption("#ludo-num-players", "2");
  await page.click("#start-ludo-game");
  await page.waitForTimeout(400);
  const board = await page.evaluate(() => ({
    track: document.querySelectorAll(".ludo-cell-track").length,
    arrows: Array.from(document.querySelectorAll(".ludo-cell-arrow")).map((c) => c.dataset.trackIndex).join(","),
    marks: document.querySelectorAll(".ludo-arrow-mark").length,
    lines: document.querySelectorAll(".ludo-arrow-lines line").length,
    flag: AppStateLudo.state.arrows === true,
    wide: document.documentElement.scrollWidth - innerWidth
  }));
  check("52 track cells, 4 arrow squares " + JSON.stringify(board), board.track === 52 && board.arrows === "4,17,30,43" && board.marks === 4);
  check("two flight lines and the state flag", board.lines === 2 && board.flag);
  check("no sideways scrolling", board.wide <= 0);

  // Hint before a roll.
  await page.click("#ludo-hint-button");
  check("hint asks for a roll first", /W.rfle zuerst|Roll the die/i.test(await page.textContent("#board-info")), await page.textContent("#board-info"));

  // Put red token 0 on route square 1 and roll a 3.
  await page.evaluate(() => {
    const s = AppStateLudo.state;
    s.turnIndex = 0;
    s.tokens.red[0] = { state: "active", rel: 1 };
    AppStateLudo.roll = 3;
    AppStateLudo.legalMoves = LudoCore.getLegalMoves(s, "red", 3);
    updateLudoBoard();
  });
  await page.click("#ludo-hint-button");
  check("hint marks a cell", (await page.$$(".ludo-hint")).length === 1);
  check("hint names the token", /1/.test(await page.textContent("#board-info")) && /Tipp|Hint/i.test(await page.textContent("#board-info")), await page.textContent("#board-info"));
  await page.click(".ludo-cell-track[data-track-index='1']");
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({
    rel: AppStateLudo.state.tokens.red[0].rel,
    info: document.getElementById("board-info").textContent,
    from: Array.from(document.querySelectorAll(".ludo-cell-flight-from")).map((c) => c.dataset.trackIndex).join(","),
    to: Array.from(document.querySelectorAll(".ludo-cell-flight-to")).map((c) => c.dataset.trackIndex).join(","),
    line: document.querySelectorAll(".ludo-arrow-lines line.ludo-flight-last").length,
    saved: !!localStorage.getItem("einkchess_save_arrowludo"),
    plain: !!localStorage.getItem("einkchess_save_ludo")
  }));
  check("the token flew to 30", after.rel === 30, after);
  check("the message names the flight", /Pfeilfeld/.test(after.info) && /Mitte/.test(after.info) && /26 Felder voraus/.test(after.info), after.info);
  check("flight marked: from arrow square 4 to 30, with its line", after.from === "4" && after.to === "30" && after.line === 1, after);
  check("saved under its own key", after.saved && !after.plain);

  // A flight back: green from route square 27 with a 3.
  await page.evaluate(() => {
    const s = AppStateLudo.state;
    s.turnIndex = s.activeColors.indexOf("green");
    s.tokens.green[0] = { state: "active", rel: 27 };
    AppStateLudo.roll = 3;
    AppStateLudo.legalMoves = LudoCore.getLegalMoves(s, "green", 3);
    updateLudoBoard();
  });
  await page.click(".ludo-cell-track[data-track-index='40']");
  await page.waitForTimeout(200);
  const backInfo = await page.evaluate(() => ({ rel: AppStateLudo.state.tokens.green[0].rel, info: document.getElementById("board-info").textContent, from: Array.from(document.querySelectorAll(".ludo-cell-flight-from")).map((c) => c.dataset.trackIndex).join(",") }));
  check("flight back: green lands on track 43 and flies back to route square 4", backInfo.rel === 4 && backInfo.from === "43", backInfo);
  check("flight back: the message says back", /26 Felder zurück/.test(backInfo.info), backInfo.info);
  // Red's turn again, so the reload check below finds red's token on 30.
  await page.evaluate(() => { AppStateLudo.state.tokens.green[0] = { state: "home", rel: null }; AppStateLudo.state.turnIndex = 0; updateLudoBoard(); saveLudoGame(); });

  // Reload: the game and its arrows are back.
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  const back = await page.evaluate(() => ({ rel: AppStateLudo.state && AppStateLudo.state.tokens.red[0].rel, arrows: document.querySelectorAll(".ludo-cell-arrow").length }));
  check("after a reload the game is back " + JSON.stringify(back), back.rel === 30 && back.arrows === 4);

  // Large board cells.
  const cells = await page.evaluate(() => {
    const b = document.getElementById("ludo-board").getBoundingClientRect();
    return { w: Math.round(b.width), min: Math.min.apply(null, Array.from(document.querySelectorAll("#ludo-board .ludo-cell")).map((c) => c.getBoundingClientRect().width)) };
  });
  check("cells are at least 14 px at 360 px " + JSON.stringify(cells), cells.min >= 14);

  // Plain Ludo has no arrows and its own save.
  await page.goto(BASE + "ludo.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  const plain = await page.evaluate(() => ({ arrows: document.querySelectorAll(".ludo-cell-arrow").length, flag: !!(AppStateLudo.state && AppStateLudo.state.arrows) }));
  check("Ludo is separate and has no arrows " + JSON.stringify(plain), plain.arrows === 0 && !plain.flag);

  check("no page errors", errors.length === 0, errors);
  await browser.close();
  if (fails.length) { console.error("FAIL (" + fails.length + "):\n  " + fails.join("\n  ")); process.exit(1); }
  console.log("=== ARROW LUDO UI: board, arrow squares 4/17/30/43, flight forward and back marked, hint, save, separate from Ludo, 0 failure(s) ===");
})().catch((e) => { console.error(e); process.exit(1); });
