#!/usr/bin/env node
// Puzzle Advent calendar in the browser (task 122), German page at
// 360 x 640: 24 doors in a grid (taps of at least 44 px, closed / open /
// solved told apart by class and shape), the season line before 1
// December, door 1 open on 5 December and door 2 waiting for it, solving
// door 1 (Light Switch) by tapping, the solved text, door 2 opening after
// it, a digit entered in door 2 surviving a reload, "Open all doors" from
// the menu, every door open after 24 December, the cells of the biggest
// puzzles at least 40 px, broken and old saves, no sideways scroll, no
// page error.
// BASE_URL from the environment or as --base URL.
const { chromium } = require("playwright");
const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 && process.argv[argBase + 1]) || process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const load = async () => { await page.goto(BASE + "advent.html?lang=de", { waitUntil: "load" }); await page.waitForTimeout(400); };
  const setDate = (y, m, d) => page.evaluate(([yy, mm, dd]) => { AppStateAdvent.now = new Date(yy, mm - 1, dd, 12); closeDoorAdv(); }, [y, m, d]);
  const info = () => page.evaluate(() => document.getElementById("board-info").textContent.trim());
  const doors = () => page.evaluate(() => Array.from(document.querySelectorAll("#adv-doors .adv-door-btn")).map((b) => b.className.replace("adv-door-btn ", "")));
  const noScroll = async (where) => {
    const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(where + ": no sideways scroll (" + o + ")", o <= 0);
  };

  await load();
  await page.evaluate(() => localStorage.removeItem("einkchess_save_advent"));
  await load();

  // Before 1 December.
  await setDate(2026, 11, 20);
  const before = await doors();
  check("24 doors", before.length === 24);
  check("20 Nov: all closed", before.every((c) => /^adv-closed/.test(c)));
  check("20 Nov: season line " + (await info()), (await info()) === "Der Kalender beginnt am 1. Dezember.");
  await page.tap('#adv-doors [data-door="1"]');
  check("tap on a closed door in November says why", /1\. Dezember/.test(await info()) && await page.isHidden("#adv-door"));
  const sizes = await page.evaluate(() => Array.from(document.querySelectorAll("#adv-doors .adv-door-btn")).map((b) => { const r = b.getBoundingClientRect(); return Math.min(r.width, r.height); }));
  check("door buttons at least 44 px (smallest " + Math.round(Math.min(...sizes)) + ")", Math.min(...sizes) >= 44);
  const shapes = await page.evaluate(() => {
    const st = (sel) => { const b = document.querySelector(sel); const cs = getComputedStyle(b); return cs.borderTopStyle + " " + cs.backgroundImage.slice(0, 26); };
    return st("#adv-doors .adv-closed");
  });
  check("closed door: dashed edge and stripes " + shapes, /dashed/.test(shapes) && /gradient/.test(shapes));
  check("20 Nov: Open the next door is greyed out", await page.evaluate(() => document.getElementById("adv-new-game").disabled));
  await noScroll("calendar");

  // 5 December, nothing solved: door 1 open, door 2 waits for door 1.
  await setDate(2026, 12, 5);
  let d = await doors();
  check("5 Dec: door 1 open, 2 to 24 closed " + d.slice(0, 3).join(","), /^adv-open/.test(d[0]) && d.slice(1).every((c) => /^adv-closed/.test(c)));
  check("5 Dec: door 1 is waiting " + (await info()), /Türchen 1 wartet auf dich/.test(await info()));
  await page.tap('#adv-doors [data-door="2"]');
  check("door 2 waits for door 1: " + (await info()), (await info()) === "Löse zuerst Türchen 1.");
  await page.tap('#adv-doors [data-door="5"]');
  check("door 5 waits for door 4 as well", (await info()) === "Löse zuerst Türchen 4.");
  await page.tap('#adv-doors [data-door="6"]');
  check("door 6 waits for its day: " + (await info()), (await info()) === "Türchen 6 öffnet sich am 6. Dezember.");

  // Solve door 1 by tapping the lights of its one solution (opened with
  // "Open the next door").
  check("5 Dec: Open the next door says so", (await page.textContent("#adv-new-game")).trim() === "Nächstes Türchen öffnen");
  await page.tap("#adv-new-game");
  check("door 1 open with its title", (await page.textContent("#adv-door-title")).trim() === "Türchen 1: Lichtschalter");
  const presses = await page.evaluate(() => { const p = AdventCore.puzzle(1); return LightSwitchCore.allSolutions(p.start)[0].map(([r, c]) => r * p.size + c); });
  check("door 1: no number pad for lights", await page.isHidden("#adv-pad"));
  for (const i of presses) await page.tap("#adv-puzzle .adv-cell >> nth=" + i);
  const solved1 = await page.evaluate(() => ({
    panel: !document.getElementById("adv-solved").classList.contains("hidden"),
    title: document.querySelector(".adv-solved-title").textContent.trim(),
    text: document.getElementById("adv-solved-text").textContent.trim(),
    save: GameStorage.load("einkchess_save_advent")
  }));
  check("door 1 solved: panel and text " + JSON.stringify(solved1.text), solved1.panel && solved1.title === "Gelöst!" && solved1.text === "Das erste Türchen ist offen - 23 kommen noch.");
  check("door 1 solved: saved " + JSON.stringify(solved1.save && solved1.save.solved), solved1.save && JSON.stringify(solved1.save.solved) === "[1]" && solved1.save.year === 2026);
  await page.tap("#adv-back");
  d = await doors();
  check("after door 1: door 1 solved, door 2 open, door 3 closed " + d.slice(0, 3).join(","), /^adv-solved/.test(d[0]) && /^adv-open/.test(d[1]) && /^adv-closed/.test(d[2]));

  // Door 2: a digit, then a reload.
  await page.tap('#adv-doors [data-door="2"]');
  const free = await page.evaluate(() => AdventCore.puzzle(2).givens.findIndex((v) => !v));
  const want = await page.evaluate((i) => AdventCore.puzzle(2).solution[i], free);
  await page.tap("#adv-puzzle .adv-cell >> nth=" + free);
  check("tapped cell is selected", await page.evaluate((i) => document.querySelectorAll("#adv-puzzle .adv-cell")[i].classList.contains("adv-selected"), free));
  const pad = await page.evaluate(() => Array.from(document.querySelectorAll("#adv-pad button")).map((b) => ({ t: b.textContent.trim(), h: Math.round(b.getBoundingClientRect().height), w: Math.round(b.getBoundingClientRect().width) })));
  check("pad 1-4 and Löschen, at least 44 px " + JSON.stringify(pad), pad.map((b) => b.t).join(",") === "1,2,3,4,Löschen" && pad.every((b) => b.h >= 44 && b.w >= 44));
  await page.tap("#adv-pad button >> nth=" + (want - 1));
  check("digit entered", (await page.evaluate((i) => document.querySelectorAll("#adv-puzzle .adv-cell")[i].textContent.trim(), free)) === String(want));
  await noScroll("door 2");
  await load();
  await setDate(2026, 12, 5);
  await page.tap('#adv-doors [data-door="2"]');
  check("after reload: digit still there", (await page.evaluate((i) => document.querySelectorAll("#adv-puzzle .adv-cell")[i].textContent.trim(), free)) === String(want));
  check("after reload: door 1 still solved", await page.evaluate(() => AppStateAdvent.save.solved.join() === "1"));
  // Fill in the rest from the solution: door 2 solved.
  const rest = await page.evaluate(() => { const p = AdventCore.puzzle(2); return p.solution.map((v, i) => (p.givens[i] ? null : [i, v])).filter(Boolean); });
  for (const [i, v] of rest) { await page.tap("#adv-puzzle .adv-cell >> nth=" + i); await page.tap("#adv-pad button >> nth=" + (v - 1)); }
  check("door 2 solved", await page.evaluate(() => AppStateAdvent.save.solved.join() === "1,2" && !document.getElementById("adv-solved").classList.contains("hidden")));
  await page.tap("#adv-back");

  // Open all doors from the menu.
  await page.tap("#menu-toggle");
  await page.tap("#adv-all-open");
  d = await doors();
  check("open all: every unsolved door open", d.slice(2).every((c) => /^adv-open/.test(c)) && /^adv-solved/.test(d[0]));
  check("open all remembered", await page.evaluate(() => localStorage.getItem("papergames_advent_all_open") === "1"));
  // The biggest puzzles: cells at least 40 px, no sideways scroll.
  for (const n of [14, 17, 18, 21, 24]) {
    await page.evaluate((k) => openDoorAdv(k), n);
    const m = await page.evaluate(() => Math.min(...Array.from(document.querySelectorAll("#adv-puzzle .adv-cell")).map((b) => { const r = b.getBoundingClientRect(); return Math.min(r.width, r.height); })));
    check("door " + n + ": cells at least 40 px (" + Math.round(m) + ")", m >= 40);
    await noScroll("door " + n);
    await page.evaluate(() => closeDoorAdv());
  }
  await page.tap("#adv-all-open");
  check("open all off again", await page.evaluate(() => localStorage.getItem("papergames_advent_all_open") === "0" && document.querySelector('#adv-doors [data-door="24"]').classList.contains("adv-closed")));

  // After 24 December every door is open.
  await setDate(2026, 12, 27);
  d = await doors();
  check("27 Dec: every door open or solved", d.every((c) => /^adv-(open|solved)/.test(c)) && /vorbei/.test(await info()));

  // Broken and old saves.
  for (const bad of ["garbage{", JSON.stringify({ year: 2025, solved: [1, 2, 3] }), JSON.stringify({ year: 2026, solved: "x", work: 5 })]) {
    await page.evaluate((v) => localStorage.setItem("einkchess_save_advent", v), bad);
    await load();
    const ok = await page.evaluate(() => document.querySelectorAll("#adv-doors .adv-door-btn").length === 24 && Array.isArray(AppStateAdvent.save.solved));
    check("save " + bad.slice(0, 20) + " loads without error", ok);
  }
  // Arabic (right to left): the puzzle grid is not mirrored, so the signs
  // and side clues keep their meaning.
  await page.goto(BASE + "advent.html?lang=ar", { waitUntil: "load" });
  await page.waitForTimeout(400);
  const rtl = await page.evaluate(() => {
    AppStateAdvent.allOpen = true;
    openDoorAdv(15);
    const cells = document.querySelectorAll("#adv-puzzle .adv-cell");
    return { dir: document.documentElement.dir, first: cells[0].getBoundingClientRect().left, last: cells[4].getBoundingClientRect().left };
  });
  check("Arabic: page right to left, puzzle left to right " + JSON.stringify(rtl), rtl.dir === "rtl" && rtl.first < rtl.last);
  await noScroll("Arabic door 15");
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== ADVENT UI: 24 doors, unlocking by date, solve door 1 by tapping, door 2 opens, save and load, open all, cells and taps at 360 x 640, old saves, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
