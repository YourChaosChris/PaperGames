#!/usr/bin/env node
// Rommé in the browser (tasks 106-108), German page at 600 and 360 px:
//   - a joker tapped onto a run with room at both ends asks "Unten anlegen
//     (als 3♥)" / "Oben anlegen (als 7♥)"; below, then the 2 of hearts
//     empties the hand;
//   - knocking: the "Klopfen auf …" button shows only when the human is
//     not next; after knocking the computer decides; when it gives the
//     card, only discarding is possible and the player after the human
//     moves next; the option is off on one device and with one computer;
//   - Hand-Rommé: "Alle Karten auslegen" lays out everything, the round
//     list shows "x2 Hand-Rommé".
// States are set up directly (AppStateRomme.busy blocks the computer's
// timer). No page error, nothing scrolls sideways.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

// Builds a state in the page: opts for createInitialState, then `setup`
// (a function body run with s, card(rank, suit), joker()).
async function setState(page, opts, setup) {
  await page.evaluate(({ opts, setup }) => {
    let id = 5000;
    const card = (rank, suit) => ({ id: id++, rank, suit });
    const joker = () => ({ id: id++, joker: true });
    const s = RommeCore.createInitialState(opts);
    new Function("s", "card", "joker", "C", setup)(s, card, joker, RommeCore);
    AppStateRomme.mode = "vs-ai";
    AppStateRomme.aiLevel = 2;
    AppStateRomme.state = s;
    AppStateRomme.started = true;
    AppStateRomme.busy = true;          // no computer step by timer
    AppStateRomme.selected = [];
    AppStateRomme.choice = null;
    AppStateRomme.revealed = true;
    showBoardRomme();
    renderRomme();
  }, { opts, setup });
}

// Clicks the hand button of the card with this id.
async function tapCard(page, id) {
  const i = await page.evaluate((id) => sortHandRomme(AppStateRomme.state.players[0].hand).findIndex((c) => c.id === id), id);
  await page.locator("#romme-hand button").nth(i).click();
}

