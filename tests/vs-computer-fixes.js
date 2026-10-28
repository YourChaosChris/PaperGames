#!/usr/bin/env node
// Task 162 (fixes from the proposals of 23, 24 and 28 October), German pages
// at 360 x 640 unless said otherwise:
// - Resign while the computer is to move: in all 22 games the computer wins
//   (the result says so), not the person who gave up.
// - Go as White: Undo right after the computer's first move lets the
//   computer move again instead of leaving the game stuck.
// - Nim: Undo stays off while the person has not moved yet (computer
//   begins); rule, heaps and "who starts" come back after a reload, also
//   from an old save without them.
// - Tic-Tac-Toe: "Your turn." is not followed by "Player 1 to move."
// - Backgammon, 2 players: a double is answered with two buttons on the
//   page (German), no browser dialog; Decline ends the game, Accept doubles.
// - Chess online without an account: a German line in the status, no dialog.
// - Minesweeper: the clock's unit is translated.
// - "Report an idea or bug": browser, window size and a version also
//   without a service worker.
// - Footer links 44 px are checked in tap-targets.js; here: the game
//   switcher ends a long name in "…", category names hyphenate.
const { chromium } = require("playwright");
const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 && process.argv[argBase + 1]) || process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

const RESIGN = {
  sternhalma: "AppStateSternhalma", xiangqi: "AppStateXiangqi", marblepush: "AppStateMarblePush", reversi: "AppStateReversi",
  shogi: "AppStateShogi", ur: "AppStateUr", mancala: "AppStateMancala", morris: "AppStateMorris", wallmaze: "AppStateWallMaze",
  go: "AppStateGo", gomoku: "AppStateGomoku", senet: "AppStateSenet", tablut: "AppStateTablut", surakarta: "AppStateSurakarta",
  backgammon: "AppStateBackgammon", hnefatafl: "AppStateHnefatafl", checkers: "AppStateCheckers", fanorona: "AppStateFanorona",
  halma: "AppStateHalma", fourinarow: "AppStateFourInARow", amazons: "AppStateAmazons", hex: "AppStateHex"
};
const RED_BLACK = ["xiangqi", "hex"];
const A_B = ["mancala", "senet"];

