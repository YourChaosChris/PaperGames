// pfotenwurf-app.js
// Wires PfotenwurfCore ("Critter Roll") to pfotenwurf.html.
//
// One person against the computer, or 1 to 4 people passing the device
// around. On a turn: "Roll the dice"; tap a die to keep it (it gets a thick
// frame and a black bar), roll again, up to three times. After any roll
// the sheet shows, on every free field, the points it would get (in a
// dashed box); tapping a field puts the dice there - a field showing 0 is
// struck out. The computer plays a whole turn, then a panel shows its dice
// and the field it chose until "Next" is tapped. Pictures for every field,
// a short name for reading aloud; nothing is animated, no time limit,
// black on white only.

const PFOTENWURF_SAVE_KEY = "einkchess_save_pfotenwurf";

const AppStateTY = {
  state: null,
  review: null   // the computer turn just played, shown until "Next" (not saved)
};

function tTY(key, values) {
  return DiceCommon.fill(I18n.t(key), values);
}

function nameTY(i) {
  return DiceCommon.playerName(AppStateTY.state.computer, i);
}

function humansTY() {
  return AppStateTY.state.computer.filter((c) => !c).length;
}

function faceNameTY(f) {
  return tTY(f === PfotenwurfCore.PAW ? "zw_wild" : "zw_animal_" + f);
}

function fieldNameTY(field) {
  return tTY("ty_field_" + field);
}

/*** Save and load ***/

function saveTY() {
  if (typeof GameStorage === "undefined" || !AppStateTY.state) return;
  if (AppStateTY.state.phase === "over") {
    GameStorage.clear(PFOTENWURF_SAVE_KEY);
    return;
  }
  GameStorage.save(PFOTENWURF_SAVE_KEY, { state: AppStateTY.state });
}

function validStateTY(s) {
  return !!s && s.game === "pfotenwurf" && Array.isArray(s.sheets) && Array.isArray(s.computer) && Array.isArray(s.dice) && Array.isArray(s.held) &&
    s.sheets.length === s.computer.length && s.phase === "roll";
}

/*** Game flow ***/

function startGameTY() {
  const mode = DiceCommon.activeMode();
  const people = parseInt(document.getElementById("ty-players").value, 10) || 1;
  // Against the computer: one person and one computer.
  const n = mode === "ai" ? 2 : Math.max(1, Math.min(4, people));
  AppStateTY.state = PfotenwurfCore.newGame({ players: n, computer: mode === "ai" ? [false, true] : new Array(n).fill(false) });
  AppStateTY.review = null;
  setResultTY("");
  if (window.ResultModal) window.ResultModal.hide();
  DiceCommon.showBoard();
  afterActionTY();
}

// The computer plays one whole turn; the turn is shown until "Next".
function runComputerTurnTY() {
  let st = AppStateTY.state;
  const seq = st.seq;
  const rec = { player: st.current, rolls: [] };
  let guard = 0;
  while (st.phase !== "over" && st.computer[st.current] && st.seq === seq && guard++ < 20) {
    const next = PfotenwurfCore.aiStep(st);
    if (next === st) break;
    if (next.rolls > st.rolls) rec.rolls.push({ dice: next.dice.slice(), held: st.rolls > 0 ? st.held.slice() : [false, false, false, false, false] });
    st = next;
  }
  AppStateTY.state = st;
  if (st.last && st.seq !== seq) {
    rec.field = st.last.field;
    rec.points = st.last.points;
    AppStateTY.review = rec;
  }
}

function afterActionTY() {
  const s = AppStateTY.state;
  if (!AppStateTY.review && s.phase !== "over" && s.computer[s.current]) runComputerTurnTY();
  if (AppStateTY.state.phase === "over" && !AppStateTY.review) finishTY();
  renderTY();
  saveTY();
}

function nextTY() {
  if (!AppStateTY.review) return;
  AppStateTY.review = null;
  afterActionTY();
}

function humanTurnTY() {
  const s = AppStateTY.state;
  return !!s && s.phase !== "over" && !s.computer[s.current] && !AppStateTY.review;
}

function rollTY() {
  if (!humanTurnTY()) return;
  const next = PfotenwurfCore.roll(AppStateTY.state);
  if (next === AppStateTY.state) return;
  AppStateTY.state = next;
  afterActionTY();
}

function holdTY(i) {
  if (!humanTurnTY()) return;
  const next = PfotenwurfCore.toggleHold(AppStateTY.state, i);
  if (next === AppStateTY.state) return;
  AppStateTY.state = next;
  renderTY();
  saveTY();
}

