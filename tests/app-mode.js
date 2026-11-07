#!/usr/bin/env node
// App mode and cream theme (task 186). Without app mode: donation link
// visible, white background. With ?app=ios: donation link and its privacy
// note hidden, cream background by default. The choice in Settings is kept
// after a reload. Contrast of black text on cream is checked (WCAG AA).
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

const lum = (rgb) => {
  const c = rgb.match(/\d+/g).slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const open = async (path, ctx) => {
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(path + ": " + e.message));
    await page.goto(BASE + path);
    await page.waitForTimeout(400);
    return page;
  };
  const vis = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== "none"; }, sel);
  const bg = (p) => p.evaluate(() => getComputedStyle(document.body).backgroundColor);

  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
    const p = await open("about.html?lang=en", ctx);
    check("web: donation link visible", await vis(p, ".about-donate"));
    check("web: background white-ish by default", lum(await bg(p)) > 0.85 && (await bg(p)) !== "rgb(247, 241, 227)");
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
    const p = await open("about.html?lang=en&app=ios", ctx);
    check("app: donation link hidden", !(await vis(p, ".about-donate")));
    check("app: cream background by default (" + (await bg(p)) + ")", (await bg(p)) === "rgb(247, 241, 227)");
    const text = await p.evaluate(() => getComputedStyle(document.body).color);
    const ratio = (lum("rgb(247, 241, 227)") + 0.05) / (lum(text) + 0.05);
    check("app: contrast text on cream >= 4.5 (" + ratio.toFixed(1) + ")", ratio >= 4.5);
    // remembered for the tab: other page keeps app mode without the parameter
    const p2 = p;
    await p2.goto(BASE + "calm.html?lang=en");
    await p2.waitForTimeout(300);
    check("app: calm page keeps app mode, donation sentence hidden", !(await vis(p2, '[data-i18n="calm_point_8"]')));
    const p3 = p;
    await p3.goto(BASE + "datenschutz.html?lang=en");
    await p3.waitForTimeout(300);
    check("app: privacy PayPal section hidden", !(await vis(p3, '[data-i18n="privacy_paypal_heading"]')));
    // game page + settings
    const g = p;
    await g.goto(BASE + "chess.html?lang=en");
    await g.waitForTimeout(500);
    check("app: chess page is cream too", (await bg(g)) === "rgb(247, 241, 227)");
    await ctx.close();
  }
  {
    // choice in settings stays after reload (website, switch to cream)
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
    const p = await open("index.html?lang=en", ctx);
    await p.evaluate(() => window.Theme.set("cream"));
    await p.reload();
    await p.waitForTimeout(400);
    check("web: cream kept after reload", (await bg(p)) === "rgb(247, 241, 227)");
    await p.evaluate(() => window.Theme.set("white"));
    await p.reload();
    await p.waitForTimeout(400);
    check("web: white kept after reload", (await bg(p)) !== "rgb(247, 241, 227)");
    // settings menu shows the two buttons
    await p.waitForTimeout(300);
    await p.evaluate(() => { const b = document.getElementById("settings-menu-button"); if (b) b.click(); });
    await p.waitForTimeout(300);
    const n = await p.evaluate(() => document.querySelectorAll("#settings-theme-group button").length);
    check("settings: two theme buttons (" + n + ")", n === 2);
    await ctx.close();
  }
  {
    // German text of the new settings entries
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
    const p = await open("index.html?lang=de", ctx);
    await p.waitForTimeout(800);
    const t = await p.evaluate(() => window.I18n && window.I18n.t ? [I18n.t("settings_theme_cream"), I18n.t("settings_section_theme")] : []);
    check("de: Creme / Hintergrund (" + t + ")", t[0] === "Creme" && t[1] === "Hintergrund");
    await ctx.close();
  }

  await browser.close();
  check("no page errors (" + errors.join("; ") + ")", errors.length === 0);
  console.log(fails.length ? "app-mode: " + fails.length + " FAIL" : "app-mode: OK");
  process.exit(fails.length ? 1 : 0);
})();