const visible = (page, sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return false;
  for (let e = el; e; e = e.parentElement) if (e.classList && e.classList.contains("hidden")) return false;
  return true;
}, sel);
const text = (page, sel) => page.evaluate((sel) => document.querySelector(sel).textContent, sel);
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ width: 600, height: 800 }, { width: 360, height: 740 }]) {
    const w = vp.width + ": ";
    const ctx = await browser.newContext({ viewport: vp, serviceWorkers: "block" });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("dialog", (d) => d.accept());   // "start a new game?" on switching mode
    await page.goto(BASE + "romme.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(400);

    // Settings: knocking only against two or three computers.
    const knockOff = await page.evaluate(() => {
      const el = document.getElementById("romme-knock-rule");
      const opp = document.getElementById("romme-opponents-inline");
      const r = {};
      opp.value = "1"; opp.dispatchEvent(new Event("change"));
      r.one = el.disabled;
      opp.value = "2"; opp.dispatchEvent(new Event("change"));
      r.two = el.disabled;
      document.getElementById("mode-offline").click();
      r.hotseat = el.disabled;
      document.getElementById("mode-offline-ai").click();
      r.back = el.disabled;
      return r;
    });
    check(w + "knocking off with 1 computer, on with 2, off on one device: " + JSON.stringify(knockOff), knockOff.one && !knockOff.two && knockOff.hotseat && !knockOff.back);
    check(w + "option labels in German", (await text(page, "label:has(#romme-hand-rule)")).includes("Hand-Rommé: nur alles auf einmal auslegen") &&
      (await text(page, "label:has(#romme-knock-rule)")).includes("Klopfen erlaubt"));

    // ---- 106: joker end ------------------------------------------------
    await setState(page, { players: 2, dealer: 1 }, `
      const two = card(2, "H"), j = joker();
      s.players[0].hand = [two, j];
      s.players[0].opened = true; s.players[1].opened = true;
      const m = C.buildMeld([card(4, "H"), card(5, "H"), card(6, "H")]); m.owner = 1;
      s.melds = [m]; s.turn = 0; s.phase = "play"; s.firstTurn = false;
      window.__ids = { two: two.id, j: j.id };`);
    const ids = await page.evaluate(() => window.__ids);
    await tapCard(page, ids.j);
    await page.click("#romme-table button.romme-meld");
    check(w + "106: both end buttons shown", (await visible(page, "#romme-choice-low")) && (await visible(page, "#romme-choice-high")));
    const low = await text(page, "#romme-choice-low"), high = await text(page, "#romme-choice-high");
    check(w + "106: labels name the card: " + low + " / " + high, /Unten anlegen \(als 3/.test(low) && /Oben anlegen \(als 7/.test(high));
    check(w + "106: question in German", (await text(page, "#board-info")).includes("Der Joker passt an beide Enden"));
    check(w + "106: no sideways scroll with the choice", (await overflow(page)) <= 0);
    const lb = await page.locator("#romme-choice-low").boundingBox();
    const db = await page.locator("#romme-discard-button").boundingBox();
    check(w + "106: choice button as high as the other buttons: " + (lb && lb.height) + " / " + (db && db.height), lb && db && lb.height >= db.height);
    await page.click("#romme-choice-low");
    const ranks = await page.evaluate(() => AppStateRomme.state.melds[0].entries.map((e) => e.rank).join(","));
    check(w + "106: joker as the 3: " + ranks, ranks === "3,4,5,6");
    check(w + "106: buttons gone", !(await visible(page, "#romme-choice-low")));
    await tapCard(page, ids.two);
    await page.click("#romme-table button.romme-meld");
    const won = await page.evaluate(() => ({ over: AppStateRomme.state.over, winner: AppStateRomme.state.winner }));
    check(w + "106: the 2 follows, round won", won.over && won.winner === 0);
    await page.evaluate(() => window.ResultModal && window.ResultModal.hide());

    // ---- 108: knocking -------------------------------------------------
    // Computer 1 has discarded, Computer 2 is to draw, the human may knock.
    await setState(page, { players: 3, dealer: 1, knockRule: true }, `
      s.firstTurn = false; s.turn = 2; s.phase = "draw";
      const top = card(7, "H");
      s.discard.push(top); s.knockable = { id: top.id, from: 1 };
      s.players[2].hand = [card(13, "C"), card(2, "S"), card(9, "D")];
      window.__top = top.id;`);
    check(w + "108a: knock button when not next", await visible(page, "#romme-knock-row"));
    check(w + "108a: knock label: " + (await text(page, "#romme-knock-button")), /^Klopfen auf die 7/.test(await text(page, "#romme-knock-button")));
    check(w + "108: no sideways scroll with the knock button", (await overflow(page)) <= 0);
    await page.click("#romme-knock-button");
    check(w + "108: phase knocked", await page.evaluate(() => AppStateRomme.state.phase === "knocked" && AppStateRomme.state.knocker === 0));
    const knockMsg = await text(page, "#board-info");
    check(w + "108: knock message: " + knockMsg, knockMsg.includes("Du klopfst auf die 7") && knockMsg.includes("Computer 2 muss entscheiden."));
    check(w + "108: button gone after knocking", !(await visible(page, "#romme-knock-row")));
    await page.evaluate(() => aiStepRomme());
    const give = await page.evaluate(() => ({ turn: AppStateRomme.state.turn, phase: AppStateRomme.state.phase, n: AppStateRomme.state.players[0].hand.length,
      status: document.getElementById("board-info").textContent }));
    check(w + "108c: computer gives the card, human discards: " + JSON.stringify(give), give.turn === 0 && give.phase === "knockDiscard" && give.n === 14);
    check(w + "108c: status in German: " + give.status, give.status.includes("Du bekommst die Karte.") && give.status.includes("Du musst jetzt eine Karte ablegen."));
    check(w + "108c: only discarding: actions shown, lay-out button hidden", (await visible(page, "#romme-actions")) && !(await visible(page, "#romme-meld-button")) && (await visible(page, "#romme-discard-button")));
    const first = await page.evaluate(() => sortHandRomme(AppStateRomme.state.players[0].hand)[0].id);
    await tapCard(page, first);
    await page.click("#romme-discard-button");
    const after = await page.evaluate(() => ({ turn: AppStateRomme.state.turn, phase: AppStateRomme.state.phase, n2: AppStateRomme.state.players[2].hand.length }));
    check(w + "108c: the player after the human moves, Computer 2 missed: " + JSON.stringify(after), after.turn === 1 && after.phase === "draw" && after.n2 === 3);
    // (b) Computer keeps a fitting card.
    await setState(page, { players: 3, dealer: 1, knockRule: true }, `
      s.firstTurn = false; s.turn = 2; s.phase = "draw";
      const top = card(7, "H");
      s.discard.push(top); s.knockable = { id: top.id, from: 1 };
      s.players[2].hand = [card(8, "H"), card(9, "H"), card(2, "S")];`);
    await page.click("#romme-knock-button");
    await page.evaluate(() => aiStepRomme());
    const keep = await page.evaluate(() => ({ turn: AppStateRomme.state.turn, n2: AppStateRomme.state.players[2].hand.length, status: document.getElementById("board-info").textContent }));
    check(w + "108b: computer keeps: " + JSON.stringify(keep), keep.n2 === 4 && keep.status.includes("behält die Karte, du bekommst sie nicht."));
    await page.evaluate(() => { AppStateRomme.busy = true; });
    // (a) Human is next: no button.
    await setState(page, { players: 3, dealer: 1, knockRule: true }, `
      s.firstTurn = false; s.turn = 0; s.phase = "draw";
      const top = card(7, "H");
      s.discard.push(top); s.knockable = { id: top.id, from: 2 };`);
    check(w + "108a: no knock button when the human is next", !(await visible(page, "#romme-knock-row")));
    // Option off: no button.
    await setState(page, { players: 3, dealer: 1 }, `
      s.firstTurn = false; s.turn = 2; s.phase = "draw";
      const top = card(7, "H"); s.discard.push(top);`);
    check(w + "108: no knock button without the option", !(await visible(page, "#romme-knock-row")));

    // ---- 107: Hand-Rommé ----------------------------------------------
    await setState(page, { players: 2, dealer: 0, handRule: true }, `
      const a = [card(2, "C"), card(3, "C"), card(4, "C")], b = [card(9, "S"), card(9, "H"), card(9, "D")];
      s.players[0].hand = a.concat(b, [card(13, "D")]);
      s.players[1].hand = [card(5, "S"), card(6, "S")];
      s.turn = 0; s.phase = "play"; s.firstTurn = false;
      window.__melds = [a.map((c) => c.id), b.map((c) => c.id)];`);
    check(w + "107: round line names Hand-Rommé: " + (await text(page, "#romme-round-line")), (await text(page, "#romme-round-line")).includes("Hand-Rommé"));
    check(w + "107: prompt: " + (await text(page, "#board-info")), true);
    const melds = await page.evaluate(() => window.__melds);
    for (const group of melds) {
      for (const id of group) await tapCard(page, id);
      await page.click("#romme-meld-button");
    }
    const conf = await page.evaluate(() => ({ label: document.getElementById("romme-confirm-button").textContent, disabled: document.getElementById("romme-confirm-button").disabled,
      table: AppStateRomme.state.melds.length, staged: document.getElementById("romme-staged-label").textContent }));
    check(w + "107: confirm button 'Alle Karten auslegen' enabled, table still empty: " + JSON.stringify(conf), conf.label === "Alle Karten auslegen" && !conf.disabled && conf.table === 0);
    check(w + "107: staged label in German", conf.staged.includes("Für Hand-Rommé bereitgelegt"));
    await page.click("#romme-confirm-button");
    const end = await page.evaluate(() => ({ over: AppStateRomme.state.over, doubled: AppStateRomme.state.doubled, list: document.getElementById("romme-round-scores").textContent,
      result: document.getElementById("game-result").textContent }));
    check(w + "107: round over, doubled: " + JSON.stringify(end), end.over && end.doubled && end.list.includes("x2 Hand-Rommé") && end.list.includes("22 Strafpunkte"));
    check(w + "107: result names the double count", end.result.includes("Strafpunkte zählen doppelt"));
    await page.evaluate(() => window.ResultModal && window.ResultModal.hide());
    // Not everything: refused.
    await setState(page, { players: 2, dealer: 0, handRule: true }, `
      const a = [card(2, "C"), card(3, "C"), card(4, "C")];
      s.players[0].hand = a.concat([card(13, "D"), card(7, "S")]);
      s.turn = 0; s.phase = "play"; s.firstTurn = false;
      window.__a = a.map((c) => c.id);`);
    for (const id of await page.evaluate(() => window.__a)) await tapCard(page, id);
    await page.click("#romme-meld-button");
    check(w + "107b: confirm disabled with two cards left", await page.evaluate(() => document.getElementById("romme-confirm-button").disabled));
    check(w + "107: no sideways scroll", (await overflow(page)) <= 0);

    check(w + "no page error: " + errors.join(" | "), errors.length === 0);
    await ctx.close();
  }
  await browser.close();
  if (fails.length) {
    fails.forEach((f) => console.log("FAIL " + f));
    console.log("ROMME UI: " + fails.length + " failure(s)");
    process.exit(1);
  }
  console.log("ROMME UI: joker end, knocking, Hand-Rommé at 600 and 360 px - all checks pass");
})().catch((e) => { console.error(e); process.exit(1); });