function chooseTY(field) {
  if (!humanTurnTY()) return;
  const next = PfotenwurfCore.choose(AppStateTY.state, field);
  if (next === AppStateTY.state) return;
  AppStateTY.state = next;
  afterActionTY();
}

/*** End of the game ***/

function finishTY() {
  const s = AppStateTY.state;
  const humans = humansTY();
  const names = s.winners.map(nameTY).join(", ");
  let title;
  let text;
  if (s.winners.length > 1) {
    title = "Draw";
    text = tTY("ty_tie", { names: names });
  } else if (!s.computer[s.winners[0]]) {
    title = humans === 1 ? "You win!" : "Player " + (s.computer.slice(0, s.winners[0] + 1).filter((c) => !c).length) + " wins";
    text = humans === 1 && s.n > 1 ? I18n.t("ui_status_you_win") : tTY("dg_wins", { name: nameTY(s.winners[0]) });
  } else {
    title = humans === 1 ? "You lose" : "Computer wins";
    text = humans === 1 ? I18n.t("ui_status_computer_wins") : tTY("dg_wins", { name: nameTY(s.winners[0]) });
  }
  if (s.n === 1) { title = "You win!"; text = tTY("ty_solo_end", { n: PfotenwurfCore.total(s.sheets[0]) }); }
  setResultTY(text);
  DiceCommon.showResult(title, text);
  if (humans === 1 && s.n > 1 && typeof GameStats !== "undefined") {
    GameStats.record("pfotenwurf", PfotenwurfCore.outcomeFor(s, s.computer.indexOf(false)));
  }
}

/*** Display ***/

function setStatusTY(text) {
  DiceCommon.setText(document.getElementById("board-info"), text);
}

function setResultTY(text) {
  DiceCommon.setText(document.getElementById("game-result"), text);
}

// One die with the animal (or the paw). A kept die has a thick frame and a
// black bar along the bottom; before the first roll the face is dashed.
function dieSvgTY(face, kept, size) {
  const empty = face === null || face === undefined;
  const px = size || 60;
  const rect = '<rect x="5" y="5" width="90" height="90" rx="16" fill="#ffffff" stroke="#141413" stroke-width="' + (kept ? 10 : 4) + '"' + (empty ? ' stroke-dasharray="10 8"' : "") + "/>";
  const pic = empty ? "" : '<g transform="translate(17 10) scale(1.1)">' + ZooIcons.inner(face) + "</g>";
  const bar = kept ? '<rect x="14" y="78" width="72" height="12" rx="3" fill="#141413"/>' : "";
  return '<svg class="ty-die" viewBox="0 0 100 100" width="' + px + '" height="' + px + '" aria-hidden="true" focusable="false">' + rect + pic + bar + "</svg>";
}

// The picture of a field: the animal; for "two/three/four/five the same"
// as many small squares with the same mark; five different animals; a
// four-leaf clover for the lucky field.
function fieldIconTY(field) {
  if (field.charAt(0) === "a" && field.length === 2) return ZooIcons.svg(+field.charAt(1), 30);
  const same = { two: 2, three: 3, four: 4, five: 5 }[field];
  if (same) {
    let b = "";
    for (let i = 0; i < same; i++) {
      const x = 2 + i * 17;
      b += '<rect x="' + x + '" y="6" width="15" height="15" rx="3" fill="#fff" stroke="#141413" stroke-width="2"/><circle cx="' + (x + 7.5) + '" cy="13.5" r="4" fill="#141413"/>';
    }
    return '<svg viewBox="0 0 ' + (4 + same * 17) + ' 27" width="' + (4 + same * 17) + '" height="27" aria-hidden="true" focusable="false">' + b + "</svg>";
  }
  if (field === "diff") {
    let h = "";
    for (let a = 0; a < PfotenwurfCore.ANIMALS; a++) h += ZooIcons.svg(a, 17);
    return '<span class="ty-icon-row">' + h + "</span>";
  }
  // lucky field: a four-leaf clover
  return '<svg viewBox="0 0 30 30" width="30" height="30" aria-hidden="true" focusable="false"><g fill="#141413"><circle cx="11" cy="9" r="5.5"/><circle cx="19" cy="9" r="5.5"/><circle cx="11" cy="17" r="5.5"/><circle cx="19" cy="17" r="5.5"/></g><path d="M15 17C16 22 18 25 21 28" fill="none" stroke="#141413" stroke-width="2.6" stroke-linecap="round"/></svg>';
}

