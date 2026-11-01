#!/usr/bin/env node
// Steckwürfeln in the browser (task 167), German page at 360 x 640, one
// person against two computers. Points, one round: the roll that ends your
// turn stays on screen ("Letzter Wurf: Du") with "Weiter"; each computer
// plays its whole turn only on "Weiter", the status names all its rolls
// ("Computer 1 hat ... gewürfelt.") and its dice stay; a reload while a
// computer waits keeps that. After the last turn the result does not open
// by itself: the last roll stays, the button says "Ergebnis"; saved and back
// after a reload; the result opens on the tap and the save is gone. Shared
// board: after your peg computer 1 plays at once and the holes it pegged
// have a ring. An old save without the new fields loads. Buttons 44 px, no
// sideways scroll, no page error.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

const view = (page) => page.evaluate(() => {
  const next = document.getElementById("sw-next");
  const s = AppStateSW.state;
  return {
    status: document.getElementById("board-info").textContent.trim(),
    next: next.offsetHeight > 0 ? next.textContent.trim() : "",
    nextH: next.getBoundingClientRect().height,
    roll: document.getElementById("sw-roll").offsetHeight > 0,
    who: document.getElementById("sw-dice-who").textContent.trim(),
    dice: (document.getElementById("sw-dice").getAttribute("aria-label") || ""),
    phase: s.phase, cur: s.current, seq: s.seq, pending: AppStateSW.pending,
    result: document.getElementById("game-result").textContent.trim(),
    overflow: document.documentElement.scrollWidth - innerWidth
  };
});

// The person's whole turn: roll and take the first way until the turn ends.
async function humanTurn(page) {
  for (let i = 0; i < 40; i++) {
    const st = await page.evaluate(() => ({ phase: AppStateSW.state.phase, cpu: !!AppStateSW.state.computer[AppStateSW.state.current] }));
    if (st.phase === "over" || st.cpu) return;
    if (st.phase === "plug") await page.click("#sw-ways button");
    else await page.click("#sw-roll");
    await page.waitForTimeout(30);
  }
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "steckwuerfeln.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    DiceCommon.setMode("ai");
    document.getElementById("sw-players").value = "3";
    document.getElementById("sw-mode").value = "score";
    document.getElementById("sw-rounds").value = "1";
    document.getElementById("sw-sixes").value = "plug";
    startGameSW();
  });
  check("you begin", await page.evaluate(() => AppStateSW.state.current === 0 && !AppStateSW.state.computer[0]));
  await humanTurn(page);
  const a = await view(page);
  check("your last roll stays " + JSON.stringify(a), a.who === "Letzter Wurf: Du" && /Würfel/.test(a.dice) && /^Du: .* nichts passt\./.test(a.status));
  check("then Weiter for computer 1: " + a.status, a.next === "Weiter" && !a.roll && /Computer 1 ist dran: tippe auf Weiter\.$/.test(a.status) && a.cur === 1);
  check("Weiter 44 px (" + a.nextH + ")", a.nextH >= 43.5);
  await page.click("#sw-next");
  await page.waitForTimeout(50);
  const b = await view(page);
  check("computer 1 played its turn: " + b.status, /^Computer 1 hat \d \+ \d(, \d \+ \d)* gewürfelt\./.test(b.status) && b.who === "Letzter Wurf: Computer 1" && b.cur === 2);
  check("computer 2 waits: " + b.status, b.next === "Weiter" && /Computer 2 ist dran: tippe auf Weiter\.$/.test(b.status));
  check("no sideways scroll", b.overflow <= 0);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  const c = await view(page);
  check("reload keeps the shown turn " + JSON.stringify({ c: c.status, b: b.status }), c.status === b.status && c.who === b.who && c.next === "Weiter" && c.seq === b.seq);
  await page.click("#sw-next");
  await page.waitForTimeout(50);
  const d = await view(page);
  check("game over waits for Ergebnis " + JSON.stringify(d), d.phase === "over" && d.pending && d.next === "Ergebnis" && /Das Spiel ist aus: tippe auf Ergebnis\.$/.test(d.status) && d.result === "" && d.who === "Letzter Wurf: Computer 2");
  check("no result window yet", await page.evaluate(() => !Array.from(document.querySelectorAll(".result-modal, #result-modal")).some((m) => m.offsetHeight > 0)));
  check("saved while waiting", await page.evaluate(() => { const v = JSON.parse(localStorage.getItem("einkchess_save_steckwuerfeln") || "null"); return !!v && v.pending === true && v.state.phase === "over"; }));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  const e = await view(page);
  check("reload keeps the end " + JSON.stringify(e), e.phase === "over" && e.next === "Ergebnis" && e.status === d.status);
  await page.click("#sw-next");
  await page.waitForTimeout(100);
  const f = await view(page);
  check("result after the tap " + JSON.stringify(f), f.result.length > 0 && f.next === "" && !f.pending);
  check("save gone after the result", await page.evaluate(() => localStorage.getItem("einkchess_save_steckwuerfeln") === null));
  await page.evaluate(() => { if (window.ResultModal) window.ResultModal.hide(); });

  // Shared board: computer 1 answers your peg at once; its holes have a ring.
  let ringed = false;
  for (let g = 0; g < 6 && !ringed; g++) {
    await page.evaluate(() => { document.getElementById("sw-mode").value = "shared"; document.getElementById("sw-players").value = "2"; startGameSW(); });
    await page.click("#sw-roll");
    await page.waitForTimeout(30);
    if (!(await page.$("#sw-ways button"))) continue;
    await page.click("#sw-ways button");
    await page.waitForTimeout(50);
    const r = await page.evaluate(() => ({ last: AppStateSW.state.last, rings: Array.from(document.querySelectorAll(".sw-hole-last")).map((h) => parseInt(h.textContent, 10)), status: document.getElementById("board-info").textContent.trim() }));
    if (r.last && r.last.player === 1 && r.last.kind === "plug") {
      ringed = true;
      check("shared: ring on the computer's holes " + JSON.stringify(r), JSON.stringify(r.rings) === JSON.stringify(r.last.fields) && /^Computer hat \d \+ \d gewürfelt\./.test(r.status) && /Du bist dran\. Wirf die zwei Würfel\.$/.test(r.status));
    }
  }
  check("shared: computer pegged after you", ringed);

  // An old save (before task 167) loads and plays on.
  await page.evaluate(() => {
    const s = SteckwuerfelnCore.newGame({ players: 2, computer: [false, true], mode: "score", sixes: "plug", rounds: 3 });
    localStorage.setItem("einkchess_save_steckwuerfeln", JSON.stringify({ state: s, undoStack: [] }));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  const old = await view(page);
  check("old save loads " + JSON.stringify(old), old.phase === "roll" && old.roll && old.status === "Du bist dran. Wirf die zwei Würfel.");
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log("=== STECKWUERFELN UI: last roll stays, computer turns on Weiter with their rolls, result on Ergebnis, save and load while waiting and at the end, shared board ring, old save, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
