#!/usr/bin/env node
// Lock Logic in the browser, English page at 360 x 640 and 600 x 800.
// The page starts with puzzle 1 of the level by itself; clue cards with
// their sentences; notes (a tap crosses a clue digit out, Undo takes it
// back); code fields and keypad (a digit in another field is locked,
// Delete); a wrong code counts a mistake, the right one opens the lock with
// a result and a win in the stats; save and load after a reload; Hint
// marks clues and says a true fact; "New puzzle" takes the next number per
// level; every level solved once. Taps at least 44 px, no sideways scroll,
// no page error, no key names.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const SHOTS = process.env.SHOTS || "";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "zahlenschloss.html?lang=en", { waitUntil: "load" });
  await page.waitForTimeout(400);
  const S = () => page.evaluate(() => AppStateZL.state);
  const status = () => page.evaluate(() => document.getElementById("board-info").textContent);
  const closeModal = () => page.evaluate(() => { const b = document.querySelector("#result-modal-overlay .result-modal-close, #result-modal-overlay button:not(.result-modal-replay)"); if (b) b.click(); else if (window.ResultModal) ResultModal.hide(); });

  let s = await S();
  check("starts with puzzle 1 of the easy level " + JSON.stringify(s && [s.level, s.number]), s && s.level === 1 && s.number === 1);
  check("board shown", await page.evaluate(() => !document.getElementById("board-container").classList.contains("hidden")));
  check("one card per clue", (await page.$$eval(".zl-clue", (e) => e.length)) === s.clues.length);
  check("3 code fields, 10 keys", (await page.$$eval(".zl-slot", (e) => e.length)) === 3 && (await page.$$eval(".zl-key", (e) => e.length)) === 10);
  check("meta shows puzzle number " + await page.textContent("#game-meta"), /Puzzle 1 · Mistakes: 0/.test(await page.textContent("#game-meta")));
  const says = await page.evaluate(() => Array.from(document.querySelectorAll(".zl-clue")).map((c) => Array.from(c.querySelectorAll(".zl-say")).map((p) => p.textContent)));
  check("a clue with no right digit says so " + JSON.stringify(says), says.some((x) => x.length === 1 && x[0] === "No digit is right."));
  check("every sentence is its own element", says.every((x) => x.every((t) => /^[^.]+\.$/.test(t))));

  // Notes: cross out, cross out another, undo, undo.
  await page.click('.zl-digit[data-clue="0"][data-place="1"]');
  check("tap crosses out", JSON.stringify((await S()).struck[0]) === "[1]" && await page.getAttribute('.zl-digit[data-clue="0"][data-place="1"]', "aria-pressed") === "true");
  await page.click('.zl-digit[data-clue="1"][data-place="0"]');
  await page.click('.zl-digit[data-clue="0"][data-place="1"]');
  check("second tap takes it back", (await S()).struck[0].length === 0);
  check("undo enabled", !(await page.evaluate(() => document.getElementById("zl-undo").disabled)));
  await page.click("#zl-undo");
  check("undo crosses it out again", JSON.stringify((await S()).struck[0]) === "[1]");
  await page.click("#zl-undo");
  await page.click("#zl-undo");
  check("undo all notes", (await S()).struck.every((x) => x.length === 0) && await page.evaluate(() => document.getElementById("zl-undo").disabled));
  check("undo button is not #undo-btn", (await page.$$("#undo-btn")).length === 0);

  // Entry: digits, a locked digit, delete, choose a field.
  s = await S();
  const wrong = s.code.split("").reverse().join("") === s.code ? "012" : s.code.split("").reverse().join("");
  await page.click('.zl-key[data-digit="7"]');
  await page.click('.zl-key[data-digit="8"]');
  check("two digits typed " + (await S()).entry, (await S()).entry === "78_");
  check("7 is locked on the keypad", await page.evaluate(() => document.querySelector('.zl-key[data-digit="7"]').disabled && document.querySelector('.zl-key[data-digit="7"]').classList.contains("zl-locked")));
  await page.click("#zl-erase");
  check("delete takes the last digit", (await S()).entry === "7__");
  await page.click('.zl-slot[data-place="0"]');
  check("chosen field has the thick frame", await page.evaluate(() => document.querySelector('.zl-slot[data-place="0"]').classList.contains("zl-sel")));
  check("7 unlocked while its field is chosen", await page.evaluate(() => !document.querySelector('.zl-key[data-digit="7"]').disabled));
  await page.click("#zl-erase");
  check("delete the chosen digit", (await S()).entry === "___");
  await page.click("#zl-check");
  check("check with empty fields asks to fill them " + await status(), /Fill in all 3 fields/.test(await status()) && (await S()).mistakes === 0);
  for (const d of wrong) await page.click(`.zl-key[data-digit="${d}"]`);
  await page.click("#zl-check");
  check("wrong code counts a mistake " + await status(), (await S()).mistakes === 1 && /Not the code\. Mistakes: 1\./.test(await status()) && (await S()).entry === wrong);
  check("meta shows the mistake", /Mistakes: 1/.test(await page.textContent("#game-meta")));

  // Hint: clues marked, a true fact said.
  await page.click("#hint-btn");
  const h = await page.evaluate(() => ({ s: AppStateZL.state, marked: Array.from(document.querySelectorAll(".zl-clue.zl-hinted")).map((c) => Number(c.dataset.clue)), text: document.getElementById("board-info").textContent }));
  check("hint gives facts " + JSON.stringify(h.s.hints), h.s.hints.length >= 1 && h.s.hintCount === 1);
  check("hint marks its clues " + h.marked.join() + " / " + JSON.stringify(h.s.lastHint.clues), h.marked.join() === h.s.lastHint.clues.join());
  check("hint sentence " + h.text, /^(From .* it follows: .*|One digit of the code: .*)\.$/.test(h.text));
  const fact = h.s.hints[0];
  const ch = String(fact.digit);
  const ok = fact.kind === "absent" ? h.s.code.indexOf(ch) === -1 : fact.kind === "present" ? h.s.code.indexOf(ch) !== -1 : fact.kind === "place" ? h.s.code[fact.place] === ch : h.s.code[fact.place] !== ch;
  check("hint fact is true", ok);

  // Reload: the same state.
  await page.click('.zl-digit[data-clue="0"][data-place="2"]');
  const before = await S();
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(400);
  const after = await S();
  check("same state after reload", JSON.stringify(after) === JSON.stringify(before));
  check("note and hint mark shown after reload", await page.evaluate(() => document.querySelector('.zl-digit[data-clue="0"][data-place="2"]').getAttribute("aria-pressed") === "true" && document.querySelectorAll(".zl-clue.zl-hinted").length === AppStateZL.state.lastHint.clues.length));
  check("hint sentence back after reload", /follows|One digit/.test(await status()));

  // Sizes and scrolling at 360 px.
  const sizes = async () => page.evaluate(() => Array.from(document.querySelectorAll(".zl-digit, .zl-slot, .zl-key, #zl-erase, #zl-check, #zl-undo, #hint-btn")).filter((b) => b.offsetParent).every((b) => { const r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }));
  const noScroll = async () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0);
  check("taps at least 44 px (360)", await sizes());
  check("no sideways scroll (360)", await noScroll());
  if (SHOTS) await page.screenshot({ path: SHOTS + "/zl-360.png", fullPage: true });

  // Solve: type the code.
  const solve = async () => {
    const st = await S();
    for (let p = 0; p < st.digits; p++) if (st.entry[p] !== "_") { await page.click(`.zl-slot[data-place="${p}"]`); await page.click("#zl-erase"); }
    await page.click('.zl-slot[data-place="0"]');
    for (const d of st.code) await page.click(`.zl-key[data-digit="${d}"]`);
    await page.click("#zl-check");
  };
  await solve();
  const won = await page.evaluate(() => ({ solved: AppStateZL.state.solved, result: document.getElementById("game-result").textContent, modal: (document.getElementById("result-modal-message") || {}).textContent || "" }));
  check("solved with a result " + JSON.stringify(won.result), won.solved && won.result === "The lock is open.");
  check("result tells mistakes and hints " + won.modal, /Mistakes: 1\. Hints: 1\./.test(won.modal));
  check("keys locked after solving", await page.evaluate(() => Array.from(document.querySelectorAll(".zl-key")).every((b) => b.disabled) && document.getElementById("hint-btn").disabled));
  await closeModal();

  // New puzzle: the next number at the level; each level solved once.
  for (const lv of ["1", "2", "3"]) {
    await page.evaluate((v) => { document.getElementById("zahlenschloss-level").value = v; document.getElementById("start-zahlenschloss-game").click(); }, lv);
    await page.waitForTimeout(50);
    const st = await S();
    const expect = lv === "1" ? 2 : 1;
    check("level " + lv + " new puzzle number " + st.number, st.level === Number(lv) && st.number === expect && !st.solved);
    check("level " + lv + " fields " + st.digits, (await page.$$eval(".zl-slot", (e) => e.length)) === (lv === "3" ? 4 : 3));
    await solve();
    check("level " + lv + " solved", (await S()).solved);
    if (lv === "3") {
      check("hard: taps at least 44 px", await sizes());
      check("hard: no sideways scroll (360)", await noScroll());
    }
    await closeModal();
  }
  check("next numbers remembered per level", await page.evaluate(() => localStorage.getItem("papergames_zahlenschloss_next")) === JSON.stringify({ 1: 3, level: 3, 2: 2, 3: 2 }));
  // After a solved puzzle the page starts the next one by itself.
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(400);
  const fresh = await S();
  check("after solving, a reload starts the next puzzle " + JSON.stringify([fresh.level, fresh.number]), !fresh.solved && fresh.level === 3 && fresh.number === 2);
  await page.setViewportSize({ width: 600, height: 800 });
  await page.waitForTimeout(100);
  check("taps at least 44 px (600)", await sizes());
  check("no sideways scroll (600)", await noScroll());
  if (SHOTS) await page.screenshot({ path: SHOTS + "/zl-600.png", fullPage: true });
  await page.setViewportSize({ width: 360, height: 640 });
  await page.waitForTimeout(100);
  check("hard at 360: no sideways scroll", await noScroll());
  if (SHOTS) await page.screenshot({ path: SHOTS + "/zl-360-hard.png", fullPage: true });

  check("no key names in the page", await page.evaluate(() => !/\b(zl_|zahlenschloss_|msg_t_)/.test(document.body.innerText)));
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log(`=== ZAHLENSCHLOSS UI: direct start, clue sentences, notes and undo, locked digits, delete, mistakes, hint, reload, three levels solved, next numbers, 360/600 px, ${fails.length} failure(s) ===`);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