function diceAriaTY(dice, held) {
  return dice.map((f, i) => faceNameTY(f) + (held && held[i] ? " (" + tTY("ty_kept") + ")" : "")).join(", ");
}

function renderDiceTY() {
  const s = AppStateTY.state;
  const wrap = document.getElementById("ty-dice");
  wrap.innerHTML = "";
  const canHold = humanTurnTY() && s.rolls > 0 && s.rolls < PfotenwurfCore.MAX_ROLLS;
  s.dice.forEach((f, i) => {
    const kept = s.rolls > 0 && s.held[i];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ty-die-btn" + (kept ? " ty-die-kept" : "");
    b.innerHTML = dieSvgTY(f, kept, 58);
    b.setAttribute("aria-pressed", kept ? "true" : "false");
    b.setAttribute("aria-label", f === null ? tTY("ty_die_empty") : faceNameTY(f) + (kept ? ", " + tTY("ty_kept") : ""));
    if (canHold) b.addEventListener("click", () => holdTY(i));
    else b.disabled = true;
    wrap.appendChild(b);
  });
  let r = "";
  for (let i = 0; i < PfotenwurfCore.MAX_ROLLS; i++) {
    r += '<svg class="ty-roll-dot" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7.5" fill="' + (i < s.rolls ? "#141413" : "#ffffff") + '" stroke="#141413" stroke-width="2.5"/></svg>';
  }
  const rolls = document.getElementById("ty-rolls");
  rolls.innerHTML = r;
  rolls.setAttribute("aria-label", tTY("zw_rolls_aria", { n: s.rolls, m: PfotenwurfCore.MAX_ROLLS }));
}

// The sheet of the player to move (or of the player whose turn the
// computer panel shows): one row per field with its picture, its name and
// the points - written ones in a solid box, possible ones (after a roll,
// on the player's own turn) in a dashed box to tap.
function renderSheetTY() {
  const s = AppStateTY.state;
  const who = AppStateTY.review ? AppStateTY.review.player : (s.phase === "over" ? 0 : s.current);
  const sheet = s.sheets[who];
  const opt = humanTurnTY() ? PfotenwurfCore.options(s) : {};
  const wrap = document.getElementById("ty-sheet");
  wrap.innerHTML = "";
  document.getElementById("ty-sheet-label").textContent = tTY("ty_sheet_of", { name: nameTY(who) });
  PfotenwurfCore.FIELDS.forEach((field) => {
    const done = sheet[field] !== null && sheet[field] !== undefined;
    const can = !done && opt[field] !== undefined;
    const marked = AppStateTY.review && AppStateTY.review.field === field;
    const row = document.createElement("button");
    row.type = "button";
    row.className = "ty-row" + (can ? " ty-row-can" : "") + (done ? " ty-row-done" : "") + (marked ? " ty-row-marked" : "");
    const pts = done ? sheet[field] : (can ? opt[field] : null);
    row.innerHTML = '<span class="ty-row-icon">' + fieldIconTY(field) + '</span><span class="ty-row-name">' + fieldNameTY(field) + "</span>" +
      '<span class="ty-row-points' + (done && sheet[field] === 0 ? " ty-row-struck" : "") + (can ? " ty-row-points-can" : "") + '">' + (pts === null ? "" : String(pts)) + "</span>";
    let aria = fieldNameTY(field) + ": ";
    if (done) aria += tTY("ty_points", { n: sheet[field] });
    else if (can) aria += tTY("ty_points_possible", { n: opt[field] });
    else aria += tTY("ty_free");
    row.setAttribute("aria-label", aria);
    if (can) row.addEventListener("click", () => chooseTY(field));
    else row.disabled = true;
    wrap.appendChild(row);
  });
  const sum = document.createElement("div");
  sum.className = "ty-row ty-row-total";
  sum.innerHTML = '<span class="ty-row-icon"></span><span class="ty-row-name">' + tTY("ty_total") + '</span><span class="ty-row-points">' + PfotenwurfCore.total(sheet) + "</span>";
  wrap.appendChild(sum);
}

