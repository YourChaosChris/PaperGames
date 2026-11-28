#!/usr/bin/env node
// Peg Solitaire in the browser (task 239), English page at 360 x 740 and
// 600 x 800: the board choice offers every board of PegSolitaireCore.BOARDS;
// each board starts with its documented holes and one empty hole; one jump
// by tapping a peg and its target; Undo takes it back; Hint marks a jump.
// The boards of task 239 have taps of at least 44 px at 360 px; no board
// scrolls sideways at 360 or 600 px. No page error, no key names.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const SHOTS = process.env.SHOTS || "";
const NEW = ["square25", "cross20", "rect24", "octagon24", "heart27", "castle30", "rect32"];
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 740 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "pegsolitaire.html?lang=en", { waitUntil: "load" });
  await page.waitForTimeout(300);

  const options = await page.$$eval("#pegsolitaire-board-inline option", (o) => o.map((x) => x.value));
  const variants = await page.evaluate(() => PegSolitaireCore.VARIANTS);
  check("board choice shows every board " + options.join(), options.slice().sort().join() === variants.slice().sort().join());
  check("7 new boards offered", NEW.every((v) => options.indexOf(v) !== -1));

  for (const width of [360, 600]) {
    await page.setViewportSize({ width, height: width === 360 ? 740 : 800 });
    for (const v of options) {
      await page.evaluate((val) => {
        const panel = document.getElementById("settings-panel");
        if (panel.classList.contains("hidden")) document.getElementById("menu-toggle").click();
        document.getElementById("pegsolitaire-board-inline").value = val;
        document.getElementById("start-pegsolitaire-game").click();
      }, v);
      await page.waitForTimeout(150);
      const st = await page.evaluate(() => ({ v: AppStatePegSolitaire.variant, pegs: PegSolitaireCore.countPegs(AppStatePegSolitaire.board), holes: PegSolitaireCore.countHoles(AppStatePegSolitaire.board), want: PegSolitaireCore.BOARDS[AppStatePegSolitaire.variant].holes, buttons: document.querySelectorAll("#pegsolitaire-board .peg-square:not(.peg-square-gap)").length }));
      const tag = v + " @" + width;
      check(tag + ": board started " + JSON.stringify(st), st.v === v && st.holes === st.want && st.pegs === st.want - 1 && st.buttons === st.want);
      check(tag + ": no sideways scroll", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (NEW.indexOf(v) !== -1) {
        const small = await page.evaluate(() => Array.from(document.querySelectorAll("#pegsolitaire-board .peg-square:not(.peg-square-gap)")).filter((b) => { const r = b.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length);
        check(tag + ": taps at least 44 px (" + small + " smaller)", small === 0);
        if (SHOTS && width === 360) await page.screenshot({ path: SHOTS + "/peg-" + v + "-360.png", fullPage: true });
      }
      if (width !== 360) continue;
      // One jump by tapping, then Undo, then Hint.
      const m = await page.evaluate(() => PegSolitaireCore.getLegalMoves(AppStatePegSolitaire.board, AppStatePegSolitaire.variant)[0]);
      await page.click(`#pegsolitaire-board .peg-square[data-row="${m.from[0]}"][data-col="${m.from[1]}"]`);
      await page.click(`#pegsolitaire-board .peg-square[data-row="${m.to[0]}"][data-col="${m.to[1]}"]`);
      const after = await page.evaluate(() => ({ n: AppStatePegSolitaire.moveCount, pegs: PegSolitaireCore.countPegs(AppStatePegSolitaire.board) }));
      check(tag + ": one jump " + JSON.stringify(after), after.n === 1 && after.pegs === st.want - 2);
      await page.click("#undo-btn");
      const back = await page.evaluate(() => ({ n: AppStatePegSolitaire.moveCount, pegs: PegSolitaireCore.countPegs(AppStatePegSolitaire.board) }));
      check(tag + ": undo " + JSON.stringify(back), back.n === 0 && back.pegs === st.want - 1);
      await page.click("#hint-btn");
      await page.waitForTimeout(100);
      check(tag + ": hint marks a jump", (await page.$$("#pegsolitaire-board .peg-square-hint")).length === 2);
    }
  }
  check("no key names in the page", await page.evaluate(() => !/\bpegsolitaire_/.test(document.body.innerText)));
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  console.log(`=== PEGSOLITAIRE UI: ${options.length} boards in the choice, start, jump, undo, hint, 44 px for the new boards, no sideways scroll at 360/600 px, ${fails.length} failure(s) ===`);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
