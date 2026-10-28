#!/usr/bin/env node
// dialog-texts.js
// Native browser dialogs (alert, confirm, prompt) are invisible to the
// other sweeps: Playwright closes them silently, so an English dialog
// text in another language went unnoticed (Backgammon double, chess
// online, fixed in v276). This test opens every page that still shows a
// native dialog, triggers each dialog in every language except English,
// records type, language and text, dismisses it, and fails when a text
// is the English one from lang/en.js or is recognisably English.
//
// Dialogs that exist today (confirm-actions.js, stats-app.js, app.js):
//   resign confirm, new-game confirm (chess, backgammon), Lichess token
//   prompt (chess online), stats reset (stats page), "restart level" /
//   "new level" (Crate Pusher) and "new game" after a move (Shape Sort).
// A dialog that no longer appears is reported too, so a scenario that
// silently stops triggering cannot hide a text.
//
// Requires a local server serving the repo root and Playwright.

const { chromium } = require("playwright");
const { VIEWPORT, BASE_URL, tryStart, runWithConcurrency } = require("./lib");

const ctx = require("./load-i18n").loadI18n({ texts: false });
const EN = ctx.STRINGS.en;
const LANGS = ctx.LANGUAGE_ORDER.filter((l) => l !== "en");
// Scripts without Latin letters: any Latin word not in the language's own
// texts is a leftover (same rule as i18n-runtime-sweep.js).
const NON_LATIN = new Set(["ru", "uk", "ja", "zh", "ar"]);

