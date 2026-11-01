#!/usr/bin/env node
// Suchbild in the browser (task 171), German page at 360 x 640 and on the
// 600 x 800 reader screen. Every level: the drawn signs do not overlap (their
// boxes on the screen), the board has no sideways scroll. Easy: a tap on a
// normal sign gives "Das ist wie die anderen." and adds nothing; a tap on an
// odd one adds one ring, nothing else on the board (no element removed, the
// svg stays); "Gefunden: n von m"; the same odd one again counts once; hint
// draws one dashed box with an odd one inside; saved and back after a
// reload; all found shows the result and the game is not saved. Very hard:
// signs at least 16 px on 360 x 640 (task 171: below 44 px so the page can
// be filled, see task 169), "Vergrößern" doubles the board, stays when
// tapping and is saved. Buttons 44 px, no tap flash, no page error.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

const itemXY = (page, i) => page.evaluate((k) => {
  const svg = document.querySelector("#sb-board svg");
  const it = SuchbildCore.roundOf(AppStateSB.state).items[k];
  const at = () => { const pt = svg.createSVGPoint(); pt.x = it.x * SuchbildCore.UNIT; pt.y = it.y * SuchbildCore.UNIT; return pt.matrixTransform(svg.getScreenCTM()); };
  let q = at();
  if (q.y < 20 || q.y > innerHeight - 20) { window.scrollBy(0, q.y - innerHeight / 2); q = at(); }
  const box = document.getElementById("sb-scroll").getBoundingClientRect();
  if (q.x < box.left + 10 || q.x > box.right - 10) { document.getElementById("sb-scroll").scrollLeft += q.x - (box.left + box.right) / 2; q = at(); }
  return [q.x, q.y];
}, i);

const tapItem = async (page, i) => {
  const [x, y] = await itemXY(page, i);
  await page.mouse.click(x, y);
  await page.waitForTimeout(20);
};

