#!/usr/bin/env node
// Zahlenbild in the browser (tasks 166 and 169), German page at 360 x 640.
// Easy: the status asks for dot 1, a wrong dot gives "Das ist Punkt 3.
// Gesucht ist Punkt 1." and changes nothing, tapping every dot in order
// (real taps on the drawn dots) finishes the picture with its name; easy
// keeps the whole board with dots 44 px apart and more.
// Very hard (task 169): the whole picture by default (no magnified part),
// no two numbers overlap; five dots tapped: the board is not built again
// (the same svg element), its scale and part do not change; a tap half-way
// between the next dot and its nearest neighbour counts for the next dot;
// saved and back after a reload; an old save with "zoom" starts with the
// whole picture; undo, hint; "Vergrößern" shows a fixed part (closest dots
// 30 px apart) that does not move with taps, "Zum nächsten Punkt" moves it
// when the next dot is outside, the choice is saved; "Ganzes Bild" goes
// back. Buttons at least 44 px, no sideways scroll, no page error. Every
// level and picture also on 384 x 752 and on the 600 x 800 reader: numbers
// never overlap. Exception (task 169): from medium on the dots themselves
// are closer than 44 px on purpose (Kirsten's wish); the 44 px rule of task
// 164 applies to the buttons.
// Task 169, second report: per tap no element is added or removed and at
// most 14 changes happen on the page; a "resize" with the same width keeps
// the board; no grey tap flash. "Linie ziehen" (remembered): one mouse
// stroke through an easy picture joins every dot without building the board
// again and without messages for dots on the way; taps still work; a finger
// (touch events) on 384 x 752 draws dots 1 to 6 and the page does not scroll.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

