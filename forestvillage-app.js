// forestvillage-app.js
// Wires ForestVillageCore ("Forest Village") to forestvillage.html.
//
// Layout: a status line, the player's season, workers and resources, the
// forest map (8 field buttons with what they give and who stands there),
// the Clearing (6 open cards), the hand, the action buttons (Build, Change
// season, Done), the village (cards built, pairs marked), the task card,
// the points (also of the others) and the log. Tap a field to place a
// worker; tap a card (meadow or hand) to see it - "Build" shows what is
// missing when it can't be paid.
//
// Against the computer the human is player 0; with several people on one
// device the hand is covered between turns; alone there is no opponent,
// the target score counts. Every text comes from fv_* i18n keys.

const FV_SAVE_KEY = "einkchess_save_forestvillage_v2";
const FV_OLD_SAVE_KEY = "einkchess_save_forestvillage";
const FV_LOG_LINES = 8;

const AppStateFv = {
  mode: "vs-ai",     // "vs-ai" | "hotseat"
  level: "medium",
  state: null,
  gameOver: false,
  revealed: true,
  busy: false,
  sel: null,         // { from: "hand" | "meadow", index }
  status: null
};

const FC = () => ForestVillageCore;
function tFv(key) { return typeof I18n !== "undefined" ? I18n.t(key) : key; }
function fillFv(key, vars) {
  let s = tFv(key);
  Object.keys(vars || {}).forEach((k) => { s = s.split("{" + k + "}").join(String(vars[k])); });
  return s;
}
function escFv(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function isAiFv(i) { return AppStateFv.mode === "vs-ai" && i !== 0; }
function viewerFv() { return AppStateFv.mode === "vs-ai" ? 0 : AppStateFv.state.current; }
function playerNameFv(i) {
  if (AppStateFv.state && AppStateFv.state.players.length === 1) return tFv("fv_you");
  if (AppStateFv.mode === "vs-ai") return i === 0 ? tFv("fv_you") : fillFv("fv_computer_n", { n: i });
  return fillFv("fv_player_n", { n: i + 1 });
}
function cardNameFv(id) { return tFv("fv_card_" + id); }

// "2 clay, 1 feathers" in the current language.
function resTextFv(r) {
  const parts = FC().RES.filter((k) => r && r[k]).map((k) => fillFv("fv_res_amount", { n: r[k], r: tFv("fv_res_" + k) }));
  return parts.join(tFv("fv_list_sep"));
}

function cardTextFv(id) {
  const c = FC().card(id);
  const parts = [];
  if (c.fx.prod) parts.push(fillFv("fv_fx_prod", { s: resTextFv(c.fx.prod) }));
  if (c.fx.gain) parts.push(fillFv("fv_fx_gain", { s: resTextFv(c.fx.gain) }));
  if (c.fx.draw) parts.push(c.fx.draw === 1 ? tFv("fv_fx_draw1") : fillFv("fv_fx_draw", { n: c.fx.draw }));
  if (c.fx.end) parts.push(fillFv("fv_fx_end_" + c.fx.end.per, { n: c.fx.end.n }));
  return parts.join(" ");
}

function fieldTextFv(f) {
  const parts = [];
  if (f.gain) parts.push("+" + resTextFv(f.gain));
  if (f.draw) parts.push(fillFv("fv_field_draw", { n: f.draw }));
  return parts.join(tFv("fv_list_sep"));
}

function taskTextFv(id) {
  const t = FC().TASKS.find((x) => x.id === id);
  return fillFv("fv_task_" + id, { n: t.n, m: t.pts });
}

function setStatusFv(key, vars) {
  AppStateFv.status = key ? { key, vars: vars || {} } : null;
  const el = document.getElementById("board-info");
  if (el) el.textContent = key ? fillFv(key, vars) : "";
}

function saveFvGame() {
  if (typeof GameStorage === "undefined" || !AppStateFv.state) return;
  GameStorage.save(FV_SAVE_KEY, { mode: AppStateFv.mode, level: AppStateFv.level, state: AppStateFv.state });
}
function clearSavedFvGame() { if (typeof GameStorage !== "undefined") GameStorage.clear(FV_SAVE_KEY); }

/*** Setup ***/

function initFvApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeHotseat = document.getElementById("mode-offline");
  const modeAi = document.getElementById("mode-offline-ai");
  const levelWrap = document.getElementById("fv-level-wrap");
  let pendingMode = "vs-ai";
  function setMode(mode) {
    pendingMode = mode;
    if (modeHotseat) modeHotseat.classList.toggle("active-mode", mode === "hotseat");
    if (modeAi) modeAi.classList.toggle("active-mode", mode === "vs-ai");
    if (levelWrap) levelWrap.classList.toggle("hidden", mode !== "vs-ai");
  }
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  if (modeHotseat) modeHotseat.addEventListener("click", () => setMode("hotseat"));
  if (modeAi) modeAi.addEventListener("click", () => setMode("vs-ai"));
  document.getElementById("start-forestvillage-game").addEventListener("click", () => {
    const n = parseInt(document.getElementById("fv-players").value, 10) || 2;
    startNewFvGame(pendingMode, document.getElementById("fv-level").value, n);
  });
  document.getElementById("resign-button").addEventListener("click", resignFv);
  document.getElementById("fv-build").addEventListener("click", onBuildFv);
  document.getElementById("fv-season").addEventListener("click", () => { if (humanTurnFv()) doFv({ type: "season" }); });
  document.getElementById("fv-pass").addEventListener("click", () => { if (humanTurnFv()) doFv({ type: "pass" }); });
  document.getElementById("fv-show-hand").addEventListener("click", () => { AppStateFv.revealed = true; promptFv(); });
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => {
      if (AppStateFv.status) setStatusFv(AppStateFv.status.key, AppStateFv.status.vars);
      if (AppStateFv.state) renderFv();
    });
  }
  setMode("vs-ai");
  const oldSave = typeof GameStorage !== "undefined" ? GameStorage.load(FV_OLD_SAVE_KEY) : null;
  if (oldSave) {
    GameStorage.clear(FV_OLD_SAVE_KEY);
    setStatusFv("fv_old_save_discarded");
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(FV_SAVE_KEY) : null;
  if (saved && saved.state && saved.state.players && !saved.state.over) {
    AppStateFv.mode = saved.mode === "hotseat" ? "hotseat" : "vs-ai";
    AppStateFv.level = saved.level || "medium";
    AppStateFv.state = saved.state;
    AppStateFv.gameOver = false;
    AppStateFv.revealed = AppStateFv.mode !== "hotseat" || saved.state.players.length === 1;
    setMode(AppStateFv.mode);
    document.getElementById("fv-level").value = AppStateFv.level;
    showBoardFv();
    if (isAiFv(AppStateFv.state.current)) runAiFv();
    else promptFv();
  }
}

