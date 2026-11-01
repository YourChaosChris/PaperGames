#!/usr/bin/env node
// Irrgarten in the browser (task 170), German page at 360 x 640. Easy: the
// status asks to tap, the board is square and drawn once; a tap into a wall
// gives "Da ist eine Wand im Weg." and changes nothing; walking the right way
// with real taps (single cells and straight runs) reaches the flag, the
// result shows, the game is not saved after the end. Per tap no element is
// added or removed (only the line, the circle and the texts change). Back and
// hint; saved and back after a reload. "Mit dem Finger ziehen" (remembered):
// a finger (touch events) draws the right way on medium and the page does not
// scroll. Very hard: every cell at least 16 px on 360 x 640 (task 170: the
// smallest passage - 20 x 20 cells must fit the 324 px board) and 28 px on
// the 600 x 800 reader screen. Buttons 44 px, no sideways scroll, no tap
// flash, no page error. Writes screenshots to /tmp when SHOTS=1.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

// Screen point of the centre of cell c (scrolls it onto the screen).
const cellXY = (page, c) => page.evaluate((k) => {
  const svg = document.querySelector("#ig-board svg");
  const n = IrrgartenCore.mazeOf(AppStateIG.state).n;
  const at = () => { const pt = svg.createSVGPoint(); pt.x = (k % n + 0.5) * AppStateIG.cell; pt.y = (Math.floor(k / n) + 0.5) * AppStateIG.cell; return pt.matrixTransform(svg.getScreenCTM()); };
  let q = at();
  if (q.y < 20 || q.y > innerHeight - 20) { window.scrollBy(0, q.y - innerHeight / 2); q = at(); }
  return [q.x, q.y];
}, c);

const tapCell = async (page, c) => {
  const [x, y] = await cellXY(page, c);
  await page.mouse.click(x, y);
  await page.waitForTimeout(20);
};

