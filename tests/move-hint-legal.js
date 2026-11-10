#!/usr/bin/env node
// Task 209: in every strategy game with a Hint button (move-hint.js) the
// hint is a legal move for the side to move, checked against the game's own
// rules, and the hint does not make the move. Two players on one device, so
// the hint is asked for both sides. After each check the hinted move is
// played by tapping the marked cells, and the next position is checked too
// (up to POSITIONS per game, as far as tapping the marks plays the move).
// Run: node tests/move-hint-legal.js [slug ...]
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const POSITIONS = 4;

// Legality of the hinted move m in the page, by the game's own rules.
// same(list, m): some entry of list has the same values for m's fields.
const LEGAL = {
  go: "m.pass || GoCore.tryMove(AppStateGo.board, AppStateGo.size, m.r, m.c, AppStateGo.turn, AppStateGo.koPoint, goHistorySet()).legal",
  hex: "same(HexCore.getLegalMoves(AppStateHex.state), m)",
  reversi: "same(ReversiCore.getLegalMoves(AppStateReversi.board, AppStateReversi.turn), m)",
  gomoku: "!AppStateGomoku.board[m[0]][m[1]]",
  morris: "same(MorrisCore.getLegalMoves(AppStateMorris.state, AppStateMorris.turn), m)",
  // A hint may be a whole capture chain: compare with the full moves.
  fanorona: "same(FanoronaCore.enumerateFullMoves(AppStateFanorona.board, AppStateFanorona.turn), m)",
  surakarta: "same(SurakartaCore.getLegalMoves(AppStateSurakarta.board, AppStateSurakarta.turn), m)",
  fourinarow: "same(FourInARowCore.getLegalMoves(AppStateFourInARow.board, AppStateFourInARow.turn), m)",
  halma: "same(HalmaCore.getLegalMoves(AppStateHalma.state, AppStateHalma.turn), m)",
  hnefatafl: "same(HnefataflCore.getLegalMoves(AppStateHnefatafl.state, AppStateHnefatafl.turn), m)",
  tablut: "same(TablutCore.getLegalMoves(AppStateTablut.state, AppStateTablut.turn), m)",
  sternhalma: "same(SternhalmaCore.getLegalMoves(AppStateSternhalma.state, AppStateSternhalma.turn), m)",
  xiangqi: "same(XiangqiCore.getLegalMoves(AppStateXiangqi.board, AppStateXiangqi.turn), m)",
  amazons: "same(AmazonsCore.getLegalMoves(AppStateAmazons.state, AppStateAmazons.turn), m)",
  mancala: "same(MancalaCore.getLegalMoves(AppStateMancala.state, AppStateMancala.turn), m)",
  dotsandboxes: "DotsAndBoxesCore.isLegalMove(AppStateDotsAndBoxes.state, m)",
  shogi: "m.kind === 'move' ? same(ShogiCore.legalMoves(AppStateShogi.state, AppStateShogi.turn), { from: m.from, to: m.to }) : same(ShogiCore.legalDrops(AppStateShogi.state, AppStateShogi.turn), m)",
  konane: "same(KonaneCore.enumerateFullMoves(AppStateKonane.board, AppStateKonane.turn), m)",
  kleeberg: "KleebergCore.destinations(AppStateKB.state).indexOf(m) !== -1",
  nim: "same(NimCore.legalMoves(AppStateNim.state.heaps), m)",
  chess: "same(AiEngine.generateLegalMoves(AppState.board, AppState.turn), { from: m.from, to: m.to })",
  // Task 210: Blocked Path, hint for the current roll (move) or the captured block.
  blockers: "m.stone !== undefined ? BlockersCore.stoneTargets(AppStateBL.state).indexOf(m.stone) !== -1 : same(BlockersCore.legalMoves(AppStateBL.state), m)"
};
const START = { chess: ["#mode-offline", null], kleeberg: ["#mode-offline", "#start-kb-game"], blockers: ["#mode-offline", "#start-bl-game", "document.getElementById('bl-computers').value = '0'; document.getElementById('bl-computers').dispatchEvent(new Event('change'));"] };
// Dice games: roll first, so there is a move to hint.
const BEFORE = { blockers: "#bl-roll" };