function showBoardFv() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startNewFvGame(mode, level, n) {
  AppStateFv.mode = n === 1 ? "hotseat" : mode;
  AppStateFv.level = level;
  AppStateFv.state = FC().createGame(n);
  AppStateFv.gameOver = false;
  AppStateFv.busy = false;
  AppStateFv.revealed = AppStateFv.mode !== "hotseat" || n === 1;
  AppStateFv.sel = null;
  const result = document.getElementById("game-result");
  if (result) result.textContent = "";
  if (window.ResultModal) window.ResultModal.hide();
  showBoardFv();
  saveFvGame();
  promptFv();
}

function humanTurnFv() {
  const s = AppStateFv.state;
  return !!s && !AppStateFv.gameOver && !AppStateFv.busy && !isAiFv(s.current) && AppStateFv.revealed;
}

function promptFv() {
  const s = AppStateFv.state;
  if (!s || AppStateFv.gameOver) return;
  const p = s.players[s.current];
  if (AppStateFv.mode === "hotseat" && !AppStateFv.revealed) setStatusFv("fv_status_pass", { p: playerNameFv(s.current) });
  else if (FC().season(p) === "winter") setStatusFv("fv_status_winter", { p: playerNameFv(s.current) });
  else if (p.placed >= p.workers && !FC().legalActions(s).some((a) => a.type === "build")) setStatusFv("fv_status_season", { p: playerNameFv(s.current) });
  else setStatusFv(s.players.length === 1 || AppStateFv.mode === "vs-ai" ? "fv_status_turn" : "fv_status_turn_player", { p: playerNameFv(s.current) });
  renderFv();
}

/*** Actions ***/

