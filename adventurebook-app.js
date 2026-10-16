// adventurebook-app.js
// Wires AdventureCore ("Adventure Book") to adventurebook.html.
//
// Three views in the board: creating a hero (name, class, 6 points,
// difficulty, place), the adventure (room text, what happened, the
// choices as buttons, the hero's values; map and backpack behind their
// own buttons) and the end (won or out of strength: same hero again or a
// new one). The game is saved after every step; every text comes from
// ab_* i18n keys.

const AB_SAVE_KEY = "einkchess_save_adventurebook";
const AB_LOG_LINES = 8;

const AppStateAb = {
  state: null,        // the running adventure (AdventureCore state)
  hero: null,         // the hero of the last adventure (for "same hero")
  draft: { name: "", cls: "fighter", stats: { str: 2, dex: 2, wis: 2 }, level: "easy", setting: "random" },
  panel: null,        // null | "map" | "pack" | "items"
  logFrom: 0,         // first log entry of the last step (shown as result)
  view: "create"      // "create" | "play" | "end"
};

const AC = () => AdventureCore;
function tAb(key) { return typeof I18n !== "undefined" ? I18n.t(key) : key; }
function fillAb(key, vars) {
  let s = tAb(key);
  Object.keys(vars || {}).forEach((k) => { s = s.split("{" + k + "}").join(String(vars[k])); });
  return s;
}
function escAb(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function itemName(id) { return tAb("ab_item_" + id); }
function enemyName(id) { return tAb("ab_enemy_" + id); }
function statName(k) { return tAb("ab_stat_" + k); }
function goalAcc(s) { return tAb("ab_goalitem_" + AC().GOAL_ITEM[s.dungeon.setting]); }
function goalName(s) { return itemName(AC().GOAL_ITEM[s.dungeon.setting]); }
function heroName(h) { return h.name || tAb("ab_name_default"); }

function saveAb() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(AB_SAVE_KEY, { state: AppStateAb.state, hero: AppStateAb.hero, view: AppStateAb.view, logFrom: AppStateAb.logFrom });
}

/*** Setup ***/

function initAbApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-adventurebook-game").addEventListener("click", () => {
    AppStateAb.state = null;
    AppStateAb.view = "create";
    showBoardAb();
    renderAb();
  });
  document.getElementById("resign-button").addEventListener("click", () => {
    const s = AppStateAb.state;
    if (!s || s.phase === "won" || s.phase === "lost") return;
    s.phase = "lost";
    s.hero.hp = 0;
    endAb();
  });
  document.getElementById("ab-map-btn").addEventListener("click", () => { AppStateAb.panel = AppStateAb.panel === "map" ? null : "map"; renderAb(); });
  document.getElementById("ab-pack-btn").addEventListener("click", () => { AppStateAb.panel = AppStateAb.panel === "pack" ? null : "pack"; renderAb(); });
  document.getElementById("ab-start").addEventListener("click", startAdventureAb);
  document.getElementById("ab-name").addEventListener("input", (e) => { AppStateAb.draft.name = e.target.value; });
  document.getElementById("ab-level").addEventListener("change", (e) => { AppStateAb.draft.level = e.target.value; });
  document.getElementById("ab-setting").addEventListener("change", (e) => { AppStateAb.draft.setting = e.target.value; });
  document.getElementById("ab-same").addEventListener("click", () => {
    const h = AC().keepHero(AppStateAb.hero || AppStateAb.state.hero);
    beginAb(h, AppStateAb.state ? AppStateAb.state.level : AppStateAb.draft.level, AppStateAb.draft.setting);
  });
  document.getElementById("ab-new").addEventListener("click", () => {
    AppStateAb.state = null;
    AppStateAb.view = "create";
    renderAb();
  });
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") I18n.onChange(() => renderAb());
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(AB_SAVE_KEY) : null;
  if (saved && saved.state && saved.state.hero && saved.state.dungeon) {
    AppStateAb.state = saved.state;
    AppStateAb.hero = saved.hero || saved.state.hero;
    AppStateAb.view = saved.view === "end" ? "end" : "play";
    AppStateAb.logFrom = saved.logFrom || 0;
    showBoardAb();
  } else {
    // Start a simple default adventure immediately. The New hero control
    // still opens the full character setup when the player wants it.
    const hero = AC().createHero(tAb("ab_name_default"), "fighter", { str: 2, dex: 2, wis: 2 });
    beginAb(hero, "easy", null);
  }
  renderAb();
}