function renderReviewTY() {
  const r = AppStateTY.review;
  const wrap = document.getElementById("ty-review");
  wrap.classList.toggle("hidden", !r);
  if (!r) { wrap.innerHTML = ""; return; }
  let h = '<div class="ty-review-title">' + tTY("zw_cpu_title", { name: nameTY(r.player) }) + "</div>";
  r.rolls.forEach((x, i) => {
    h += '<div class="ty-review-roll" role="img" aria-label="' + tTY("zw_cpu_roll", { n: i + 1 }) + " " + diceAriaTY(x.dice, x.held) + '"><span class="ty-review-label" aria-hidden="true">' + tTY("zw_cpu_roll", { n: i + 1 }) + '</span><span class="ty-review-dice" aria-hidden="true">' +
      x.dice.map((f, k) => dieSvgTY(f, x.held[k], 34)).join("") + "</span></div>";
  });
  h += '<div class="status-text">' + tTY("ty_cpu_chose", { name: nameTY(r.player), field: fieldNameTY(r.field), n: r.points }) + "</div>";
  h += '<div class="dg-actions"><button id="ty-next" class="primary" type="button">' + tTY("zw_next") + "</button></div>";
  wrap.innerHTML = h;
  document.getElementById("ty-next").addEventListener("click", nextTY);
}

function statusTY() {
  const s = AppStateTY.state;
  if (AppStateTY.review) return tTY("zw_cpu_title", { name: nameTY(AppStateTY.review.player) });
  if (s.phase === "over") return "";
  if (s.computer[s.current]) return I18n.t("ui_status_computer_turn");
  const who = humansTY() === 1 ? I18n.t("ui_status_your_turn") : tTY("dg_turn_of", { name: nameTY(s.current) });
  let hint;
  if (s.rolls === 0) hint = tTY("ty_hint_roll");
  else if (s.rolls < PfotenwurfCore.MAX_ROLLS) hint = tTY("ty_hint_keep");
  else hint = tTY("ty_hint_field");
  return who + " " + hint;
}

function renderLastTY() {
  const s = AppStateTY.state;
  const el = document.getElementById("ty-last");
  if (!s.last || AppStateTY.review || s.computer[s.last.player]) { el.textContent = ""; return; }
  el.textContent = tTY("ty_last", { name: nameTY(s.last.player), field: fieldNameTY(s.last.field), n: s.last.points });
}

function renderTY() {
  const s = AppStateTY.state;
  if (!s) return;
  const over = s.phase === "over";
  document.getElementById("ty-players-list").innerHTML = DiceCommon.playersHtml(s.computer, s.current, s.sheets.map((sh) => tTY("ty_count", { n: PfotenwurfCore.total(sh) })), over);
  const showing = !!AppStateTY.review;
  document.getElementById("ty-play").classList.toggle("hidden", showing || over);
  renderReviewTY();
  if (!showing && !over) renderDiceTY();
  document.getElementById("ty-roll").disabled = !(humanTurnTY() && s.rolls < PfotenwurfCore.MAX_ROLLS);
  renderSheetTY();
  setStatusTY(statusTY());
  renderLastTY();
}

/*** Setup ***/

function initPfotenwurfApp() {
  DiceCommon.wireMenu();
  // The number of people only matters without the computer.
  const showPlayersTY = () => document.getElementById("ty-players-wrap").classList.toggle("hidden", DiceCommon.activeMode() !== "hotseat");
  document.getElementById("mode-ai").addEventListener("click", () => { DiceCommon.setMode("ai"); showPlayersTY(); });
  document.getElementById("mode-offline").addEventListener("click", () => { DiceCommon.setMode("hotseat"); showPlayersTY(); });
  showPlayersTY();
  document.getElementById("start-ty-game").addEventListener("click", startGameTY);
  document.getElementById("ty-roll").addEventListener("click", rollTY);
  const D = (face, kept) => dieSvgTY(face, kept, 40);
  Howto.init({ slug: "pfotenwurf", actions: ["ty-roll"], steps: [
    { pics: D(0) + D(3) + D(0) + D(5) + D(2), key: "ty_howto_1" },
    { pics: D(0, true) + D(0, true) + D(5, true) + D(1) + D(4), key: "ty_howto_2" },
    { pics: Howto.box(ZooIcons.svg(0, 30)) + Howto.sign("=") + Howto.sign("3"), key: "ty_howto_3" },
    { pics: Howto.box(fieldIconTY("five")) + Howto.sign("=") + Howto.sign("0"), key: "ty_howto_4" }
  ] });
  if (window.I18n && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateTY.state) renderTY(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(PFOTENWURF_SAVE_KEY) : null;
  if (saved && validStateTY(saved.state)) {
    AppStateTY.state = saved.state;
    if (saved.state.computer.some((c) => c)) DiceCommon.setMode("ai");
    else { DiceCommon.setMode("hotseat"); document.getElementById("ty-players").value = String(saved.state.n); }
    showPlayersTY();
    DiceCommon.showBoard();
    afterActionTY();
  }
}

document.addEventListener("DOMContentLoaded", initPfotenwurfApp);
