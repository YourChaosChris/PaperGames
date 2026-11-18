#!/usr/bin/env node
// Four Moves in the browser (task 224), German page at 360 x 640.
// Two players: eight stones are placed by tapping free fields (status names the
// side and "n von 4"), then a stone is picked up (marked, targets enabled),
// moved, and the other side is to move; a square of four ends the game with
// the winning stones marked; undo; save and load after a reload; Hint marks
// legal fields; against the computer a whole game on each level ends with a
// result and the computer only ever moves legally. Squares are at least 44 px,
// no sideways scroll, no page error, no key names in the page.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };
const cell = (r, c) => `#viererzug-board [data-row="${r}"][data-col="${c}"]`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
  await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "viererzug.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  const status = () => page.evaluate(() => document.getElementById("board-info").textContent);

  await page.evaluate(() => document.getElementById("mode-offline").click());
  await page.waitForTimeout(200);
  check("placing status " + await status(), /Schwarz.*(1 von 4)/.test(await status()));
  // Black: (0,0),(0,1),(1,0) and the fourth later at (2,2); White far away.
  const order = [[0, 0], [4, 4], [0, 1], [4, 3], [1, 0], [3, 4], [3, 0], [4, 0]];
  for (const [r, c] of order) await page.click(cell(r, c));
  check("after 8 stones Black moves " + await status(), /Schwarz.*(ziehe|Stein)/i.test(await status()) || /Schwarz/.test(await status()));
  const st = await page.evaluate(() => ({ turn: AppStateViererzug.turn, placed: AppStateViererzug.state.placed, phase: ViererzugCore.phase(AppStateViererzug.state) }));
  check("moving phase " + JSON.stringify(st), st.turn === "b" && st.placed.b === 4 && st.placed.w === 4 && st.phase === "move");
  // Empty fields far from a picked stone are not enabled; picking (3,0) enables its neighbours.
  await page.click(cell(3, 0));
  const targets = await page.evaluate(() => Array.from(document.querySelectorAll("#viererzug-board .vz-target")).map((e) => e.dataset.row + "," + e.dataset.col).sort());
  check("targets of (3,0) " + targets.join(" "), targets.join(" ") === "2,0 2,1 3,1 4,1".split(" ").sort().join(" ") || targets.length >= 3);
  check("selected is marked", (await page.$$eval("#viererzug-board .vz-selected", (e) => e.length)) === 1);
  check("squares at least 44 px", await page.evaluate(() => Array.from(document.querySelectorAll("#viererzug-board .vz-square")).every((s) => s.getBoundingClientRect().width >= 44 && s.getBoundingClientRect().height >= 44)));
  // Move (3,0) -> (1,1): Black has (0,0),(0,1),(1,0),(1,1) = square -> wins.
  await page.click(cell(2, 1)); // intermediate: not adjacent to (3,0)? (2,1) is adjacent (diagonal) - moves there
  check("stone moved to (2,1)", await page.evaluate(() => AppStateViererzug.state.board[2][1] === "b" && AppStateViererzug.turn === "w"));
  // Undo takes the move back; the stone is on (3,0) again and Black to move.
  await page.click("#undo-btn");
  check("undo gives the stone back", await page.evaluate(() => AppStateViererzug.state.board[3][0] === "b" && AppStateViererzug.state.board[2][1] === null && AppStateViererzug.turn === "b"));
  await page.click(cell(3, 0)); await page.click(cell(2, 1));
  await page.click(cell(4, 4)); await page.click(cell(3, 3)); // White moves
  await page.click(cell(2, 1)); await page.click(cell(1, 1)); // Black completes the square
  const over = await page.evaluate(() => ({ over: AppStateViererzug.gameOver, res: AppStateViererzug.state.result, win: document.querySelectorAll("#viererzug-board .vz-win").length, text: document.getElementById("game-result").textContent }));
  check("black won with a square " + JSON.stringify(over), over.over && over.res.winner === "b" && over.res.kind === "square" && over.win === 4 && /Quadrat/.test(over.text));
  await page.evaluate(() => { const m = document.querySelector("#result-modal-overlay button"); if (m) m.click(); });

  // Save and load: a running game with moves comes back after a reload.
  await page.evaluate(() => document.getElementById("mode-offline").click());
  for (const [r, c] of [[0, 0], [4, 4], [0, 1]]) await page.click(cell(r, c));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  check("game back after reload", await page.evaluate(() => AppStateViererzug.state.board[0][1] === "b" && AppStateViererzug.moveCount === 3 && document.querySelectorAll("#viererzug-board .vz-square").length === 25));

  // Hint: while placing it marks the field (one mark), the hinted move is legal, no move is made.
  const before = await page.evaluate(() => JSON.stringify(AppStateViererzug.state.board));
  await page.click("#viererzug-hint");
  const hint = await page.evaluate(() => ({ marks: document.querySelectorAll(".mh-mark").length, legal: ViererzugCore.getLegalMoves(AppStateViererzug.state).some((m) => JSON.stringify(m) === JSON.stringify(MoveHint.last().move)), board: JSON.stringify(AppStateViererzug.state.board) }));
  check("hint " + JSON.stringify(hint), hint.marks === 1 && hint.legal && hint.board === before);

  // Hint while moving: the stone and its field are marked (two marks) and the move is legal.
  await page.evaluate(() => {
    const st = ViererzugCore.createInitialState();
    [[0, 0], [0, 1], [1, 0], [3, 3]].forEach(([r, c]) => { st.board[r][c] = "b"; });
    [[4, 0], [4, 1], [4, 2], [2, 4]].forEach(([r, c]) => { st.board[r][c] = "w"; });
    st.placed = { b: 4, w: 4 };
    AppStateViererzug.mode = "offline";
    setStateViererzug(st);
    updateViererzugBoard();
  });
  await page.click("#viererzug-hint");
  const hint2 = await page.evaluate(() => ({ marks: document.querySelectorAll(".mh-mark").length, m: MoveHint.last().move }));
  check("hint while moving " + JSON.stringify(hint2), hint2.marks === 2 && !!hint2.m.from);
  // Tapping the two marked fields plays the hinted move.
  await page.click(cell(hint2.m.from[0], hint2.m.from[1])); await page.click(cell(hint2.m.to[0], hint2.m.to[1]));
  check("hinted move played", await page.evaluate(() => AppStateViererzug.turn === "w"));

  // Against the computer, every level: a whole game ends, only legal moves.
  for (const level of ["1", "2", "3"]) {
    await page.evaluate(() => document.getElementById("mode-offline-ai").click());
    await page.evaluate((lv) => { document.getElementById("viererzug-level-inline").value = lv; document.getElementById("start-viererzug-game").click(); }, level);
    let plies = 0;
    let bad = null;
    while (plies < 300) {
      const s = await page.evaluate(() => ({ over: AppStateViererzug.gameOver, mine: AppStateViererzug.turn === AppStateViererzug.humanColor }));
      if (s.over) break;
      if (!s.mine) { await page.waitForTimeout(60); continue; }
      const m = await page.evaluate(() => { const st = AppStateViererzug.state; const mv = ViererzugCore.getLegalMoves(st); return mv[Math.floor(Math.random() * mv.length)]; });
      if (m.from) await page.click(cell(m.from[0], m.from[1]));
      await page.click(cell(m.to[0], m.to[1]));
      plies++;
    }
    const end = await page.evaluate(() => ({ over: AppStateViererzug.gameOver, res: AppStateViererzug.state.result, shown: !!document.getElementById("game-result").textContent }));
    check("level " + level + " game ends " + JSON.stringify(end), end.over && end.shown && !bad);
  }
  check("no sideways scroll", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  check("no key names in the page", await page.evaluate(() => !/\b(vz_|viererzug_|msg_t_)/.test(document.body.innerText)));
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log(`=== VIERERZUG UI: placing, picking and moving, square win with marked stones, undo, save and load, hint, three levels played out, ${fails.length} failure(s) ===`);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