function showBoardAb() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startAdventureAb() {
  const d = AppStateAb.draft;
  if (!AC().validStats(d.stats)) { document.getElementById("ab-create-msg").textContent = tAb("ab_need_points"); return; }
  const h = AC().createHero(d.name, d.cls, d.stats);
  beginAb(h, d.level, d.setting);
}

function beginAb(hero, level, setting) {
  AppStateAb.state = AC().newGame(hero, level, setting === "random" ? null : setting);
  AppStateAb.hero = AppStateAb.state.hero;
  AppStateAb.view = "play";
  AppStateAb.panel = null;
  AppStateAb.logFrom = 0;
  showBoardAb();
  if (window.ResultModal) window.ResultModal.hide();
  document.getElementById("game-result").textContent = "";
  saveAb();
  renderAb();
}

/*** Actions ***/

function doAb(act) {
  const s = AppStateAb.state;
  const before = s.logN || 0;
  if (!AC().apply(s, act)) return;
  AppStateAb.logFrom = before;
  if (act.type !== "use" && act.type !== "equip" && act.type !== "drop") AppStateAb.panel = null;
  if (s.phase === "won" || s.phase === "lost") { endAb(); return; }
  saveAb();
  renderAb();
}

function endAb() {
  const s = AppStateAb.state;
  AppStateAb.view = "end";
  AppStateAb.hero = s.hero;
  AppStateAb.panel = null;
  const won = s.phase === "won";
  const title = tAb(won ? "ab_result_won" : "ab_result_lost");
  const text = won ? fillAb("ab_result_won_text", { name: heroName(s.hero), g: goalAcc(s), n: s.hero.gold, l: s.hero.lvl })
    : fillAb("ab_result_lost_text", { name: heroName(s.hero) });
  document.getElementById("game-result").textContent = text;
  if (typeof GameStats !== "undefined") GameStats.record("adventurebook", won ? "win" : "loss");
  if (window.ResultModal) window.ResultModal.show(title, text);
  saveAb();
  renderAb();
}

/*** Texts ***/

function checkTextAb(c) {
  const t = c.tool ? fillAb("ab_check_tool", { i: itemName(c.tool) }) : "";
  return (c.reroll ? tAb("ab_check_reroll") : "") +
    fillAb("ab_check", { d: c.dice, s: statName(c.stat), v: c.value, t, sum: c.total, n: c.diff, r: tAb(c.ok ? "ab_check_ok" : "ab_check_fail") });
}

