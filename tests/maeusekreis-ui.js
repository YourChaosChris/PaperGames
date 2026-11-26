#!/usr/bin/env node
// Mouse Ring in the browser, English page at 360 x 640 (and 600 wide).
// Two players: the level picks the board (8/10/12 points), the mouse moves
// first, only the marked points are enabled (the mouse only along the ring,
// the cat also over the dashed lines across), a step is marked, the cat's
// steps left count down, the cat catches the mouse, undo; save and load after
// a reload; Hint marks a legal point and makes no move; against the computer
// as cat and as mouse a whole game on each level ends with a result and the
// right stats. Points at least 44 px, no sideways scroll at 360 and 600 px,
// no page error, no key names in the page.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };
const pt = (i) => `#maeusekreis-board [data-point="${i}"]`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
  await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "maeusekreis.html?lang=en", { waitUntil: "load" });
  await page.waitForTimeout(500);
  const status = () => page.evaluate(() => document.getElementById("board-info").textContent);
  const S = () => page.evaluate(() => AppStateMaeusekreis.state);
  const enabled = () => page.$$eval("#maeusekreis-board .mk-point", (e) => e.filter((b) => !b.disabled).map((b) => +b.dataset.point).sort((a, b) => a - b).join());

  // Two players, each level: the board has 8 / 10 / 12 points, the mouse begins.
  for (const [lv, n] of [["1", 8], ["2", 10], ["3", 12]]) {
    await page.evaluate((v) => { document.getElementById("maeusekreis-level-inline").value = v; document.getElementById("mode-offline").click(); }, lv);
    await page.waitForTimeout(150);
    const s = await S();
    check("level " + lv + ": " + n + " points, mouse first", (await page.$$eval(".mk-point", (e) => e.length)) === n && s.turn === "mouse" && s.level === +lv && /Mouse to move/.test(await status()));
    check("level " + lv + ": cat has exactly enough steps " + s.limit, await page.evaluate(() => { const s = AppStateMaeusekreis.state; return s.limit === MaeusekreisCore.steps(s.level, s.cat, s.mouse, "mouse"); }));
    check("level " + lv + ": points at least 44 px", await page.evaluate(() => Array.from(document.querySelectorAll(".mk-point")).every((b) => b.getBoundingClientRect().width >= 44 && b.getBoundingClientRect().height >= 44)));
    check("level " + lv + ": no sideways scroll at 360", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
    check("level " + lv + ": lines across drawn", (await page.$$eval(".mk-chord", (e) => e.length)) === (lv === "1" ? 2 : 3));
  }

  // A fixed position on level 1 (8 points, lines 0-2 and 4-6): cat at 0, mouse at 3.
  await page.evaluate(() => {
    document.getElementById("maeusekreis-level-inline").value = "1";
    document.getElementById("mode-offline").click();
    const st = AppStateMaeusekreis.state;
    st.cat = 0; st.mouse = 3; st.limit = 6; st.catSteps = 0; st.turn = "mouse"; st.last = null;
    setStateMaeusekreis(st);
    AppStateMaeusekreis.undoStack = [];
    updateMaeusekreisBoard(); updateGameLabelsMaeusekreis(); showPromptMaeusekreis();
  });
  check("mouse targets only on the ring: 2 and 4, got " + await enabled(), await enabled() === "2,4");
  check("cat and mouse drawn", (await page.$$eval('.mk-figure[data-mk-figure="cat"]', (e) => e.length)) === 1 && (await page.$$eval('.mk-figure[data-mk-figure="mouse"]', (e) => e.length)) === 1);
  check("steps left shown", /The cat has 6 steps left/.test(await page.evaluate(() => document.getElementById("game-meta").textContent)));
  await page.click(pt(2));
  check("mouse stepped to 2, cat to move " + await status(), (await S()).mouse === 2 && (await S()).turn === "cat" && /Cat to move/.test(await status()));
  check("cat targets include the line across: 1,2,7, got " + await enabled(), await enabled() === "1,2,7");
  check("last step marked", await page.evaluate(() => document.querySelector('#maeusekreis-board [data-point="3"]').classList.contains("mk-from") && !!document.querySelector(".mk-last-path").getAttribute("d")));
  // Undo takes the mouse step back.
  await page.click("#undo-btn");
  check("undo gives the mouse its point back", (await S()).mouse === 3 && (await S()).turn === "mouse" && await page.evaluate(() => document.getElementById("undo-btn").disabled));
  await page.click(pt(2));
  // Points the cat may not reach are disabled; the cat catches the mouse over the line across.
  check("far points disabled", await page.evaluate(() => document.querySelector('#maeusekreis-board [data-point="5"]').disabled));
  await page.click(pt(2));
  const over = await page.evaluate(() => ({ over: AppStateMaeusekreis.gameOver, res: AppStateMaeusekreis.state.result, text: document.getElementById("game-result").textContent }));
  check("the cat catches the mouse " + JSON.stringify(over), over.over && over.res.winner === "cat" && /cat wins/i.test(over.text));
  await page.evaluate(() => { const m = document.querySelector("#result-modal-overlay button"); if (m) m.click(); });

  // The mouse gets away: the cat's last step misses.
  await page.evaluate(() => {
    document.getElementById("mode-offline").click();
    const st = AppStateMaeusekreis.state;
    st.level = 1; st.cat = 0; st.mouse = 5; st.limit = 1; st.catSteps = 0; st.turn = "cat"; st.last = null;
    setStateMaeusekreis(st);
    buildMaeusekreisBoardDOM(); updateMaeusekreisBoard(); updateGameLabelsMaeusekreis();
  });
  await page.click(pt(1));
  const away = await page.evaluate(() => ({ over: AppStateMaeusekreis.gameOver, res: AppStateMaeusekreis.state.result, text: document.getElementById("game-result").textContent }));
  check("the mouse gets away " + JSON.stringify(away), away.over && away.res.winner === "mouse" && /mouse wins/i.test(away.text));
  await page.evaluate(() => { const m = document.querySelector("#result-modal-overlay button"); if (m) m.click(); });

  // Save and load: a running game with a step comes back after a reload.
  await page.evaluate(() => { document.getElementById("maeusekreis-level-inline").value = "2"; document.getElementById("mode-offline").click(); });
  await page.click("#maeusekreis-board .mk-target");
  const before = await S();
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  const after = await S();
  check("game back after reload", JSON.stringify(after) === JSON.stringify(before) && (await page.$$eval(".mk-point", (e) => e.length)) === 10 && await page.evaluate(() => !document.getElementById("undo-btn").disabled));

  // Hint marks one legal point and makes no move.
  await page.click("#maeusekreis-hint");
  const hint = await page.evaluate(() => ({ marks: document.querySelectorAll(".mh-mark").length, legal: MaeusekreisCore.isLegalMove(AppStateMaeusekreis.state, MoveHint.last().move), same: JSON.stringify(AppStateMaeusekreis.state) }));
  check("hint " + JSON.stringify({ marks: hint.marks, legal: hint.legal }), hint.marks === 1 && hint.legal && hint.same === JSON.stringify(after));

  // 600 px: no sideways scroll, bigger points.
  await page.setViewportSize({ width: 600, height: 800 });
  await page.waitForTimeout(200);
  check("no sideways scroll at 600", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  await page.setViewportSize({ width: 360, height: 640 });

  // Against the computer: each level as cat and as mouse, a whole game ends.
  await page.evaluate(() => {
    try { localStorage.removeItem("papergames_random_start"); } catch (e) { /* ignore */ }
    // Counts the stats calls (the game list in game-stats.js may not know the game yet).
    window.__mkRec = [];
    const rec = GameStats.record;
    GameStats.record = (g, o, x) => { window.__mkRec.push(g + ":" + o); return rec(g, o, x); };
  });
  for (const level of ["1", "2", "3"]) {
    for (const side of ["cat", "mouse"]) {
      await page.evaluate(() => document.getElementById("mode-offline-ai").click());
      await page.evaluate(([lv, sd]) => {
        document.getElementById("maeusekreis-level-inline").value = lv;
        document.querySelector(`input[name='maeusekreis-side'][value='${sd}']`).checked = true;
        document.getElementById("start-maeusekreis-game").click();
      }, [level, side]);
      const start = await page.evaluate(() => ({ s: AppStateMaeusekreis.state, h: AppStateMaeusekreis.humanColor, need: MaeusekreisCore.steps(AppStateMaeusekreis.state.level, AppStateMaeusekreis.state.cat, AppStateMaeusekreis.state.mouse, "mouse") }));
      check(`level ${level} ${side}: side and limit ` + JSON.stringify({ limit: start.s.limit, need: start.need }), start.h === side && start.s.level === +level && start.s.limit === (side === "mouse" ? start.need - 1 : start.need));
      let plies = 0;
      while (plies < 60) {
        const s = await page.evaluate(() => ({ over: AppStateMaeusekreis.gameOver, mine: AppStateMaeusekreis.turn === AppStateMaeusekreis.humanColor }));
        if (s.over) break;
        if (!s.mine) { await page.waitForTimeout(40); continue; }
        if (plies === 0) check(`level ${level} ${side}: status is the person's turn ` + await status(), /Your turn/.test(await status()));
        // Play the best step (the hint's), so the person's side should win.
        const to = await page.evaluate(() => MaeusekreisAi.chooseMove(AppStateMaeusekreis.state, 3));
        await page.click(pt(to));
        plies++;
      }
      const end = await page.evaluate(() => ({ over: AppStateMaeusekreis.gameOver, res: AppStateMaeusekreis.state.result, shown: !!document.getElementById("game-result").textContent }));
      check(`level ${level} ${side}: game ends ` + JSON.stringify(end), end.over && end.shown && !!end.res);
      check(`level ${level} ${side}: best play wins for the person`, !!end.res && end.res.winner === side);
      await page.evaluate(() => { const m = document.querySelector("#result-modal-overlay button"); if (m) m.click(); });
    }
  }
  const stats = await page.evaluate(() => window.__mkRec.join());
  check("stats: six wins recorded " + stats, stats === Array(6).fill("maeusekreis:win").join());

  // Resign against the computer: the person loses.
  await page.evaluate(() => { document.getElementById("mode-offline-ai").click(); document.getElementById("start-maeusekreis-game").click(); });
  await page.waitForTimeout(200);
  await page.click("#resign-button");
  check("resign ends the game, a loss", await page.evaluate(() => AppStateMaeusekreis.gameOver && /resignation/.test(document.getElementById("game-result").textContent) && window.__mkRec[window.__mkRec.length - 1] === "maeusekreis:loss"));
  await page.evaluate(() => { const m = document.querySelector("#result-modal-overlay button"); if (m) m.click(); });

  check("no key names in the page", await page.evaluate(() => !/\b(mk_|maeusekreis_|msg_t_)/.test(document.body.innerText)));
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log(`=== MAEUSEKREIS UI: boards 8/10/12, ring and lines across, marked targets, catch, getaway, undo, save and load, hint, cat and mouse on three levels played out, ${fails.length} failure(s) ===`);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
