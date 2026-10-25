#!/usr/bin/env node
// Sternjagd in the browser (task 128), German page at 360 x 640: a new game
// against the computer names who starts ("Du beginnst." or "Computer
// beginnt."); over many new games both start; the line goes away after
// the first own roll; the game is saved and back after a reload; a game
// saved before task 128 (3 players, no `homes`) loads and plays on. No page
// error, nothing scrolls sideways.
// Task 130: the choice "Ausgleich für den Zweiten" is shown with 2 players
// only and on by default; the starter line names the double turn; after
// the computer started, the person's first move is followed by a second
// one ("Noch einmal dran (Ausgleich)."); switched off or with 3 players
// there is none; `balance` and `bonus` are saved and come back; an old
// 2-player save without them plays without a balance; remembered settings
// (quick-rules.js) keep the choice and hide it with 3 players.
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
  await page.goto(BASE + "sternjagd.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  if (!(await page.isVisible("#start-sj-game"))) await page.tap("#menu-toggle");
  await page.tap("#mode-ai");
  // Task 130: the balance is offered with 2 players only, on by default.
  await page.selectOption("#sj-players", "3");
  check("balance hidden with 3 players", !(await page.isVisible("#sj-balance")));
  await page.selectOption("#sj-players", "2");
  check("balance shown with 2 players", await page.isVisible("#sj-balance"));
  check("balance on by default", await page.isChecked("#sj-balance"));
  check("no sideways scroll with the settings", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  const seen = { you: 0, cpu: 0 };
  for (let g = 0; g < 16; g++) {
    await page.evaluate(() => startGameSJ());
    const line = await page.evaluate(() => { const el = document.getElementById("sj-starter"); return el ? el.textContent.trim() : ""; });
    if (line === "Du beginnst. Computer ist beim ersten Mal zweimal hintereinander dran.") seen.you++;
    else if (line === "Computer beginnt. Du bist beim ersten Mal zweimal hintereinander dran.") seen.cpu++;
    else check("starter line: '" + line + "'", false);
    check("state has the balance", await page.evaluate(() => AppStateSJ.state.balance === true));
  }
  check("both start sometimes " + JSON.stringify(seen), seen.you > 0 && seen.cpu > 0);
  // Without the balance the line only names the starter.
  await page.evaluate(() => { document.getElementById("sj-balance").checked = false; startGameSJ(); });
  const plain = await page.evaluate(() => ({ line: document.getElementById("sj-starter").textContent.trim(), balance: AppStateSJ.state.balance, bonus: AppStateSJ.state.bonus }));
  check("line without the balance " + JSON.stringify(plain), /^(Du beginnst\.|Computer beginnt\.)$/.test(plain.line) && plain.balance === false && plain.bonus === -1);
  // With 3 players the setting does nothing.
  await page.evaluate(() => { document.getElementById("sj-balance").checked = true; document.getElementById("sj-players").value = "3"; startGameSJ(); });
  check("3 players without the balance", await page.evaluate(() => AppStateSJ.state.balance === false && !/zweimal/.test(document.getElementById("sj-starter").textContent)));
  // Back to 2 players with the balance; a game where the computer starts:
  // after your first move you are on again, and the list says so.
  await page.evaluate(() => { document.getElementById("sj-players").value = "2"; });
  let doubled = false;
  for (let g = 0; g < 20 && !doubled; g++) {
    await page.evaluate(() => startGameSJ());
    if (await page.evaluate(() => !AppStateSJ.state.computer[AppStateSJ.starter])) continue;
    await page.tap("#sj-roll");
    await page.waitForTimeout(100);
    const goal = await page.$(".sj-goal");
    if (!goal) continue;
    await page.evaluate(() => moveSJ(parseInt(document.querySelector(".sj-goal").getAttribute("data-node"), 10)));
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => ({ cur: AppStateSJ.state.current, comp: AppStateSJ.state.computer[AppStateSJ.state.current], phase: AppStateSJ.state.phase, bonus: AppStateSJ.state.bonus, top: (document.querySelector("#sj-last div") || {}).textContent || "" }));
    check("your double turn " + JSON.stringify(after), after.phase !== "roll" || (!after.comp && after.bonus === -1 && /Noch einmal dran \(Ausgleich\)\./.test(after.top)));
    doubled = after.phase === "roll";
  }
  check("double turn seen", doubled);
  await page.evaluate(() => startGameSJ());
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
  check("saved with balance and bonus", saved && saved.state && saved.state.balance === true && typeof saved.state.bonus === "number");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const back = await page.evaluate(() => ({ ok: !!AppStateSJ.state, seq: AppStateSJ.state && AppStateSJ.state.seq, balance: AppStateSJ.state && AppStateSJ.state.balance, bonus: AppStateSJ.state && AppStateSJ.state.bonus }));
  check("game back after reload " + JSON.stringify(back), back.ok && back.seq === saved.state.seq && back.balance === true && back.bonus === saved.state.bonus);

  // An old 2-player save from before task 130 (no balance, no bonus): it
  // loads and both sides take turns as before.
  await page.evaluate(() => {
    const s = SternjagdCore.newGame({ players: 2, computer: [false, true], first: 0 });
    delete s.balance;
    delete s.bonus;
    localStorage.setItem("einkchess_save_sternjagd", JSON.stringify({ state: s, undoStack: [] }));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  check("old 2-player save loads", await page.evaluate(() => AppStateSJ.state && AppStateSJ.state.n === 2 && AppStateSJ.state.balance === undefined));
  let oldOk = false;
  for (let i = 0; i < 6 && !oldOk; i++) {
    await page.tap("#sj-roll");
    await page.waitForTimeout(100);
    if (await page.$(".sj-goal")) {
      await page.evaluate(() => moveSJ(parseInt(document.querySelector(".sj-goal").getAttribute("data-node"), 10)));
      await page.waitForTimeout(100);
      // The computer moved right after the person: no double turn.
      oldOk = await page.evaluate(() => AppStateSJ.log.length >= 2 && AppStateSJ.log[0].player === 1 && AppStateSJ.log.every((l) => !l.again));
    }
  }
  check("old 2-player save plays without the balance", oldOk);

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

  // quick-rules.js restores the remembered settings without a change event:
  // switched off stays off, and with 3 players the row stays hidden.
  await page.evaluate(() => {
    localStorage.removeItem("einkchess_save_sternjagd");
    localStorage.setItem("papergames_last_settings_sternjagd", JSON.stringify({ modeId: "mode-ai", fields: [{ id: "sj-players", value: "2" }, { id: "sj-balance", value: "on", checked: false }] }));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  if (!(await page.isVisible("#sj-balance"))) await page.tap("#menu-toggle");
  check("switched off is remembered", (await page.isVisible("#sj-balance")) && !(await page.isChecked("#sj-balance")));
  // quick-rules.js starts the next game at once, with the remembered choice.
  check("and the game started without the balance", await page.evaluate(() => AppStateSJ.state && AppStateSJ.state.balance === false));
  await page.evaluate(() => {
    localStorage.removeItem("einkchess_save_sternjagd");
    localStorage.setItem("papergames_last_settings_sternjagd", JSON.stringify({ modeId: "mode-ai", fields: [{ id: "sj-players", value: "3" }, { id: "sj-balance", value: "on", checked: true }] }));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  check("3 players remembered: row hidden", await page.evaluate(() => document.getElementById("sj-players").value === "3" && document.getElementById("sj-balance-row").classList.contains("hidden")));
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== STERNJAGD UI: starter named, random starter, balance for the second (choice, line, double turn), save and load, old saves, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