// Konane begins with a ritual (each side removes one stone), in which the
// hint stays quiet; take the first allowed stones like a person would.
async function konaneOpening(page) {
  await page.evaluate(() => {
    const b = KonaneCore.openingRemovalOptions(AppStateKonane.board, "b")[0];
    onKonaneSquareClick(b[0], b[1]);
    const w = KonaneCore.adjacentRemovalOptions(AppStateKonane.board, AppStateKonane.openingBlackCell, "w")[0];
    onKonaneSquareClick(w[0], w[1]);
  });
  await page.waitForTimeout(400);
}

const games = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(LEGAL);
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
let checked = 0;

(async () => {
  const browser = await chromium.launch();
  for (const g of games) {
    const ctx = await browser.newContext({ viewport: { width: 600, height: 1000 }, serviceWorkers: "block" });
    await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    await page.goto(BASE + g + ".html?lang=en", { waitUntil: "load" });
    await page.waitForTimeout(400);
    const [modeSel, startSel, setup] = START[g] || ["#mode-offline", "#start-" + g + "-game"];
    await page.evaluate(([mode, start, setup]) => {
      if (setup) eval(setup);
      const m = document.querySelector(mode);
      if (m) m.click();
      const s = start && document.querySelector(start);
      if (s) s.click();
    }, [modeSel, startSel, setup || ""]);
    await page.waitForTimeout(500);
    const btn = "#" + g + "-hint";
    let n = 0;
    let prevKey = null;
    if (g === "konane") await konaneOpening(page);
    for (let k = 0; k < POSITIONS; k++) {
      if (BEFORE[g]) {
        await page.waitForTimeout(300);
        await page.evaluate((sel) => { const b = document.querySelector(sel); if (b && !b.disabled && b.offsetParent) b.click(); }, BEFORE[g]);
        await page.waitForTimeout(300);
      }
      // Against the computer the button waits for the person's turn.
      const ready = await page.waitForFunction((sel) => { const b = document.querySelector(sel); return b && !b.disabled; }, btn, { timeout: 10000 }).then(() => true).catch(() => false);
      if (!ready) break;
      await page.click(btn);
      await page.waitForTimeout(150);
      const r = await page.evaluate(([expr, prevKey]) => {
        const last = MoveHint.last();
        if (!last || last.move === null) return { none: true };
        if (last.key === prevKey) return { same: true };
        const m = last.move;
        const same = (list, mv) => list.some((x) => {
          if (typeof mv !== "object" || mv === null || Array.isArray(mv)) return JSON.stringify(x) === JSON.stringify(mv);
          const keys = Object.keys(mv).filter((key) => x && x[key] !== undefined);
          return keys.length > 0 && keys.every((key) => JSON.stringify(x[key]) === JSON.stringify(mv[key]));
        });
        let legal = false;
        try { legal = !!eval(expr); } catch (e) { legal = "error: " + e.message; }
        return { legal, move: JSON.stringify(m), marks: document.querySelectorAll(".mh-mark").length, key: last.key };
      }, [LEGAL[g], prevKey]);
      if (r.none) { check(g + ": hint gave no move in position " + (k + 1), false); break; }
      if (r.same) break; // tapping the marks did not finish the move; stop here
      prevKey = r.key;
      check(g + ": hint " + r.move + " is legal in position " + (k + 1) + " (" + r.legal + ")", r.legal === true);
      check(g + ": hint marks cells (" + r.marks + ")", r.marks >= 1);
      n++;
      // The hint itself does not move anything; then play it by tapping the marks.
      // Tap the marks in the order the game gives them (from, to, ...).
      const last = await page.evaluate(() => MoveHint.last());
      for (const sel of (last && last.selectors) || []) {
        const h = await page.$("#" + last.board + " " + sel);
        if (h) await h.click({ force: true, timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(150);
      }
      if (g === "nim") await page.click("#nim-take", { timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    checked += n;
    check(g + ": at least one position checked", n >= 1);
    check(g + ": no page error " + errors.join("|"), errors.length === 0);
    console.log(g + ": " + n + " position(s)");
    await ctx.close();
  }
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("=== MOVE HINT LEGAL: " + games.length + " games, " + checked + " hinted moves, every one legal, 0 failure(s) ===");
})();