const words = (s) => (String(s).match(/[A-Za-zÀ-ÿ']{3,}/g) || []).map((w) => w.toLowerCase());
function vocab(table) {
  const set = new Set();
  Object.values(table).forEach((v) => { if (typeof v === "string") words(v).forEach((w) => set.add(w)); });
  return set;
}
const enVocab = vocab(EN);
const langVocab = {};
LANGS.forEach((l) => { langVocab[l] = vocab(ctx.STRINGS[l]); });

// Returns the reason a dialog text counts as English, or "".
function englishReason(lang, text) {
  const t = String(text).trim();
  for (const k of Object.keys(EN)) {
    if (EN[k] === t && ctx.STRINGS[lang][k] !== t) return "English text of " + k;
  }
  // Proper names and numbers: words the language's own texts also use
  // (Lichess, API, board:play, ...) never count.
  const foreign = words(t).filter((w) => !langVocab[lang].has(w));
  if (NON_LATIN.has(lang)) {
    const latin = foreign.filter((w) => /^[a-z']+$/.test(w));
    return latin.length ? "Latin words " + latin.join(", ") : "";
  }
  const english = foreign.filter((w) => enVocab.has(w));
  const all = words(t).length;
  return english.length >= 2 && english.length * 3 >= all ? "English words " + english.join(", ") : "";
}

// Self-check: the English texts must be caught in every language, or the
// test could pass while seeing nothing.
const SAMPLE_KEYS = ["resign_confirm_dialog", "new_game_confirm_dialog", "stats_reset_confirm", "lichess_token_prompt", "cp_restart_confirm", "cp_new_level_confirm"];
const selfFail = [];
LANGS.forEach((l) => SAMPLE_KEYS.forEach((k) => {
  if (!englishReason(l, EN[k])) selfFail.push(l + "/" + k + " not detected as English");
  if (englishReason(l, ctx.STRINGS[l][k])) selfFail.push(l + "/" + k + " translation flagged: " + englishReason(l, ctx.STRINGS[l][k]));
}));

async function clickIfThere(page, sel) {
  return page.evaluate((s) => { const el = document.querySelector(s); if (!el) return false; el.click(); return true; }, sel).catch(() => false);
}

// Each scenario: page, the dialogs it must show, and how to trigger them.
const SCENARIOS = [
  {
    name: "chess", page: "chess.html",
    expect: ["new_game_confirm_dialog", "resign_confirm_dialog", "lichess_token_prompt"],
    // The token prompt is app.js's fallback for old browsers where
    // lichess-auth.js does not load; blocking it shows that path.
    block: "**/lichess-auth.js",
    run: async (page, mark) => {
      await tryStart(page);
      mark("new_game_confirm_dialog"); await clickIfThere(page, "#mode-offline"); await page.waitForTimeout(150);
      mark("resign_confirm_dialog"); await clickIfThere(page, "#resign-button"); await page.waitForTimeout(150);
      mark("lichess_token_prompt"); await clickIfThere(page, "#login-button"); await page.waitForTimeout(150);
    }
  },
  {
    name: "backgammon", page: "backgammon.html",
    expect: ["new_game_confirm_dialog", "resign_confirm_dialog"],
    run: async (page, mark) => {
      await tryStart(page);
      mark("new_game_confirm_dialog"); await clickIfThere(page, "#mode-offline"); await page.waitForTimeout(150);
      mark("resign_confirm_dialog"); await clickIfThere(page, "#resign-button"); await page.waitForTimeout(150);
    }
  },
  {
    name: "stats", page: "stats.html",
    expect: ["stats_reset_confirm"],
    run: async (page, mark) => {
      mark("stats_reset_confirm"); await clickIfThere(page, "#stats-reset"); await page.waitForTimeout(150);
    }
  },
  {
    name: "cratepusher", page: "cratepusher.html",
    expect: ["cp_restart_confirm", "cp_new_level_confirm"],
    run: async (page, mark) => {
      await clickIfThere(page, "#start-cratepusher-game");
      await page.waitForFunction(() => document.querySelectorAll("#cratepusher-board button").length > 0, null, { timeout: 8000 }).catch(() => {});
      // Click floor cells until one move is made (Undo becomes active).
      for (let i = 0; i < 200; i++) {
        const moved = await page.evaluate(() => {
          const u = document.getElementById("undo-btn");
          if (u && !u.disabled) return true;
          const cells = Array.from(document.querySelectorAll("#cratepusher-board button")).filter((b) => b.tabIndex !== -1);
          if (cells.length) cells[Math.floor(Math.random() * cells.length)].click();
          return false;
        }).catch(() => false);
        if (moved) break;
        await page.waitForTimeout(20);
      }
      mark("cp_restart_confirm"); await clickIfThere(page, "#cp-restart"); await page.waitForTimeout(150);
      mark("cp_new_level_confirm"); await clickIfThere(page, "#start-cratepusher-game"); await page.waitForTimeout(150);
    }
  },
  {
    name: "shapesort", page: "shapesort.html",
    expect: ["new_game_confirm_dialog"],
    run: async (page, mark) => {
      await tryStart(page);
      // Click tubes in pairs until the shuffle button asks first.
      for (let i = 0; i < 80; i++) {
        const asks = await page.evaluate(() => {
          const b = document.getElementById("shapesort-shuffle");
          if (b && b.hasAttribute("data-confirm")) return true;
          const tubes = Array.from(document.querySelectorAll("#shapesort-tubes button"));
          if (tubes.length) tubes[Math.floor(Math.random() * tubes.length)].click();
          return false;
        }).catch(() => false);
        if (asks) break;
        await page.waitForTimeout(20);
      }
      mark("new_game_confirm_dialog"); await clickIfThere(page, "#shapesort-shuffle"); await page.waitForTimeout(150);
    }
  }
];

async function runOne(browser, lang, sc) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  const seen = [];
  let current = null;
  page.on("dialog", (d) => {
    seen.push({ key: current, type: d.type(), text: d.message() });
    d.dismiss().catch(() => {});
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e)));
  await page.addInitScript((l) => {
    try { localStorage.clear(); localStorage.setItem("einkchess_lang", l); } catch (e) {}
  }, lang);
  try {
    if (sc.block) await page.route(sc.block, (r) => r.abort());
    await page.goto(BASE_URL + sc.page, { waitUntil: "networkidle", timeout: 15000 });
    await sc.run(page, (key) => { current = key; });
  } catch (e) {
    errors.push("flow error: " + String(e));
  }
  await page.close();
  const problems = [];
  seen.forEach((d) => {
    const why = englishReason(lang, d.text);
    if (why) problems.push(`${d.type} (${d.key}): ${why}: ${JSON.stringify(d.text.slice(0, 120))}`);
  });
  sc.expect.forEach((key) => {
    if (!seen.some((d) => d.key === key)) problems.push(`dialog ${key} did not appear`);
  });
  return { slug: sc.name + "/" + lang, problems, errors, dialogs: seen.length };
}

(async () => {
  const t0 = Date.now();
  if (selfFail.length) {
    console.log("SELF-CHECK FAILED:\n  " + selfFail.join("\n  "));
    process.exit(1);
  }
  const jobs = [];
  LANGS.forEach((lang) => SCENARIOS.forEach((sc) => jobs.push({ slug: sc.name + "/" + lang, lang, sc })));
  const browser = await chromium.launch();
  const results = await runWithConcurrency(jobs, 5, (job) => runOne(browser, job.lang, job.sc));
  await browser.close();

  let issues = 0;
  let dialogs = 0;
  for (const r of results) {
    dialogs += r.dialogs;
    if (r.problems.length || r.errors.length) {
      issues++;
      console.log(`ISSUE ${r.slug}: ` + r.problems.concat(r.errors).join(" | ").slice(0, 400));
    }
  }
  console.log(`\n=== DIALOG TEXTS: ${results.length} runs in ${LANGS.length} languages, ${dialogs} dialogs checked, ${issues} with issues, ${((Date.now() - t0) / 1000).toFixed(1)} s ===`);
  process.exit(issues === 0 ? 0 : 1);
})();
