#!/usr/bin/env node
// Step Numbers in the browser (task 226), German page at 360 x 640.
// Two players: Black and White fill the middle column by tapping numbers
// ("Zufallszahlen" fills the rest, "Rückgängig" takes one back), then cards are
// drawn: fields that fit are highlighted and enabled, a card that fits nowhere
// is out, the last open field wins; save and load after a reload; Hint (a
// number while setting up, the draw button, a fitting field); against the
// computer a whole game on each level ends with a result. Fields at least
// 44 px, no sideways scroll on the hard level, no page error, no key names.
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
  await page.goto(BASE + "zahlenschritt.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  const status = () => page.evaluate(() => document.getElementById("board-info").textContent);
  const S = () => page.evaluate(() => AppStateZahlenschritt.state);

  // A first visit starts at the lowest level (quick-rules.js); the test plays Medium.
  await page.evaluate(() => { document.getElementById("zahlenschritt-level-inline").value = "2"; document.getElementById("mode-offline").click(); });
  await page.waitForTimeout(200);
  check("setup status " + await status(), /Schwarz.*(1 von 7)/.test(await status()));
  check("palette 0..9", (await page.$$eval(".zs-num", (e) => e.length)) === 10);
  for (const n of [3, 4, 5]) await page.click(`[data-zs-num="${n}"]`);
  check("three numbers written", (await S()).mids.b.join() === "3,4,5" && /4 von 7/.test(await status()));
  await page.click("#zs-remove");
  check("take back the last number", (await S()).mids.b.join() === "3,4");
  await page.click("#zs-random");
  check("random fills Black's column, White is next " + JSON.stringify((await S()).mids), (await S()).mids.b.length === 7 && (await S()).turn === "w" && /Weiß/.test(await status()));
  await page.click("#zs-random");
  check("both done, Black draws " + await status(), (await S()).phase === "draw" && (await S()).turn === "b" && /Schwarz.*Karte/.test(await status()));

  // A fixed position: Black 3,4,5,... ; the stack on top shows 2 (fits left of 3), then 9 (fits nowhere for White).
  await page.evaluate(() => {
    const st = JSON.parse(JSON.stringify(AppStateZahlenschritt.state));
    st.mids.b = [3, 4, 5, 3, 4, 5, 3]; st.mids.w = [0, 9, 0, 9, 0, 9, 0];
    st.cells.b = st.mids.b.map((m) => [null, null]);
    st.cells.w = st.mids.w.map((m) => [m - 1 < 0 ? "x" : null, m + 1 > 9 ? "x" : null]);
    st.deck = [7, 2];
    setStateZahlenschritt(st);
    updateZahlenschrittBoard();
  });
  await page.click("#zs-draw");
  const fit = await page.$$eval(".zs-fit", (e) => e.map((x) => x.dataset.side + x.dataset.row + x.dataset.col));
  check("card 2 fits the left of both 3s " + fit.join(), fit.join() === "b00,b30,b60");
  check("fields that do not fit are disabled", await page.evaluate(() => Array.from(document.querySelectorAll(".zs-cell[data-side]")).filter((c) => !c.classList.contains("zs-fit")).every((c) => c.disabled)));
  check("status names the card " + await status(), /Schwarz.*2/.test(await status()));
  await page.click('[data-side="b"][data-row="3"][data-col="0"]');
  const a = await S();
  check("2 written, White to draw " + JSON.stringify(a.cells.b[3]), a.cells.b[3][0] === 2 && a.turn === "w" && a.phase === "draw");
  check("the field written is marked", (await page.$$eval(".zs-last", (e) => e.length)) === 1);
  // White draws 7: fits nowhere (needs 1 or 8 etc.), the card is out.
  await page.click("#zs-draw");
  const b = await S();
  check("card 7 is out and Black is next " + await status(), b.turn === "b" && b.phase === "draw" && b.last && b.last.fit === false && /kein Feld/i.test(await page.evaluate(() => document.getElementById("game-meta").textContent)));

  // Reload: the running game comes back.
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  check("game back after reload", await page.evaluate(() => AppStateZahlenschritt.state.cells.b[3][0] === 2 && document.querySelectorAll(".zs-sheet").length === 2));

  // Hint in the draw phase marks the draw button, no card is drawn.
  await page.click("#zahlenschritt-hint");
  const h1 = await page.evaluate(() => ({ marks: document.querySelectorAll(".mh-mark").length, id: (document.querySelector(".mh-mark") || {}).id, phase: AppStateZahlenschritt.state.phase }));
  check("hint marks the draw button " + JSON.stringify(h1), h1.marks === 1 && h1.id === "zs-draw" && h1.phase === "draw");
  // Hint in the place phase marks a fitting field.
  await page.evaluate(() => { const st = JSON.parse(JSON.stringify(AppStateZahlenschritt.state)); st.deck = [6]; setStateZahlenschritt(st); updateZahlenschrittBoard(); });
  await page.click("#zs-draw");
  await page.click("#zahlenschritt-hint");
  const h2 = await page.evaluate(() => ({ marks: document.querySelectorAll(".mh-mark.zs-fit").length, move: MoveHint.last().move, legal: ZahlenschrittCore.isLegalMove(AppStateZahlenschritt.state, MoveHint.last().move) }));
  check("hint marks a fitting field " + JSON.stringify(h2), h2.marks === 1 && h2.move.kind === "cell" && h2.legal);

  // Win: Black has one field left.
  await page.evaluate(() => {
    const st = ZahlenschrittCore.createInitialState(1);
    [1, 1, 1, 1].forEach((n) => { st.mids.b.push(n); st.cells.b.push([null, null]); st.mids.w.push(n); st.cells.w.push([null, null]); });
    st.cells.b = [[0, 2], [0, 2], [0, 2], [0, null]];
    st.phase = "place"; st.turn = "b"; st.card = 2; st.deck = [3];
    AppStateZahlenschritt.mode = "offline";
    setStateZahlenschritt(st);
    updateZahlenschrittBoard();
  });
  await page.click('[data-side="b"][data-row="3"][data-col="1"]');
  const w = await page.evaluate(() => ({ over: AppStateZahlenschritt.gameOver, res: AppStateZahlenschritt.state.result, text: document.getElementById("game-result").textContent }));
  check("Black wins with the last field " + JSON.stringify(w), w.over && w.res.winner === "b" && /Schwarz/.test(w.text));
  await page.evaluate(() => { const m = document.querySelector("#result-modal-overlay button"); if (m) m.click(); });

  // Against the computer, every level: a whole game ends.
  for (const level of ["1", "2", "3"]) {
    await page.evaluate(() => document.getElementById("mode-offline-ai").click());
    await page.evaluate((lv) => { document.getElementById("zahlenschritt-level-inline").value = lv; document.getElementById("start-zahlenschritt-game").click(); }, level);
    let steps = 0;
    while (steps < 600) {
      const s = await page.evaluate(() => ({ over: AppStateZahlenschritt.gameOver, mine: AppStateZahlenschritt.turn === AppStateZahlenschritt.humanColor, phase: AppStateZahlenschritt.state.phase }));
      if (s.over) break;
      if (!s.mine) { await page.waitForTimeout(40); continue; }
      if (s.phase === "setup") await page.click("#zs-random");
      else if (s.phase === "draw") await page.click("#zs-draw");
      else await page.click(".zs-fit:not([disabled])");
      steps++;
    }
    const end = await page.evaluate(() => ({ over: AppStateZahlenschritt.gameOver, rows: AppStateZahlenschritt.state.rows, shown: !!document.getElementById("game-result").textContent }));
    check("level " + level + " game ends " + JSON.stringify(end), end.over && end.shown);
    if (level === "3") {
      check("hard: 10 rows, fields at least 44 px", end.rows === 10 && await page.evaluate(() => Array.from(document.querySelectorAll(".zs-cell")).every((c) => c.getBoundingClientRect().height >= 44 && c.getBoundingClientRect().width >= 44)));
      check("no sideways scroll", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
    }
    await page.evaluate(() => { const m = document.querySelector("#result-modal-overlay button"); if (m) m.click(); });
  }
  check("no key names in the page", await page.evaluate(() => !/\b(zs_|zahlenschritt_|msg_t_)/.test(document.body.innerText)));
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log(`=== ZAHLENSCHRITT UI: numbers, take back, random, fitting fields, card that fits nowhere, win, reload, hint, three levels played out, ${fails.length} failure(s) ===`);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
