// teufelsieben-app.js
// Connects TeufelSiebenCore (Devilish Seven) to the page. Each player takes
// one turn per round, turning up cards until stopping or busting. Rows show
// the open cards and points; computer turns are paced one step at a time.
// The deck order stays hidden, so there is no undo.

const TEUFELSIEBEN_SAVE_KEY = "einkchess_save_teufelsieben";
const AppStateTS = { state: null, generation: 0 };

function tTS(key, values) {
  let text = I18n.t(key);
  Object.keys(values || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(values[k])); });
  return text;
}
function nameTS(i) { return DiceCommon.playerName(AppStateTS.state.computer, i); }
function cardNameTS(card) { return TeufelSiebenCore.isNumber(card) ? String(card) : tTS("ts_card_" + card); }
function humansTS() { return AppStateTS.state.computer.filter((c) => !c).length; }
function saveTS() {
  if (typeof GameStorage === "undefined" || !AppStateTS.state) return;
  if (AppStateTS.state.phase === "over") { GameStorage.clear(TEUFELSIEBEN_SAVE_KEY); return; }
  GameStorage.save(TEUFELSIEBEN_SAVE_KEY, { state: AppStateTS.state });
}
// The targets offered fit the chosen cards (task 133): 60/90/120 for the
// normal cards, 250/500 for "extreme".
function syncTargetsTS() {
  const extreme = document.getElementById("ts-mode").value === "extreme";
  const allowed = extreme ? TeufelSiebenCore.EXTREME_TARGETS : TeufelSiebenCore.TARGETS;
  const select = document.getElementById("ts-target");
  Array.from(select.options).forEach((o) => {
    const ok = allowed.indexOf(parseInt(o.value, 10)) !== -1;
    o.hidden = !ok;
    o.disabled = !ok;
  });
  if (allowed.indexOf(parseInt(select.value, 10)) === -1) select.value = String(extreme ? TeufelSiebenCore.EXTREME_DEFAULT : TeufelSiebenCore.DEFAULT_TARGET);
}
function startTS() {
  syncTargetsTS();
  const n = parseInt(document.getElementById("ts-players").value, 10) || 2;
  const comps = Math.min(n - 1, parseInt(document.getElementById("ts-computers").value, 10) || 0);
  const level = parseInt(document.getElementById("ts-level").value, 10) || 2;
  const mode = document.getElementById("ts-mode").value === "extreme" ? "extreme" : "normal";
  const target = parseInt(document.getElementById("ts-target").value, 10) || 90;
  const computer = [], levels = [];
  for (let i = 0; i < n; i++) { computer.push(i >= n - comps); levels.push(level); }
  AppStateTS.state = TeufelSiebenCore.newGame({ players: n, computer, levels, target, mode });
  AppStateTS.generation++;
  setResultTS("");
  if (window.ResultModal) window.ResultModal.hide();
  DiceCommon.showBoard(); afterTS();
}
function actorIsComputerTS() { const s = AppStateTS.state; return !!s && s.phase === "turn" && s.computer[TeufelSiebenCore.actor(s)]; }
function afterTS() {
  const s = AppStateTS.state;
  if (s.phase === "over") finishTS();
  renderTS(); saveTS();
  if (actorIsComputerTS()) {
    const gen = AppStateTS.generation, from = s;
    setTimeout(() => { if (gen !== AppStateTS.generation || AppStateTS.state !== from) return; AppStateTS.state = TeufelSiebenCore.aiStep(from); afterTS(); }, typeof AiPacing !== "undefined" ? AiPacing.delay(900) : 900);
  }
}
function humanTurnTS() { const s = AppStateTS.state; return !!s && s.phase === "turn" && !s.computer[TeufelSiebenCore.actor(s)]; }
function drawTS() { const s = AppStateTS.state; if (!humanTurnTS()) return; const next = TeufelSiebenCore.draw(s); if (next !== s) { AppStateTS.state = next; afterTS(); } }
function stopTS() { const s = AppStateTS.state; if (!humanTurnTS()) return; const next = TeufelSiebenCore.stop(s); if (next !== s) { AppStateTS.state = next; afterTS(); } }
function nextRoundTS() { const s = AppStateTS.state; if (!s || s.phase !== "roundover") return; AppStateTS.state = TeufelSiebenCore.nextRound(s); afterTS(); }
function finishTS() {
  const s = AppStateTS.state, humans = humansTS(), best = s.totals[s.winners[0]];
  let title, text;
  if (s.winners.length > 1) { title = I18n.t("ts_draw_title"); text = tTS("ts_game_over_tie", { names: s.winners.map(nameTS).join(", "), n: best }); }
  else {
    const w = s.winners[0]; text = tTS("ts_game_over", { name: nameTS(w), n: best });
    if (humans === 1) { title = I18n.t(s.computer[w] ? "ui_status_computer_wins" : "ui_status_you_win"); }
    else title = tTS(s.computer[w] ? "ts_computer_wins" : "ts_player_wins", { n: s.computer.slice(0, w + 1).filter((c) => !c).length });
  }
  setResultTS(text); if (window.ResultModal) window.ResultModal.show(title, text);
  if (humans === 1 && s.n > 1 && typeof GameStats !== "undefined") GameStats.record("teufelsieben", TeufelSiebenCore.outcomeFor(s, s.computer.indexOf(false)));
}
function setStatusTS(text) { DiceCommon.setText(document.getElementById("board-info"), text); }
function setResultTS(text) { DiceCommon.setText(document.getElementById("game-result"), text); }
const TS_SIGNS = {
  courage: '<path d="M20 4L33 9V19C33 28 27 33 20 36C13 33 7 28 7 19V9Z" fill="none" stroke="#141413" stroke-width="3"/><path d="M14 20L18 24L27 15" fill="none" stroke="#141413" stroke-width="3"/>',
  strike: '<text x="20" y="26" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="19" fill="#141413">5</text><path d="M5 35L35 5" stroke="#141413" stroke-width="3"/>',
  pass: '<path d="M5 20H31M22 10L32 20L22 30" fill="none" stroke="#141413" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  bridge: '<path d="M5 31C5 9 35 9 35 31M5 31H35" fill="none" stroke="#141413" stroke-width="3"/>',
  collector: '<rect x="6" y="11" width="19" height="23" rx="2" fill="none" stroke="#141413" stroke-width="2.5"/><rect x="12" y="6" width="19" height="23" rx="2" fill="#fff" stroke="#141413" stroke-width="2.5"/><path d="M30 27V37M25 32H35" stroke="#141413" stroke-width="2.5"/>',
  peek: '<path d="M3 20S9 9 20 9S37 20 37 20S31 31 20 31S3 20 3 20Z" fill="none" stroke="#141413" stroke-width="2.5"/><circle cx="20" cy="20" r="5" fill="none" stroke="#141413" stroke-width="2.5"/>',
  // "extreme" cards (task 133)
  star: '<path d="M20 3L24.6 14.6H37L27 22.2L30.6 35L20 27.4L9.4 35L13 22.2L3 14.6H15.4Z" fill="none" stroke="#141413" stroke-width="2.4" stroke-linejoin="round"/><text x="20" y="25" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="9" fill="#141413">+7</text>',
  weight: '<circle cx="20" cy="8" r="4" fill="none" stroke="#141413" stroke-width="2.5"/><path d="M12 12H28L35 35H5Z" fill="#141413"/><text x="20" y="30" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="11" fill="#fff">−7</text>',
  link: '<rect x="3" y="14" width="20" height="12" rx="6" fill="none" stroke="#141413" stroke-width="3"/><rect x="17" y="14" width="20" height="12" rx="6" fill="none" stroke="#141413" stroke-width="3"/>',
  storm: '<path d="M24 3L9 23H19L15 37L31 16H21Z" fill="#141413"/>'
};
function cardHtmlTS(card, size, extraClass) {
  const cls = "ts-card" + (size ? " ts-card-" + size : "") + (TeufelSiebenCore.isNumber(card) ? "" : " ts-card-special") + (extraClass ? " " + extraClass : "");
  if (TeufelSiebenCore.isNumber(card)) return '<span class="' + cls + '" role="img" aria-label="' + card + '"><span class="ts-num">' + card + "</span></span>";
  return '<span class="' + cls + '" role="img" aria-label="' + cardNameTS(card) + '"><svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + TS_SIGNS[card] + '</svg><span class="ts-card-name">' + cardNameTS(card) + "</span></span>";
}
function lastTextTS() {
  const s = AppStateTS.state, l = s.last; if (!l) return "";
  const v = { name: l.player === null ? "" : nameTS(l.player), n: l.card, card: l.card !== undefined ? cardNameTS(l.card) : "", r: s.round };
  const key = { number: "ts_last_number", bust: "ts_last_bust", saved: "ts_last_saved", courage: "ts_last_courage", strike: "ts_last_strike", pass: "ts_last_pass", bridge: "ts_last_bridge", collector: "ts_last_collector", peek: "ts_last_peek", star: "ts_last_star", weight: "ts_last_weight", link: "ts_last_link", storm: "ts_last_storm", void: "ts_last_void", empty: "ts_last_empty", stop: "ts_last_stop", roundover: "ts_round_over", gameover: "ts_game_over_notice" }[l.type];
  if (!key) return "";
  if (l.type === "stop") v.n = l.points;
  if (l.type === "peek") v.card = l.shown === null ? I18n.t("ts_card_empty") : cardNameTS(l.shown);
  return tTS(key, v);
}
function statusTS() {
  const s = AppStateTS.state;
  if (s.phase === "over") return "";
  if (s.phase === "roundover") return tTS("ts_round_over", { r: s.round });
  const a = TeufelSiebenCore.actor(s);
  if (s.computer[a]) return I18n.t("ui_status_computer_turn");
  const who = humansTS() === 1 ? I18n.t("ui_status_your_turn") : DiceCommon.fill(I18n.t("dg_turn_of"), { name: nameTS(a) });
  return who + " " + tTS(s.hands[a].drawn ? "ts_hint_turn" : "ts_hint_first");
}
function renderPlayersTS() {
  const s = AppStateTS.state, wrap = document.getElementById("ts-rows"); wrap.innerHTML = "";
  const showRound = s.phase === "roundover" || s.phase === "over";
  s.hands.forEach((h, i) => {
    const row = document.createElement("div"), active = s.phase === "turn" && TeufelSiebenCore.actor(s) === i;
    row.className = "ts-player" + (active ? " ts-player-active" : "") + " ts-player-" + h.status;
    const pts = showRound && s.roundPoints ? s.roundPoints[i] : TeufelSiebenCore.handPoints(h), status = tTS("ts_status_" + h.status);
    let cards = h.numbers.map((c, k) => cardHtmlTS(c, "small", h.status === "bust" && k === h.numbers.length - 1 ? "ts-card-bust" : "")).join("");
    if (h.courage) cards += cardHtmlTS("courage", "small");
    for (let k = 0; k < h.bridges; k++) cards += cardHtmlTS("bridge", "small");
    for (let k = 0; k < h.collectors; k++) cards += cardHtmlTS("collector", "small");
    ["star", "weight", "link"].forEach((c) => { for (let k = 0; k < (h[c + "s"] || 0); k++) cards += cardHtmlTS(c, "small"); });
    const run = TeufelSiebenCore.runLength(h.numbers, h.bridges, s.mode === "extreme" ? 15 : undefined);
    const bonus = run >= TeufelSiebenCore.RUN_MIN ? '<span class="ts-run-bonus">' + tTS("ts_run_bonus", { n: run, m: 5 * (run - 2) * (1 + (h.links || 0)) }) + "</span>" : "";
    row.innerHTML = '<span class="ts-player-head"><span class="ts-player-name">' + nameTS(i) + '</span> <span class="ts-player-status">' + status + "</span>" + '<span class="ts-player-points">' + tTS("ts_round", { n: pts }) + " · " + tTS("ts_total", { n: s.totals[i] }) + "</span>" + bonus + '</span><span class="ts-player-cards">' + cards + "</span>";
    row.setAttribute("aria-label", nameTS(i) + ", " + status + ", " + tTS("ts_round", { n: pts }) + ", " + tTS("ts_total", { n: s.totals[i] }) + (h.numbers.length ? ", " + h.numbers.join(" ") : "") + (h.courage ? ", " + tTS("ts_courage_aria") : "")); wrap.appendChild(row);
  });
}
function renderTS() {
  const s = AppStateTS.state; if (!s) return;
  renderPlayersTS();
  document.getElementById("ts-last-card").innerHTML = s.last && s.last.card !== undefined ? cardHtmlTS(s.last.card, "") : "";
  document.getElementById("ts-last-text").textContent = lastTextTS();
  const myTurn = humanTurnTS(); document.getElementById("ts-draw").disabled = !myTurn; document.getElementById("ts-stop").disabled = !myTurn || s.hands[s.current].drawn < 1;
  document.getElementById("ts-actions").classList.toggle("hidden", s.phase !== "turn");
  const roundWrap = document.getElementById("ts-roundover"); roundWrap.classList.toggle("hidden", s.phase !== "roundover");
  const peek = document.getElementById("ts-peek-line"); peek.textContent = s.peek !== null && s.peek !== undefined ? tTS("ts_peek_line", { card: cardNameTS(s.peek) }) : ""; peek.classList.toggle("hidden", !peek.textContent);
  document.getElementById("game-meta").textContent = tTS("ts_meta", { r: s.round, n: s.target }) + (s.mode === "extreme" ? " · " + I18n.t("ts_mode_extreme") : "");
  setStatusTS(statusTS());
}
function initTeufelSiebenApp() {
  DiceCommon.wireMenu();
  const computers = document.getElementById("ts-computers");
  const limitComputers = () => { const n = parseInt(document.getElementById("ts-players").value, 10); Array.from(computers.options).forEach((o) => { o.disabled = parseInt(o.value, 10) > n - 1; }); if (parseInt(computers.value, 10) > n - 1) computers.value = String(n - 1); };
  document.getElementById("ts-players").addEventListener("change", limitComputers); limitComputers();
  document.getElementById("start-ts-game").addEventListener("click", startTS); document.getElementById("ts-draw").addEventListener("click", drawTS); document.getElementById("ts-stop").addEventListener("click", stopTS); document.getElementById("ts-next").addEventListener("click", nextRoundTS);
  const T = (n, st) => Howto.tile(n, st, 36);
  Howto.init({ slug: "teufelsieben", actions: ["ts-draw", "ts-stop"], steps: [
    { pics: T("5") + T("9") + T("2"), key: "ts_howto_1" },
    { pics: T("5") + T("9") + Howto.arrow() + T("5", "shut"), key: "ts_howto_2" },
    { pics: T("5") + T("9") + Howto.sign("=") + Howto.sign("14"), key: "ts_howto_3" },
    { pics: T("3") + T("4") + T("5") + T("6") + Howto.sign("+10"), key: "ts_howto_4" },
    { pics: T("13") + T("14") + T("15") + Howto.sign("+7") + Howto.sign("−7"), key: "ts_howto_5" }
  ] });
  // Targets fit the chosen cards; quick-rules.js restores the fields after
  // this handler, so the targets are synced again right after.
  document.getElementById("ts-mode").addEventListener("change", syncTargetsTS);
  syncTargetsTS();
  setTimeout(syncTargetsTS, 0);
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateTS.state) renderTS(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(TEUFELSIEBEN_SAVE_KEY) : null;
  if (saved) {
    if (TeufelSiebenCore.isCurrentState(saved.state) && saved.state.phase !== "over") { AppStateTS.state = saved.state; DiceCommon.showBoard(); afterTS(); }
    else GameStorage.clear(TEUFELSIEBEN_SAVE_KEY);
  }
}
document.addEventListener("DOMContentLoaded", initTeufelSiebenApp);
