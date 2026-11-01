#!/usr/bin/env node
// Bingo in the browser (task 168), German page at 360 x 640: against two
// computers their cards are shown small under your own card, one small card
// per computer, cell for cell the same numbers and marks as the game state;
// after a draw the status line names which computer marked the call (or
// that none has it), the cell just called is framed; the switch "Karten der
// Computer verbergen/zeigen" hides and shows them, is 44 px high and comes
// back after a reload together with the game (drawn items, marks); the
// small numbers are at least 12 px; small cards do not overlap and nothing
// scrolls sideways; a computer bingo is named in the status line and its
// winning cells are black. Your own card stays tappable (44 px cells).
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "bingo.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  if (!(await page.isVisible("#start-bingo-game"))) await page.tap("#menu-toggle");
  await page.selectOption("#bingo-mode", "computer");
  await page.selectOption("#bingo-opponents", "2");
  await page.selectOption("#bingo-size", "5");
  await page.tap("#start-bingo-game");
  await page.waitForTimeout(300);
  check("two small cards", (await page.$$("#bingo-cpu-cards .bingo-mini")).length === 2);
  check("titles name the computers", await page.evaluate(() => Array.from(document.querySelectorAll("#bingo-cpu-cards .bingo-card-title")).map((h) => h.textContent).join("|") === "Computer 1|Computer 2"));

  // Small cards match the stored cards, cell for cell.
  const sameAsState = () => page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem("einkchess_save_bingo") || "null");
    if (!save) return "no save";
    const minis = document.querySelectorAll("#bingo-cpu-cards .bingo-mini");
    for (let k = 0; k < minis.length; k++) {
      const card = save.cards[k + 1];
      const cells = minis[k].querySelectorAll(".bingo-mini-cell");
      if (cells.length !== card.board.length) return "cell count " + k;
      for (let i = 0; i < cells.length; i++) {
        const v = card.board[i];
        if (v !== null && cells[i].textContent.trim() !== String(v)) return "number " + k + "/" + i;
        if (cells[i].classList.contains("marked") !== !!card.marked[i]) return "mark " + k + "/" + i;
      }
    }
    return "ok";
  });

  let named = 0, none = 0, framed = 0;
  for (let d = 0; d < 12; d++) {
    await page.tap("#bingo-draw");
    await page.waitForTimeout(60);
    const r = await page.evaluate(() => {
      const status = document.getElementById("board-info").textContent;
      const v = document.getElementById("bingo-current").textContent.trim();
      const save = JSON.parse(localStorage.getItem("einkchess_save_bingo") || "null");
      const owners = save ? save.cards.slice(1).map((c, k) => (c.board.indexOf(Number(v)) >= 0 ? k + 1 : 0)).filter(Boolean) : [];
      return { status, v, owners, just: document.querySelectorAll("#bingo-cpu-cards .bingo-just").length, over: !save };
    });
    if (r.over) break;
    if (r.owners.length) {
      check("status names the computer " + JSON.stringify(r), r.owners.every((n) => r.status.indexOf("Computer " + n + " hat " + r.v + " markiert.") !== -1));
      check("called cell framed " + JSON.stringify(r), r.just === r.owners.length);
      named++; framed += r.just;
    } else {
      check("status without owner " + JSON.stringify(r), r.status.indexOf("Kein Computer hat " + r.v + ".") === 0);
      none++;
    }
    check("small cards match after draw " + d, (await sameAsState()) === "ok");
  }
  check("both kinds of status seen (" + named + " named, " + none + " none)", named > 0 && none > 0);

  // Sizes: own cells tappable, small numbers readable, no overlap, no sideways scroll.
  const geo = await page.evaluate(() => {
    const own = Array.from(document.querySelectorAll("#bingo-cards .bingo-cell")).map((b) => b.getBoundingClientRect().height);
    const font = Math.min.apply(null, Array.from(document.querySelectorAll(".bingo-mini-cell")).map((c) => parseFloat(getComputedStyle(c).fontSize)));
    const boxes = Array.from(document.querySelectorAll(".bingo-mini")).map((a) => a.getBoundingClientRect());
    let overlap = false;
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) overlap = true;
    }
    const tog = document.getElementById("bingo-cpu-toggle").getBoundingClientRect();
    return { own: Math.min.apply(null, own), font, overlap, toggle: tog.height, scroll: document.documentElement.scrollWidth - innerWidth };
  });
  check("own cells 44 px " + JSON.stringify(geo), geo.own >= 43.5);
  check("small numbers >= 12 px " + JSON.stringify(geo), geo.font >= 12);
  check("small cards do not overlap", !geo.overlap);
  check("switch 44 px " + JSON.stringify(geo), geo.toggle >= 43.5);
  check("no sideways scroll " + JSON.stringify(geo), geo.scroll <= 0);
  console.log("small card font " + geo.font + " px, own cells " + Math.round(geo.own) + " px");

  // The switch hides and shows; reload keeps game and switch.
  await page.tap("#bingo-cpu-toggle");
  check("hidden after the switch", !(await page.isVisible("#bingo-cpu-cards .bingo-mini")) && (await page.textContent("#bingo-cpu-toggle")).trim() === "Karten der Computer zeigen");
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("einkchess_save_bingo")));
  check("switch saved", before && before.showCpu === false);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => ({ drawn: JSON.parse(localStorage.getItem("einkchess_save_bingo")).game.drawn.length, shown: !!document.querySelector("#bingo-cpu-cards .bingo-mini"), board: !document.getElementById("board-container").classList.contains("hidden") }));
  check("game back after reload " + JSON.stringify(after), after.board && after.drawn === before.game.drawn.length && !after.shown);
  await page.tap("#bingo-cpu-toggle");
  check("shown again", (await page.$$("#bingo-cpu-cards .bingo-mini")).length === 2 && (await sameAsState()) === "ok");

  // Play on until a computer has a bingo (you mark nothing).
  let won = null;
  for (let d = 0; d < 80 && !won; d++) {
    await page.tap("#bingo-draw");
    won = await page.evaluate(() => (/hat Bingo!/.test(document.getElementById("board-info").textContent) ? {
      status: document.getElementById("board-info").textContent, black: document.querySelectorAll(".bingo-mini-cell.bingo-win").length,
      saved: localStorage.getItem("einkchess_save_bingo")
    } : null));
  }
  check("computer bingo named " + JSON.stringify(won), !!won && /Computer \d hat Bingo!/.test(won.status));
  check("winning cells black " + JSON.stringify(won), !!won && won.black >= 5);
  check("finished game not saved", !!won && won.saved === null);

  check("no page errors " + errors.join("; "), errors.length === 0);
  await browser.close();
  if (fails.length) {
    console.log(fails.join("\n"));
    console.log("=== BINGO UI: " + fails.length + " failure(s) ===");
    process.exit(1);
  }
  console.log("=== BINGO UI: computer cards, status, switch, save and load, 0 failures ===");
})();
