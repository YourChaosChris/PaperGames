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
// Task 173: numbers run 1-90; an old 1-75 save is dropped.
// Task 178: the called number stands large (48 px or more) and alone in the
// field, no figure beside it, also in the caller-only mode.
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

  // Task 178: the called number (1-90) stands large and alone, no figure.
  const alone = () => page.evaluate(() => {
    const cur = document.getElementById("bingo-current");
    return { text: cur.textContent.trim(), kids: cur.children.length, svg: cur.querySelectorAll("svg, img").length, font: parseFloat(getComputedStyle(cur).fontSize) };
  });
  const checkAlone = (where, c) => {
    check(where + ": called number 1-90 " + JSON.stringify(c), /^\d+$/.test(c.text) && Number(c.text) >= 1 && Number(c.text) <= 90);
    check(where + ": no figure beside the number " + JSON.stringify(c), c.svg === 0 && c.kids === 0);
    check(where + ": number 48 px or larger " + JSON.stringify(c), c.font >= 48);
  };
  const call = await alone();
  checkAlone("vs computer", call);
  console.log("called " + call.text + ": number " + call.font + " px, no figure");

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

  // A number game saved before task 173 (1-75, no range) is dropped on load.
  await page.evaluate(() => {
    const old = { game: { kind: "numbers", size: 3, mode: "computer", pattern: "line", drawn: [75], over: false }, cards: [{ kind: "numbers", size: 3, board: [1, 2, 3, 4, 5, 6, 7, 8, 75], marked: [false, false, false, false, false, false, false, false, false], drawn: [75], winner: false }], active: 0, current: 75, showCpu: true };
    localStorage.setItem("einkchess_save_bingo", JSON.stringify(old));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  const dropped = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("einkchess_save_bingo") || "null");
    return { current: document.getElementById("bingo-current").textContent.trim(), drawn: s ? s.game.drawn.length : 0, range: s ? s.game.range : 90, has75: s ? s.cards.some((c) => c.size === 3 && c.board.indexOf(75) === 8) : false };
  });
  check("old 1-75 save dropped " + JSON.stringify(dropped), dropped.current !== "75" && dropped.drawn === 0 && dropped.range === 90 && !dropped.has75);

  // Caller only: all 90 numbers, each shown alone and large.
  if (!(await page.isVisible("#start-bingo-game"))) await page.tap("#menu-toggle");
  await page.selectOption("#bingo-kind", "numbers");
  await page.selectOption("#bingo-mode", "caller");
  await page.tap("#start-bingo-game");
  await page.waitForTimeout(300);
  const calledAlone = new Set();
  for (let d = 0; d < 95; d++) {
    await page.tap("#bingo-draw");
    const c = await alone();
    if (calledAlone.has(c.text) || !/^\d+$/.test(c.text)) break; // after number 90 the pool is empty and the field shows a dash
    checkAlone("caller " + d, c);
    calledAlone.add(c.text);
  }
  check("caller drew 1 to 90 (" + calledAlone.size + ")", calledAlone.size === 90 && calledAlone.has("1") && calledAlone.has("90"));

  check("no page errors " + errors.join("; "), errors.length === 0);
  await browser.close();
  if (fails.length) {
    console.log(fails.join("\n"));
    console.log("=== BINGO UI: " + fails.length + " failure(s) ===");
    process.exit(1);
  }
  console.log("=== BINGO UI: computer cards, status, switch, save and load, number alone 1-90, 0 failures ===");
})();