function logLineAb(s, e) {
  const c = e.c ? checkTextAb(e.c) : "";
  const i = e.item ? (AC().ITEM[e.item].kind === "goal" ? tAb("ab_goalitem_" + e.item) : itemName(e.item)) : "";
  const en = e.e ? enemyName(e.e) : "";
  switch (e.k) {
    case "start": return tAb("ab_log_start");
    case "go": return fillAb("ab_log_go", { d: tAb("ab_dir_" + e.dir) });
    case "search_ok": return fillAb("ab_log_search_ok", { c, g: e.gold });
    case "search_none": return fillAb("ab_log_search_none", { c });
    case "trap_hit": return fillAb("ab_log_trap_hit", { c, n: e.n });
    case "trap_ok": return fillAb("ab_log_trap_ok", { c });
    case "chest": return fillAb("ab_log_chest", { i, g: e.gold });
    case "packfull": return fillAb("ab_log_packfull", { i });
    case "found_equip": return fillAb("ab_log_found_equip", { i });
    case "equip": return fillAb("ab_log_equip", { i });
    case "obstacle_ok": return fillAb("ab_log_obstacle_ok", { c, i });
    case "obstacle_fail": return fillAb("ab_log_obstacle_fail", { c, n: e.n });
    case "drink": return fillAb("ab_log_drink", { n: e.n });
    case "take": return fillAb("ab_log_take", { i: tAb("ab_goalitem_" + e.item) });
    case "won": return fillAb("ab_log_won", { i: itemName(e.item) });
    case "heal": return fillAb("ab_log_heal", { i, n: e.n });
    case "charm": return fillAb("ab_log_charm", { i, s: statName(e.stat) });
    case "lantern": return tAb("ab_log_lantern");
    case "drop": return fillAb("ab_log_drop", { i });
    case "meet": return fillAb("ab_log_meet", { e: en });
    case "hit": return fillAb("ab_log_hit", { d: e.dice, s: statName(e.stat), v: e.value, sum: e.total, n: e.need, e: en, m: e.n });
    case "miss": return fillAb("ab_log_miss", { d: e.dice, s: statName(e.stat), v: e.value, sum: e.total, n: e.need });
    case "defend": return tAb("ab_log_defend");
    case "scroll_damage": return fillAb("ab_log_scroll_damage", { i, e: en, n: e.n });
    case "scroll_sleep": return fillAb("ab_log_scroll_sleep", { i, e: en });
    case "scroll_shield": return fillAb("ab_log_scroll_shield", { i });
    case "scroll_escape": return fillAb("ab_log_scroll_escape", { i });
    case "powerstrike": return fillAb("ab_log_powerstrike", { d: e.dice, v: e.value, sum: e.total, n: e.need, e: en, m: e.n });
    case "powerstrike_miss": return fillAb("ab_log_powerstrike_miss", { d: e.dice, v: e.value, sum: e.total, n: e.need });
    case "ambush": return fillAb("ab_log_ambush", { e: en, n: e.n });
    case "healspell": return fillAb("ab_log_healspell", { n: e.n });
    case "spark": return fillAb("ab_log_spark", { e: en, n: e.n });
    case "flee_ok": return fillAb("ab_log_flee_ok", { c });
    case "flee_fail": return fillAb("ab_log_flee_fail", { c });
    case "enemy_sleeps": return fillAb("ab_log_enemy_sleeps", { e: en });
    case "enemy_hit": return fillAb("ab_log_enemy_hit", { e: en, d: e.dice, a: e.atk, sum: e.total, n: e.need, m: e.n });
    case "enemy_miss": return fillAb("ab_log_enemy_miss", { e: en, d: e.dice, a: e.atk, sum: e.total, n: e.need });
    case "enemy_gone": return fillAb("ab_log_enemy_gone", { e: en, x: e.xp, g: e.gold });
    case "levelup": return fillAb("ab_log_levelup", { l: e.lvl });
    case "lost": return tAb("ab_log_lost");
    default: return "";
  }
}

function eventTextAb(s) {
  const rm = AC().here(s);
  switch (rm.kind) {
    case "start": return s.hasGoal ? fillAb("ab_ev_start_goal", { g: goalName(s) }) : tAb("ab_ev_start");
    case "enemy": return rm.done ? tAb("ab_ev_quiet") : fillAb("ab_ev_enemy", { e: enemyName(rm.enemy.id) });
    case "goal": return !rm.done ? fillAb("ab_ev_guardian", { e: enemyName(rm.enemy.id), g: goalAcc(s) }) : (s.hasGoal ? tAb("ab_ev_quiet") : fillAb("ab_ev_goal_here", { g: goalName(s) }));
    case "chest": return tAb(rm.done ? "ab_ev_chest_open" : "ab_ev_chest");
    case "well": return tAb(rm.done ? "ab_ev_well_used" : "ab_ev_well");
    case "obstacle": return rm.done ? tAb("ab_ev_obstacle_done") : tAb("ab_obst_" + rm.obstacle.id);
    default: return "";
  }
}