// Overlapping sign boxes (1 px slack) and the smallest cell in px.
const layout = (page) => page.evaluate(() => {
  const boxes = Array.from(document.querySelectorAll("#sb-board .sb-sign")).map((g) => g.getBoundingClientRect());
  let overlap = 0;
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.left + 0.5 < b.right - 0.5 && b.left + 0.5 < a.right - 0.5 && a.top + 0.5 < b.bottom - 0.5 && b.top + 0.5 < a.bottom - 0.5) overlap++;
  }
  const svg = document.querySelector("#sb-board svg");
  return { signs: boxes.length, overlap, cell: SuchbildCore.UNIT * svg.getScreenCTM().a, sideways: document.documentElement.scrollWidth - innerWidth > 0 };
});

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "suchbild.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  if (!(await page.isVisible("#start-sb-game"))) await page.click("#menu-toggle");
  await page.selectOption("#sb-level", "easy");
  await page.click("#start-sb-game");
  await page.waitForTimeout(200);
  const rd = await page.evaluate(() => { const r = SuchbildCore.roundOf(AppStateSB.state); return { count: r.count, odd: SuchbildCore.oddIndexes(r), normal: r.items.findIndex((it) => !it.odd) }; });
  check("status names the count: " + (await page.textContent("#board-info")), (await page.textContent("#board-info")).trim() === "Finde die " + rd.count + " Zeichen, die anders sind.");
  check("no grey tap flash", await page.evaluate(() => { const c = getComputedStyle(document.getElementById("sb-board")).webkitTapHighlightColor; return c === "rgba(0, 0, 0, 0)" || c === "transparent"; }));
  await page.evaluate(() => {
    window.__svg = document.querySelector("#sb-board svg");
    window.__mut = { records: 0, added: 0, removed: 0, addedBoard: 0 };
    window.__obs = new MutationObserver((list) => list.forEach((m) => { window.__mut.records++; m.addedNodes.forEach((n) => { if (n.nodeType === 1) { window.__mut.added++; if (n.closest && n.closest("#sb-board")) window.__mut.addedBoard++; } }); m.removedNodes.forEach((n) => { if (n.nodeType === 1) window.__mut.removed++; }); }));
    window.__obs.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  });
  await tapItem(page, rd.normal);
  const wrong = await page.evaluate(() => Object.assign({ status: document.getElementById("board-info").textContent, rings: document.querySelectorAll("#sb-rings circle").length }, window.__mut));
  check("normal sign: note, nothing added " + JSON.stringify(wrong), wrong.status === "Das ist wie die anderen." && wrong.rings === 0 && wrong.added === 0 && wrong.removed === 0);
  await page.evaluate(() => { window.__mut = { records: 0, added: 0, removed: 0, addedBoard: 0 }; });
  await tapItem(page, rd.odd[0]);
  const found = await page.evaluate(() => Object.assign({ meta: document.getElementById("game-meta").textContent, rings: document.querySelectorAll("#sb-rings circle").length, same: document.querySelector("#sb-board svg") === window.__svg }, window.__mut));
  check("odd one: one ring more, board not built again " + JSON.stringify(found), found.rings === 1 && found.same && found.addedBoard === 1 && found.removed === 0 && found.records <= 8 && found.meta.indexOf("Gefunden: 1 von " + rd.count) === 0);
  console.log("per find: " + found.records + " changes, " + found.addedBoard + " element added (the ring), 0 removed; per wrong tap: " + wrong.records + " changes");
  await page.evaluate(() => window.__obs.disconnect());
  if (rd.count > 1) {
    await tapItem(page, rd.odd[0]);
    check("the same one again: " + (await page.textContent("#board-info")), (await page.textContent("#board-info")).trim() === "Das hast du schon gefunden." && (await page.evaluate(() => AppStateSB.state.found.length)) === 1);
  }
  await page.click("#hint-btn");
  const hint = await page.evaluate(() => {
    const r = document.querySelector("#sb-hint rect");
    const a = SuchbildCore.hintArea(AppStateSB.state);
    const it = SuchbildCore.roundOf(AppStateSB.state).items[a.item];
    return { box: !!r, inside: it.x >= a.x && it.x <= a.x + a.w && it.y >= a.y && it.y <= a.y + a.h, note: document.getElementById("board-info").textContent };
  });
  check("hint box " + JSON.stringify(hint), hint.box && hint.inside && hint.note === "Tipp: Eines liegt im gestrichelten Kasten.");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  check("saved and back", await page.evaluate(() => AppStateSB.state && AppStateSB.state.found.length === 1 && document.querySelectorAll("#sb-rings circle").length === 1));
  for (const i of rd.odd.slice(1)) await tapItem(page, i);
  const end = await page.evaluate(() => ({ solved: AppStateSB.state.solved, result: document.getElementById("game-result").textContent, saved: localStorage.getItem("einkchess_save_suchbild") }));
  check("all found " + JSON.stringify(end), end.solved && end.result === "Geschafft! Du hast alle " + rd.count + " gefunden." && end.saved === null);
  await page.evaluate(() => { if (window.ResultModal) window.ResultModal.hide(); });
  const heights = await page.evaluate(() => ["hint-btn", "start-sb-game"].map((id) => document.getElementById(id).getBoundingClientRect().height));
  check("buttons at least 44 px " + JSON.stringify(heights), heights.every((h) => h === 0 || h >= 43.5));

  // Every level and round: no overlap, size of a cell.
  const sizes = {};
  for (const level of ["easy", "medium", "hard", "expert"]) {
    for (let k = 0; k < 5; k++) {
      await page.evaluate((lv) => { document.getElementById("sb-level").value = lv; startSB(); }, level);
      const l = await layout(page);
      sizes[level] = Math.round(l.cell);
      check("360 x 640 " + level + " round " + (k + 1) + " " + JSON.stringify(l), l.overlap === 0 && !l.sideways);
    }
  }
  check("very hard: cells at least 16 px (" + sizes.expert + ")", sizes.expert >= 16);
  // Magnify on very hard: twice as wide, stays with taps, saved.
  check("'Vergrößern' only on hard levels", await page.isVisible("#sb-zoom"));
  const zh = await page.evaluate(() => document.getElementById("sb-zoom").getBoundingClientRect().height);
  check("'Vergrößern' 44 px (" + zh + ")", zh >= 43.5);
  await page.click("#sb-zoom");
  const mag = await layout(page);
  check("magnified: cells twice as big " + JSON.stringify(mag), Math.abs(mag.cell - 2 * sizes.expert) < 2 && mag.overlap === 0 && !mag.sideways);
  const odd2 = await page.evaluate(() => SuchbildCore.oddIndexes(SuchbildCore.roundOf(AppStateSB.state)));
  await page.evaluate(() => { window.__svg = document.querySelector("#sb-board svg"); });
  await tapItem(page, odd2[0]);
  check("magnified: a tap finds, board stays", await page.evaluate(() => AppStateSB.state.found.length === 1 && document.querySelector("#sb-board svg") === window.__svg && AppStateSB.magnify));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  check("magnify saved", await page.evaluate(() => AppStateSB.magnify === true && document.getElementById("sb-scroll").classList.contains("sb-magnified")));
  await page.click("#sb-zoom");
  check("'Normale Größe' goes back", await page.evaluate(() => !AppStateSB.magnify && document.getElementById("sb-zoom").textContent.trim() === "Vergrößern"));
  await page.evaluate(() => { localStorage.removeItem("einkchess_save_suchbild"); });
  check("page errors " + errors.join(" | "), errors.length === 0);

  // Reader screen 600 x 800.
  const reader = await browser.newContext({ viewport: { width: 600, height: 800 }, serviceWorkers: "block" });
  const rp = await reader.newPage();
  rp.on("pageerror", (e) => errors.push(e.message));
  await rp.goto(BASE + "suchbild.html?lang=de", { waitUntil: "load" });
  await rp.waitForTimeout(400);
  const rsizes = {};
  for (const level of ["easy", "medium", "hard", "expert"]) {
    await rp.evaluate((lv) => { document.getElementById("sb-level").value = lv; startSB(); }, level);
    const l = await layout(rp);
    rsizes[level] = Math.round(l.cell);
    check("reader " + level + " " + JSON.stringify(l), l.overlap === 0 && !l.sideways);
  }
  check("page errors (reader) " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log("=== SUCHBILD UI: wrong tap, find with one ring, again, hint box, save and load, all found, no overlap on every level, magnify (saved), cell px 360 x 640 " + JSON.stringify(sizes) + ", reader " + JSON.stringify(rsizes) + ", " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
