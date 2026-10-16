// tests/move-hints.js
// Setting "Show move suggestions" (move-hints.js, Settings menu).
//
// Checks, in a fresh browser (nothing stored):
// - Domino, variant Triangles: off by default - no hand tile is marked as
//   unplayable, and after picking a tile every free place is offered, not
//   only the ones it fits; tapping a place it doesn't fit is refused with
//   a line and the board stays as it was. Switched on in the Settings
//   menu, only the fitting places are offered again.
// - Mau Mau: off - no card in the hand is marked; tapping a card that
//   doesn't fit is refused with a line and the hand keeps it. Switched on,
//   exactly the cards that can't be played are marked.
// - Card duel: off - no hand card is marked; picking a card that costs
//   more than the power there is and pressing Play is refused with a line.
//   Switched on, that card is marked.
// - Mau Mau with the animal cards (maumau.html?deck=kids): on by default.
// - The checkbox is in the Settings menu on these games and not on a game
//   without suggestions (chess); no page scrolls sideways at 360 px with
//   the menu open.
//
// Needs the local server (BASE_URL) and Playwright, like board-sweep.js.
// Run: node tests/move-hints.js

const { chromium } = require("playwright");
const BASE_URL = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok, info) => { if (!ok) fails.push(name + (info !== undefined ? ": " + JSON.stringify(info) : "")); };

