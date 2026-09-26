// lib.js
// Shared helpers for the Playwright-based sweeps (board-sweep.js,
// interaction-sweep.js). Keeping "how do I start a game generically"
// in one place means both sweeps stay in sync automatically.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Tolino Vision 6: 1264x1680 physical px @ 300ppi, Android 8.1, no Google
// Play (so no WebView auto-update) - likely stuck near the Chrome 60s
// generation. CSS viewport assuming a ~2x (xhdpi) Android density bucket.
// This is the smallest, most constrained real device this app targets,
// so it's the one worth sweeping by default.
const VIEWPORT = { width: 632, height: 840 };

const BASE_URL = process.env.BASE_URL || "http://localhost:8000/";

// games-catalog.js is this project's own single source of truth for
// which games exist (already shared by the home page's Favorites
// section and the full games list) - reading the slug list from there
// instead of hardcoding it here means a 47th game is covered by these
// tests automatically, with nothing to remember to update.
function getGameSlugs() {
  const src = fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8");
  const slugs = [];
  const re = /slug:\s*"([a-z0-9]+)"/g;
  let m;
  while ((m = re.exec(src))) slugs.push(m[1]);
  if (!slugs.length) throw new Error("could not find any slugs in games-catalog.js");
  return slugs;
}

// Generically "start a game", whatever kind it is: local hotseat/vs-AI
// picker (most board games), a single "New game"/"Start"-style button
// (puzzles and solitaires), or - for games with a player-count picker -
// an extra explicit start click even after picking offline mode.
async function tryStart(page) {
  const modeOffline = await page.$("#mode-offline");
  if (modeOffline && await modeOffline.isVisible().catch(() => false)) {
    await modeOffline.click().catch(() => {});
    await page.waitForTimeout(200);
    // Games with a player-count picker (Ludo, Domino, Mau Mau) need an
    // explicit start click even after picking offline mode.
    const explicitStart = await page.$("button[id^='start-'][id$='-game']");
    if (explicitStart && await explicitStart.isVisible().catch(() => false)) {
      await explicitStart.click().catch(() => {});
      await page.waitForTimeout(250);
    }
    return "mode-offline";
  }
  const modeOfflineAi = await page.$("#mode-offline-ai");
  if (modeOfflineAi && await modeOfflineAi.isVisible().catch(() => false)) {
    await modeOfflineAi.click().catch(() => {});
    await page.waitForTimeout(150);
  }
  const startBtn = await page.$("button[id^='start-']:not([id='start-seek-button'])");
  if (startBtn && await startBtn.isVisible().catch(() => false)) {
    await startBtn.click().catch(() => {});
    await page.waitForTimeout(300);
    return "start-button";
  }
  return "no-start-flow-found";
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = [];
  let idx = 0;
  async function run() {
    while (idx < items.length) {
      const item = items[idx++];
      results.push(await worker(item));
      process.stdout.write(".");
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  console.log("");
  results.sort((a, b) => a.slug.localeCompare(b.slug));
  return results;
}

module.exports = { VIEWPORT, BASE_URL, getGameSlugs, tryStart, runWithConcurrency };
