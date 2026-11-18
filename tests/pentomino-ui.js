#!/usr/bin/env node
// "Fit the Pattern" (Pentomino, task 225) in the browser, German page at 360 x 640.
// The mode is in the list; a new game shows black blocked squares (solid, no
// grey) and exactly the pieces to lay; a piece can't go on a blocked square;
// laying the stored solution square by square (turn and flip as needed) ends
// with the pattern-solved message; save and load after a reload; Hint names a
// piece; no sideways scroll, no page error, no key names in the page.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "pentomino.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);

  check("mode in the list", await page.evaluate(() => Array.from(document.querySelectorAll("#pt-mode option")).some((o) => o.value === "pattern" && /Muster legen/.test(o.textContent))));
  await page.click("#menu-toggle");
  await page.selectOption("#pt-mode", "pattern");
  await page.selectOption("#pt-level", "medium");
  await page.click("#start-pt-game");
  await page.waitForTimeout(200);
  const info = await page.evaluate(() => { const p = AppStatePt.puzzle; return { mode: p.mode, n: p.pieces.length, blocked: p.blocked.length, tray: document.querySelectorAll("#pt-tray .pt-piece").length, black: document.querySelectorAll('#pt-board svg rect[fill="#141413"]').length }; });
  check("pattern puzzle " + JSON.stringify(info), info.mode === "pattern" && info.n === 4 && info.tray === 4 && info.blocked > 0 && info.black >= info.blocked);
  check("blocked squares are labelled", await page.evaluate(() => { const p = AppStatePt.puzzle; return document.querySelector('.pt-cell[data-i="' + p.blocked[0] + '"]').getAttribute("aria-label").indexOf("gesperrt") !== -1; }));
  // A piece on a blocked square is refused.
  await page.evaluate(() => { selectPt(AppStatePt.puzzle.pieces[0]); onCellPt(AppStatePt.puzzle.blocked[0]); });
  check("blocked square refuses", await page.evaluate(() => AppStatePt.placements.length === 0));
  // Hint names a place.
  await page.click("#pt-hint");
  check("hint marks cells", (await page.$$eval("#pt-board .pt-hint", (e) => e.length)) === 5);
  // Lay all but the last stored piece, reload, then finish.
  await page.evaluate(() => {
    const p = AppStatePt.puzzle;
    window.__lay = (pl) => {
      selectPt(pl.piece);
      const want = JSON.stringify(PentominoCore.normalize(pl.cells.map((i) => [Math.floor(i / p.cols), i % p.cols])));
      for (let m = 0; m < 2; m++) for (let r = 0; r < 4; r++) {
        const sh = PentominoCore.transform(pl.piece, r, m === 1);
        if (JSON.stringify(sh) !== want) continue;
        AppStatePt.rot = r; AppStatePt.mirror = m === 1;
        const first = pl.cells.slice().sort((a, b) => a - b)[0];
        onCellPt(first);
        return;
      }
    };
    p.solution.slice(0, -1).forEach(window.__lay);
  });
  check("three laid", await page.evaluate(() => AppStatePt.placements.length === 3));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(400);
  check("saved game comes back", await page.evaluate(() => AppStatePt.puzzle && AppStatePt.puzzle.mode === "pattern" && AppStatePt.placements.length === 3 && AppStatePt.puzzle.blocked.length > 0));
  await page.evaluate(() => { const p = AppStatePt.puzzle; const pl = p.solution.find((s) => !AppStatePt.placements.some((x) => x.piece === s.piece)); selectPt(pl.piece); const want = JSON.stringify(PentominoCore.normalize(pl.cells.map((i) => [Math.floor(i / p.cols), i % p.cols]))); for (let m = 0; m < 2; m++) for (let r = 0; r < 4; r++) { if (JSON.stringify(PentominoCore.transform(pl.piece, r, m === 1)) === want) { AppStatePt.rot = r; AppStatePt.mirror = m === 1; onCellPt(pl.cells.slice().sort((a, b) => a - b)[0]); return; } } });
  await page.waitForTimeout(200);
  const res = await page.evaluate(() => document.getElementById("game-result").textContent);
  check("solved message " + res, /Muster ist voll/.test(res));
  check("no sideways scroll", await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  check("no key names", await page.evaluate(() => !/\b(pt_|msg_pt)[a-z_]+/.test(document.body.innerText)));
  check("no page error " + errors.join("|"), errors.length === 0);
  await browser.close();
  console.log("\n=== PENTOMINO UI (Fit the Pattern): " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})();