const watch = (page) => page.evaluate(() => {
  window.__mut = { records: 0, added: 0, removed: 0 };
  if (window.__obs) window.__obs.disconnect();
  window.__obs = new MutationObserver((list) => list.forEach((m) => { window.__mut.records++; m.addedNodes.forEach((n) => { if (n.nodeType === 1) window.__mut.added++; }); m.removedNodes.forEach((n) => { if (n.nodeType === 1) window.__mut.removed++; }); }));
  window.__obs.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
});

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "irrgarten.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  if (!(await page.isVisible("#start-ig-game"))) await page.click("#menu-toggle");
  check("default way: tapping", await page.evaluate(() => document.getElementById("ig-input").value === "tap"));
  await page.selectOption("#ig-level", "easy");
  await page.click("#start-ig-game");
  await page.waitForTimeout(200);
  if (process.env.SHOTS) await page.screenshot({ path: "/tmp/irrgarten-easy.png", fullPage: true });
  check("status asks to tap: " + (await page.textContent("#board-info")), (await page.textContent("#board-info")).trim() === "Tippe auf ein Feld neben dir oder weiter im Gang.");
  check("board square", await page.evaluate(() => { const r = document.getElementById("ig-board").getBoundingClientRect(); return Math.abs(r.width - r.height) < 2 && r.width > 300; }));
  check("no grey tap flash", await page.evaluate(() => { const c = getComputedStyle(document.getElementById("ig-board")).webkitTapHighlightColor; return c === "rgba(0, 0, 0, 0)" || c === "transparent"; }));
  // A wall next to the start.
  const wall = await page.evaluate(() => { const m = IrrgartenCore.mazeOf(AppStateIG.state); return [1, m.n].find((c) => IrrgartenCore.neighbours(m, 0).indexOf(c) < 0); });
  if (wall !== undefined) {
    await tapCell(page, wall);
    check("wall named: " + (await page.textContent("#board-info")), (await page.textContent("#board-info")).trim() === "Da ist eine Wand im Weg." && (await page.evaluate(() => AppStateIG.state.path.length)) === 1);
  }
  // Walk the right way: the first cells one by one (counting page changes),
  // then the rest with straight taps.
  const sol = await page.evaluate(() => IrrgartenCore.solution(IrrgartenCore.mazeOf(AppStateIG.state)));
  await page.evaluate(() => { window.__svg = document.querySelector("#ig-board svg"); });
  const perTap = [];
  for (let i = 1; i <= 3; i++) {
    await watch(page);
    await tapCell(page, sol[i]);
    perTap.push(await page.evaluate(() => Object.assign({}, window.__mut)));
  }
  check("per tap no element added or removed, at most 8 changes " + JSON.stringify(perTap), perTap.every((m) => m.added === 0 && m.removed === 0 && m.records <= 8));
  console.log("per tap: " + perTap.map((m) => m.records).join(", ") + " changes, 0 elements replaced");
  check("three steps walked, board not built again", await page.evaluate(() => AppStateIG.state.path.length === 4 && document.querySelector("#ig-board svg") === window.__svg));
  // Back and hint.
  await page.click("#ig-back");
  check("back takes one cell back", await page.evaluate(() => AppStateIG.state.path.length === 3));
  await page.click("#hint-btn");
  check("hint: three dashed rings and the note", (await page.evaluate(() => document.querySelectorAll("#ig-hint circle").length)) === 3 && /gestrichelten Ringe/.test(await page.textContent("#board-info")));
  // Saved and back.
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  check("saved and back", await page.evaluate(() => AppStateIG.state && AppStateIG.state.path.length === 3 && AppStateIG.state.level === "easy"));
  // Straight taps to the goal.
  let at = 2;
  const n = await page.evaluate(() => IrrgartenCore.mazeOf(AppStateIG.state).n);
  const line = (a, b) => (a % n === b % n) || (Math.floor(a / n) === Math.floor(b / n));
  let taps = 0;
  while (at < sol.length - 1 && taps < 60) {
    let j = at + 1;
    while (j + 1 < sol.length && line(sol[at], sol[j + 1]) && line(sol[j], sol[j + 1]) && (sol[at] % n === sol[j + 1] % n) === (sol[at] % n === sol[j] % n)) j++;
    await tapCell(page, sol[j]);
    taps++;
    at = j;
  }
  const done = await page.evaluate(() => ({ solved: AppStateIG.state.solved, status: document.getElementById("game-result").textContent, saved: localStorage.getItem("einkchess_save_irrgarten") }));
  check("goal reached " + JSON.stringify(done), done.solved && done.status === "Geschafft! Du hast den Weg zur Fahne gefunden." && done.saved === null);
  console.log("easy maze walked with " + (taps + 3) + " taps for " + (sol.length - 1) + " cells");
  await page.evaluate(() => { if (window.ResultModal) window.ResultModal.hide(); });
  const heights = await page.evaluate(() => ["ig-back", "hint-btn", "start-ig-game"].map((id) => document.getElementById(id).getBoundingClientRect().height));
  check("buttons at least 44 px " + JSON.stringify(heights), heights.every((h) => h === 0 || h >= 43.5));
  // Very hard on 360 x 640: smallest cell.
  await page.evaluate(() => { document.getElementById("ig-level").value = "expert"; startIG(); });
  await page.waitForTimeout(200);
  const cell360 = await page.evaluate(() => { const svg = document.querySelector("#ig-board svg"); return AppStateIG.cell * svg.getScreenCTM().a; });
  check("very hard: cells at least 16 px on 360 x 640 (" + cell360.toFixed(1) + ")", cell360 >= 15.9);
  if (process.env.SHOTS) await page.screenshot({ path: "/tmp/irrgarten-expert.png", fullPage: true });
  check("no sideways scroll", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));

  // Drawing with a finger (touch events), medium.
  if (!(await page.isVisible("#ig-input"))) await page.click("#menu-toggle");
  await page.selectOption("#ig-input", "drag");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  check("drawing remembered", await page.evaluate(() => AppStateIG.input === "drag" && document.getElementById("ig-board").classList.contains("ig-drag-mode") && getComputedStyle(document.getElementById("ig-board")).touchAction === "none"));
  await page.evaluate(() => { document.getElementById("ig-level").value = "medium"; startIG(); window.scrollTo(0, document.getElementById("ig-board").getBoundingClientRect().top + scrollY - 5); });
  await page.waitForTimeout(200);
  check("drawing: status: " + (await page.textContent("#board-info")), (await page.textContent("#board-info")).trim() === "Zieh den Weg mit dem Finger.");
  const msol = await page.evaluate(() => IrrgartenCore.solution(IrrgartenCore.mazeOf(AppStateIG.state)));
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts.map(([x, y]) => ({ x, y })) });
  const y0 = await page.evaluate(() => scrollY);
  await page.evaluate(() => { window.__svg = document.querySelector("#ig-board svg"); });
  await watch(page);
  let q = await cellXY(page, 0);
  await touch("touchStart", [q]);
  const upto = Math.min(msol.length - 1, 24);
  for (let i = 1; i <= upto; i++) {
    const r = await cellXY(page, msol[i]);
    for (let k = 1; k <= 3; k++) await touch("touchMove", [[q[0] + (r[0] - q[0]) * k / 3, q[1] + (r[1] - q[1]) * k / 3]]);
    q = r;
  }
  await touch("touchEnd", []);
  await page.waitForTimeout(100);
  const drawn = await page.evaluate((y) => ({ len: AppStateIG.state.path.length, same: document.querySelector("#ig-board svg") === window.__svg, still: Math.abs(scrollY - y) < 2, mut: Object.assign({}, window.__mut) }), y0);
  check("finger draws " + upto + " cells of the right way, page stays, board not built again " + JSON.stringify(drawn), drawn.len === upto + 1 && drawn.same && drawn.still && drawn.mut.added === 0 && drawn.mut.removed === 0);
  check("drawing: no message on the way", (await page.textContent("#board-info")).trim() === "Zieh den Weg mit dem Finger.");
  await page.evaluate(() => { localStorage.removeItem("papergames_irrgarten_input"); localStorage.removeItem("einkchess_save_irrgarten"); });
  check("page errors " + errors.join(" | "), errors.length === 0);

  // Reader screen 600 x 800.
  const reader = await browser.newContext({ viewport: { width: 600, height: 800 }, serviceWorkers: "block" });
  const rp = await reader.newPage();
  rp.on("pageerror", (e) => errors.push(e.message));
  await rp.goto(BASE + "irrgarten.html?lang=de", { waitUntil: "load" });
  await rp.waitForTimeout(400);
  const sizes = {};
  for (const level of ["easy", "medium", "hard", "expert"]) {
    await rp.evaluate((lv) => { document.getElementById("ig-level").value = lv; startIG(); }, level);
    sizes[level] = await rp.evaluate(() => Math.round(AppStateIG.cell * document.querySelector("#ig-board svg").getScreenCTM().a));
  }
  check("reader: very hard cells at least 28 px " + JSON.stringify(sizes), sizes.expert >= 27);
  check("no sideways scroll (reader)", await rp.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  if (process.env.SHOTS) await rp.screenshot({ path: "/tmp/irrgarten-reader.png", fullPage: true });
  check("page errors (reader) " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log("=== IRRGARTEN UI: wall, right way by taps, few changes per tap, back, hint, save and load, goal, drawing with a finger (remembered), cell sizes px " + JSON.stringify(sizes) + " on the reader, " + cell360.toFixed(1) + " px very hard on 360 x 640, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
