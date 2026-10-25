#!/usr/bin/env node
// Blocked Path (blockers) in the browser (task 113, the rename from
// "Path Blockers" / "Sperrsteine"), German and English page, 360 x 640:
//   - title, start card and board name the game "Wegesperre" /
//     "Blocked Path"; no old name anywhere in the page text;
//   - a new game starts, a roll and a move work, the game is saved under
//     the old key einkchess_save_blockers;
//   - a save written in the old format (same key, same fields, made
//     before the rename) loads again: board, players and phase as saved;
//     a saved "put the block" phase asks for a field with the new word
//     ("Sperrklotz"), a field with a block says so in its label.
// No page error, nothing scrolls sideways.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
const OLD = /Sperrstein|Path Blockers|Pierres de blocage|Blokstenen/;

(async () => {
  const browser = await chromium.launch();
  for (const lang of ["de", "en"]) {
    const name = lang === "de" ? "Wegesperre" : "Blocked Path";
    const tag = lang + ": ";
    const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, serviceWorkers: "block" });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    await page.goto(BASE + "blockers.html?lang=" + lang, { waitUntil: "load" });
    await page.waitForTimeout(600);
    const start = await page.evaluate(() => ({ title: document.title, card: document.querySelector(".board-placeholder-title").textContent.trim(), text: document.body.innerText }));
    check(tag + "title " + start.title, start.title.indexOf(name) !== -1);
    check(tag + "start card " + start.card, start.card === name);
    check(tag + "old name in page", !OLD.test(start.text + start.title));

    // A new game: 2 players, 1 computer, human first.
    if (!(await page.isVisible("#bl-num-players"))) await page.tap("#menu-toggle");
    await page.selectOption("#bl-num-players", "2");
    await page.selectOption("#bl-computers", "1");
    if (await page.$("#bl-first option[value='me']")) await page.selectOption("#bl-first", "me");
    await page.tap("#start-bl-game");
    await page.waitForFunction(() => AppStateBL.state && AppStateBL.state.turn === 0 && AppStateBL.state.phase === "roll", null, { timeout: 10000 });
    await page.tap("#bl-roll");
    await page.waitForFunction(() => AppStateBL.state.phase !== "roll" || AppStateBL.state.turn !== 0, null, { timeout: 10000 });
    const moved = await page.evaluate(() => {
      const s = AppStateBL.state;
      if (s.phase !== "move" || s.turn !== 0) return "no move needed";
      const m = BlockersCore.legalMoves(s)[0];
      if (!m) return "no legal move";
      onFieldBL(m.to);
      return "moved";
    });
    await page.waitForTimeout(300);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("einkchess_save_blockers") || "null"));
    check(tag + "saved under the old key (" + moved + ")", saved && saved.state && Array.isArray(saved.state.tokens) && saved.numPlayers === 2);
    const label = await page.evaluate(() => {
      const s = AppStateBL.state;
      const btn = Array.from(document.querySelectorAll("#bl-board .bl-field"))[BlockersCore.fields.indexOf(s.stones[0])];
      return btn ? btn.getAttribute("aria-label") : "";
    });
    check(tag + "block field label " + label, lang === "de" ? /Sperrklotz/.test(label) : /\bblock\b/.test(label));

    // An old save: written the way the app wrote it before the rename,
    // human in the phase "put the block".
    await page.evaluate(() => {
      const s = BlockersCore.createInitialState(2, {});
      s.tokens[0][0] = BlockersCore.fields.find((f) => BlockersCore.isBottomRow(f));
      s.stones.pop();
      s.phase = "stone";
      s.pendingStone = true;
      s.turn = 0;
      s.roll = 3;
      localStorage.setItem("einkchess_save_blockers", JSON.stringify({ numPlayers: 2, computers: 1, level: 2, state: s }));
    });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(800);
    const back = await page.evaluate(() => ({
      started: AppStateBL.started, phase: AppStateBL.state && AppStateBL.state.phase, stones: AppStateBL.state && AppStateBL.state.stones.length,
      status: document.getElementById("board-info").textContent.trim(), overflow: document.documentElement.scrollWidth - innerWidth, text: document.body.innerText
    }));
    check(tag + "old save loads", back.started === true && back.phase === "stone" && back.stones === 5);
    check(tag + "block prompt " + back.status, lang === "de" ? /Sperrklotz/.test(back.status) : /block/.test(back.status));
    check(tag + "old name after load", !OLD.test(back.text));
    // Put the block, the game goes on.
    const placed = await page.evaluate(() => {
      const f = BlockersCore.stoneTargets(AppStateBL.state)[0];
      onFieldBL(f);
      return AppStateBL.state.stones.length === 6 && AppStateBL.state.phase !== "stone";
    });
    check(tag + "block put back on the board", placed);
    check(tag + "no sideways scroll " + back.overflow, back.overflow <= 0);
    check(tag + "page errors " + errors.join(" | "), errors.length === 0);
    await ctx.close();
  }
  await browser.close();
  console.log("\n=== BLOCKERS UI (Blocked Path / Wegesperre): de and en at 360x640, new game, roll and move, old save loads, block prompt and labels, " + fails.length + " failure(s) ===");
  fails.forEach((f) => console.log("  FAIL " + f));
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
