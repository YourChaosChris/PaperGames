#!/usr/bin/env node
// Sternjagd in the browser (task 128), German page at 360 x 640: a new game
// against the computer names who starts ("Du beginnst." or "Computer
// beginnt."); over many new games both start; the line goes away after
// the first own roll; the game is saved and back after a reload; a game
// saved before task 128 (3 players, no `homes`) loads and plays on. No page
// error, nothing scrolls sideways.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "sternjagd.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  if (!(await page.isVisible("#start-sj-game"))) await page.tap("#menu-toggle");
  await page.tap("#mode-ai");
  await page.selectOption("#sj-players", "2");
  const seen = { you: 0, cpu: 0 };
  for (let g = 0; g < 16; g++) {
    await page.evaluate(() => startGameSJ());
    const line = await page.evaluate(() => { const el = document.getElementById("sj-starter"); return el ? el.textContent.trim() : ""; });
    if (line === "Du beginnst.") seen.you++;
    else if (/^Computer.* beginnt\.$/.test(line)) seen.cpu++;
    else check("starter line: '" + line + "'", false);
  }
  check("both start sometimes " + JSON.stringify(seen), seen.you > 0 && seen.cpu > 0);
  const info = await page.evaluate(() => ({ visible: !!document.getElementById("sj-starter") && document.getElementById("sj-starter").offsetHeight > 0, overflow: document.documentElement.scrollWidth - innerWidth }));
  check("starter line visible", info.visible);
  check("no sideways scroll", info.overflow <= 0);
  // The person's first roll removes the line.
  await page.waitForFunction(() => AppStateSJ.state.phase === "roll" && !AppStateSJ.state.computer[AppStateSJ.state.current], null, { timeout: 10000 });
  await page.tap("#sj-roll");
  await page.waitForTimeout(200);
  check("line gone after the first roll", !(await page.$("#sj-starter")));
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("einkchess_save_sternjagd") || "null"));
  check("saved with homes", saved && saved.state && Array.isArray(saved.state.homes));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const back = await page.evaluate(() => ({ ok: !!AppStateSJ.state, seq: AppStateSJ.state && AppStateSJ.state.seq }));
  check("game back after reload " + JSON.stringify(back), back.ok && back.seq === saved.state.seq);

  // An old 3-player save without homes.
  await page.evaluate(() => {
    const s = SternjagdCore.newGame({ players: 3, computer: [false, true, true] });
    delete s.homes;
    s.pos = [0, 1, 2];
    localStorage.setItem("einkchess_save_sternjagd", JSON.stringify({ state: s, undoStack: [] }));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const old = await page.evaluate(() => ({ n: AppStateSJ.state && AppStateSJ.state.n, pos: AppStateSJ.state && AppStateSJ.state.pos.join(","), homes: SternjagdCore.homesOf(AppStateSJ.state).join(",") }));
  check("old 3-player save loads " + JSON.stringify(old), old.n === 3 && old.pos === "0,1,2" && old.homes === "0,1,2");
  await page.tap("#sj-roll");
  await page.waitForTimeout(200);
  check("and plays on", await page.evaluate(() => AppStateSJ.state.phase === "move" || AppStateSJ.state.seq > 0));
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== STERNJAGD UI: starter named, random starter, save and load, old save, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
