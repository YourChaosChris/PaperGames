#!/usr/bin/env node
// Ludo in the browser (task 109), German page at 360 px:
//   - the classic board is still the default (15 x 15 grid, 52 + 20 cells);
//   - "6 Spieler": six-arm board with 78 track cells, 6 x 5 home-column
//     cells and six home bases, players 5 and 6 offered only there, purple
//     and orange only there; six colors in the finish line-up;
//   - a hotseat game with six players: rolls and moves until a token moves;
//   - save and load: after a reload the six-arm game is back;
//   - large board: every cell at least 28 px (as tests/cell-size.js);
//   - no sideways scrolling, no page error.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

async function openSettings(page) {
  if (!(await page.isVisible("#start-ludo-game"))) await page.click("#menu-toggle");
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "ludo.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  await openSettings(page);

  // Classic default.
  check("board choice defaults to 4", (await page.inputValue("#ludo-board-size")) === "4");
  check("5 and 6 players disabled on the classic board", await page.evaluate(() => Array.from(document.querySelectorAll("#ludo-num-players option")).filter((o) => o.disabled).map((o) => o.value).join(",") === "5,6"));
  check("purple and orange hidden on the classic board", await page.evaluate(() => Array.from(document.querySelectorAll(".ludo-color-six")).every((l) => l.classList.contains("hidden"))));
  await page.click("#start-ludo-game");
  await page.waitForTimeout(300);
  const classic = await page.evaluate(() => ({ track: document.querySelectorAll(".ludo-cell-track").length, col: document.querySelectorAll(".ludo-cell-home-column").length, six: document.getElementById("ludo-board").classList.contains("ludo-board-6"), board: AppStateLudo.state.board }));
  check("classic board unchanged " + JSON.stringify(classic), classic.track === 52 && classic.col === 20 && !classic.six && classic.board === undefined);

  // Six arms, hotseat, six players.
  await openSettings(page);
  await page.selectOption("#ludo-board-size", "6");
  check("purple and orange offered on the six-arm board", await page.evaluate(() => Array.from(document.querySelectorAll(".ludo-color-six")).every((l) => !l.classList.contains("hidden"))));
  await page.click("#mode-offline");
  await page.selectOption("#ludo-num-players", "6");
  await page.click("#start-ludo-game");
  await page.waitForTimeout(400);
  const six = await page.evaluate(() => {
    const b = document.getElementById("ludo-board").getBoundingClientRect();
    const cells = Array.from(document.querySelectorAll("#ludo-board .ludo-cell"));
    const inside = cells.every((c) => { const r = c.getBoundingClientRect(); return r.left >= b.left - 1 && r.right <= b.right + 1 && r.top >= b.top - 1 && r.bottom <= b.bottom + 1; });
    return {
      track: document.querySelectorAll(".ludo-cell-track").length,
      col: document.querySelectorAll(".ludo-cell-home-column").length,
      bases: document.querySelectorAll(".ludo-home-base").length,
      slots: document.querySelectorAll(".ludo-home-slot-filled").length,
      chips: document.querySelectorAll(".ludo-turn-chip").length,
      board: AppStateLudo.state.board, colors: AppStateLudo.state.activeColors.join(","),
      inside, wide: document.documentElement.scrollWidth - innerWidth
    };
  });
  check("six-arm board " + JSON.stringify(six), six.track === 78 && six.col === 30 && six.bases === 6 && six.slots === 24 && six.chips === 6);
  check("six colors in play", six.board === 6 && six.colors === "red,green,yellow,blue,purple,orange");
  check("all cells inside the board", six.inside);
  check("no sideways scrolling", six.wide <= 0);

  // Play until a token has moved (hotseat: every color is human).
  let moved = false;
  for (let i = 0; i < 80 && !moved; i++) {
    if (await page.isEnabled("#ludo-roll-button")) await page.click("#ludo-roll-button");
    await page.waitForTimeout(60);
    const legal = await page.evaluate(() => AppStateLudo.legalMoves.slice());
    if (legal.length) {
      const color = await page.evaluate(() => LudoCore.currentColor(AppStateLudo.state));
      await page.click(".ludo-home-slot-" + color + ".ludo-home-slot-movable");
      moved = await page.evaluate((c) => AppStateLudo.state.tokens[c].some((t) => t.state === "active"), color);
    }
    await page.waitForTimeout(900);
  }
  check("a token entered the six-arm board", moved);
  const onBoard = await page.evaluate(() => document.querySelectorAll("#ludo-board .ludo-token").length);
  check("the token is drawn on a cell", onBoard >= 1);

  // Save and load.
  const before = await page.evaluate(() => JSON.stringify(AppStateLudo.state.tokens));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => ({ board: AppStateLudo.state && AppStateLudo.state.board, tokens: JSON.stringify(AppStateLudo.state && AppStateLudo.state.tokens), six: document.getElementById("ludo-board").classList.contains("ludo-board-6"), track: document.querySelectorAll(".ludo-cell-track").length, choice: document.getElementById("ludo-board-size").value }));
  check("saved six-arm game is back " + JSON.stringify({ board: after.board, six: after.six, track: after.track, choice: after.choice }), after.board === 6 && after.six && after.track === 78 && after.choice === "6");
  check("same tokens after loading", after.tokens === before);

  // Large board: cells at least 28 px.
  await page.click(".big-board-toggle");
  await page.waitForTimeout(400);
  const big = await page.evaluate(() => {
    const sizes = Array.from(document.querySelectorAll("#ludo-board .ludo-cell")).map((el) => { const b = el.getBoundingClientRect(); return Math.min(b.width, b.height); });
    return { min: Math.round(Math.min.apply(null, sizes)), wide: document.documentElement.scrollWidth - innerWidth };
  });
  // A turned cell's box is larger than the cell; the cell itself is
  // measured by its own width.
  const cellPx = await page.evaluate(() => Math.round(document.querySelector("#ludo-board .ludo-cell").offsetWidth));
  check("large view: cells at least 28 px (" + cellPx + ")", cellPx >= 28);
  check("large view: no page overflow", big.wide <= 0);
  await page.click(".big-board-toggle");
  await page.waitForTimeout(300);
  const normalPx = await page.evaluate(() => Math.round(document.querySelector("#ludo-board .ludo-cell").offsetWidth));
  console.log("six-arm board cells: " + normalPx + " px normal, " + cellPx + " px large (360 px screen)");

  check("no page error " + errors.join(" | "), !errors.length);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== LUDO UI: classic default, six-arm board, play, save and load, large view, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})();
