#!/usr/bin/env node
// The three games of task 118 in the browser, German page at 360 x 740:
//   Sliding puzzle - the board starts by itself (9 tiles), a tap next to
//     the gap moves one tile, a tap outside row and column says so, a tap
//     further along the row slides two tiles; the hint marks a tile; the
//     3 x 3 puzzle played with its shortest solution ends with the result
//     and the fewest moves; 5 x 5 has 25 places;
//   Tower of Hanoi - 4 discs, a bigger disc onto a smaller one is refused
//     with a note and nothing moves, Undo takes a move back, playing the
//     hints solves it in exactly 15 moves ("fewest");
//   Nim - against the hard computer: the start line names won/lost, a move
//     by tapping a stone and "Steine nehmen", the computer answers, Undo
//     takes back both; two players with misère to the end;
//   saved games come back after a reload; no sideways scroll; no page error.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

async function open(browser, slug) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + slug + ".html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(700);
  return { ctx, page };
}

(async () => {
  const browser = await chromium.launch();

  // Sliding puzzle.
  {
    const { ctx, page } = await open(browser, "slidepuzzle");
    check("sp: started by itself with 9 places", await page.evaluate(() => !!AppStateSP.state && document.querySelectorAll("#sp-board .sp-tile").length === 9));
    const info = await page.evaluate(() => {
      const s = AppStateSP.state, gap = s.tiles.indexOf(0), size = s.size;
      const nb = [gap - 1, gap + 1, gap - size, gap + size].filter((i) => i >= 0 && i < 9 && (Math.floor(i / size) === Math.floor(gap / size) || i % size === gap % size));
      const far = [0, 1, 2, 3, 4, 5, 6, 7, 8].find((i) => Math.floor(i / size) !== Math.floor(gap / size) && i % size !== gap % size);
      return { near: nb[0], far };
    });
    await page.click("#sp-board .sp-tile >> nth=" + info.far);
    check("sp: tap outside the line explained", /nicht in der Zeile/.test(await page.textContent("#board-info")));
    await page.click("#sp-board .sp-tile >> nth=" + info.near);
    check("sp: one move counted", await page.evaluate(() => AppStateSP.state.moves === 1));
    // Two tiles at once: put the gap in a corner of a known board.
    await page.evaluate(() => { AppStateSP.state = Object.assign({}, AppStateSP.state, { tiles: [1, 2, 3, 4, 5, 6, 0, 7, 8], moves: 0, solved: false, start: [1, 2, 3, 4, 5, 6, 0, 7, 8] }); renderSP(); });
    await page.click("#sp-board .sp-tile >> nth=8");
    check("sp: two tiles slide at once and solve it", await page.evaluate(() => AppStateSP.state.solved && AppStateSP.state.moves === 1));
    const result = await page.textContent("#game-result");
    check("sp: result with moves and fewest: " + result, /Gelöst in 1 Zügen/.test(result) && /Am wenigsten möglich ab diesem Start: 1/.test(result));
    await page.evaluate(() => { const sel = document.getElementById("sp-size"); sel.value = "3"; startSP(); });
    await page.click("#hint-btn");
    check("sp: hint marks a tile", await page.evaluate(() => document.querySelectorAll("#sp-board .sp-hint").length === 1) && /Hinweis/.test(await page.textContent("#board-info")));
    // Play the shortest solution by tapping.
    const path = await page.evaluate(() => SlidePuzzleCore.solve3(AppStateSP.state.tiles).path);
    for (const i of path) await page.click("#sp-board .sp-tile >> nth=" + i);
    check("sp: shortest solution solves it", await page.evaluate(() => AppStateSP.state.solved));
    await page.evaluate(() => { document.getElementById("sp-size").value = "5"; startSP(); });
    const big = await page.evaluate(() => ({ n: document.querySelectorAll("#sp-board .sp-tile").length, min: Math.min.apply(null, Array.from(document.querySelectorAll("#sp-board .sp-tile")).map((t) => t.getBoundingClientRect().width)), wide: document.documentElement.scrollWidth - innerWidth }));
    check("sp: 5 x 5 with places of at least 28 px " + JSON.stringify(big), big.n === 25 && big.min >= 28 && big.wide <= 0);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(600);
    check("sp: saved 5 x 5 puzzle back", await page.evaluate(() => AppStateSP.state && AppStateSP.state.size === 5));
    check("sp: no page error " + page.errors.join(" | "), !page.errors.length);
    await ctx.close();
  }

  // Tower of Hanoi.
  {
    const { ctx, page } = await open(browser, "hanoi");
    check("hanoi: started with 4 discs", await page.evaluate(() => AppStateHanoi.state && AppStateHanoi.state.n === 4 && document.querySelectorAll(".hanoi-disc").length === 4));
    await page.click(".hanoi-rod >> nth=0");
    await page.click(".hanoi-rod >> nth=1");
    await page.click(".hanoi-rod >> nth=0");
    await page.click(".hanoi-rod >> nth=1");
    check("hanoi: bigger on smaller refused: " + await page.textContent("#board-info"), /größere Scheibe/.test(await page.textContent("#board-info")) && await page.evaluate(() => AppStateHanoi.state.moves === 1));
    await page.click("#undo-btn");
    check("hanoi: undo back to the start", await page.evaluate(() => AppStateHanoi.state.moves === 0 && AppStateHanoi.state.pegs[0].length === 4));
    for (let i = 0; i < 20; i++) {
      const done = await page.evaluate(() => AppStateHanoi.state.solved);
      if (done) break;
      await page.click("#hint-btn");
      const h = await page.evaluate(() => AppStateHanoi.hint);
      await page.click(".hanoi-rod >> nth=" + h[0]);
      await page.click(".hanoi-rod >> nth=" + h[1]);
    }
    const end = await page.evaluate(() => ({ solved: AppStateHanoi.state.solved, moves: AppStateHanoi.state.moves, result: document.getElementById("game-result").textContent }));
    check("hanoi: hints solve it in 15 moves " + JSON.stringify(end), end.solved && end.moves === 15 && /geringste mögliche/.test(end.result));
    const rods = await page.evaluate(() => ({ min: Math.min.apply(null, Array.from(document.querySelectorAll(".hanoi-rod")).map((r) => r.getBoundingClientRect().width)), wide: document.documentElement.scrollWidth - innerWidth }));
    check("hanoi: rods wide enough to tap " + JSON.stringify(rods), rods.min >= 28 && rods.wide <= 0);
    check("hanoi: no page error " + page.errors.join(" | "), !page.errors.length);
    await ctx.close();
  }

  // Nim.
  {
    const { ctx, page } = await open(browser, "nim");
    if (!(await page.isVisible("#start-nim-game"))) await page.click("#menu-toggle");
    await page.click("#mode-ai");
    await page.selectOption("#nim-level", "3");
    await page.selectOption("#nim-first", "me");
    await page.selectOption("#nim-heaps", "small");
    await page.click("#start-nim-game");
    await page.waitForTimeout(300);
    const start = await page.textContent("#nim-start-info");
    check("nim: start line (3,4,5 is won): " + start, /gewonnen für den Beginnenden/.test(start));
    check("nim: 12 stones", await page.evaluate(() => document.querySelectorAll(".nim-stone").length === 12));
    // Take 2 from row 1 (3 -> 1): the stone with index 1 in the first row.
    await page.click(".nim-row >> nth=0 >> .nim-stone >> nth=1");
    check("nim: marked stones", await page.evaluate(() => document.querySelectorAll(".nim-stone-marked").length === 2));
    await page.click("#nim-take");
    await page.waitForFunction(() => AppStateNim.state.moves === 2, null, { timeout: 10000 });
    const after = await page.evaluate(() => ({ heaps: AppStateNim.state.heaps.join(","), last: document.getElementById("nim-last").textContent, sum: NimCore.nimSum(AppStateNim.state.heaps) }));
    // 1, 4, 5 has nim sum 0: the hard computer is lost and takes one stone
    // from the biggest heap.
    check("nim: computer answered (lost position: one stone from the biggest heap) " + JSON.stringify(after), after.heaps === "1,4,4" && after.sum !== 0 && /Computer/.test(after.last));
    await page.click("#undo-btn");
    await page.waitForTimeout(200);
    check("nim: undo takes back both moves", await page.evaluate(() => AppStateNim.state.moves === 0 && AppStateNim.state.heaps.join(",") === "3,4,5"));
    // Two players, misère, play to the end.
    if (!(await page.isVisible("#start-nim-game"))) await page.click("#menu-toggle");
    await page.click("#mode-offline");
    await page.selectOption("#nim-rule", "misere");
    await page.click("#start-nim-game");
    await page.waitForTimeout(200);
    for (let i = 0; i < 20; i++) {
      const over = await page.evaluate(() => AppStateNim.state.over);
      if (over) break;
      await page.click(".nim-stone:not([disabled]) >> nth=0");
      await page.click("#nim-take");
    }
    const end = await page.evaluate(() => ({ over: AppStateNim.state.over, winner: AppStateNim.state.winner, last: AppStateNim.state.last.player, result: document.getElementById("game-result").textContent }));
    check("nim: misère - who took the last stone loses " + JSON.stringify(end), end.over && end.winner === 1 - end.last && end.result.length > 0);
    check("nim: no sideways scroll", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
    check("nim: no page error " + page.errors.join(" | "), !page.errors.length);
    await ctx.close();
  }
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== SMALL GAMES UI: sliding puzzle, Tower of Hanoi, Nim at 360 px, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
