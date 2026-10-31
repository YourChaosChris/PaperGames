#!/usr/bin/env node
// Zahlenbild in the browser (task 166), German page at 360 x 640. Easy: the
// status asks for dot 1, a wrong dot gives "Das ist Punkt 3. Gesucht ist
// Punkt 1." and changes nothing, tapping every dot in order (real taps on
// the drawn dots) finishes the picture with its name. Very hard: the board
// shows a magnified part ("Ganzes Bild" button), the visible dots are at
// least 44 px apart and no two numbers overlap; five dots tapped, saved and
// back after a reload (with the view), undo takes one back, "Ganzes Bild"
// shows the whole board and a tap still counts. Buttons at least 44 px, no
// sideways scroll, no page error. The same numbers check on a 600 x 800
// reader screen.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

// Screen position of dot i (the page scrolls so that it is on the screen).
const dotXY = (page, i) => page.evaluate((k) => {
  const svg = document.querySelector("#zb-board svg");
  const p = ZahlenbildCore.dotsOf(AppStateZB.state.level, AppStateZB.state.motif)[k];
  const at = () => { const pt = svg.createSVGPoint(); pt.x = p[0]; pt.y = p[1]; return pt.matrixTransform(svg.getScreenCTM()); };
  let q = at();
  if (q.y < 20 || q.y > innerHeight - 20) { window.scrollBy(0, q.y - innerHeight / 2); q = at(); }
  return [q.x, q.y];
}, i);

const tapDot = async (page, i) => {
  const [x, y] = await dotXY(page, i);
  await page.mouse.click(x, y);
  await page.waitForTimeout(30);
};