// Screen position of dot i (the page scrolls so that it is on the screen).
const dotXY = (page, i) => page.evaluate((k) => {
  const svg = document.querySelector("#zb-board svg");
  const p = ZahlenbildCore.dotsOf(AppStateZB.state.level, AppStateZB.state.motif)[k];
  const v = AppStateZB.view;
  const at = () => { const pt = svg.createSVGPoint(); pt.x = (p[0] - v.x) * v.scale; pt.y = (p[1] - v.y) * v.scale; return pt.matrixTransform(svg.getScreenCTM()); };
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
  const all = Array.from(document.querySelectorAll("#zb-board .zb-num")).map((t) => t.getBoundingClientRect());
  const nums = all.filter(inside);
  // On the whole picture (task 169) every number lies inside the board.
  const cut = AppStateZB.view.zoomed ? 0 : all.length - nums.length;
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
  const font = Math.min(...Array.from(document.querySelectorAll("#zb-board .zb-num")).map((t) => parseFloat(getComputedStyle(t).fontSize)));
  return { dots: dots.length, nums: nums.length, min, overlap, cut, size: AppStateZB.view.size, font, square: Math.abs(board.width - board.height) < 2 };
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

  // Very hard (task 169): whole picture, fixed, not built again per tap.
  await page.evaluate(() => { document.getElementById("zb-level").value = "expert"; startZB(); });
  await page.waitForTimeout(200);
  const ex = await layout(page);
  const view0 = await page.evaluate(() => { window.__svg = document.querySelector("#zb-board svg"); const v = AppStateZB.view; return { x: v.x, y: v.y, size: v.size, scale: v.scale, zoomed: v.zoomed }; });
  check("expert: whole picture by default " + JSON.stringify(view0), !view0.zoomed);
  check("expert: 'Vergrößern' offered", (await page.isVisible("#zb-zoom")) && (await page.textContent("#zb-zoom")).trim() === "Vergrößern");
  check("expert: no numbers overlap (" + ex.overlap + "), none cut (" + ex.cut + ")", ex.overlap === 0 && ex.cut === 0);
  check("expert: numbers at least 8 px (" + ex.font + ")", ex.font >= 8);
  console.log("360 x 640 expert whole picture: closest dots " + ex.min.toFixed(1) + " px, numbers " + ex.font + " px");
  for (let i = 0; i < 5; i++) await tapDot(page, i);
  const same = await page.evaluate((v0) => { const v = AppStateZB.view; return { svg: document.querySelector("#zb-board svg") === window.__svg, view: v.x === v0.x && v.y === v0.y && v.size === v0.size && v.scale === v0.scale, line: document.getElementById("zb-line").getAttribute("points").trim().split(/\s+/).length }; }, view0);
  check("five dots joined", await page.evaluate(() => AppStateZB.state.done === 5));
  check("taps do not build the board again " + JSON.stringify(same), same.svg && same.view && same.line === 5);
  // A tap half-way to the closest other dot still counts for the next dot.
  const half = await page.evaluate(() => {
    const s = AppStateZB.state, d = ZahlenbildCore.dotsOf(s.level, s.motif), n = s.done;
    let b = -1, bd = Infinity;
    d.forEach((p, i) => { if (i !== n) { const h = Math.hypot(p[0] - d[n][0], p[1] - d[n][1]); if (h < bd) { bd = h; b = i; } } });
    const v = AppStateZB.view, svg = document.querySelector("#zb-board svg");
    const pt = svg.createSVGPoint();
    pt.x = ((d[n][0] * 0.55 + d[b][0] * 0.45) - v.x) * v.scale; pt.y = ((d[n][1] * 0.55 + d[b][1] * 0.45) - v.y) * v.scale;
    const q = pt.matrixTransform(svg.getScreenCTM());
    if (q.y < 20 || q.y > innerHeight - 20) window.scrollBy(0, q.y - innerHeight / 2);
    const q2 = pt.matrixTransform(svg.getScreenCTM());
    return [q2.x, q2.y];
  });
  await page.mouse.click(half[0], half[1]);
  check("tap between two close dots counts for the next one", await page.evaluate(() => AppStateZB.state.done === 6));
  // Task 169 (second report): changes of the page per tap. No element is
  // added or removed anywhere; only a few attributes and the status text.
  await page.evaluate(() => {
    window.__mut = { records: 0, attrs: 0, added: 0, removed: 0, texts: 0 };
    window.__obs = new MutationObserver((list) => list.forEach((m) => {
      window.__mut.records++;
      if (m.type === "attributes") window.__mut.attrs++;
      if (m.type === "characterData") window.__mut.texts++;
      m.addedNodes.forEach((n) => { if (n.nodeType === 1) window.__mut.added++; else window.__mut.texts++; });
      m.removedNodes.forEach((n) => { if (n.nodeType === 1) window.__mut.removed++; });
    }));
    window.__obs.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  });
  const perTap = [];
  for (let k = 0; k < 3; k++) {
    await page.evaluate(() => { window.__mut = { records: 0, attrs: 0, added: 0, removed: 0, texts: 0 }; });
    await tapDot(page, await page.evaluate(() => AppStateZB.state.done));
    await page.waitForTimeout(50);
    perTap.push(await page.evaluate(() => Object.assign({}, window.__mut)));
  }
  const svgElements = await page.evaluate(() => document.querySelectorAll("#zb-board svg *").length);
  check("per tap no element added or removed, at most 14 changes " + JSON.stringify(perTap), perTap.every((m) => m.added === 0 && m.removed === 0 && m.records <= 14));
  console.log("per tap: " + perTap.map((m) => m.records + " changes (" + m.attrs + " attributes)").join(", ") + ", 0 elements replaced; the board has " + svgElements + " elements (before task 169 all of them were built again per tap)");
  // A "resize" with the same width (the phone's address bar) draws nothing again.
  await page.evaluate(() => { window.__svg2 = document.querySelector("#zb-board svg"); window.dispatchEvent(new Event("resize")); });
  check("resize with the same width keeps the board", await page.evaluate(() => document.querySelector("#zb-board svg") === window.__svg2));
  check("no grey tap flash on the board", await page.evaluate(() => { const c = getComputedStyle(document.getElementById("zb-board")).webkitTapHighlightColor; return c === "rgba(0, 0, 0, 0)" || c === "transparent"; }));
  await page.evaluate(() => window.__obs.disconnect());
  // Back to six dots for the checks below.
  while (await page.evaluate(() => AppStateZB.state.done > 6)) await page.click("#undo-btn");
  const heights = await page.evaluate(() => ["undo-btn", "hint-btn", "zb-zoom"].map((id) => document.getElementById(id).getBoundingClientRect().height));
  check("buttons at least 44 px " + JSON.stringify(heights), heights.every((h) => h >= 43.5));
  check("no sideways scroll (expert)", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  const motif = await page.evaluate(() => AppStateZB.state.motif);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  const back = await page.evaluate(() => AppStateZB.state && { done: AppStateZB.state.done, level: AppStateZB.state.level, motif: AppStateZB.state.motif, zoomed: AppStateZB.view.zoomed });
  check("saved and back " + JSON.stringify(back), back && back.done === 6 && back.level === "expert" && back.motif === motif && back.zoomed === false);
  await page.click("#undo-btn");
  check("undo takes one dot back", await page.evaluate(() => AppStateZB.state.done === 5));
  await page.click("#hint-btn");
  check("hint names dot 6: " + (await page.textContent("#board-info")), /Punkt 6/.test(await page.textContent("#board-info")));
  check("hint draws the double ring", await page.evaluate(() => document.querySelectorAll("#zb-hint circle").length === 2));
  // "Vergrößern": a fixed part; taps do not move it.
  await page.click("#zb-zoom");
  const mag = await page.evaluate(() => { const v = AppStateZB.view; window.__svg = document.querySelector("#zb-board svg"); return { x: v.x, y: v.y, size: v.size, scale: v.scale, zoomed: v.zoomed, label: document.getElementById("zb-zoom").textContent.trim() }; });
  const mlay = await layout(page);
  check("magnified part " + JSON.stringify(mag), mag.zoomed && mag.label === "Ganzes Bild" && mag.size < view0.size);
  check("magnified: closest dots about 30 px (" + mlay.min.toFixed(1) + "), numbers clear (" + mlay.overlap + ")", mlay.min >= 29 && mlay.overlap === 0);
  let moved = false, followSeen = false;
  for (let k = 0; k < 30; k++) {
    if (await page.isVisible("#zb-follow")) { followSeen = true; break; }
    const n = await page.evaluate(() => AppStateZB.state.done);
    await tapDot(page, n);
    const v = await page.evaluate(() => { const v = AppStateZB.view; return { x: v.x, y: v.y, scale: v.scale }; });
    if (v.x !== mag.x || v.y !== mag.y || v.scale !== mag.scale) moved = true;
  }
  check("magnified part does not move with taps", !moved);
  check("'Zum nächsten Punkt' appears when the next dot leaves the part", followSeen);
  const fh = await page.evaluate(() => document.getElementById("zb-follow").getBoundingClientRect().height);
  check("'Zum nächsten Punkt' 44 px (" + fh + ")", fh >= 43.5);
  await page.click("#zb-follow");
  const after = await page.evaluate(() => ({ moved: AppStateZB.view.x !== undefined, inside: !document.getElementById("zb-follow").offsetHeight, saved: JSON.parse(localStorage.getItem("einkchess_save_zahlenbild")).magnify }));
  check("part moved to the next dot and saved " + JSON.stringify(after), after.inside && after.saved && typeof after.saved.x === "number");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  check("magnified part back after reload", await page.evaluate(() => AppStateZB.view.zoomed === true));
  await page.click("#zb-zoom");
  const whole = await page.evaluate(() => ({ zoomed: AppStateZB.view.zoomed, label: document.getElementById("zb-zoom").textContent.trim() }));
  check("whole picture after the button " + JSON.stringify(whole), !whole.zoomed && whole.label === "Vergrößern");
  // An old save from task 166 with "zoom": starts with the whole picture.
  await page.evaluate(() => { const s = ZahlenbildCore.newGame("hard", ZahlenbildCore.MOTIFS.hard[0].id); s.done = 3; localStorage.setItem("einkchess_save_zahlenbild", JSON.stringify({ state: s, zoom: true, hints: 0 })); });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  check("old save with zoom loads whole", await page.evaluate(() => AppStateZB.state.done === 3 && AppStateZB.view.zoomed === false));
  check("page errors " + errors.join(" | "), errors.length === 0);

  // Task 169: "Linie ziehen". Default is tapping; the choice is remembered.
  check("default way: tapping", await page.evaluate(() => document.getElementById("zb-input").value === "tap" && AppStateZB.input === "tap"));
  if (!(await page.isVisible("#zb-input"))) await page.click("#menu-toggle");
  await page.selectOption("#zb-input", "drag");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  check("drawing remembered after reload", await page.evaluate(() => document.getElementById("zb-input").value === "drag" && AppStateZB.input === "drag" && document.getElementById("zb-board").classList.contains("zb-drag-mode")));
  check("drawing: page does not scroll under the finger", await page.evaluate(() => getComputedStyle(document.getElementById("zb-board")).touchAction === "none"));
  // Mouse: one stroke through all dots of an easy picture, passing over the
  // board in between; other dots on the way give no message.
  await page.evaluate(() => { document.getElementById("zb-level").value = "easy"; startZB(); window.scrollTo(0, document.getElementById("zb-board").getBoundingClientRect().top + scrollY - 10); });
  await page.waitForTimeout(200);
  check("drawing: status asks to draw: " + (await page.textContent("#board-info")), (await page.textContent("#board-info")).trim() === "Zieh die Linie zu Punkt 1.");
  const nEasy = await page.evaluate(() => ZahlenbildCore.dotsOf(AppStateZB.state.level, AppStateZB.state.motif).length);
  await page.evaluate(() => {
    window.__svg3 = document.querySelector("#zb-board svg");
    window.__mut = { added: 0, removed: 0, records: 0 };
    window.__obs = new MutationObserver((list) => list.forEach((m) => { window.__mut.records++; m.addedNodes.forEach((n) => { if (n.nodeType === 1) window.__mut.added++; }); m.removedNodes.forEach((n) => { if (n.nodeType === 1) window.__mut.removed++; }); }));
    window.__obs.observe(document.getElementById("zb-board"), { subtree: true, childList: true, attributes: true });
  });
  let p0 = await dotXY(page, 0);
  await page.mouse.move(p0[0], p0[1]);
  await page.mouse.down();
  let wrongSeen = false;
  for (let i = 1; i < nEasy - 1; i++) {
    const p1 = await dotXY(page, i);
    await page.mouse.move(p1[0], p1[1], { steps: 8 });
    if (/Das ist Punkt/.test(await page.textContent("#board-info"))) wrongSeen = true;
  }
  // Half-way to the last dot: the preview line is out.
  const pl = await dotXY(page, nEasy - 1);
  const pm = await dotXY(page, nEasy - 2);
  await page.mouse.move((pl[0] + pm[0]) / 2, (pl[1] + pm[1]) / 2, { steps: 4 });
  const midDrag = await page.evaluate(() => ({ done: AppStateZB.state.done, svg: document.querySelector("#zb-board svg") === window.__svg3, mut: Object.assign({}, window.__mut), preview: document.getElementById("zb-drag").getAttribute("visibility") }));
  // The last dot finishes the picture.
  await page.mouse.move(pl[0], pl[1], { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(100);
  check("drawing: dots joined one after the other, board not built again " + JSON.stringify(midDrag), midDrag.done === nEasy - 1 && midDrag.svg && midDrag.mut.added === 0 && midDrag.mut.removed === 0);
  check("drawing: preview line shown while drawing", midDrag.preview === "visible");
  check("drawing: no message for dots passed on the way", !wrongSeen);
  check("drawing: picture finished", await page.evaluate(() => AppStateZB.state.solved === true));
  console.log("drawing (" + nEasy + " dots, one stroke): " + midDrag.mut.records + " changes on the board, 0 elements replaced");
  await page.evaluate(() => { window.__obs.disconnect(); if (window.ResultModal) window.ResultModal.hide(); });
  // A tap still works when drawing is chosen, and a lifted finger hides the preview.
  await page.evaluate(() => { document.getElementById("zb-level").value = "medium"; startZB(); });
  await page.waitForTimeout(200);
  await tapDot(page, 0);
  await tapDot(page, 1);
  check("drawing chosen: taps still join dots", await page.evaluate(() => AppStateZB.state.done === 2));
  check("drawing chosen: preview hidden after lifting", await page.evaluate(() => document.getElementById("zb-drag").getAttribute("visibility") === "hidden"));
  check("drawing chosen: no wrong message after a tap on the next dot: " + (await page.textContent("#board-info")), (await page.textContent("#board-info")).trim() === "Zieh die Linie zu Punkt 3.");
  // Saved game and the way of playing both back after a reload.
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  check("drawing: game and way back after reload", await page.evaluate(() => AppStateZB.state.done === 2 && AppStateZB.input === "drag"));
  await page.evaluate(() => { localStorage.removeItem("papergames_zahlenbild_input"); localStorage.removeItem("einkchess_save_zahlenbild"); });
  check("page errors (drawing) " + errors.join(" | "), errors.length === 0);

  // Phone 384 x 752: every level clear, easy 44 px.
  const phone = await browser.newContext({ viewport: { width: 384, height: 752 }, hasTouch: true, serviceWorkers: "block" });
  const pp = await phone.newPage();
  pp.on("pageerror", (e) => errors.push(e.message));
  await pp.goto(BASE + "zahlenbild.html?lang=de", { waitUntil: "load" });
  await pp.waitForTimeout(400);
  const phoneMin = {};
  for (const level of ["easy", "medium", "hard", "expert"]) {
    for (let k = 0; k < 5; k++) {
      await pp.evaluate((lv) => { document.getElementById("zb-level").value = lv; startZB(); }, level);
      const l = await layout(pp);
      phoneMin[level] = Math.min(phoneMin[level] || Infinity, l.min);
      check("384 x 752 " + level + " picture " + (k + 1) + " " + JSON.stringify(l), l.overlap === 0 && l.cut === 0 && l.square && (level !== "easy" || l.min >= 43.5));
    }
  }
  check("no sideways scroll (384 x 752)", await pp.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  console.log("384 x 752 closest dots px " + JSON.stringify(Object.fromEntries(Object.entries(phoneMin).map(([a, b]) => [a, Math.round(b)]))));
  // Drawing with a real finger (touch events) on the phone, medium level.
  await pp.evaluate(() => { localStorage.setItem("papergames_zahlenbild_input", "drag"); });
  await pp.reload({ waitUntil: "load" });
  await pp.waitForTimeout(400);
  await pp.evaluate(() => { document.getElementById("zb-level").value = "medium"; startZB(); window.scrollTo(0, document.getElementById("zb-board").getBoundingClientRect().top + scrollY - 10); });
  await pp.waitForTimeout(200);
  const cdp = await phone.newCDPSession(pp);
  const touch = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts.map(([x, y]) => ({ x, y })) });
  const scrollBefore = await pp.evaluate(() => scrollY);
  let q = await dotXY(pp, 0);
  await touch("touchStart", [q]);
  for (let i = 1; i < 6; i++) {
    const r = await dotXY(pp, i);
    for (let k = 1; k <= 8; k++) await touch("touchMove", [[q[0] + (r[0] - q[0]) * k / 8, q[1] + (r[1] - q[1]) * k / 8]]);
    q = r;
  }
  await touch("touchEnd", []);
  await pp.waitForTimeout(100);
  const fing = await pp.evaluate((y0) => ({ done: AppStateZB.state.done, still: Math.abs(scrollY - y0) < 2, status: document.getElementById("board-info").textContent }), scrollBefore);
  check("phone: a finger draws dots 1 to 6, the page stays " + JSON.stringify(fing), fing.done === 6 && fing.still && fing.status === "Zieh die Linie zu Punkt 7.");

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
      check("reader " + level + " picture " + (k + 1) + " " + JSON.stringify(l), l.overlap === 0 && l.cut === 0 && l.square && (level !== "easy" || l.min >= 43.5));
    }
  }
  check("no sideways scroll (reader)", await rp.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  check("page errors (reader) " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log("=== ZAHLENBILD UI: wrong dot, easy picture finished, whole picture fixed without rebuild, close taps, few changes per tap, no tap flash, save and load, undo, hint, fixed magnified part, drawing a line (mouse and finger, remembered), 384 x 752 and reader screen (closest dots px " + JSON.stringify(Object.fromEntries(Object.entries(levels).map(([a, b]) => [a, Math.round(b)]))) + "), " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