function doFv(act) {
  const s = AppStateFv.state;
  const me = s.current;
  if (!FC().apply(s, act)) return false;
  AppStateFv.sel = null;
  if (s.over) { endGameFv(); return true; }
  saveFvGame();
  if (s.current !== me && AppStateFv.mode === "hotseat" && s.players.length > 1) AppStateFv.revealed = false;
  if (isAiFv(s.current)) { runAiFv(); return true; }
  promptFv();
  return true;
}

function onFieldFv(i) {
  if (!humanTurnFv()) return;
  doFv({ type: "place", field: i });
}

function onCardFv(from, index) {
  if (!humanTurnFv()) return;
  const same = AppStateFv.sel && AppStateFv.sel.from === from && AppStateFv.sel.index === index;
  AppStateFv.sel = same ? null : { from, index };
  renderFv();
}

function onBuildFv() {
  if (!humanTurnFv() || !AppStateFv.sel) return;
  doFv({ type: "build", from: AppStateFv.sel.from, index: AppStateFv.sel.index });
}

/*** The computer ***/

function runAiFv() {
  if (AppStateFv.busy) return;
  AppStateFv.busy = true;
  setStatusFv("fv_status_computer", { p: playerNameFv(AppStateFv.state.current) });
  renderFv();
  setTimeout(stepAiFv, typeof AiPacing !== "undefined" ? AiPacing.delay(600) : 600);
}

function stepAiFv() {
  const s = AppStateFv.state;
  if (!s || AppStateFv.gameOver || !isAiFv(s.current)) { AppStateFv.busy = false; return; }
  const act = FC().chooseAction(s, AppStateFv.level);
  FC().apply(s, act);
  if (s.over) { AppStateFv.busy = false; endGameFv(); return; }
  saveFvGame();
  if (!isAiFv(s.current)) { AppStateFv.busy = false; promptFv(); return; }
  setStatusFv("fv_status_computer", { p: playerNameFv(s.current) });
  renderFv();
  setTimeout(stepAiFv, typeof AiPacing !== "undefined" ? AiPacing.delay(600) : 600);
}

/*** End ***/

function endGameFv(resigned) {
  const s = AppStateFv.state;
  AppStateFv.gameOver = true;
  AppStateFv.busy = false;
  AppStateFv.sel = null;
  const n = s.players.length;
  const totals = s.players.map((p, i) => FC().score(s, i).total);
  let title, text;
  if (n === 1) {
    const ok = totals[0] >= FC().SOLO_TARGET;
    title = tFv(ok ? "fv_result_win" : "fv_result_lose");
    text = fillFv(ok ? "fv_result_solo_win" : "fv_result_solo_lose", { n: totals[0], m: FC().SOLO_TARGET });
  } else if (resigned) {
    title = tFv("fv_result_lose");
    text = tFv("fv_result_resigned");
  } else {
    const w = FC().winners(s);
    const best = totals[w[0]];
    const names = w.map(playerNameFv).join(tFv("fv_list_sep"));
    if (AppStateFv.mode === "vs-ai") title = tFv(w.indexOf(0) !== -1 ? (w.length > 1 ? "fv_result_tie" : "fv_result_win") : "fv_result_lose");
    else title = fillFv(w.length > 1 ? "fv_result_tie_players" : "fv_result_player_wins", { p: names });
    text = fillFv(w.length > 1 ? "fv_result_tie_text" : "fv_result_text", { p: names, n: best });
    if (AppStateFv.mode === "vs-ai" && typeof GameStats !== "undefined") GameStats.record("forestvillage", w.indexOf(0) !== -1 ? (w.length > 1 ? "draw" : "win") : "loss");
  }
  setStatusFv(null);
  document.getElementById("board-info").textContent = text;
  document.getElementById("game-result").textContent = text;
  if (window.ResultModal) window.ResultModal.show(title, text);
  clearSavedFvGame();
  renderFv();
}

function resignFv() {
  const s = AppStateFv.state;
  if (!s || AppStateFv.gameOver) return;
  s.over = true;
  if (AppStateFv.mode === "vs-ai" && typeof GameStats !== "undefined" && s.players.length > 1) GameStats.record("forestvillage", "loss");
  endGameFv(true);
}

/*** Drawing ***/

