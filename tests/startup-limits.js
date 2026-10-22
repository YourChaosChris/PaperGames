#!/usr/bin/env node
// startup-limits.js
// Guards the start of the heaviest game pages against getting slower
// again (task 105). Each page in tests/startup-limits.json is loaded once
// with tests/eink-sim.js at CPU 10 (language de, slow Wi-Fi, no game
// started, no taps) and its script time compared with the measured value.
// More than 50 % above it counts as slower. Timing is noisy, so a page
// over the limit is loaded two more times and the median of the three
// runs decides.
//
// The values were measured on the Mac mini; other machines run at other
// speeds, so elsewhere the check is skipped (STARTUP_LIMITS=1 forces it).
// Change the values only on purpose, with a new measurement and date.
//
// Usage: node tests/startup-limits.js   (BASE_URL of a running server)

const fs = require("fs");
const path = require("path");

const LIMITS = JSON.parse(fs.readFileSync(path.join(__dirname, "startup-limits.json"), "utf8"));
const CPU = 10;
const VALUES = LIMITS.scriptMs["cpu" + CPU];
const SLUGS = Object.keys(VALUES);

if (process.platform !== "darwin" && process.env.STARTUP_LIMITS !== "1") {
  console.log(`=== STARTUP LIMITS: skipped (values measured on the Mac mini; STARTUP_LIMITS=1 runs it here), 0 failure(s) ===`);
  process.exit(0);
}

const { chromium } = require("playwright");
const { runPage } = require("./eink-sim");

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function median(list) {
  const s = list.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

(async () => {
  if (SLUGS.length > 5) throw new Error("at most 5 pages, the test must stay short");
  const browser = await chromium.launch();
  const opts = { cpu: CPU, lang: "de", taps: 0 };
  const failures = [];
  for (const slug of SLUGS) {
    const base = VALUES[slug];
    const limit = Math.round(base * (1 + LIMITS.tolerance));
    const runs = [];
    const run = async () => {
      const r = await runPage(browser, slug, opts);
      if (r.errors.length) throw new Error(slug + ": " + r.errors.join(" | "));
      runs.push(r.scriptMs);
    };
    try {
      await run();
      // A short pause before each repeat, so a passing load peak doesn't
      // decide (run-all.sh runs this test alone, see ALONE_TESTS there).
      if (runs[0] > limit) { await pause(5000); await run(); await pause(5000); await run(); }
    } catch (e) {
      failures.push(String(e.message || e).slice(0, 200));
      console.log(`${slug.padEnd(14)} FAILED ${String(e.message || e).slice(0, 200)}`);
      continue;
    }
    const ms = runs.length === 1 ? runs[0] : median(runs);
    const ok = ms <= limit;
    console.log(`${slug.padEnd(14)} script ${String(ms).padStart(5)} ms  measured ${String(base).padStart(5)} ms (${LIMITS.measured[slug]})  limit ${String(limit).padStart(5)} ms` +
      (runs.length > 1 ? `  runs ${runs.join(", ")} -> median` : "") + (ok ? "" : "  TOO SLOW"));
    if (!ok) failures.push(`${slug}: ${ms} ms > ${limit} ms`);
  }
  await browser.close();
  if (failures.length) console.log("FAILURES:\n  " + failures.join("\n  "));
  console.log(`=== STARTUP LIMITS: ${SLUGS.length} pages at CPU ${CPU}x, ${failures.length} failure(s) ===`);
  process.exit(failures.length ? 1 : 0);
})().catch((e) => {
  console.log("FAILED: " + String(e.stack || e).slice(0, 400));
  console.log(`=== STARTUP LIMITS: 1 failure(s) ===`);
  process.exit(1);
});