function itemFxAb(id) {
  const it = AC().ITEM[id];
  switch (it.kind) {
    case "heal": return it.v >= 99 ? tAb("ab_fx_heal_full") : fillAb("ab_fx_heal", { n: it.v });
    case "weapon": return fillAb("ab_fx_weapon", { n: it.v });
    case "armor": return fillAb("ab_fx_armor", { n: it.v });
    case "charm": return fillAb("ab_fx_charm", { s: statName(it.v) });
    case "scroll": return tAb("ab_fx_" + it.v);
    case "tool": return it.v === "reroll" ? tAb("ab_fx_reroll") : it.v === "map" ? tAb("ab_fx_map") : it.v === "compass" ? tAb("ab_fx_compass") : fillAb("ab_fx_tool", { s: statName(it.v) });
    default: return tAb("ab_fx_goal");
  }
}

function choiceLabelAb(s, a) {
  const rm = AC().here(s);
  switch (a.type) {
    case "go": {
      const d = tAb("ab_go_" + a.dir);
      const to = s.dungeon.rooms[rm.exits[a.dir]];
      return to.visited ? fillAb("ab_go_known", { d, n: rm.exits[a.dir] + 1 }) : d;
    }
    case "open": return tAb("ab_open");
    case "try": return tAb("ab_obst_" + rm.obstacle.id + "_try");
    case "drink": return tAb("ab_drink");
    case "search": return tAb("ab_search");
    case "take": return fillAb("ab_take", { g: goalAcc(s) });
    case "leave": return tAb("ab_leave");
    case "attack": return tAb("ab_attack");
    case "defend": return tAb("ab_defend");
    case "ability": return tAb("ab_ability_" + AC().CLASSES[s.hero.cls].ability);
    case "flee": return tAb("ab_flee");
    case "item": return fillAb("ab_use_item", { i: itemName(s.hero.pack[a.index]) });
    default: return "";
  }
}

/*** Drawing ***/

function renderAb() {
  const v = AppStateAb.view;
  document.getElementById("ab-create").classList.toggle("hidden", v !== "create");
  document.getElementById("ab-play").classList.toggle("hidden", v === "create");
  document.getElementById("ab-end").classList.toggle("hidden", v !== "end");
  document.getElementById("resign-button").classList.toggle("hidden", v !== "play");
  if (v === "create") { renderCreateAb(); return; }
  renderPlayAb();
}

function renderCreateAb() {
  const d = AppStateAb.draft;
  document.getElementById("board-info").textContent = "";
  const name = document.getElementById("ab-name");
  if (name.value !== d.name) name.value = d.name;
  name.placeholder = tAb("ab_name_default");
  document.getElementById("ab-level").value = d.level;
  document.getElementById("ab-setting").value = d.setting;
  // Classes as radio buttons with their description.
  const cls = document.getElementById("ab-classes");
  cls.innerHTML = AC().CLASS_IDS.map((c) =>
    '<label class="ab-class' + (d.cls === c ? " ab-chosen" : "") + '"><input type="radio" name="ab-class" value="' + c + '"' + (d.cls === c ? " checked" : "") + "> " +
    '<span class="ab-class-name">' + escAb(tAb("ab_class_" + c)) + "</span>" +
    '<span class="ab-class-desc">' + escAb(tAb("ab_class_" + c + "_desc")) + "</span></label>").join("");
  cls.querySelectorAll("input").forEach((r) => r.addEventListener("change", () => { d.cls = r.value; renderCreateAb(); }));
  // Values with - and + .
  const used = AC().STATS.reduce((a, k) => a + d.stats[k], 0);
  const box = document.getElementById("ab-stats");
  box.innerHTML = AC().STATS.map((k) =>
    '<div class="ab-stat-row"><span class="ab-stat-name">' + escAb(fillAb("ab_stat_value", { s: statName(k), n: d.stats[k] })) + "</span>" +
    '<button type="button" class="secondary ab-stat-btn" data-stat="' + k + '" data-d="-1" aria-label="' + escAb(fillAb("ab_stat_less", { s: statName(k) })) + '"' + (d.stats[k] <= 0 ? " disabled" : "") + ">−</button>" +
    '<button type="button" class="secondary ab-stat-btn" data-stat="' + k + '" data-d="1" aria-label="' + escAb(fillAb("ab_stat_more", { s: statName(k) })) + '"' + (d.stats[k] >= AC().STAT_MAX || used >= AC().POINTS ? " disabled" : "") + ">+</button></div>").join("");
  box.querySelectorAll(".ab-stat-btn").forEach((b) => b.addEventListener("click", () => {
    d.stats[b.getAttribute("data-stat")] += parseInt(b.getAttribute("data-d"), 10);
    document.getElementById("ab-create-msg").textContent = "";
    renderCreateAb();
  }));
  document.getElementById("ab-points").textContent = fillAb("ab_points_left", { n: AC().POINTS - used });
}

