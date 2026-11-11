#!/usr/bin/env node
// Kindle confirm (task 217): window.confirm does nothing on a Kindle, so
// safeConfirm asks with a Yes/No panel there and with the browser's dialog
// everywhere else. Checks both ways for the stats reset, resigning and the
// script tag on every page that asks.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const KINDLE = "Mozilla/5.0 (X11; U; Linux armv7l like Android; en-us) AppleWebKit/531.2+ (KHTML, like Gecko) Version/5.0 Safari/533.2+ Kindle/3.0+";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

const ROOT = path.join(__dirname, "..");
for (const f of fs.readdirSync(ROOT).filter((n) => n.endsWith(".html"))) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  const users = ["move-link.js", "confirm-actions.js", "stats-app.js"].map((s) => src.indexOf('src="' + s + '"')).filter((i) => i !== -1);
  if (!users.length) continue;
  const at = src.indexOf('src="browser-compat.js"');
  check(f + ": browser-compat.js before its users", at !== -1 && at < Math.min(...users));
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const open = async (url, userAgent) => {
    const ctx = await browser.newContext({ viewport: { width: 600, height: 800 }, userAgent });
    const page = await ctx.newPage();
    page.dialogs = [];
    page.on("pageerror", (e) => errors.push(url + ": " + e.message));
    page.on("dialog", (d) => { page.dialogs.push(d.message()); page.dialogAnswer ? d.accept() : d.dismiss(); });
    await page.goto(BASE + url);
    await page.waitForTimeout(400);
    return { ctx, page };
  };
  const panel = "#safe-confirm-overlay";

  // Normal browser: the browser's own dialog, answer passed on.
  {
    const { ctx, page } = await open("stats.html?lang=en");
    const value = await page.evaluate(() => {
      let asked = "";
      const real = window.confirm;
      window.confirm = (m) => { asked = m; return true; };
      const out = window.safeConfirm("Q?", () => {});
      window.confirm = real;
      return { out, asked, inline: window.safeConfirm.inline };
    });
    check("normal browser: confirm is called", value.asked === "Q?" && value.out === true && value.inline === false);
    page.dialogAnswer = false;
    await page.click("#stats-reset");
    await page.waitForTimeout(100);
    check("normal browser: dialog shown", page.dialogs.length === 1);
    check("normal browser: no panel", (await page.$(panel)) === null);
    await ctx.close();
  }

  // Kindle: no dialog, a panel; No leaves things alone, Yes acts.
  {
    const { ctx, page } = await open("stats.html?lang=de", KINDLE);
    check("Kindle: inline mode", await page.evaluate(() => window.safeConfirm.inline === true));
    await page.evaluate(() => {
      window.__reset = 0;
      const real = GameStats.reset;
      GameStats.reset = function () { window.__reset++; return real.apply(this, arguments); };
    });
    await page.click("#stats-reset");
    await page.waitForSelector(panel);
    check("Kindle: no browser dialog", page.dialogs.length === 0);
    const labels = await page.$$eval(panel + " button", (b) => b.map((x) => x.textContent));
    check("Kindle: German Yes/No (" + labels + ")", labels.join() === "Ja,Nein");
    const heights = await page.$$eval(panel + " button", (b) => b.map((x) => x.getBoundingClientRect().height));
    check("Kindle: buttons 44 px", heights.every((h) => h >= 44));
    await page.click(panel + " button.secondary");
    check("Kindle: No closes the panel", (await page.$(panel)) === null);
    check("Kindle: No does not reset", (await page.evaluate(() => window.__reset)) === 0);
    await page.click("#stats-reset");
    await page.click(panel + " button.primary");
    check("Kindle: Yes resets once", (await page.evaluate(() => window.__reset)) === 1);
    await ctx.close();
  }

  // Kindle: the click guard holds Resign back, and lets it through after Yes.
  {
    const { ctx, page } = await open("checkers.html?lang=en", KINDLE);
    // The page starts a game by itself, so a new one asks first as well.
    await page.evaluate(() => { AppStateCheckers.moveCount = 1; document.getElementById("mode-offline").click(); });
    await page.waitForSelector(panel);
    check("Kindle new game: asks first", page.dialogs.length === 0);
    await page.click(panel + " button.primary");
    await page.waitForTimeout(300);
    check("Kindle new game: Yes starts it", await page.evaluate(() => AppStateCheckers.moveCount === 0));
    // Changing the draughts rules during a game asks too.
    const changeRules = () => page.evaluate(() => {
      AppStateCheckers.moveCount = 1;
      const select = document.getElementById("checkers-rules");
      select.value = "it";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const rules = () => page.evaluate(() => AppStateCheckers.rules);
    const before = await rules();
    await changeRules();
    await page.waitForSelector(panel);
    await page.click(panel + " button.secondary");
    check("Kindle rules: No keeps them", (await rules()) === before && (await page.inputValue("#checkers-rules")) === before);
    await changeRules();
    await page.click(panel + " button.primary");
    await page.waitForTimeout(300);
    check("Kindle rules: Yes changes them", (await rules()) === "it");
    const resign = "#resign-button";
    const over = () => page.evaluate(() => AppStateCheckers.gameOver === true);
    check("Kindle resign: game running", !(await over()));
    await page.click(resign);
    await page.waitForSelector(panel);
    check("Kindle resign: waits for the answer", !(await over()));
    await page.click(panel + " button.secondary");
    await page.waitForTimeout(100);
    check("Kindle resign: No keeps the game", !(await over()));
    await page.click(resign);
    await page.click(panel + " button.primary");
    await page.waitForTimeout(200);
    check("Kindle resign: Yes ends the game", await over());
    check("Kindle resign: panel gone", (await page.$(panel)) === null);
    check("Kindle resign: no browser dialog", page.dialogs.length === 0);
    await ctx.close();
  }

  // Kindle: a move link over a running game waits for the answer.
  {
    const { ctx, page } = await open("checkers.html?lang=en", KINDLE);
    const saved = () => page.evaluate(() => JSON.parse(window.localStorage.getItem("einkchess_save_checkers")).moveCount);
    // Move links exist for two-player games only.
    await page.evaluate(() => document.getElementById("mode-offline").click());
    await page.waitForTimeout(250);
    if (await page.$(panel)) await page.click(panel + " button.primary");
    await page.waitForTimeout(250);
    const link = await page.evaluate(async () => {
      saveCheckersGame();
      const s = JSON.parse(window.localStorage.getItem("einkchess_save_checkers"));
      s.board = s.board.slice().reverse();
      s.moveCount = 3;
      return window.MoveLink.makeLink("checkers", s);
    });
    const follow = async () => {
      await page.goto(BASE + "checkers.html?lang=en#zug=" + link.split("#zug=")[1]);
      await page.waitForSelector(panel);
    };
    await follow();
    check("Kindle link: no browser dialog", page.dialogs.length === 0);
    await page.click(panel + " button.secondary");
    await page.waitForTimeout(300);
    check("Kindle link: No keeps the game", (await saved()) === 0);
    await follow();
    await page.click(panel + " button.primary");
    await page.waitForTimeout(1200);
    check("Kindle link: Yes opens it", (await saved()) === 3);
    await ctx.close();
  }

  await browser.close();
  errors.forEach((e) => check("page error: " + e, false));
  if (fails.length) { console.log(fails.length + " check(s) failed"); process.exit(1); }
  console.log("Kindle confirm: all checks passed");
})().catch((e) => { console.error(e); process.exit(1); });
