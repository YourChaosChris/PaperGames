#!/usr/bin/env node
// Checkers in the browser (task 179), German page at 360 x 640 with touch:
//   - The settings have "Regeln: Englische Regeln / Deutsche Regeln",
//     English by default; the choice is kept after a reload.
//   - A new game uses the chosen rules (label above the board), the save
//     carries them and a reload goes on under the same rules.
//   - Changing the rules in a running game asks first: "no" keeps the game
//     and puts the choice back, "yes" starts a new game under the new rules.
//   - An old save without rules loads as English rules.
//   - German rules: a flying king with three capture paths to the same
//     square shows "Mehrere Schlagwege ..." and tapping a piece of one
//     path plays exactly that path.
//   - A few moves against the computer (German rules) without page error.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

const sqSel = (r, c) => '.checkers-square[data-row="' + r + '"][data-col="' + c + '"]';
const state = (page) => page.evaluate(() => ({
  rules: AppStateCheckers.rules, moves: AppStateCheckers.moveCount, mode: AppStateCheckers.mode,
  select: document.getElementById("checkers-rules").value,
  label: document.getElementById("game-label").textContent.trim(),
  pref: localStorage.getItem("papergames_checkers_rules"),
  save: JSON.parse(localStorage.getItem("einkchess_save_checkers") || "null")
}));

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, serviceWorkers: "block" });
  await ctx.addInitScript(() => { try { localStorage.setItem("papergames_quickrules_seen_checkers", "1"); } catch (e) {} });
  const page = await ctx.newPage();
  const errors = [];
  let answer = true;
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => (answer ? d.accept() : d.dismiss()));
  const openMenu = async () => { if (!(await page.isVisible("#checkers-rules"))) await page.tap("#menu-toggle"); };
  const load = async () => { await page.goto(BASE + "checkers.html?lang=de", { waitUntil: "load" }); await page.waitForTimeout(500); };

  await load();
  await openMenu();
  const opts = await page.$$eval("#checkers-rules option", (os) => os.map((o) => o.value + "=" + o.textContent.trim()));
  check("options in German (" + opts.join(", ") + ")", opts.join("|") === "en=Englische Regeln|de=Deutsche Regeln");
  check("label Regeln:", (await page.textContent('label[for="checkers-rules"]')).trim() === "Regeln:");
  check("default English", (await page.inputValue("#checkers-rules")) === "en");

  await page.selectOption("#checkers-rules", "de");
  check("choice stored", (await page.evaluate(() => localStorage.getItem("papergames_checkers_rules"))) === "de");
  await load();
  await openMenu();
  check("choice kept after reload", (await page.inputValue("#checkers-rules")) === "de");

  await page.tap("#mode-offline");
  await page.waitForTimeout(200);
  let s = await state(page);
  check("new game under German rules (" + s.rules + ", label " + s.label + ")", s.rules === "de" && s.label === "Deutsche Regeln");

  await page.tap(sqSel(2, 1));
  await page.tap(sqSel(3, 2));
  await page.waitForTimeout(200);
  s = await state(page);
  check("move played and saved with rules (" + s.moves + ", " + (s.save && s.save.rules) + ")", s.moves === 1 && s.save && s.save.rules === "de");

  await load();
  s = await state(page);
  check("reload goes on under German rules", s.rules === "de" && s.moves === 1 && s.select === "de");

  answer = false;
  await openMenu();
  await page.selectOption("#checkers-rules", "en");
  await page.waitForTimeout(200);
  s = await state(page);
  check("'no' keeps the game and the choice (" + JSON.stringify([s.rules, s.moves, s.select, s.pref]) + ")",
    s.rules === "de" && s.moves === 1 && s.select === "de" && s.pref === "de");

  answer = true;
  await openMenu();
  await page.selectOption("#checkers-rules", "en");
  await page.waitForTimeout(200);
  s = await state(page);
  check("'yes' starts a new game under English rules (" + JSON.stringify([s.rules, s.moves, s.label, s.pref, s.mode]) + ")",
    s.rules === "en" && s.moves === 0 && s.label === "Englische Regeln" && s.pref === "en" && s.mode === "offline");

  // An old save from before the rule choice.
  await page.evaluate(() => {
    const b = CheckersCore.createInitialBoard();
    b[2][1] = null; b[3][2] = "b";
    localStorage.setItem("einkchess_save_checkers", JSON.stringify({
      mode: "offline", board: b, turn: "w", lastMove: { from: [2, 1], to: [3, 2] }, humanColor: "b", aiLevel: 0,
      moveCount: 1, movesSinceCapture: 1, captures: { b: 0, w: 0 }, undoStack: []
    }));
    localStorage.setItem("papergames_checkers_rules", "de");
  });
  await load();
  s = await state(page);
  check("old save loads as English (" + JSON.stringify([s.rules, s.moves, s.select]) + ")", s.rules === "en" && s.moves === 1 && s.select === "en");

  // Several capture paths with a flying king. The old game is running, so
  // switching to German rules asks (yes) and starts a new game.
  await openMenu();
  await page.selectOption("#checkers-rules", "de");
  await page.waitForTimeout(200);
  s = await state(page);
  check("switch to German from the old game (" + JSON.stringify([s.rules, s.moves, s.pref]) + ")", s.rules === "de" && s.moves === 0 && s.pref === "de");
  await page.evaluate(() => {
    const b = [];
    for (let r = 0; r < 8; r++) b.push(new Array(8).fill(null));
    b[5][0] = "B"; b[4][1] = "w"; b[3][4] = "w"; b[2][5] = "w"; b[1][6] = "w"; b[5][4] = "w"; b[0][7] = "b";
    AppStateCheckers.board = b;
    AppStateCheckers.turn = "b";
    updateCheckersBoard();
  });
  await page.tap(sqSel(5, 0));
  await page.tap(sqSel(6, 3));
  await page.waitForTimeout(150);
  const msg = (await page.textContent("#board-info")).trim();
  check("choose-path message (" + msg + ")", /Mehrere Schlagwege/.test(msg));
  await page.tap(sqSel(2, 5));
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({ b: AppStateCheckers.board, cap: AppStateCheckers.captures.b, turn: AppStateCheckers.turn }));
  check("tapped path played (" + JSON.stringify([after.b[6][3], after.b[4][1], after.b[2][5], after.b[5][4], after.b[3][4], after.b[1][6], after.cap]) + ")",
    after.b[6][3] === "B" && after.b[5][0] === null && after.b[4][1] === null && after.b[2][5] === null && after.b[5][4] === null &&
    after.b[3][4] === "w" && after.b[1][6] === "w" && after.cap === 3 && after.turn === "w");

  // A few moves against the computer under German rules.
  await openMenu();
  await page.tap("#mode-offline-ai");
  await page.selectOption("#checkers-level-inline", "2");
  await page.check("input[name='checkers-color'][value='black']");
  await page.tap("#start-checkers-game");
  await page.waitForTimeout(300);
  let played = 0;
  for (let i = 0; i < 6; i++) {
    const ok = await page.waitForFunction(() => AppStateCheckers.gameOver ||
      (AppStateCheckers.turn === AppStateCheckers.humanColor), null, { timeout: 30000 }).then(() => true, () => false);
    if (!ok) { fails.push("computer did not answer"); break; }
    const mv = await page.evaluate(() => {
      if (AppStateCheckers.gameOver) return null;
      const m = CheckersCore.getLegalMoves(AppStateCheckers.board, AppStateCheckers.turn, AppStateCheckers.rules);
      const groups = m.filter((x) => x.from + "" === m[0].from + "" && x.to + "" === m[0].to + "");
      return groups.length === 1 ? m[0] : null;
    });
    if (!mv) break;
    await page.tap(sqSel(mv.from[0], mv.from[1]));
    await page.tap(sqSel(mv.to[0], mv.to[1]));
    played++;
  }
  s = await state(page);
  check("vs computer under German rules (" + played + " moves, rules " + s.rules + ")", played >= 3 && s.rules === "de" && s.mode === "offline-ai");

  check("no page error (" + errors.join(" | ") + ")", errors.length === 0);
  await browser.close();
  if (fails.length) {
    console.log("FAIL checkers-ui: " + fails.length + " problem(s)");
    fails.forEach((f) => console.log("  - " + f));
    process.exit(1);
  }
  console.log("OK checkers-ui: rule choice, save, change mid-game, old save, capture-path choice, vs computer");
})().catch((e) => { console.log("FAIL checkers-ui: " + e.message); process.exit(1); });