function renderPlayAb() {
  const s = AppStateAb.state;
  if (!s) return;
  const h = s.hero, rm = AC().here(s), D = s.dungeon;
  const over = AppStateAb.view === "end";
  document.getElementById("board-info").textContent = over ? "" : tAb(s.phase === "fight" ? "ab_status_fight" : "ab_status_explore");
  document.getElementById("ab-goal").textContent = s.hasGoal ? fillAb("ab_goal_carried", { g: goalAcc(s) }) : fillAb("ab_goal_line", { g: goalAcc(s) });
  document.getElementById("ab-room-title").textContent = fillAb("ab_room_title", { p: tAb("ab_setting_" + D.setting), n: s.room + 1, m: D.rooms.length });
  document.getElementById("ab-room-text").textContent = tAb("ab_room_" + D.setting + "_" + rm.desc);
  document.getElementById("ab-event").textContent = eventTextAb(s);
  // Fight box.
  const fight = document.getElementById("ab-fight");
  fight.classList.toggle("hidden", s.phase !== "fight");
  if (s.phase === "fight") {
    fight.innerHTML = "<strong>" + escAb(fillAb("ab_fight_title", { e: enemyName(rm.enemy.id) })) + "</strong><br>" +
      escAb(fillAb("ab_enemy_hp", { e: enemyName(rm.enemy.id), n: Math.max(0, rm.enemy.hp), m: rm.enemy.hpMax }));
  }
  // What the last step did.
  const res = s.log.filter((e) => e.q > AppStateAb.logFrom);
  document.getElementById("ab-result").innerHTML = res.map((e) => "<p>" + escAb(logLineAb(s, e)) + "</p>").join("");
  // Choices.
  const ch = document.getElementById("ab-choices");
  const acts = over ? [] : AC().choices(s);
  let list = acts;
  if (s.phase === "fight") {
    const items = acts.filter((a) => a.type === "item");
    list = AppStateAb.panel === "items" ? items : acts.filter((a) => a.type !== "item");
    if (AppStateAb.panel !== "items" && items.length) list.splice(2, 0, { type: "items" });
  }
  ch.innerHTML = list.map((a, i) => '<button type="button" class="' + (i === 0 ? "primary" : "secondary") + ' ab-choice" data-i="' + i + '">' +
    escAb(a.type === "items" ? tAb("ab_items_title") : choiceLabelAb(s, a)) + "</button>").join("") +
    (AppStateAb.panel === "items" ? '<button type="button" class="secondary ab-choice" data-i="close">' + escAb(tAb("ab_close")) + "</button>" : "");
  ch.querySelectorAll(".ab-choice").forEach((b) => b.addEventListener("click", () => {
    const i = b.getAttribute("data-i");
    if (i === "close") { AppStateAb.panel = null; renderAb(); return; }
    const a = list[parseInt(i, 10)];
    if (a.type === "items") { AppStateAb.panel = "items"; renderAb(); return; }
    doAb(a);
  }));
  // Map and backpack buttons.
  const mapBtn = document.getElementById("ab-map-btn"), packBtn = document.getElementById("ab-pack-btn");
  mapBtn.textContent = tAb("ab_map_btn");
  packBtn.textContent = fillAb("ab_pack_btn", { n: h.pack.length, m: AC().BACKPACK });
  mapBtn.setAttribute("aria-expanded", AppStateAb.panel === "map" ? "true" : "false");
  packBtn.setAttribute("aria-expanded", AppStateAb.panel === "pack" ? "true" : "false");
  renderMapAb(s);
  renderPackAb(s);
  // Hero.
  const next = h.lvl < AC().MAX_LEVEL ? AC().XP_FOR[h.lvl + 1] : null;
  document.getElementById("ab-hero").innerHTML =
    "<strong>" + escAb(fillAb("ab_hero_line", { name: heroName(h), cls: tAb("ab_class_" + h.cls), l: h.lvl })) + "</strong><br>" +
    '<span class="ab-hp">' + escAb(fillAb("ab_hp", { n: Math.max(0, h.hp), m: h.hpMax })) + "</span><br>" +
    escAb(next ? fillAb("ab_xp", { n: h.xp, m: next }) : fillAb("ab_xp_max", { n: h.xp })) + " · " + escAb(fillAb("ab_gold", { n: h.gold })) + "<br>" +
    escAb(AC().STATS.map((k) => fillAb("ab_stat_value", { s: statName(k), n: h.stats[k] })).join(" · ")) + "<br>" +
    escAb(fillAb("ab_gear", { w: h.weapon ? itemName(h.weapon) : tAb("ab_none"), a: h.armor ? itemName(h.armor) : tAb("ab_none") }));
  document.getElementById("ab-log").innerHTML = s.log.slice(-AB_LOG_LINES).map((e) => "<li>" + escAb(logLineAb(s, e)) + "</li>").join("");
}