// Visible dots: smallest distance in px, overlapping numbers, all inside the board.
const layout = (page) => page.evaluate(() => {
  const board = document.getElementById("zb-board").getBoundingClientRect();
  const inside = (r) => r.left >= board.left - 1 && r.right <= board.right + 1 && r.top >= board.top - 1 && r.bottom <= board.bottom + 1;
  const dots = Array.from(document.querySelectorAll("#zb-board circle")).filter((c) => !c.getAttribute("fill") || c.getAttribute("fill") !== "none").map((c) => c.getBoundingClientRect()).filter((r) => r.width > 0 && inside(r));
  const nums = Array.from(document.querySelectorAll("#zb-board .zb-num")).map((t) => t.getBoundingClientRect()).filter(inside);
  let min = Infinity;
  for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
    min = Math.min(min, Math.hypot(dots[i].x + dots[i].width / 2 - dots[j].x - dots[j].width / 2, dots[i].y + dots[i].height / 2 - dots[j].y - dots[j].height / 2));
  }
  let overlap = 0;
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) {
    const a = nums[i], b = nums[j];
    // 1 px of slack for the white halo and rounding.
    if (a.left + 1 < b.right - 1 && b.left + 1 < a.right - 1 && a.top + 1 < b.bottom - 1 && b.top + 1 < a.bottom - 1) overlap++;
  }
  const vb = document.querySelector("#zb-board svg").getAttribute("viewBox").split(" ").map(Number);
  return { dots: dots.length, nums: nums.length, min, overlap, size: vb[2], square: Math.abs(board.width - board.height) < 2 };
});

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "zahlenbild.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  if (!(await page.isVisible("#start-zb-game"))) await page.click("#menu-toggle");
  await page.selectOption("#zb-level", "easy");
  await page.click("#start-zb-game");
  await page.waitForTimeout(200);
  check("status asks for dot 1: " + (await page.textContent("#board-info")), (await page.textContent("#board-info")).trim() === "Tippe auf Punkt 1.");
  check("easy board square", (await layout(page)).square);
  await tapDot(page, 2);
  check("wrong dot named: " + (await page.textContent("#board-info")), (await page.textContent("#board-info")).trim() === "Das ist Punkt 3. Gesucht ist Punkt 1.");
  check("wrong dot changes nothing", await page.evaluate(() => AppStateZB.state.done === 0));
  const easy = await layout(page);
  check("easy: whole board, no magnify button", easy.size === 108 && !(await page.isVisible("#zb-zoom")));
  check("easy: dots at least 44 px apart (" + easy.min.toFixed(1) + ")", easy.min >= 43.5);
  check("easy: no numbers overlap (" + easy.overlap + ")", easy.overlap === 0);
  const n = await page.evaluate(() => ZahlenbildCore.dotsOf(AppStateZB.state.level, AppStateZB.state.motif).length);
  for (let i = 0; i < n; i++) await tapDot(page, i);
  const done = await page.evaluate(() => ({ solved: AppStateZB.state.solved, name: document.getElementById("zb-name").textContent, visible: document.getElementById("zb-name").offsetHeight > 0, status: document.getElementById("board-info").textContent, saved: localStorage.getItem("einkchess_save_zahlenbild") }));
  check("picture finished " + JSON.stringify(done), done.solved && done.visible && done.name.length > 1 && /^Fertig! Das Bild: .+\.$/.test(done.status) && done.saved === null);
  if (await page.isVisible("#result-modal-close").catch(() => false)) await page.click("#result-modal-close").catch(() => {});
  await page.evaluate(() => { if (window.ResultModal) window.ResultModal.hide(); });

  // Very hard: magnified part.
  await page.evaluate(() => { document.getElementById("zb-level").value = "expert"; startZB(); });
  await page.waitForTimeout(200);
  const ex = await layout(page);
  check("expert: magnified (" + ex.size.toFixed(1) + " units)", ex.size < 60);
  check("expert: 'Ganzes Bild' shown", (await page.isVisible("#zb-zoom")) && (await page.textContent("#zb-zoom")).trim() === "Ganzes Bild");
  check("expert: visible dots at least 44 px apart (" + ex.min.toFixed(1) + ")", ex.min >= 43.5);
  check("expert: no numbers overlap (" + ex.overlap + ")", ex.overlap === 0);
  for (let i = 0; i < 5; i++) await tapDot(page, i);
  const mid = await layout(page);
  check("expert: still clear after 5 dots " + JSON.stringify(mid), mid.min >= 43.5 && mid.overlap === 0);
  check("five dots joined", await page.evaluate(() => AppStateZB.state.done === 5));
  const heights = await page.evaluate(() => ["undo-btn", "hint-btn", "zb-zoom"].map((id) => document.getElementById(id).getBoundingClientRect().height));
  check("buttons at least 44 px " + JSON.stringify(heights), heights.every((h) => h >= 43.5));
  check("no sideways scroll (expert)", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  const motif = await page.evaluate(() => AppStateZB.state.motif);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  const back = await page.evaluate(() => AppStateZB.state && { done: AppStateZB.state.done, level: AppStateZB.state.level, motif: AppStateZB.state.motif, zoom: AppStateZB.zoom });
  check("saved and back " + JSON.stringify(back), back && back.done === 5 && back.level === "expert" && back.motif === motif && back.zoom === true);
  await page.click("#undo-btn");
  check("undo takes one dot back", await page.evaluate(() => AppStateZB.state.done === 4));
  await page.click("#hint-btn");
  check("hint names dot 5: " + (await page.textContent("#board-info")), /Punkt 5/.test(await page.textContent("#board-info")));
  await page.click("#zb-zoom");
  const whole = await layout(page);
  check("whole picture after the button", whole.size === 108 && (await page.textContent("#zb-zoom")).trim() === "Vergrößern");
  await tapDot(page, 4);
  check("a tap counts on the whole picture", await page.evaluate(() => AppStateZB.state.done === 5));
  check("page errors " + errors.join(" | "), errors.length === 0);

  // Reader screen 600 x 800: every level clear.
  const reader = await browser.newContext({ viewport: { width: 600, height: 800 }, serviceWorkers: "block" });
  const rp = await reader.newPage();
  rp.on("pageerror", (e) => errors.push(e.message));
  await rp.goto(BASE + "zahlenbild.html?lang=de", { waitUntil: "load" });
  await rp.waitForTimeout(400);
  const levels = {};
  for (const level of ["easy", "medium", "hard", "expert"]) {
    for (let k = 0; k < 5; k++) {
      await rp.evaluate((lv) => { document.getElementById("zb-level").value = lv; startZB(); }, level);
      const l = await layout(rp);
      levels[level] = Math.min(levels[level] || Infinity, l.min);
      check("reader " + level + " picture " + (k + 1) + " " + JSON.stringify(l), l.min >= 43.5 && l.overlap === 0 && l.square);
    }
  }
  check("no sideways scroll (reader)", await rp.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  check("page errors (reader) " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log("=== ZAHLENBILD UI: wrong dot, easy picture finished, magnified view with 44 px dots and clear numbers, save and load, undo, hint, whole picture, reader screen (closest dots px " + JSON.stringify(Object.fromEntries(Object.entries(levels).map(([a, b]) => [a, Math.round(b)]))) + "), " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