async function fresh(browser, file, width) {
  const ctx = await browser.newContext({ viewport: { width: width || 600, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // A game now runs from the start, so "New game" asks before replacing it.
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE_URL + file, { waitUntil: "networkidle" });
  return { ctx, page, errors };
}

async function setHints(page, on) {
  await page.click("#settings-menu-button");
  const box = page.locator("#settings-move-hints-checkbox");
  if ((await box.isChecked()) !== on) await box.click();
  await page.click(".settings-modal-close");
}

async function waitFor(page, fn, what) {
  try { await page.waitForFunction(fn, null, { timeout: 15000 }); return true; } catch (e) { fails.push("timed out waiting for " + what); return false; }
}

(async () => {
  const browser = await chromium.launch();

  // Domino, Triangles.
  {
    const { ctx, page, errors } = await fresh(browser, "domino.html");
    await page.evaluate(() => { Math.random = () => 0.1; });
    // The game now starts by itself and its settings are hidden, so the
    // variant is set and the game restarted through the DOM.
    await page.evaluate(() => {
      const select = document.getElementById("domino-variant");
      select.value = "triangle";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("start-domino-game").click();
    });
    await page.evaluate(() => { const b = document.querySelector(".confirm-ok, #confirm-yes"); if (b) b.click(); });
    if (await waitFor(page, () => typeof humanCanActDomino === "function" && humanCanActDomino() && AppStateDomino.state && DominoCore.isTriangle(AppStateDomino.state) && AppStateDomino.state.slots.length > 0, "Domino: human turn on a started triangle board")) {
      check("Domino: setting off by default", await page.evaluate(() => !MoveHints.enabled()));
      check("Domino off: no tile marked unplayable", (await page.$$(".domino-tile-unplayable")).length === 0);
      // A tile that fits somewhere but not everywhere.
      const pick = await page.evaluate(() => {
        const s = AppStateDomino.state, hand = s.hands[s.turn], open = DominoCore.openSlots(s);
        for (let i = 0; i < hand.length; i++) {
          const fit = DominoCore.slotsForTile(s, hand[i]);
          const wrong = open.find((x) => fit.indexOf(x) === -1);
          if (fit.length && wrong !== undefined) return { i, fit: fit.length, open: open.length, wrong: open.indexOf(wrong) };
        }
        return null;
      });
      if (!pick) fails.push("Domino: no tile with a fitting and a non-fitting place in this deal");
      else {
        await page.click(".domino-hand-tile >> nth=" + pick.i);
        const offered = (await page.$$(".domino-place-btn")).length;
        check("Domino off: every free place offered", offered === pick.open, { offered, open: pick.open });
        const before = await page.evaluate(() => AppStateDomino.state.slots.length);
        await page.click(".domino-place-btn >> nth=" + pick.wrong);
        const after = await page.evaluate(() => ({ n: AppStateDomino.state.slots.length, msg: document.getElementById("board-info") ? document.getElementById("board-info").textContent : document.body.textContent }));
        check("Domino off: wrong place refused", after.n === before, after.n);
        check("Domino off: refusal line shown", /doesn't fit here/.test(after.msg), after.msg.slice(0, 120));
        await setHints(page, true);
        const offeredOn = (await page.$$(".domino-place-btn")).length;
        check("Domino on: only fitting places offered", offeredOn === pick.fit, { offeredOn, fit: pick.fit });
      }
    }
    check("Domino: no page errors", errors.length === 0, errors);
    await ctx.close();
  }

  // Mau Mau.
  {
    const { ctx, page, errors } = await fresh(browser, "maumau.html");
    let found = false;
    for (let round = 0; round < 15 && !found; round++) {
      await page.evaluate((id) => document.querySelector(id).click(), "#start-maumau-game");
      await page.evaluate(() => { const b = document.querySelector(".confirm-ok, #confirm-yes"); if (b) b.click(); });
      if (!(await waitFor(page, () => AppStateMauMau.state && AppStateMauMau.state.turn === 0 && humanCanActMauMau(), "Mau Mau: human turn"))) break;
      found = await page.evaluate(() => MauMauCore.legalMoves(AppStateMauMau.state).length < AppStateMauMau.state.hands[0].length);
    }
    check("Mau Mau: a hand with a card that doesn't fit", found);
    if (found) {
      check("Mau Mau: setting off by default", await page.evaluate(() => !MoveHints.enabled()));
      check("Mau Mau off: no card marked", (await page.$$(".maumau-card-unplayable")).length === 0);
      const bad = await page.evaluate(() => { const s = AppStateMauMau.state, l = MauMauCore.legalMoves(s); return s.hands[0].findIndex((c, i) => l.indexOf(i) === -1); });
      const n0 = await page.evaluate(() => AppStateMauMau.state.hands[0].length);
      await page.click("#maumau-hand .maumau-card >> nth=" + bad);
      const r = await page.evaluate(() => ({ n: AppStateMauMau.state.hands[0].length, msg: document.body.innerText }));
      check("Mau Mau off: card that doesn't fit stays in the hand", r.n === n0, r.n);
      check("Mau Mau off: refusal line shown", /doesn't fit|Play the card you just drew|Play a Seven/.test(r.msg));
      await setHints(page, true);
      const want = await page.evaluate(() => AppStateMauMau.state.hands[0].length - MauMauCore.legalMoves(AppStateMauMau.state).length);
      const got = (await page.$$(".maumau-card-unplayable")).length;
      check("Mau Mau on: exactly the unplayable cards marked", got === want && want > 0, { got, want });
    }
    check("Mau Mau: no page errors", errors.length === 0, errors);
    await ctx.close();
  }

  // Card duel.
  {
    const { ctx, page, errors } = await fresh(browser, "cardduel.html");
    await page.evaluate(() => { Math.random = () => 0.1; });
    await page.evaluate((id) => document.querySelector(id).click(), "#start-cardduel-game");
    await page.evaluate(() => { const b = document.querySelector(".confirm-ok, #confirm-yes"); if (b) b.click(); });
    if (await waitFor(page, () => AppStateCd.state && humanTurnCd(), "Card duel: human turn")) {
      check("Card duel off: no card marked", (await page.$$(".cd-unplayable")).length === 0);
      const bad = await page.evaluate(() => { const s = AppStateCd.state, pl = s.players[s.current]; return pl.hand.findIndex((id) => coreCd().card(id).cost > pl.power); });
      check("Card duel: a card that costs too much", bad !== -1);
      if (bad !== -1) {
        const n0 = await page.evaluate(() => AppStateCd.state.players[AppStateCd.state.current].hand.length);
        await page.click('[data-hand="' + bad + '"]');
        const usable = await page.evaluate(() => !document.getElementById("cd-play").disabled);
        check("Card duel off: Play button usable", usable);
        if (usable) await page.click("#cd-play");
        const r = await page.evaluate(() => ({ n: AppStateCd.state.players[AppStateCd.state.current].hand.length, msg: document.body.innerText }));
        check("Card duel off: card stays in the hand", r.n === n0, r.n);
        check("Card duel off: refusal line shown", /Not enough power/.test(r.msg));
        await setHints(page, true);
        check("Card duel on: the card is marked", await page.evaluate((i) => document.querySelector('[data-hand="' + i + '"]').classList.contains("cd-unplayable"), bad));
      }
    }
    check("Card duel: no page errors", errors.length === 0, errors);
    await ctx.close();
  }

  // Mau Mau, animal cards: on by default.
  {
    const { ctx, page, errors } = await fresh(browser, "maumau.html?deck=kids");
    await page.evaluate((id) => document.querySelector(id).click(), "#start-maumau-game");
    await page.evaluate(() => { const b = document.querySelector(".confirm-ok, #confirm-yes"); if (b) b.click(); });
    if (await waitFor(page, () => AppStateMauMau.state && AppStateMauMau.state.variant === "kids", "Mau Mau kids game")) {
      check("Mau Mau animal cards: suggestions on by default", await page.evaluate(() => MoveHints.enabled()));
      await page.click("#settings-menu-button");
      check("Mau Mau animal cards: checkbox shows on", await page.locator("#settings-move-hints-checkbox").isChecked());
    }
    check("Mau Mau animal cards: no page errors", errors.length === 0, errors);
    await ctx.close();
  }

  // Checkbox presence and width.
  for (const [file, want] of [["domino.html", true], ["skat.html", true], ["seega.html", true], ["chess.html", false]]) {
    for (const width of [600, 360]) {
      const { ctx, page } = await fresh(browser, file, width);
      await page.click("#settings-menu-button");
      const has = (await page.$$("#settings-move-hints-checkbox")).length === 1;
      check(file + ": move suggestions checkbox " + (want ? "present" : "absent"), has === want);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(file + " at " + width + " px: no sideways scrolling with the menu open", sw <= 0, sw);
      await ctx.close();
    }
  }

  await browser.close();
  if (fails.length) {
    fails.forEach((f) => console.log("FAIL: " + f));
    console.log("=== MOVE HINTS: " + fails.length + " failure(s) ===");
    process.exit(1);
  }
  console.log("Domino (Triangles), Mau Mau and Card duel: nothing marked with the setting off, wrong moves refused with a line; on again marks them");
  console.log("=== MOVE HINTS: 0 failures ===");
})();
