#!/usr/bin/env node
// Minesweeper clock (task 115), German page at 360 px:
//   - by default no once-a-second interval runs and the clock is hidden,
//     but the time is counted: the result names the seconds;
//   - "Zeit anzeigen" starts the interval and shows the clock; the choice
//     is remembered after a reload;
//   - more flags than mines: "Flaggen: 2 mehr als Minen." instead of an
//     untranslated "-2 mines left.".
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

const clock = (page) => page.evaluate(() => {
  const el = document.getElementById("minesweeper-timer");
  return { interval: AppStateMinesweeper.timerHandle !== null, hidden: el.classList.contains("hidden"), text: el.textContent.trim(), status: document.getElementById("board-info").textContent.trim(), result: document.getElementById("game-result").textContent.trim() };
});

async function startBeginner(page) {
  if (!(await page.isVisible("#minesweeper-level-inline"))) await page.tap("#menu-toggle").catch(() => page.click("#menu-toggle"));
  await page.selectOption("#minesweeper-level-inline", "beginner");
  await page.click("#start-minesweeper-game");
  await page.locator(".minesweeper-cell").nth(40).click();     // first reveal lays the mines, clock starts
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "minesweeper.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  check("checkbox off by default", !(await page.isChecked("#minesweeper-show-time")));
  await startBeginner(page);
  let c = await clock(page);
  check("no interval by default", !c.interval);
  check("clock hidden by default", c.hidden && c.text === "");
  check("time counted (clock started)", await page.evaluate(() => AppStateMinesweeper.runStart !== null));

  // Show time (box in the toolbar above the board): interval runs, clock visible.
  await page.check("#minesweeper-show-time");
  await page.waitForTimeout(1200);
  c = await clock(page);
  check("interval with Zeit anzeigen", c.interval);
  check("clock shown: " + c.text, !c.hidden && /^⏱ \d+s$/.test(c.text));
  await page.uncheck("#minesweeper-show-time");
  c = await clock(page);
  check("interval stops when switched off", !c.interval && c.hidden);

  // More flags than mines (beginner: 10 mines): flag 12 hidden cells, then reveal a safe one.
  await page.evaluate(() => {
    const s = AppStateMinesweeper.state;
    let n = 0;
    for (let r = 0; r < s.rows && n < 12; r++) for (let c = 0; c < s.cols && n < 12; c++) {
      if (!s.cells[r][c].revealed) { AppStateMinesweeper.state = MinesweeperCore.toggleFlag(AppStateMinesweeper.state, r, c); n++; }
    }
    const t = AppStateMinesweeper.state;
    for (let r = 0; r < t.rows; r++) for (let c = 0; c < t.cols; c++) {
      const cell = t.cells[r][c];
      if (!cell.revealed && !cell.flagged && !cell.mine) { doRevealMinesweeper(r, c); return; }
    }
  });
  c = await clock(page);
  check("too many flags: " + c.status, c.status === "Flaggen: 2 mehr als Minen.");

  // Win with the clock hidden: the result names the seconds once.
  await page.evaluate(() => {
    AppStateMinesweeper.runStart -= 5000;   // as if 5 s had passed
    const s = AppStateMinesweeper.state;
    for (let r = 0; r < s.rows; r++) for (let c = 0; c < s.cols; c++) {
      if (s.cells[r][c].flagged) AppStateMinesweeper.state = MinesweeperCore.toggleFlag(AppStateMinesweeper.state, r, c);
    }
    for (let r = 0; r < s.rows; r++) for (let c = 0; c < s.cols; c++) {
      const cell = AppStateMinesweeper.state.cells[r][c];
      if (!AppStateMinesweeper.gameOver && !cell.revealed && !cell.mine) doRevealMinesweeper(r, c);
    }
  });
  c = await clock(page);
  const m = c.result.match(/Alles aufgedeckt in (\d+) Sekunden/);
  check("result with the time: " + c.result, !!m && +m[1] >= 5);
  check("no interval after the end", !c.interval);

  // The choice is remembered.
  // (the result popup covers the page now; tick the box directly)
  await page.evaluate(() => { const el = document.getElementById("minesweeper-show-time"); if (!el.checked) el.click(); });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  check("Zeit anzeigen remembered", await page.isChecked("#minesweeper-show-time") && await page.evaluate(() => AppStateMinesweeper.showTime));
  check("no sideways scrolling", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  check("no page error " + errors.join(" | "), !errors.length);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== MINESWEEPER UI: clock off by default, Zeit anzeigen, too many flags, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})();