function renderMapAb(s) {
  const box = document.getElementById("ab-map");
  box.classList.toggle("hidden", AppStateAb.panel !== "map");
  if (AppStateAb.panel !== "map") { box.innerHTML = ""; return; }
  const D = s.dungeon, C = 44, P = 6;
  // Only the part of the grid with rooms seen so far.
  const seen = D.rooms.filter((r) => r.seen);
  const x0 = Math.min.apply(null, seen.map((r) => r.x)), x1 = Math.max.apply(null, seen.map((r) => r.x));
  const y0 = Math.min.apply(null, seen.map((r) => r.y)), y1 = Math.max.apply(null, seen.map((r) => r.y));
  const W = (x1 - x0 + 1) * C + P * 2, H = (y1 - y0 + 1) * C + P * 2;
  const VX = x0 * C, VY = y0 * C;
  const cx = (r) => P + r.x * C + C / 2, cy = (r) => P + r.y * C + C / 2;
  let lines = "", rects = "";
  D.rooms.forEach((r, i) => {
    if (!r.seen) return;
    Object.keys(r.exits).forEach((d) => {
      const j = r.exits[d], o = D.rooms[j];
      if (j > i && o.seen && (r.visited || o.visited)) lines += '<line x1="' + cx(r) + '" y1="' + cy(r) + '" x2="' + cx(o) + '" y2="' + cy(o) + '" stroke="#141413" stroke-width="3"/>';
    });
  });
  D.rooms.forEach((r, i) => {
    if (!r.seen) return;
    const here = i === s.room;
    const mark = i === D.start ? "E" : (i === D.goal && (r.visited || s.hasGoal)) ? "★" : r.visited ? String(i + 1) : "?";
    const what = [fillAb("ab_map_cell", { n: i + 1 })];
    if (here) what.push(tAb("ab_map_here"));
    if (i === D.start) what.push(tAb("ab_map_start"));
    if (i === D.goal && r.visited) what.push(tAb("ab_map_goal"));
    if (!r.visited) what.push(tAb("ab_map_seen"));
    else what.push(fillAb("ab_map_exits", { d: ["n", "e", "s", "w"].filter((d) => r.exits[d] !== undefined).map((d) => tAb("ab_dir_" + d)).join(tAb("ab_list_sep")) }));
    const x = P + r.x * C + 6, y = P + r.y * C + 6, w = C - 12;
    rects += '<g role="img" aria-label="' + escAb(what.join(", ")) + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" rx="3" fill="#fff" stroke="#141413" stroke-width="' + (here ? 5 : 2) + '"' + (r.visited ? "" : ' stroke-dasharray="4 3"') + "/>" +
      '<text x="' + cx(r) + '" y="' + (cy(r) + 5) + '" text-anchor="middle" font-size="14" font-weight="700">' + mark + "</text></g>";
  });
  let compass = "";
  if (s.hero.pack.indexOf("compass") !== -1 && s.room !== D.start) {
    const d = AC().wayHome(s);
    if (d) compass = '<p class="ab-compass">' + escAb(fillAb("ab_compass_way", { d: tAb("ab_dir_" + d) })) + "</p>";
  }
  box.innerHTML = '<h2 class="ab-heading">' + escAb(tAb("ab_map_title")) + "</h2>" +
    '<svg class="ab-map-svg" style="max-width:' + Math.min(330, W * 1.2) + 'px" viewBox="' + VX + " " + VY + " " + W + " " + H + '" role="group" aria-label="' + escAb(tAb("ab_map_title")) + '">' + lines + rects + "</svg>" +
    '<p class="ab-legend">' + escAb(tAb("ab_map_legend")) + "</p>" + compass;
}

