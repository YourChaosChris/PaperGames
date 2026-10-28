/* ui-status.js: the shared turn and winner status sentences of the games
   with a computer opponent. A game's status helper hands its English status
   text to UiStatus.rewrite(); this returns "Your turn." / "The computer's
   turn." / "You win!" / "The computer wins." (localized, ui_status_* keys),
   followed by any extra sentence of the text, or the text unchanged where
   it is a hint or an error message. A game only says who the human is:
     UiStatus.rewrite(text, AppStateX)                  state, turn, humanColor / humanPlayer / human as usual
     UiStatus.rewrite(text, AppStateX, { human: 0 })    "human = seat 0"
   Options: state (object with turn/winner/gameOver), turn, human, and the
   functions humanTurn(turn) and humanWon(winner) for games whose seats are
   not compared with ===. */
const UiStatus = (function () {
  const KEEP = /(n't|\bnot\b|cannot|\billegal\b|\binvalid\b|\bfirst\b|\bmust\b|\bneed|\bempty\b|\bchoose\b|\btap\b|\bselect\b|\bpick\b|\balready\b|\bno tile\b|\bno card\b|\bno move\b|\bplay the card\b|\bplay a\b|\bdraw\b.*\bstock\b)/i;
  const COMPUTER_TURN = /(?:^|[.!?]\s+)(?:the\s+)?computer(?:\s+\d+)?(?:\x27s)?\s+(?:turn|thinking|to move|is thinking|is playing|plays|acts|rolling)\b/i;

  function rewrite(text, app, o) {
    o = o || {};
    const t = String(text);
    const keep = KEEP.test(t) && !/\b(wins?|won|winner)\b/i.test(t);
    const st = o.state || app.state || app;
    const over = app.gameOver === true || app.over === true || st.gameOver === true || st.over === true;
    const turn = "turn" in o ? o.turn : (st.turn !== undefined ? st.turn : st.current);
    const human = "human" in o ? o.human : (app.humanColor !== undefined ? app.humanColor : (app.humanPlayer !== undefined ? app.humanPlayer : app.human));
    const isHumanTurn = () => (o.humanTurn ? o.humanTurn(turn) : String(turn) === String(human));
    let key = null;
    if (over && !/\b(draw|drawn|tie|remis|stalemate)\b/i.test(t) && /\b(win|wins|won|winner|lose|loses)\b/i.test(t)) {
      if (/\b(you win|you won|you have won)\b/i.test(t)) key = "ui_status_you_win";
      else if (/\b(you lose|you lost|computer.{0,30}wins?)\b/i.test(t)) key = "ui_status_computer_wins";
      else if (o.humanWon && st.winner !== undefined) key = o.humanWon(st.winner) ? "ui_status_you_win" : "ui_status_computer_wins";
      else if (!o.humanWon && st.winner !== undefined && human !== undefined) key = String(st.winner) === String(human) ? "ui_status_you_win" : "ui_status_computer_wins";
      else if (!o.humanWon && human !== undefined) {
        const side = t.match(/\b(white|black|red|blue)\s+wins?\b/i);
        if (side) key = side[1].charAt(0).toLowerCase() === String(human).charAt(0).toLowerCase() ? "ui_status_you_win" : "ui_status_computer_wins";
      }
    }
    if (!key && COMPUTER_TURN.test(t)) key = "ui_status_computer_turn";
    if (!key && /\b(turn|to move|move a stone|place a stone|draw a card|roll|throw)\b/i.test(t) && human !== undefined && turn !== undefined) key = isHumanTurn() ? "ui_status_your_turn" : "ui_status_computer_turn";
    if (!key && /\b(your turn|you are next|you to move)\b/i.test(t)) key = "ui_status_your_turn";
    if (!key && !/\b(draw|drawn|tie|remis|stalemate|win|wins|won|winner|lose|loses)\b/i.test(t)) {
      if (human !== undefined && turn !== undefined) key = isHumanTurn() ? "ui_status_your_turn" : "ui_status_computer_turn";
      else if (COMPUTER_TURN.test(t)) key = "ui_status_computer_turn";
      else key = "ui_status_your_turn";
    }
    if (key && !keep) {
      const extraRaw = t.replace(/^.*?(?:\.|…|!)(?:\s+|$)/, "").trim();
      // A sentence "<Name> to move." / "<Name>'s turn." repeats the turn
      // sentence just written ("Your turn. Player 1 to move.") and goes.
      const extraTurnless = extraRaw.replace(/(?:^|\s+)[^.!?…]*?\b(?:to move|\x27s turn)[.!]?(?=\s|$)/gi, "").trim();
      const extra = /^(?:you win|you won|you lose|you lost|the computer wins|computer wins|your (?:move|turn)|the computer(?:\x27s)? turn|computer thinking)\W*$/i.test(extraTurnless) ? "" : extraTurnless;
      return I18n.t(key) + (extra ? " " + extra : "");
    }
    return text;
  }

  // The human's seat in a game whose AppState has mode "offline-ai" and
  // humanColor or humanSide.
  function humanSeat(app) {
    return app.humanColor !== undefined ? app.humanColor : app.humanSide;
  }

  // Who gives up when "Resign" is tapped: against the computer always the
  // human, also while the computer is still thinking about its move (the
  // button stays tappable then); between two people whoever is to move.
  function resigner(app) {
    return app.mode === "offline-ai" ? humanSeat(app) : app.turn;
  }

  // True when a game against the computer waits for a computer move, e.g.
  // after "Undo" went back to the start where the computer opens: the caller
  // then schedules the computer move again, as at the start of the game.
  function computerToMove(app) {
    return app.mode === "offline-ai" && !app.gameOver && String(app.turn) !== String(humanSeat(app));
  }

  return { rewrite: rewrite, resigner: resigner, computerToMove: computerToMove };
})();
