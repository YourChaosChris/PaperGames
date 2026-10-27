#!/usr/bin/env node
// "Who Took the Cake?" in the browser (task 146, rules 3), German page at
// 360 x 640:
//   - old saves (rules 1: one per row and column, furniture, window; rules
//     2: the cake as a placed piece) are dropped quietly: a new puzzle on
//     the saved level starts, no page error, the statistics stay;
//   - the board has 5 x 5 cells on Easy, the cake is shown on its cell from
//     the start and cannot be changed, there is no cake button, no
//     furniture and no window, cells and buttons at least 44 px, no
//     horizontal scrolling at 360 and 600 px (also 7 x 7 on Hard);
//   - "Immer gilt" shows the four rules, the clues are German sentences
//     without raw keys, a people theme says "Personen";
//   - the Hint button sets the animals one by one with a reason; the last
//     one solves the puzzle, names the animal next to the cake and counts
//     a win.
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
  check("old save replaced by a new medium puzzle: " + JSON.stringify({ rules: after.rules, n: after.n, level: after.level }), after.rules === 3 && after.n === 6 && after.level === "medium" && after.placed === 0);
  check("new puzzle saved with rules 3", after.saved && after.saved.puzzle && after.saved.puzzle.rules === 3);
  check("statistics kept", after.stats === 3);

  // A save of rules 2 (4x4, three animals and the cake as the fourth piece).
  await page.evaluate(() => {
    localStorage.setItem("einkchess_save_cake", JSON.stringify({
      level: "hard",
      puzzle: { n: 4, rules: 2, rooms: [0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2], roomNames: ["kitchen", "garden", "hall"],
        clues: [{ t: "steps", a: 0, d: 3 }, { t: "size", a: 3, size: 8 }], solution: [0, 3, 13, 9] },
      placed: [0, -1, -1, -1], crosses: [], cluesDone: [false, false], hinted: false
    }));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  const after2 = await page.evaluate(() => ({ rules: AppStateCake.puzzle && AppStateCake.puzzle.rules, n: AppStateCake.puzzle && AppStateCake.puzzle.n, level: AppStateCake.level,
    cells: document.querySelectorAll("#cake-board .cake-cell").length, overflow: document.documentElement.scrollWidth > window.innerWidth }));
  check("rules 2 save replaced by a new hard puzzle: " + JSON.stringify(after2), after2.rules === 3 && after2.n === 7 && after2.level === "hard" && after2.cells === 49);
  check("no horizontal scrolling at 360 px on 7x7", !after2.overflow);

  // A fresh easy puzzle.
  if (!(await page.isVisible("#start-cake-game"))) await page.click("#menu-toggle");
  await page.selectOption("#cake-level-inline", "easy");
  await page.click("#start-cake-game");
  await page.waitForTimeout(300);
  const board = await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll("#cake-board .cake-cell"));
    const picks = Array.from(document.querySelectorAll("#cake-palette .cake-pick"));
    const p = AppStateCake.puzzle;
    const cakeCell = document.querySelector('#cake-board .cake-cell[data-index="' + p.cake + '"]');
    return {
      cells: cells.length,
      picks: picks.length,
      animals: p.solution.length,
      cakeShown: !!cakeCell.querySelector(".cake-thing svg") && /Kuchen/.test(cakeCell.getAttribute("aria-label")),
      cakeCells: cells.filter((c) => /Kuchen/.test(c.getAttribute("aria-label"))).length,
      minCell: Math.min.apply(null, cells.map((c) => c.getBoundingClientRect().height)),
      minPick: Math.min.apply(null, picks.map((c) => c.getBoundingClientRect().height)),
      furn: document.querySelectorAll(".cake-furn").length,
      win: !!document.getElementById("cake-window"),
      always: Array.from(document.querySelectorAll("#cake-always li")).map((li) => li.textContent),
      clues: Array.from(document.querySelectorAll("#cake-clues .cake-clue")).map((b) => b.textContent),
      overflow: document.documentElement.scrollWidth > window.innerWidth
    };
  });
  check("25 cells on Easy", board.cells === 25);
  check("3 animals on Easy and buttons for them and X only: " + board.picks, board.animals === 3 && board.picks === 4);
  check("cake shown on exactly one cell from the start", board.cakeShown && board.cakeCells === 1);
  check("cells at least 44 px: " + board.minCell, board.minCell >= 44);
  check("buttons at least 44 px: " + board.minPick, board.minPick >= 44);
  check("no furniture, no window", board.furn === 0 && !board.win);
  check("always box: " + board.always.join(" | "), board.always.length === 4 && board.always[0].startsWith("In jedem Raum steht genau ein Tier") && /schräg/.test(board.always[2]) && /direkt neben dem Kuchen/.test(board.always[3]));
  check("clues German, no raw key: " + board.clues.join(" | "), board.clues.length >= 3 && board.clues.every((c) => !/cake_|[{}]/.test(c) && /Kästchen|weiter|Schritte|Wand/.test(c)));
  check("no horizontal scrolling at 360 px", !board.overflow);

  // The cake's cell cannot be changed, not even with X.
  const cakeAt = await page.evaluate(() => AppStateCake.puzzle.cake);
  await page.click('#cake-palette .cake-pick[data-tool="x"]');
  await page.click('#cake-board .cake-cell[data-index="' + cakeAt + '"]', { force: true });
  await page.click('#cake-palette .cake-pick[data-tool="0"]');
  await page.click('#cake-board .cake-cell[data-index="' + cakeAt + '"]', { force: true });
  const untouched = await page.evaluate(() => ({ crosses: AppStateCake.crosses.length, placed: AppStateCake.placed.filter((x) => x >= 0).length }));
  check("cake cell ignores taps: " + JSON.stringify(untouched), untouched.crosses === 0 && untouched.placed === 0);

  // Hints: every animal but the last one with a reason, the last one solves.
  const m = await page.evaluate(() => AppStateCake.puzzle.solution.length);
  for (let i = 0; i < m - 1; i++) {
    await page.click("#hint-btn");
    const s = await page.evaluate(() => document.getElementById("board-info").textContent);
    check("hint " + (i + 1) + " names a square and a reason: " + s, /Zeile \d, Spalte \d/.test(s) && /gehört hierhin/.test(s));
  }
  // The last animal by hand.
  const lastOne = await page.evaluate(() => { const p = AppStateCake.puzzle; const k = p.solution.findIndex((c, i) => AppStateCake.placed[i] !== c); return { k, cell: p.solution[k] }; });
  await page.click('#cake-palette .cake-pick[data-tool="' + lastOne.k + '"]');
  await page.click('#cake-board .cake-cell[data-index="' + lastOne.cell + '"]');
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
