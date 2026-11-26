#!/usr/bin/env node
// Three Grids in the browser, English page at 360 x 640 (and 600 wide).
// Two players: tap a card, the free fields with its number light up, tap
// one; tap the card again to put it back; a free field whose number lies
// open can be tapped at once; a field whose number is not open is disabled.
// A line wins a grid (frame, line marked, title), two grids end the game.
// Undo, save and load after a reload, Hint (card and field), Random side,
// and against the computer a whole game on each level ends with a result.
// Fields and cards at least 44 px, no sideways scroll at 360 and 600 px,
// no page error, no key names.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
  await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "dreitafeln.html?lang=en", { waitUntil: "load" });
  await page.waitForTimeout(500);
  const status = () => page.evaluate(() => document.getElementById("board-info").textContent);
  const S = () => page.evaluate(() => AppStateDreitafeln.state);
  const setPos = (pos) => page.evaluate((p) => {
    const st = DreitafelnCore.createInitialState();
    st.boards = p.boards.map((b) => b.split("").map((c) => (c === "." ? null : c)));
    st.won = p.won || [null, null, null];
    st.lines = p.lines || [null, null, null];
    st.open = p.open; st.deck = p.deck; st.turn = p.turn;
    AppStateDreitafeln.selected = null;
    setStateDreitafeln(st);
    updateDreitafelnBoard();
    updateGameLabelsDreitafeln();
  }, pos);

  // A first visit starts a game against the computer at once (quick-rules.js).
  check("a first visit starts a game", await page.evaluate(() => document.getElementById("board-placeholder").classList.contains("hidden") && AppStateDreitafeln.mode === "offline-ai"));
  await page.evaluate(() => document.getElementById("mode-offline").click());
  await page.waitForTimeout(200);
  check("three grids of nine fields, three cards " + await page.$$eval(".dt-cell", (e) => e.length),
    (await page.$$eval(".dt-grid", (e) => e.length)) === 3 && (await page.$$eval(".dt-cell", (e) => e.length)) === 27 && (await page.$$eval(".dt-card", (e) => e.length)) === 3);
  check("X starts " + await status(), /^X to move/.test(await status()));
  check("stack line", /Cards in the stack: 24/.test(await page.textContent("#dt-stack")));

  // Fixed position: cards 3, 5, 3; X has 1 and 2 on grid 1.
  await setPos({ boards: ["xx.......", ".........", "........."], open: [3, 5, 3], deck: [7, 8, 9, 1], turn: "x" });
  const enabled = await page.$$eval(".dt-cell:not([disabled])", (e) => e.map((c) => c.dataset.board + c.dataset.cell).join());
  check("only free fields 3 and 5 are tappable " + enabled, enabled === "02,04,12,14,22,24");
  await page.click('.dt-card[data-slot="2"]');
  const fit = await page.$$eval(".dt-fit", (e) => e.map((c) => c.dataset.board + c.dataset.cell).join());
  check("card 3 lights the free 3s " + fit, fit === "02,12,22");
  check("status names the card " + await status(), /Card 3/.test(await status()));
  check("chosen card pressed", await page.evaluate(() => document.querySelector('.dt-card[data-slot="2"]').getAttribute("aria-pressed") === "true"));
  await page.click('.dt-card[data-slot="2"]');
  check("tapping the card again puts it back", (await page.$$eval(".dt-fit", (e) => e.length)) === 0 && (await page.evaluate(() => AppStateDreitafeln.selected)) === null);
  await page.click('.dt-card[data-slot="2"]');
  await page.click('.dt-cell[data-board="0"][data-cell="2"]');
  const a = await S();
  check("X wins grid 1, the tapped card is replaced " + JSON.stringify(a.open), a.won[0] === "x" && a.turn === "o" && a.open.join() === "3,5,7" && !a.result);
  check("won grid marked", await page.evaluate(() => document.querySelector('.dt-grid[data-grid="0"]').classList.contains("dt-grid-won") &&
    /won by X/.test(document.querySelector('.dt-grid[data-grid="0"] .dt-grid-title').textContent) && document.querySelectorAll(".dt-winline").length === 3));
  check("score and last move " + await page.textContent("#game-label") + " / " + await page.textContent("#game-meta"),
    /X 1 – O 0/.test(await page.textContent("#game-label")) && /X took 3 and wins grid 1/.test(await page.textContent("#game-meta")) &&
    (await page.$$eval(".dt-cell.lm-to", (e) => e.map((c) => c.dataset.board + c.dataset.cell).join())) === "02");
  // Direct tap: O taps the free 5 on grid 1 (the won grid stays open).
  await page.click('.dt-cell[data-board="0"][data-cell="4"]');
  check("direct tap on a field whose number is open", (await S()).boards[0][4] === "o" && (await S()).turn === "x" && (await S()).won[0] === "x");
  // Undo in two-player mode takes back one move.
  await page.click("#undo-btn");
  check("undo one move", (await S()).boards[0][4] === null && (await S()).turn === "o");

  // Reload: the running game comes back.
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  check("game back after reload", await page.evaluate(() => AppStateDreitafeln.state.won[0] === "x" && AppStateDreitafeln.turn === "o" && document.querySelectorAll(".dt-cell").length === 27 && !document.getElementById("undo-btn").disabled));

  // Hint marks a card and a field of that number.
  await page.click("#dreitafeln-hint");
  const h = await page.evaluate(() => {
    const marks = Array.from(document.querySelectorAll(".mh-mark"));
    const card = marks.find((m) => m.classList.contains("dt-card"));
    const cell = marks.find((m) => m.classList.contains("dt-cell"));
    return { n: marks.length, card: card && card.dataset.n, cell: cell && Number(cell.dataset.cell) + 1, legal: DreitafelnCore.isLegalMove(AppStateDreitafeln.state, MoveHint.last().move) };
  });
  check("hint marks a card and its field " + JSON.stringify(h), h.n === 2 && Number(h.card) === h.cell && h.legal);

  // Two grids end the game.
  await setPos({ boards: ["xxx......", "x.x......", "o........"], won: ["x", null, null], lines: [[0, 1, 2], null, null], open: [2, 6, 9], deck: [4], turn: "x" });
  await page.click('.dt-cell[data-board="1"][data-cell="1"]');
  const w = await page.evaluate(() => ({ over: AppStateDreitafeln.gameOver, res: AppStateDreitafeln.state.result, text: document.getElementById("game-result").textContent }));
  check("X wins with two grids " + JSON.stringify(w), w.over && w.res.winner === "x" && /X wins two grids/.test(w.text));
  check("fields locked after the end", (await page.$$eval(".dt-cell:not([disabled]), .dt-card:not([disabled])", (e) => e.length)) === 0);
  await page.evaluate(() => { const m = document.querySelector("#result-modal-overlay button"); if (m) m.click(); });

  // Sizes and no sideways scroll at 360 and 600 px.
  for (const width of [360, 600]) {
    await page.setViewportSize({ width: width, height: 800 });
    await page.waitForTimeout(150);
    const sz = await page.evaluate(() => {
      const small = Array.from(document.querySelectorAll(".dt-cell, .dt-card, #board-actions button:not(.hidden)")).filter((c) => { const r = c.getBoundingClientRect(); return r.width < 44 || r.height < 44; });
      return { small: small.length, scroll: document.documentElement.scrollWidth - innerWidth };
    });
    check("width " + width + ": all at least 44 px, no sideways scroll " + JSON.stringify(sz), sz.small === 0 && sz.scroll <= 0);
  }
  await page.setViewportSize({ width: 360, height: 640 });

  // Random side: the human gets X or O and the start line says chance decided.
  await page.evaluate(() => document.getElementById("mode-offline-ai").click());
  await page.evaluate(() => { document.querySelector("input[name='dreitafeln-color'][value='random']").checked = true; document.getElementById("dreitafeln-level-inline").value = "1"; document.getElementById("start-dreitafeln-game").click(); });
  await page.waitForTimeout(100);
  const rnd = await page.evaluate(() => ({ h: AppStateDreitafeln.humanColor, t: document.getElementById("offline-dreitafeln-status").textContent }));
  check("random side " + JSON.stringify(rnd), (rnd.h === "x" || rnd.h === "o") && /^Chance decided: you play [XO]/.test(rnd.t));

  // Against the computer, every level: a whole game ends; the human plays O
  // on Medium so the computer opens there.
  for (const level of ["1", "2", "3"]) {
    const side = level === "2" ? "o" : "x";
    await page.evaluate(() => document.getElementById("mode-offline-ai").click());
    await page.evaluate(([lv, sd]) => {
      document.querySelector("input[name='dreitafeln-color'][value='" + sd + "']").checked = true;
      document.getElementById("dreitafeln-level-inline").value = lv;
      document.getElementById("start-dreitafeln-game").click();
    }, [level, side]);
    let steps = 0;
    let undone = false;
    while (steps < 200) {
      const s = await page.evaluate(() => ({ over: AppStateDreitafeln.gameOver, mine: AppStateDreitafeln.turn === AppStateDreitafeln.humanColor, moves: AppStateDreitafeln.state.moves || 0 }));
      if (s.over) break;
      if (!s.mine) { await page.waitForTimeout(30); continue; }
      if (level === "1" && !undone && s.moves >= 2) {
        undone = true;
        check("your turn shown " + await status(), /^Your turn/.test(await status()));
        const before = s.moves;
        await page.click("#undo-btn");
        const after = await page.evaluate(() => ({ moves: AppStateDreitafeln.state.moves || 0, mine: AppStateDreitafeln.turn === AppStateDreitafeln.humanColor }));
        check("undo against the computer goes back to your own move " + JSON.stringify(after), after.mine && after.moves === before - 2);
        continue;
      }
      // Take the first card, then the first field it lights up.
      await page.click(".dt-card:not([disabled])");
      await page.click(".dt-cell.dt-fit:not([disabled])");
      steps++;
    }
    const end = await page.evaluate(() => ({ over: AppStateDreitafeln.gameOver, side: AppStateDreitafeln.humanColor, shown: !!document.getElementById("game-result").textContent, res: AppStateDreitafeln.state.result }));
    check("level " + level + " game ends " + JSON.stringify(end), end.over && end.shown && !!end.res && end.side === side);
    await page.evaluate(() => { const m = document.querySelector("#result-modal-overlay button"); if (m) m.click(); });
  }
  check("no key names in the page", await page.evaluate(() => !/\b(dt_|dreitafeln_|msg_t_)/.test(document.body.innerText)));
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log(`=== DREITAFELN UI: card choice, fitting fields, direct tap, grid won, two grids win, undo, reload, hint, random side, sizes at 360 and 600 px, three levels played out, ${fails.length} failure(s) ===`);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