function cardHtmlFv(id, from, index, p, s, canTap) {
  const c = FC().card(id);
  const sel = AppStateFv.sel && AppStateFv.sel.from === from && AppStateFv.sel.index === index;
  const built = from === "village";
  const discounted = !built && FC().discountedAnimal(p, id);
  const ok = built || FC().canBuild(s, p, id);
  const cls = ["fv-card"];
  if (sel) cls.push("fv-selected");
  if (!ok) cls.push("fv-unaffordable");
  // Cards already in the village show no price.
  const shownCost = Object.assign({}, c.cost);
  if (discounted) shownCost.f = Math.max(0, (shownCost.f || 0) - 1);
  const cost = built ? "" : discounted ? fillFv("fv_cost_discount", { s: resTextFv(shownCost) }) : fillFv("fv_cost", { s: resTextFv(c.cost) });
  const kind = tFv(c.kind === "animal" ? "fv_kind_animal" : "fv_kind_building");
  const lines = [kind + " · " + fillFv("fv_points", { n: c.pts }), cost, cardTextFv(id), fillFv("fv_partner", { c: cardNameFv(c.partner) })].filter(Boolean);
  const label = [cardNameFv(id)].concat(lines).concat(ok ? [] : [tFv("fv_aria_unaffordable")]).join(", ");
  const inner = '<span class="fv-card-name">' + escFv(cardNameFv(id)) + "</span>" + lines.map((l) => '<span class="fv-card-line">' + escFv(l) + "</span>").join("");
  if (!canTap) return '<li class="' + cls.join(" ") + '" aria-label="' + escFv(label) + '">' + inner + "</li>";
  return '<li><button type="button" class="' + cls.join(" ") + '" data-from="' + from + '" data-index="' + index + '" aria-label="' + escFv(label) + '">' + inner + "</button></li>";
}

function missingTextFv(p, id) {
  const c = FC().card(id);
  const miss = {};
  const cost = Object.assign({}, c.cost);
  if (FC().discountedAnimal(p, id)) cost.f = Math.max(0, (cost.f || 0) - 1);
  Object.keys(cost).forEach((k) => { if (p.res[k] < cost[k]) miss[k] = cost[k] - p.res[k]; });
  return resTextFv(miss);
}