(async () => {
  const browser = await chromium.launch();
  const newPage = async (opts) => {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" }, opts || {}));
    const page = await ctx.newPage();
    page.errors = [];
    page.dialogs = [];
    page.on("pageerror", (e) => page.errors.push(e.message));
    page.on("dialog", (d) => { page.dialogs.push(d.message()); d.accept(); });
    await page.addInitScript(() => { try { if (!localStorage.getItem("papergames_ai_pacing")) localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) {} });
    return { ctx, page };
  };
  const errors = [];

  // 1. Resign while the computer is to move.
  for (const [slug, name] of Object.entries(RESIGN)) {
    const { ctx, page } = await newPage();
    await page.goto(BASE + slug + ".html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    const res = await page.evaluate(([name, rb, ab]) => {
      const A = (0, eval)(name);
      const human = A.humanColor !== undefined ? A.humanColor : A.humanSide;
      const other = rb ? (human === "r" ? "b" : "r") : ab ? (human === "a" ? "b" : "a")
        : ({ b: "w", w: "b", p1: "p2", p2: "p1", attacker: "defender", defender: "attacker" })[human];
      A.mode = "offline-ai";
      A.gameOver = false;
      A.turn = other;
      const btn = document.getElementById("resign-button");
      if (!btn) return { error: "no resign button" };
      btn.click();
      const modal = document.querySelector("#result-modal-overlay .result-modal");
      return { human, other, over: A.gameOver, cls: modal ? modal.className : "", info: (document.getElementById("game-result") || {}).textContent };
    }, [name, RED_BLACK.includes(slug), A_B.includes(slug)]);
    check(`${slug}: resigning on the computer's turn must lose ${JSON.stringify(res)}`, !res.error && res.over === true && /result-modal-loss/.test(res.cls));
    errors.push(...page.errors.map((e) => slug + ": " + e));
    await ctx.close();
  }

  // 2. Go as White: Undo after the computer's first move.
  {
    const { ctx, page } = await newPage();
    await page.goto(BASE + "go.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    const waitHuman = () => page.waitForFunction(() => AppStateGo.gameOver || AppStateGo.turn === AppStateGo.humanColor, null, { timeout: 30000 });
    await page.click('#go-setup .go-pick[data-color="w"]');
    await waitHuman();
    let st = await page.evaluate(() => ({ moves: AppStateGo.moveCount, turn: AppStateGo.turn, undo: !document.getElementById("undo-btn").disabled }));
    check("Go: White, the computer opened " + JSON.stringify(st), st.moves === 1 && st.turn === "w" && st.undo);
    await page.click("#undo-btn");
    await page.waitForFunction(() => AppStateGo.moveCount === 1 && AppStateGo.turn === "w", null, { timeout: 15000 }).catch(() => {});
    st = await page.evaluate(() => ({ moves: AppStateGo.moveCount, turn: AppStateGo.turn, info: document.getElementById("board-info").textContent }));
    check("Go: after Undo the computer moves again " + JSON.stringify(st), st.moves === 1 && st.turn === "w");
    // A real move, then Resign at once while the computer still thinks (slow pacing).
    await page.evaluate(() => localStorage.setItem("papergames_ai_pacing", "slow"));
    const free = await page.evaluate(() => { const p = Array.from(document.querySelectorAll("#go-grid .go-point")).find((x) => !x.querySelector(".go-stone-black, .go-stone-white")); return p ? [p.dataset.row, p.dataset.col] : null; });
    await page.click(`#go-grid .go-point[data-row="${free[0]}"][data-col="${free[1]}"]`);
    const mid = await page.evaluate(() => ({ turn: AppStateGo.turn, human: AppStateGo.humanColor }));
    await page.evaluate(() => document.getElementById("resign-button").click());
    const end = await page.evaluate(() => ({ over: AppStateGo.gameOver, cls: document.querySelector("#result-modal-overlay .result-modal").className, info: document.getElementById("board-info").textContent + " " + document.getElementById("game-result").textContent }));
    check("Go: resign while the computer thinks " + JSON.stringify([mid, end]), mid.turn !== mid.human && end.over && /result-modal-loss/.test(end.cls) && !/Du gewinnst/.test(end.info));
    errors.push(...page.errors.map((e) => "go: " + e));
    await ctx.close();
  }

  // 3. Nim.
  {
    const { ctx, page } = await newPage();
    await page.goto(BASE + "nim.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      document.getElementById("nim-first").value = "computer";
      document.getElementById("nim-rule").value = "misere";
      document.getElementById("nim-heaps").value = "classic";
      document.getElementById("start-nim-game").click();
    });
    await page.waitForFunction(() => AppStateNim.state && AppStateNim.state.last, null, { timeout: 15000 });
    const n1 = await page.evaluate(() => ({ undo: document.getElementById("undo-btn").disabled, stack: AppStateNim.undoStack.length }));
    check("Nim: computer began, Undo stays off " + JSON.stringify(n1), n1.undo === true && n1.stack === 1);
    await page.evaluate(() => undoNim());
    const n2 = await page.evaluate(() => ({ last: !!AppStateNim.state.last, stack: AppStateNim.undoStack.length }));
    check("Nim: Undo before an own move does nothing " + JSON.stringify(n2), n2.last && n2.stack === 1);
    await page.goto(BASE + "nim.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    const n3 = await page.evaluate(() => ({ rule: document.getElementById("nim-rule").value, heaps: document.getElementById("nim-heaps").value, first: document.getElementById("nim-first").value, misere: AppStateNim.state.misere }));
    check("Nim: menu after reload " + JSON.stringify(n3), n3.rule === "misere" && n3.heaps === "classic" && n3.first === "computer" && n3.misere === true);
    // An old save (before v276) without the menu choices.
    await page.evaluate(() => localStorage.setItem("einkchess_save_nim", JSON.stringify({ mode: "ai", level: 2, computer: 1, state: { heaps: [3, 4, 5], start: [3, 4, 5], misere: true, turn: 0, over: false, last: null, winner: null }, undoStack: [] })));
    await page.goto(BASE + "nim.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    const n4 = await page.evaluate(() => ({ rule: document.getElementById("nim-rule").value, heaps: document.getElementById("nim-heaps").value }));
    check("Nim: old save shows its rule " + JSON.stringify(n4), n4.rule === "misere" && n4.heaps === "small");
    errors.push(...page.errors.map((e) => "nim: " + e));
    await ctx.close();
  }

  // 4. Tic-Tac-Toe status line.
  {
    const { ctx, page } = await newPage();
    await page.goto(BASE + "tictactoe.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    const mode = await page.evaluate(() => AppStateTicTacToe.mode);
    if (mode === "offline-ai") {
      await page.waitForFunction(() => AppStateTicTacToe.state.turn === AppStateTicTacToe.humanPlayer, null, { timeout: 15000 });
      await page.evaluate(() => { const c = Array.from(document.querySelectorAll(".ttt-cell")).find((b) => !b.textContent.trim() && !b.querySelector("svg")); c.click(); });
      await page.waitForFunction(() => AppStateTicTacToe.gameOver || AppStateTicTacToe.state.turn === AppStateTicTacToe.humanPlayer, null, { timeout: 15000 });
      const info = await page.textContent("#board-info");
      check("Tic-Tac-Toe: no second turn sentence: " + info, /Du bist dran/.test(info) && !/am Zug/.test(info));
    } else check("Tic-Tac-Toe starts against the computer: " + mode, false);
    await ctx.close();
  }

  // 5. Backgammon, 2 players: the double on the page.
  for (const answer of ["decline", "accept"]) {
    const { ctx, page } = await newPage();
    await page.goto(BASE + "backgammon.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    // "Two players" starts a 2-player game at once.
    await page.evaluate(() => document.getElementById("mode-offline").click());
    await page.waitForTimeout(300);
    const dialogsBefore = page.dialogs.length;
    await page.click("#backgammon-double-button");
    const q = await page.evaluate(() => {
      const box = document.getElementById("backgammon-double-offer");
      const r = (id) => document.getElementById(id).getBoundingClientRect();
      return { shown: !box.classList.contains("hidden"), text: document.getElementById("backgammon-double-question").textContent, acc: r("backgammon-double-accept").height, dec: r("backgammon-double-decline").height, label: document.getElementById("backgammon-double-decline").textContent, roll: document.getElementById("backgammon-roll-button").disabled };
    });
    check("Backgammon: double offer on the page in German " + JSON.stringify(q), q.shown && /Verdopplung auf 2 annehmen\?/.test(q.text) && /Ablehnen/.test(q.label) && q.acc >= 43.5 && q.dec >= 43.5 && q.roll === true);
    check("Backgammon: no browser dialog for the double", page.dialogs.length === dialogsBefore);
    if (!q.shown) { await ctx.close(); continue; }
    await page.click("#backgammon-double-" + answer);
    const after = await page.evaluate(() => ({ over: AppStateBackgammon.gameOver, cube: AppStateBackgammon.cubeValue, hidden: document.getElementById("backgammon-double-offer").classList.contains("hidden") }));
    if (answer === "decline") check("Backgammon: Decline ends the game " + JSON.stringify(after), after.over && after.hidden);
    else check("Backgammon: Accept doubles the cube " + JSON.stringify(after), !after.over && after.cube === 2 && after.hidden);
    errors.push(...page.errors.map((e) => "backgammon: " + e));
    await ctx.close();
  }

  // 6. Chess online without an account.
  {
    const { ctx, page } = await newPage();
    await page.goto(BASE + "chess.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    await page.evaluate(() => { document.getElementById("mode-online").click(); document.getElementById("start-seek-button").click(); });
    await page.waitForTimeout(200);
    const text = await page.textContent("#online-status");
    check("Chess online: German hint in the status, no dialog: " + text + " / " + page.dialogs.join("|"), /Online-Konto/.test(text) && page.dialogs.length === 0);
    const prompt = await page.evaluate(() => I18n.t("lichess_token_prompt"));
    check("Chess online: the connect question is German", /Berechtigung 'board:play'/.test(prompt));
    await ctx.close();
  }

  // 7. Minesweeper clock unit, report link, game switcher.
  {
    const { ctx, page } = await newPage();
    await page.goto(BASE + "minesweeper.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    const t = await page.evaluate(() => { setStatusMinesweeper("minesweeper-timer", "⏱ 12s"); return document.getElementById("minesweeper-timer").textContent; });
    check("Minesweeper clock in German: " + t, t === "⏱ 12 s");
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage();
    await page.goto(BASE + "go.html?lang=de", { waitUntil: "load" });
    await page.waitForFunction(() => { const a = document.getElementById("report-link"); return a && !/Version%3A%20unknown/.test(a.href); }, null, { timeout: 8000 }).catch(() => {});
    const body = await page.evaluate(() => decodeURIComponent(document.getElementById("report-link").href.split("&body=")[1] || ""));
    check("Report link names browser, window size and version: " + body.replace(/\n/g, " | "), /Browser: Mozilla/.test(body) && /Screen: 360 x 640/.test(body) && /Version: papergames-cache-v\d+/.test(body));
    const sel = await page.evaluate(() => { const s = document.querySelector(".game-select"); return s ? getComputedStyle(s).textOverflow : "none"; });
    check("Game switcher ends long names in an ellipsis: " + sel, sel === "ellipsis");
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage({ viewport: { width: 600, height: 800 } });
    await page.goto(BASE + "index.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    const h = await page.evaluate(() => { const n = document.querySelector(".category-tile-name"); return n ? { hy: getComputedStyle(n).hyphens || getComputedStyle(n).webkitHyphens, wrap: getComputedStyle(n).overflowWrap } : null; });
    check("Category names hyphenate instead of breaking anywhere: " + JSON.stringify(h), h && h.hy === "auto" && h.wrap !== "anywhere");
    await ctx.close();
  }

  check("no page errors: " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((x) => console.log("FAIL " + x));
  console.log("=== VS COMPUTER FIXES (task 162): resign in " + Object.keys(RESIGN).length + " games, Go undo, Nim, Tic-Tac-Toe, Backgammon double, chess online, Minesweeper, report link; " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
