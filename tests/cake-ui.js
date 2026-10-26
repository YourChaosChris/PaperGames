#!/usr/bin/env node
// "Who Took the Cake?" in the browser (task 146, rules 2), German page at
// 360 x 640:
//   - an old save (rules 1: one per row and column, furniture, window) is
//     dropped quietly: a new puzzle on the saved level starts, no page
//     error, the statistics stay;
//   - the board has N x N cells, no furniture and no window, cells and
//     buttons at least 44 px, no horizontal scrolling at 360 and 600 px;
//   - "Immer gilt" shows the four new rules, the clues are German
//     sentences without raw keys, a people theme says "Personen";
//   - the Hint button sets the animals one by one with a reason, then says
//     the cake is left; placing the cake solves the puzzle, names the
//     animal next to it and counts a win.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "cake.html?lang=de", { waitUntil: "load" });

  // An old save and some statistics.
  await page.evaluate(() => {
    const rooms = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1];
    const furniture = new Array(16).fill(null);
    furniture[14] = "table";
    localStorage.setItem("einkchess_save_cake", JSON.stringify({
      level: "medium",
      puzzle: { n: 4, rooms, roomNames: ["kitchen", "garden"], furniture, window: { row: 0, side: "left" },
        clues: [{ t: "in", a: 0, room: 0 }, { t: "on", a: 1, f: "chair" }], solution: [1, 7, 8, 14] },
      placed: [1, -1, -1, -1], crosses: [], cluesDone: [false, false], hinted: false
    }));
    localStorage.setItem("einkchess_stats", JSON.stringify({ cake: { wins: 3, losses: 0, draws: 0 } }));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({
    rules: AppStateCake.puzzle && AppStateCake.puzzle.rules, n: AppStateCake.puzzle && AppStateCake.puzzle.n, level: AppStateCake.level,
    placed: AppStateCake.placed.filter((x) => x >= 0).length,
    stats: JSON.parse(localStorage.getItem("einkchess_stats")).cake.wins,
    saved: JSON.parse(localStorage.getItem("einkchess_save_cake") || "null")
  }));
  check("old save replaced by a new medium puzzle: " + JSON.stringify({ rules: after.rules, n: after.n, level: after.level }), after.rules === 2 && after.n === 5 && after.level === "medium" && after.placed === 0);
  check("new puzzle saved with rules 2", after.saved && after.saved.puzzle && after.saved.puzzle.rules === 2);
  check("statistics kept", after.stats === 3);

  // A fresh easy puzzle.
  if (!(await page.isVisible("#start-cake-game"))) await page.click("#menu-toggle");
  await page.selectOption("#cake-level-inline", "easy");
  await page.click("#start-cake-game");
  await page.waitForTimeout(300);
  const board = await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll("#cake-board .cake-cell"));
    const picks = Array.from(document.querySelectorAll("#cake-palette .cake-pick"));
    return {
      cells: cells.length,
      minCell: Math.min.apply(null, cells.map((c) => c.getBoundingClientRect().height)),
      minPick: Math.min.apply(null, picks.map((c) => c.getBoundingClientRect().height)),
      furn: document.querySelectorAll(".cake-furn").length,
      win: !!document.getElementById("cake-window"),
      always: Array.from(document.querySelectorAll("#cake-always li")).map((li) => li.textContent),
      clues: Array.from(document.querySelectorAll("#cake-clues .cake-clue")).map((b) => b.textContent),
      overflow: document.documentElement.scrollWidth > window.innerWidth
    };
  });
  check("16 cells on Easy", board.cells === 16);
  check("cells at least 44 px: " + board.minCell, board.minCell >= 44);
  check("buttons at least 44 px: " + board.minPick, board.minPick >= 44);
  check("no furniture, no window", board.furn === 0 && !board.win);
  check("always box: " + board.always.join(" | "), board.always.length === 4 && board.always[0].startsWith("In jedem Raum steht genau ein Tier") && /schräg/.test(board.always[2]) && /direkt neben dem Kuchen/.test(board.always[3]));
  check("clues German, no raw key: " + board.clues.join(" | "), board.clues.length >= 3 && board.clues.every((c) => !/cake_|[{}]/.test(c) && /Kästchen|weiter|Schritte|Wand/.test(c)));
  check("no horizontal scrolling at 360 px", !board.overflow);

  // Hints: every animal, then the cake is left.
  const n = await page.evaluate(() => AppStateCake.puzzle.n);
  for (let i = 0; i < n - 1; i++) {
    await page.click("#hint-btn");
    const s = await page.evaluate(() => document.getElementById("board-info").textContent);
    check("hint " + (i + 1) + " names a square and a reason: " + s, /Zeile \d, Spalte \d/.test(s) && /gehört hierhin/.test(s));
  }
  await page.click("#hint-btn");
  const last = await page.evaluate(() => document.getElementById("board-info").textContent);
  check("last hint leaves the cake: " + last, /Alle Tiere stehen richtig/.test(last));
  const cakeCell = await page.evaluate(() => AppStateCake.puzzle.solution[AppStateCake.puzzle.n - 1]);
  await page.click('#cake-palette .cake-pick[data-tool="' + (n - 1) + '"]');
  await page.click('#cake-board .cake-cell[data-index="' + cakeCell + '"]');
  await page.waitForTimeout(200);
  const won = await page.evaluate(() => ({
    over: AppStateCake.gameOver,
    text: document.getElementById("game-result").textContent,
    culprit: CakeCore.thingName(AppStateCake.puzzle, CakeCore.culprit(AppStateCake.puzzle), (k) => I18n.t(k)),
    wins: JSON.parse(localStorage.getItem("einkchess_stats")).cake.wins
  }));
  check("solved and culprit named: " + won.text, won.over && won.text.indexOf(won.culprit) !== -1 && /Kuchen genommen/.test(won.text));
  check("win counted: " + won.wins, won.wins === 4);

  // A people theme.
  check("result shown in the modal", await page.isVisible("#result-modal-overlay"));
  await page.evaluate(() => window.ResultModal.hide());
  if (!(await page.isVisible("#cake-motif"))) await page.click("#menu-toggle");
  await page.selectOption("#cake-motif", "family");
  await page.click("#start-cake-game");
  const fam = await page.evaluate(() => Array.from(document.querySelectorAll("#cake-always li")).map((li) => li.textContent).join(" "));
  check("family rules: " + fam, /Zwei Personen/.test(fam) && !/Tier/.test(fam));
  await page.setViewportSize({ width: 600, height: 800 });
  check("no horizontal scrolling at 600 px", !(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)));
  check("no page errors: " + errors.join(" / "), errors.length === 0);

  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("\n=== CAKE UI: 360 px, old save dropped, hints, solve, themes, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