function renderPackAb(s) {
  const box = document.getElementById("ab-pack");
  box.classList.toggle("hidden", AppStateAb.panel !== "pack");
  if (AppStateAb.panel !== "pack") { box.innerHTML = ""; return; }
  const h = s.hero;
  const acts = AC().packActions(s);
  const worn = [h.weapon, h.armor].filter(Boolean).map((id) => "<li>" + escAb(fillAb("ab_equipped", { i: itemName(id) })) + ' <span class="ab-fx">' + escAb(itemFxAb(id)) + "</span></li>").join("");
  const goal = s.hasGoal ? "<li><strong>" + escAb(goalName(s)) + '</strong> <span class="ab-fx">' + escAb(tAb("ab_fx_goal")) + "</span></li>" : "";
  const items = h.pack.map((id, i) => {
    const btns = acts.filter((a) => a.index === i).map((a) => '<button type="button" class="secondary small ab-pack-act" data-type="' + a.type + '" data-index="' + i + '" aria-label="' + escAb(tAb("ab_" + a.type) + ": " + itemName(id)) + '">' + escAb(tAb("ab_" + a.type)) + "</button>").join("");
    return "<li><strong>" + escAb(itemName(id)) + '</strong> <span class="ab-fx">' + escAb(itemFxAb(id)) + '</span><span class="ab-pack-btns">' + btns + "</span></li>";
  }).join("");
  box.innerHTML = '<h2 class="ab-heading">' + escAb(tAb("ab_pack_title")) + "</h2>" +
    '<ul class="ab-pack-list">' + worn + goal + (items || "<li>" + escAb(tAb("ab_pack_empty")) + "</li>") + "</ul>";
  box.querySelectorAll(".ab-pack-act").forEach((b) => b.addEventListener("click", () => doAb({ type: b.getAttribute("data-type"), index: parseInt(b.getAttribute("data-index"), 10) })));
}

document.addEventListener("DOMContentLoaded", initAbApp);