function renderFv() {
  const s = AppStateFv.state;
  if (!s) return;
  const me = viewerFv();
  const p = s.players[me];
  const covered = AppStateFv.mode === "hotseat" && !AppStateFv.revealed && !AppStateFv.gameOver;
  const myTurn = humanTurnFv() && s.current === me;
  const legal = myTurn ? FC().legalActions(s) : [];

  // Season, workers, resources.
  document.getElementById("fv-me").innerHTML =
    "<strong>" + escFv(playerNameFv(me)) + "</strong> · " + escFv(fillFv("fv_season_now", { s: tFv("fv_season_" + FC().season(p)) })) +
    " · " + escFv(fillFv("fv_workers", { n: p.workers - p.placed, m: p.workers })) +
    '<br><span class="fv-res">' + FC().RES.map((k) => escFv(fillFv("fv_res_amount", { n: p.res[k], r: tFv("fv_res_" + k) }))).join(" · ") + "</span>";

  // Forest map.
  const fields = document.getElementById("fv-fields");
  fields.innerHTML = FC().FIELDS.map((f, i) => {
    const who = s.fields[i].map(playerNameFv);
    const free = f.shared || !s.fields[i].length;
    const can = legal.some((a) => a.type === "place" && a.field === i);
    const cls = ["fv-field"];
    if (!free) cls.push("fv-taken");
    if (can) cls.push("fv-target");
    const text = fieldTextFv(f) + (f.shared ? " · " + tFv("fv_field_shared") : "");
    const whoText = who.length ? fillFv("fv_field_who", { p: who.join(tFv("fv_list_sep")) }) : "";
    const label = [tFv("fv_field_" + f.id), text, whoText].filter(Boolean).join(", ");
    return '<button type="button" class="' + cls.join(" ") + '" data-field="' + i + '"' + (can ? "" : " disabled") + ' aria-label="' + escFv(label) + '">' +
      '<span class="fv-field-name">' + escFv(tFv("fv_field_" + f.id)) + "</span>" +
      '<span class="fv-field-gain">' + escFv(text) + "</span>" +
      (whoText ? '<span class="fv-field-who">' + escFv(whoText) + "</span>" : "") + "</button>";
  }).join("");
  fields.querySelectorAll(".fv-field").forEach((b) => b.addEventListener("click", () => onFieldFv(parseInt(b.getAttribute("data-field"), 10))));

  // Clearing and hand.
  const meadow = document.getElementById("fv-meadow");
  meadow.innerHTML = s.meadow.map((id, i) => (id ? cardHtmlFv(id, "meadow", i, p, s, true) : "")).join("");
  const cover = document.getElementById("fv-hand-cover");
  const hand = document.getElementById("fv-hand");
  cover.classList.toggle("hidden", !covered);
  if (covered) document.getElementById("fv-hand-cover-text").textContent = fillFv("fv_status_pass", { p: playerNameFv(s.current) });
  hand.classList.toggle("hidden", covered);
  hand.innerHTML = covered ? "" : p.hand.map((id, i) => cardHtmlFv(id, "hand", i, p, s, true)).join("");
  [meadow, hand].forEach((box) => box.querySelectorAll(".fv-card").forEach((b) => b.addEventListener("click", () => onCardFv(b.getAttribute("data-from"), parseInt(b.getAttribute("data-index"), 10)))));

  // Buttons and the line under them.
  const sel = AppStateFv.sel;
  const selId = sel ? (sel.from === "hand" ? p.hand[sel.index] : s.meadow[sel.index]) : null;
  const canBuild = !!selId && legal.some((a) => a.type === "build" && a.from === sel.from && a.index === sel.index);
  document.getElementById("fv-build").disabled = !canBuild;
  document.getElementById("fv-season").disabled = !legal.some((a) => a.type === "season");
  document.getElementById("fv-pass").disabled = !legal.some((a) => a.type === "pass");
  document.getElementById("resign-button").classList.toggle("hidden", AppStateFv.gameOver);
  let info = "";
  if (selId && !canBuild && myTurn) {
    info = p.village.length >= FC().MAX_VILLAGE ? tFv("fv_info_full") : fillFv("fv_info_missing", { c: cardNameFv(selId), s: missingTextFv(p, selId) });
  } else if (selId) info = cardNameFv(selId) + ": " + (cardTextFv(selId) || fillFv("fv_points", { n: FC().card(selId).pts }));
  document.getElementById("fv-info").textContent = info;

  // Village.
  document.getElementById("fv-village-title").textContent = fillFv("fv_village_title", { n: p.village.length, m: FC().MAX_VILLAGE });
  document.getElementById("fv-village").innerHTML = p.village.map((v) => cardHtmlFv(v.id, "village", 0, p, s, false)).join("") || "<li>" + escFv(tFv("fv_village_empty")) + "</li>";

  // Task and points.
  document.getElementById("fv-task").textContent = taskTextFv(s.task) + " " + (FC().taskDone(s, p) ? tFv("fv_task_done") : "");
  document.getElementById("fv-score").innerHTML = s.players.map((q, i) => {
    const sc = FC().score(s, i);
    // Second line in the name cell: cards in the village (saves a column on narrow screens).
    const count = tFv("fv_score_count") + ": " + q.village.length + " / " + FC().MAX_VILLAGE;
    return "<tr><th scope=\"row\">" + escFv(playerNameFv(i)) + '<span class="fv-score-count">' + escFv(count) + "</span></th><td>" + sc.cards + "</td><td>" + sc.pairs + "</td><td>" + sc.bonus + "</td><td>" + sc.task + "</td><td><strong>" + sc.total + "</strong></td></tr>";
  }).join("");
  document.getElementById("fv-solo").textContent = s.players.length === 1 ? fillFv("fv_solo_target", { n: FC().SOLO_TARGET }) : "";

  document.getElementById("fv-log").innerHTML = s.log.slice(-FV_LOG_LINES).map((e) => "<li>" + escFv(logLineFv(s, e)) + "</li>").join("");
}

function logLineFv(s, e) {
  switch (e.k) {
    case "place": return fillFv("fv_log_place", { p: playerNameFv(e.p), x: tFv("fv_field_" + FC().FIELDS[e.field].id) });
    case "build": return fillFv(e.discounted ? "fv_log_build_discount" : "fv_log_build", { p: playerNameFv(e.p), c: cardNameFv(e.c) });
    case "season": return fillFv("fv_log_season", { p: playerNameFv(e.p), s: tFv("fv_season_" + e.season) });
    case "pass": return fillFv("fv_log_pass", { p: playerNameFv(e.p) });
    case "end": return tFv("fv_log_end");
    default: return "";
  }
}

document.addEventListener("DOMContentLoaded", initFvApp);
