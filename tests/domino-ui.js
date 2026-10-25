#!/usr/bin/env node
// Domino in the browser (task 119), German page on a phone: 360 x 640 and
// 412 x 915 with touch, classic and triangles, against the computer.
//   - On the human's turn the stock button is always visible, at least
//     44 px high, labelled "Vorrat (N Steine)", with the sentence about
//     when to draw below it.
//   - A tile fits: tapping the stock draws nothing and says so right
//     below the button ("du musst nicht ziehen").
//   - Nothing fits: tapping the stock draws (classic until a tile fits,
//     triangles at most three).
//   - Triangles: picking a tile says the tile turns by itself; tapping
//     each offered place gives a valid move (tile on the board, corners
//     match).
// No page error, nothing scrolls sideways.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

const info = (page) => page.evaluate(() => {
  const b = document.getElementById("domino-stock-button");
  const r = b.getBoundingClientRect();
  let visible = !!r.height;
  for (let e = b; e; e = e.parentElement) if (e.classList && e.classList.contains("hidden")) visible = false;
  const s = AppStateDomino.state;
  return {
    action: DominoCore.requiredAction(s), visible, disabled: b.disabled, h: r.height, label: b.textContent.trim(),
    hint: document.getElementById("domino-stock-hint").textContent.trim(),
    note: document.getElementById("domino-stock-note").textContent.trim(),
    status: document.getElementById("board-info").textContent.trim(),
    stock: s.stock.length, hand: s.hands[0].length, overflow: document.documentElement.scrollWidth - innerWidth
  };
});

// Waits for the human's turn (the computer moves by timer).
const humanTurn = (page) => page.waitForFunction(() => AppStateDomino.state && AppStateDomino.state.turn === 0 && !AppStateDomino.busy && !AppStateDomino.gameOver, null, { timeout: 20000 });

(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ width: 360, height: 640 }, { width: 412, height: 915 }]) {
    for (const variant of ["classic", "triangle"]) {
      const tag = vp.width + "x" + vp.height + " " + variant + ": ";
      const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true, serviceWorkers: "block" });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("dialog", (d) => d.accept());
      await page.goto(BASE + "domino.html?lang=de", { waitUntil: "load" });
      await page.waitForTimeout(600);
      if (!(await page.isVisible("#domino-variant"))) await page.tap("#menu-toggle");
      await page.selectOption("#domino-variant", variant);
      await page.tap("#start-domino-game");
      await humanTurn(page);
      check(tag + "variant", await page.evaluate((v) => DominoCore.isTriangle(AppStateDomino.state) === (v === "triangle"), variant));

      // A tile fits (made sure by giving the human a fitting tile).
      await page.evaluate(() => {
        const s = AppStateDomino.state;
        const fits = (t) => (DominoCore.isTriangle(s) ? DominoCore.slotsForTile(s, t) : DominoCore.sidesForTile(s, t)).length > 0;
        if (!s.hands[0].some(fits)) {
          const i = s.stock.findIndex(fits);
          const t = s.stock[i]; s.stock[i] = s.hands[0][0]; s.hands[0][0] = t;
        }
        AppStateDomino.busy = true;          // no computer step by timer
        promptHumanDomino();
      });
      let a = await info(page);
      check(tag + "stock button visible while a tile fits", a.visible && !a.disabled);
      check(tag + "stock button at least 44 px (" + Math.round(a.h) + ")", a.h >= 44);
      check(tag + "label " + a.label, a.label === "Vorrat (" + a.stock + " Steine)");
      check(tag + "hint " + a.hint, a.hint === "Ziehe nur aus dem Vorrat, wenn keiner deiner Steine passt.");
      await page.tap("#domino-stock-button");
      let b = await info(page);
      check(tag + "no draw while a tile fits", b.hand === a.hand && b.stock === a.stock);
      check(tag + "note below the button: " + b.note, b.note === "Du hast einen passenden Stein – du musst nicht ziehen.");

      if (variant === "triangle") {
        // Every offered place gives a valid move.
        const n = await page.evaluate(() => {
          const s = AppStateDomino.state;
          const i = s.hands[0].findIndex((t) => DominoCore.slotsForTile(s, t).length > 0);
          return { i, places: DominoCore.slotsForTile(s, s.hands[0][i]).length };
        });
        for (let k = 0; k < n.places; k++) {
          const snap = await page.evaluate(() => JSON.stringify(AppStateDomino.state));
          await page.locator("#domino-hand button").nth(n.i).tap();
          const sel = await page.evaluate(() => document.getElementById("board-info").textContent.trim());
          check(tag + "turning sentence: " + sel, /Der Stein dreht sich dabei von selbst passend\.$/.test(sel));
          // with suggestions off every free place is offered: tap the k-th fitting one
          const ok = await page.evaluate((k) => {
            const s = AppStateDomino.state;
            const slot = DominoCore.slotsForTile(s, s.hands[0][AppStateDomino.selected])[k];
            const free = DominoCore.openSlots(s);
            const btn = document.querySelectorAll(".domino-place-btn")[(MoveHints.enabled() ? DominoCore.slotsForTile(s, s.hands[0][AppStateDomino.selected]) : free).indexOf(slot)];
            return { slot, has: !!btn, idx: Array.prototype.indexOf.call(document.querySelectorAll(".domino-place-btn"), btn) };
          }, k);
          check(tag + "place button for " + ok.slot, ok.has);
          if (ok.has) await page.locator(".domino-place-btn").nth(ok.idx).tap();
          const after = await page.evaluate((slot) => {
            const s = AppStateDomino.state;
            const laid = s.board[slot];
            const rc = DominoCore.parseSlot(slot);
            const pts = DominoCore.triCorners(rc[0], rc[1]);
            return !!laid && pts.every((pt, j) => s.corners[pt] === laid[j]);
          }, ok.slot);
          check(tag + "valid move on " + ok.slot, after);
          await page.evaluate((snap) => { AppStateDomino.state = JSON.parse(snap); AppStateDomino.selected = null; AppStateDomino.busy = true; AppStateDomino.gameOver = false; promptHumanDomino(); }, snap);
        }
      }

      // Nothing fits: swap non-fitting stock tiles into the hand.
      await page.evaluate(() => {
        const s = AppStateDomino.state;
        const fits = (t) => (DominoCore.isTriangle(s) ? DominoCore.slotsForTile(s, t) : DominoCore.sidesForTile(s, t)).length > 0;
        const pool = s.stock.concat(s.hands[0]);
        const hand = pool.filter((t) => !fits(t)).slice(0, s.hands[0].length);
        s.hands[0] = hand;
        s.stock = pool.filter((t) => hand.indexOf(t) === -1);
        s.drawn = s.drawn === undefined ? undefined : 0;
        promptHumanDomino();
      });
      a = await info(page);
      check(tag + "must draw", a.action === "draw" && a.visible && !a.disabled);
      await page.tap("#domino-stock-button");
      b = await info(page);
      check(tag + "drew by touch", b.hand > a.hand && b.stock < a.stock);
      if (variant === "triangle") check(tag + "at most three drawn", a.stock - b.stock <= 3);
      else check(tag + "classic draws until a tile fits", b.action === "play" || b.stock === 0);
      check(tag + "no sideways scrolling", b.overflow <= 0);
      check(tag + "no page error " + errors.join(" | "), !errors.length);
      console.log(tag + "stock button " + Math.round(a.h) + " px, \"" + a.label + "\", drew " + (a.stock - b.stock));
      await ctx.close();
    }
  }
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== DOMINO UI: stock button and triangle places at 360x640 and 412x915 with touch, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})();
