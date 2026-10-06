// romme-core.js
// Rules engine for Rommé (German rummy) - no DOM here; the page is
// romme-app.js, the computer player romme-ai.js.
//
// Version played here, as decided for PaperGames on 06.10.2026 after the
// German Wikipedia article "Rommé" (https://de.wikipedia.org/wiki/Romm%C3%A9):
//   - 110 cards: two packs of 52 plus 6 jokers. 2 to 4 players.
//   - The dealer gets 14 cards, everyone else 13. No card starts face up:
//     the dealer begins and ends that first turn by discarding.
//   - A turn: draw the top card of the stock or take the top discard;
//     lay out new melds and/or add cards to melds on the table; discard
//     one card. (The dealer's first turn starts without drawing.)
//   - Melds: sets of three or four cards of one rank in different suits
//     (no suit twice, even with two packs), and runs of at least three
//     cards of one suit in order. The Ace goes after the King (Q-K-A) or
//     before the Two (A-2-3), never round the corner (K-A-2).
//   - Jokers stand for any card.
//   - First meld ("Erstauslage"): at least `threshold` points (30, 40 or
//     51, default 40) laid out in one turn. Before it a player may not
//     add to melds on the table.
//   - Card values: Jack, Queen, King 10; Two to Ten their number; Ace 11,
//     but 1 in a run A-2-3 when counting the first meld. A joker counts as
//     the card it stands for in the first meld, and 20 in a hand.
//   - After their first meld a player may add cards to ANY meld on the
//     table, whoever laid it out (unlike Concan).
//   - Joker swap: a player who has made the first meld and holds the card
//     a joker on the table stands for may exchange them; the joker must be
//     laid out again at once in a new meld (so the swap is only allowed
//     when such a meld is possible).
//   - Whoever has no cards left ends the round. The others count the
//     cards in their hands as penalty points.
// PaperGames rules (not from the source, marked on the rules page):
//   - Only a player who has made the first meld may swap a joker.
//   - If the stock runs out, the discard pile except its top card is
//     shuffled and becomes the new stock.
// Settings (06.10.2026, players' wishes):
//   - rounds: 1, 3, 5, 10, 20 or 25 (default 1). Penalty points add up
//     over the rounds; after the last one the fewest points win, a tie at
//     the top is a draw (matchResult).
//   - takeRule, a house rule (default off, not usual Rommé): after the
//     first meld a player may take a natural card from any meld on the
//     table as long as at least three cards stay there as a valid meld -
//     from a run only the first or the last card, from a set of four any
//     one; never a joker. The taken card must go into a NEW meld in the
//     same turn; while one is still in hand the player may not discard.
//     "Take back" (cancelPending) puts table and hand back as they were
//     before the first take of the turn.
//   - discardRule, a variant (default off; Wikipedia, "Rommé"): the top
//     discard may only be taken to be laid out in a meld in the same turn
//     (before the first meld it belongs to the first meld). Until it lies
//     on the table the player may not discard. PaperGames rule: if that
//     doesn't work out, "returnDiscard" puts it back on the discard pile
//     (dissolving staged melds that hold it) and draws from the stock.
//
// Card: { id, rank 1..13, suit "C"|"S"|"H"|"D" } or { id, joker: true }.
// Meld on the table: { owner, type: "set"|"run", entries: [{ card, rank,
// suit }] } - for a run in order, with rank 1 for a low Ace and 14 for a
// high one; a joker's entry says which card it stands for (in a set its
// suit is null: any suit the set does not have yet).

const RommeCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const JOKERS = 6;
  const THRESHOLDS = [30, 40, 51];
  const DEFAULT_THRESHOLD = 40;
  const ROUND_CHOICES = [1, 3, 5, 10, 20, 25];

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  function makeDeck() {
    const deck = [];
    let id = 0;
    for (let pack = 0; pack < 2; pack++) {
      SUITS.forEach((suit) => { for (let rank = 1; rank <= 13; rank++) deck.push({ id: id++, rank, suit }); });
    }
    for (let j = 0; j < JOKERS; j++) deck.push({ id: id++, joker: true });
    return deck;
  }

  // Value of a card in a hand (penalty).
  function handValue(card) {
    if (card.joker) return 20;
    if (card.rank === 1) return 11;
    return card.rank >= 11 ? 10 : card.rank;
  }

  // Value of a meld entry for the first meld.
  function entryValue(e, type) {
    const r = e.rank;
    if (type === "run") {
      if (r === 1) return 1;
      if (r === 14) return 11;
      return r >= 11 ? 10 : r;
    }
    if (r === 1) return 11;
    return r >= 11 ? 10 : r;
  }

  function meldValue(meld) {
    return meld.entries.reduce((t, e) => t + entryValue(e, meld.type), 0);
  }

  // The meld these cards form, or null. Jokers in a run fill gaps first,
  // then extend upwards, then downwards.
  function buildMeld(cards) {
    if (cards.length < 3) return null;
    const naturals = cards.filter((c) => !c.joker);
    const jokers = cards.filter((c) => c.joker);
    if (!naturals.length) return null;
    // Set
    if (naturals.every((c) => c.rank === naturals[0].rank)) {
      const suits = new Set(naturals.map((c) => c.suit));
      if (suits.size === naturals.length && cards.length <= 4) {
        const rank = naturals[0].rank;
        return {
          type: "set",
          entries: naturals.sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit))
            .map((c) => ({ card: c, rank, suit: c.suit }))
            .concat(jokers.map((c) => ({ card: c, rank, suit: null })))
        };
      }
    }
    // Run
    if (!naturals.every((c) => c.suit === naturals[0].suit)) return null;
    const suit = naturals[0].suit;
    const aces = naturals.filter((c) => c.rank === 1);
    const tries = aces.length ? [1, 14] : [0];
    for (const aceAs of tries) {
      const placed = naturals.map((c) => ({ card: c, rank: c.rank === 1 ? (aceAs || 1) : c.rank }));
      placed.sort((a, b) => a.rank - b.rank);
      let ok = true;
      for (let i = 1; i < placed.length; i++) if (placed[i].rank === placed[i - 1].rank) ok = false;
      if (!ok) continue;
      let gaps = 0;
      for (let i = 1; i < placed.length; i++) gaps += placed[i].rank - placed[i - 1].rank - 1;
      if (gaps > jokers.length) continue;
      const entries = [];
      let j = 0;
      for (let i = 0; i < placed.length; i++) {
        if (i > 0) for (let r = placed[i - 1].rank + 1; r < placed[i].rank; r++) entries.push({ card: jokers[j++], rank: r, suit });
        entries.push({ card: placed[i].card, rank: placed[i].rank, suit });
      }
      let low = placed[0].rank, high = placed[placed.length - 1].rank;
      while (j < jokers.length && high < 14) { high++; entries.push({ card: jokers[j++], rank: high, suit }); }
      while (j < jokers.length && low > 1) { low--; entries.unshift({ card: jokers[j++], rank: low, suit }); }
      if (j < jokers.length) continue;
      if (entries.length > 13) continue;
      return { type: "run", entries };
    }
    return null;
  }

  // The meld after adding `card` at the fitting end/slot, or null.
  function extendMeld(meld, card) {
    const m = clone(meld);
    if (m.type === "set") {
      if (m.entries.length >= 4) return null;
      const rank = m.entries[0].rank;
      if (card.joker) { m.entries.push({ card, rank, suit: null }); return m; }
      if (card.rank !== rank) return null;
      if (m.entries.some((e) => e.suit === card.suit)) return null;
      m.entries.splice(m.entries.filter((e) => e.suit).length, 0, { card, rank, suit: card.suit });
      return m;
    }
    const suit = m.entries[0].suit;
    const low = m.entries[0].rank, high = m.entries[m.entries.length - 1].rank;
    if (m.entries.length >= 13) return null;
    if (card.joker) {
      if (high < 14) m.entries.push({ card, rank: high + 1, suit });
      else if (low > 1) m.entries.unshift({ card, rank: low - 1, suit });
      else return null;
      return m;
    }
    if (card.suit !== suit) return null;
    const r = card.rank;
    if (high < 14 && (r === high + 1 || (r === 1 && high === 13))) { m.entries.push({ card, rank: high + 1, suit }); return m; }
    if (low > 1 && (r === low - 1 || (r === 1 && low === 2))) { m.entries.unshift({ card, rank: low - 1, suit }); return m; }
    return null;
  }

  // Index of the joker in `meld` that `card` may replace, or -1.
  function jokerSlotFor(meld, card) {
    if (card.joker) return -1;
    if (meld.type === "set") {
      if (card.rank !== meld.entries[0].rank) return -1;
      if (meld.entries.some((e) => e.suit === card.suit)) return -1;
      return meld.entries.findIndex((e) => e.card.joker);
    }
    return meld.entries.findIndex((e) => e.card.joker && e.suit === card.suit &&
      (e.rank === card.rank || (card.rank === 1 && e.rank === 14)));
  }

  // Can `joker` form a new meld with two or more of these hand cards?
  function jokerUsable(hand, joker) {
    const others = hand.filter((c) => c.id !== joker.id);
    for (let a = 0; a < others.length; a++) {
      for (let b = a + 1; b < others.length; b++) {
        if (buildMeld([joker, others[a], others[b]])) return true;
      }
    }
    return false;
  }

  function createInitialState(opts) {
    const o = opts || {};
    const n = Math.max(2, Math.min(4, o.players || 2));
    return startRound({
      n,
      threshold: THRESHOLDS.indexOf(o.threshold) !== -1 ? o.threshold : DEFAULT_THRESHOLD,
      rounds: ROUND_CHOICES.indexOf(o.rounds) !== -1 ? o.rounds : 1,
      takeRule: !!o.takeRule,
      discardRule: !!o.discardRule,
      scores: new Array(n).fill(0),
      round: 0,
      dealer: o.dealer !== undefined ? o.dealer : 0
    }, o.rng);
  }

  // Deals a new round; `base` carries n, threshold, rounds, takeRule,
  // scores, round, dealer.
  function startRound(base, rng) {
    const deck = shuffle(makeDeck(), rng);
    const n = base.n;
    const players = [];
    for (let i = 0; i < n; i++) players.push({ hand: [], opened: false });
    for (let k = 0; k < 13; k++) for (let i = 0; i < n; i++) players[(base.dealer + 1 + i) % n].hand.push(deck.pop());
    players[base.dealer].hand.push(deck.pop());
    return {
      n,
      threshold: base.threshold,
      rounds: base.rounds || 1,
      takeRule: !!base.takeRule,
      discardRule: !!base.discardRule,
      scores: base.scores.slice(),
      round: base.round + 1,
      dealer: base.dealer,
      players,
      melds: [],
      stock: deck,
      discard: [],
      seen: [],          // every card ever discarded (for the hard computer)
      reshuffles: 0,     // how often the discard pile became the stock
      turn: base.dealer,
      phase: "play",     // the dealer starts without drawing
      firstTurn: true,
      pending: [],       // melds staged this turn by a player before the first meld
      pendingJoker: null, // id of a swapped joker that must be laid out again
      takenIds: [],      // house rule: cards taken from the table, still to be laid out
      takeUndo: null,    // house rule: { melds, hand, pendingJoker } before the first take
      discardTakenId: null, // variant: id of the discard taken this turn, to be laid out
      over: false,
      winner: null,
      penalties: null,
      lastEvent: null
    };
  }

  function nextRound(s, rng) {
    return startRound({ n: s.n, threshold: s.threshold, rounds: s.rounds || 1, takeRule: !!s.takeRule, discardRule: !!s.discardRule, scores: s.scores,
      round: s.round, dealer: (s.dealer + 1) % s.n }, rng);
  }

  // After a finished round: { over: false } while rounds are left, else
  // { over: true, winner } - the player with the fewest penalty points,
  // or null when several share the fewest.
  function matchResult(s) {
    if (!s.over || s.round < (s.rounds || 1)) return { over: false, winner: null };
    const best = Math.min.apply(null, s.scores);
    const leaders = s.scores.map((v, i) => (v === best ? i : -1)).filter((i) => i !== -1);
    return { over: true, winner: leaders.length === 1 ? leaders[0] : null };
  }

  // Variant: does the discard taken this turn still have to be laid out?
  function discardCardOpen(s) {
    const id = s.discardTakenId;
    if (id === null || id === undefined) return false;
    return !s.melds.some((m) => m.entries.some((e) => e.card.id === id));
  }

  // House rule: may the natural card at `index` be taken out of `meld`?
  // At least three cards must stay as a valid meld of the same kind.
  function canTakeFrom(meld, index) {
    const e = meld.entries[index];
    if (!e || e.card.joker || meld.entries.length < 4) return false;
    if (meld.type === "run" && index !== 0 && index !== meld.entries.length - 1) return false;
    const rest = meld.entries.filter((_, i) => i !== index);
    return rest.some((x) => !x.card.joker);
  }

  // Every card the side to move may take now: [{ meld, id }].
  function takeOptions(s) {
    const pl = s.players[s.turn];
    if (!s.takeRule || !pl.opened || s.phase !== "play" || s.pendingJoker !== null) return [];
    const out = [];
    s.melds.forEach((m, mi) => m.entries.forEach((e, ei) => { if (canTakeFrom(m, ei)) out.push({ meld: mi, id: e.card.id }); }));
    return out;
  }

  function topDiscard(s) { return s.discard.length ? s.discard[s.discard.length - 1] : null; }

  function findInHand(hand, id) { return hand.findIndex((c) => c.id === id); }

  function takeFromHand(hand, ids) {
    const out = [];
    for (const id of ids) {
      const i = findInHand(hand, id);
      if (i === -1) return null;
      out.push(hand.splice(i, 1)[0]);
    }
    return out;
  }

  function pendingValue(s) {
    return s.pending.reduce((t, m) => t + meldValue(m), 0);
  }

  function endRound(s, winner) {
    s.over = true;
    s.phase = "over";
    s.winner = winner;
    s.penalties = s.players.map((p, i) => (i === winner ? 0 : p.hand.reduce((t, c) => t + handValue(c), 0)));
    s.penalties.forEach((v, i) => { s.scores[i] += v; });
    return s;
  }

  // PaperGames rule (not from the source): the discard pile becomes the
  // new stock at most MAX_RESHUFFLES times per round. Without a limit a
  // round could go on for ever - e.g. everyone holds one card and every
  // meld on the table is full, so nobody can ever go out.
  const MAX_RESHUFFLES = 2;

  function canRefill(s) {
    return s.discard.length >= 2 && (s.reshuffles || 0) < MAX_RESHUFFLES;
  }

  function refillStock(s) {
    if (s.stock.length || !canRefill(s)) return;
    s.reshuffles = (s.reshuffles || 0) + 1;
    const top = s.discard.pop();
    s.stock = shuffle(s.discard, null);
    s.discard = [top];
    s.lastEvent = { type: "reshuffle" };
  }

  // Applies one step for s.turn. Moves:
  //   { type: "draw" } | { type: "takeDiscard" }           phase "draw"
  //   { type: "meld", ids }       new meld (staged before the first meld)
  //   { type: "confirmOpen" }     lay out the staged melds (>= threshold)
  //   { type: "cancelPending" }   take the staged melds back
  //   { type: "extend", meld, id } add a hand card to any table meld
  //   { type: "swapJoker", meld, id } exchange a table joker for the card
  //   { type: "take", meld, id }  house rule: take a card from a table meld
  //   { type: "returnDiscard" }   variant: put the taken discard back, draw
  //   { type: "discard", id }     end the turn
  // Returns { ok, state, reason }.
  function applyMove(state, move) {
    if (state.over) return { ok: false, state, reason: "over" };
    const s = clone(state);
    const p = s.turn;
    const pl = s.players[p];

    if (move.type === "draw" || move.type === "takeDiscard") {
      if (s.phase !== "draw") return { ok: false, state, reason: "not-now" };
      let card;
      if (move.type === "takeDiscard") {
        if (!s.discard.length) return { ok: false, state, reason: "no-discard" };
        card = s.discard.pop();
      } else {
        refillStock(s);
        if (!s.stock.length) return { ok: false, state, reason: "no-stock" };
        card = s.stock.pop();
      }
      pl.hand.push(card);
      s.phase = "play";
      s.discardTakenId = move.type === "takeDiscard" && s.discardRule ? card.id : null;
      s.lastEvent = { type: move.type, player: p, card: move.type === "takeDiscard" ? card : null };
      return { ok: true, state: s };
    }

    if (s.phase !== "play") return { ok: false, state, reason: "draw-first" };

    if (move.type === "meld") {
      const cards = move.ids.map((id) => pl.hand.find((c) => c.id === id));
      if (cards.some((c) => !c)) return { ok: false, state, reason: "not-in-hand" };
      const meld = buildMeld(cards);
      if (!meld) return { ok: false, state, reason: "not-a-meld" };
      if (s.pendingJoker !== null && !move.ids.includes(s.pendingJoker)) return { ok: false, state, reason: "joker-first" };
      takeFromHand(pl.hand, move.ids);
      meld.owner = p;
      if (!pl.opened) {
        s.pending.push(meld);
        s.lastEvent = { type: "stage", player: p };
        return { ok: true, state: s };
      }
      s.melds.push(meld);
      if (s.pendingJoker !== null && move.ids.includes(s.pendingJoker)) s.pendingJoker = null;
      if (s.takenIds && s.takenIds.length) {
        s.takenIds = s.takenIds.filter((id) => !move.ids.includes(id));
        if (!s.takenIds.length) s.takeUndo = null;
      }
      s.lastEvent = { type: "meld", player: p, cards };
      if (!pl.hand.length) return { ok: true, state: endRound(s, p) };
      return { ok: true, state: s };
    }

    if (move.type === "confirmOpen") {
      if (pl.opened || !s.pending.length) return { ok: false, state, reason: "nothing-staged" };
      if (pendingValue(s) < s.threshold) return { ok: false, state, reason: "below-threshold" };
      const laid = s.pending;
      s.pending = [];
      laid.forEach((m) => s.melds.push(m));
      pl.opened = true;
      s.lastEvent = { type: "open", player: p, points: laid.reduce((t, m) => t + meldValue(m), 0), melds: laid.length };
      if (!pl.hand.length) return { ok: true, state: endRound(s, p) };
      return { ok: true, state: s };
    }

    if (move.type === "cancelPending") {
      if (s.takeUndo) {
        // House rule: table and hand as before the first take this turn.
        s.melds = s.takeUndo.melds;
        pl.hand = s.takeUndo.hand;
        s.pendingJoker = s.takeUndo.pendingJoker;
        s.takenIds = [];
        s.takeUndo = null;
        s.lastEvent = { type: "untake", player: p };
        return { ok: true, state: s };
      }
      s.pending.forEach((m) => m.entries.forEach((e) => pl.hand.push(e.card)));
      s.pending = [];
      s.lastEvent = { type: "unstage", player: p };
      return { ok: true, state: s };
    }

    if (move.type === "returnDiscard") {
      // Variant, PaperGames rule: put the discard back and draw instead.
      if (!discardCardOpen(s)) return { ok: false, state, reason: "not-now" };
      const id = s.discardTakenId;
      let card = null;
      const hi = findInHand(pl.hand, id);
      if (hi !== -1) card = pl.hand.splice(hi, 1)[0];
      const keep = [];
      s.pending.forEach((m) => {
        if (m.entries.some((e) => e.card.id === id)) {
          m.entries.forEach((e) => { if (e.card.id === id) card = e.card; else pl.hand.push(e.card); });
        } else keep.push(m);
      });
      s.pending = keep;
      if (!card) return { ok: false, state, reason: "not-in-hand" };
      s.discard.push(card);
      refillStock(s);
      if (!s.stock.length) return { ok: false, state, reason: "no-stock" };
      const drawn = s.stock.pop();
      pl.hand.push(drawn);
      s.discardTakenId = null;
      s.lastEvent = { type: "returnDiscard", player: p, card };
      return { ok: true, state: s };
    }

    if (move.type === "take") {
      if (!s.takeRule) return { ok: false, state, reason: "bad-move" };
      if (!pl.opened) return { ok: false, state, reason: "open-first" };
      if (s.pendingJoker !== null) return { ok: false, state, reason: "joker-first" };
      const meld = s.melds[move.meld];
      const idx = meld ? meld.entries.findIndex((e) => e.card.id === move.id) : -1;
      if (idx === -1) return { ok: false, state, reason: "not-in-meld" };
      if (meld.entries[idx].card.joker) return { ok: false, state, reason: "take-joker" };
      if (!canTakeFrom(meld, idx)) return { ok: false, state, reason: "take-breaks-meld" };
      if (!s.takeUndo) s.takeUndo = { melds: clone(s.melds), hand: clone(pl.hand), pendingJoker: s.pendingJoker };
      const card = meld.entries.splice(idx, 1)[0].card;
      pl.hand.push(card);
      s.takenIds = (s.takenIds || []).concat([card.id]);
      s.lastEvent = { type: "take", player: p, card, owner: meld.owner };
      return { ok: true, state: s };
    }

    if (move.type === "extend") {
      if (!pl.opened) return { ok: false, state, reason: "open-first" };
      if (s.pendingJoker !== null) return { ok: false, state, reason: "joker-first" };
      if ((s.takenIds || []).includes(move.id)) return { ok: false, state, reason: "taken-new-meld" };
      const meld = s.melds[move.meld];
      const i = findInHand(pl.hand, move.id);
      if (!meld || i === -1) return { ok: false, state, reason: "not-in-hand" };
      const grown = extendMeld(meld, pl.hand[i]);
      if (!grown) return { ok: false, state, reason: "doesnt-fit" };
      const card = pl.hand.splice(i, 1)[0];
      s.melds[move.meld] = grown;
      s.lastEvent = { type: "extend", player: p, card, owner: meld.owner };
      if (!pl.hand.length) return { ok: true, state: endRound(s, p) };
      return { ok: true, state: s };
    }

    if (move.type === "swapJoker") {
      if (!pl.opened) return { ok: false, state, reason: "open-first" };
      if (s.pendingJoker !== null) return { ok: false, state, reason: "joker-first" };
      if ((s.takenIds || []).includes(move.id)) return { ok: false, state, reason: "taken-new-meld" };
      const meld = s.melds[move.meld];
      const i = findInHand(pl.hand, move.id);
      if (!meld || i === -1) return { ok: false, state, reason: "not-in-hand" };
      const card = pl.hand[i];
      const slot = jokerSlotFor(meld, card);
      if (slot === -1) return { ok: false, state, reason: "no-joker-for-card" };
      const joker = meld.entries[slot].card;
      const handAfter = pl.hand.filter((c) => c.id !== card.id).concat([joker]);
      if (!jokerUsable(handAfter, joker)) return { ok: false, state, reason: "joker-unusable" };
      pl.hand.splice(i, 1);
      const e = meld.entries[slot];
      meld.entries[slot] = { card, rank: e.rank, suit: card.suit };
      if (meld.type === "set") {
        // keep the natural cards first
        const nat = meld.entries.filter((x) => !x.card.joker), jok = meld.entries.filter((x) => x.card.joker);
        meld.entries = nat.concat(jok);
      }
      pl.hand.push(joker);
      s.pendingJoker = joker.id;
      s.lastEvent = { type: "swap", player: p, card, owner: meld.owner };
      return { ok: true, state: s };
    }

    if (move.type === "discard") {
      if (s.pending.length) return { ok: false, state, reason: "staged-open" };
      if (s.pendingJoker !== null) return { ok: false, state, reason: "joker-first" };
      if ((s.takenIds || []).length) return { ok: false, state, reason: "taken-first" };
      if (discardCardOpen(s)) return { ok: false, state, reason: "discard-card-first" };
      const i = findInHand(pl.hand, move.id);
      if (i === -1) return { ok: false, state, reason: "not-in-hand" };
      const card = pl.hand.splice(i, 1)[0];
      s.discard.push(card);
      s.seen.push(card);
      s.discardTakenId = null;
      s.lastEvent = { type: "discard", player: p, card };
      s.firstTurn = false;
      if (!pl.hand.length) return { ok: true, state: endRound(s, p) };
      s.turn = (p + 1) % s.n;
      s.phase = "draw";
      if (!s.stock.length && !canRefill(s)) {
        // Nothing left to draw: the round ends without a winner.
        s.over = true; s.phase = "over"; s.winner = null;
        s.penalties = s.players.map((x) => x.hand.reduce((t, c) => t + handValue(c), 0));
        s.penalties.forEach((v, k) => { s.scores[k] += v; });
      }
      return { ok: true, state: s };
    }
    return { ok: false, state, reason: "bad-move" };
  }

  function cardCount(s) {
    return s.stock.length + s.discard.length + s.players.reduce((t, p) => t + p.hand.length, 0) +
      s.melds.reduce((t, m) => t + m.entries.length, 0) + s.pending.reduce((t, m) => t + m.entries.length, 0);
  }

  return {
    SUITS, JOKERS, THRESHOLDS, DEFAULT_THRESHOLD, ROUND_CHOICES, MAX_RESHUFFLES, makeDeck, handValue, entryValue, meldValue, buildMeld,
    extendMeld, jokerSlotFor, jokerUsable, createInitialState, nextRound, matchResult, canTakeFrom, takeOptions, discardCardOpen, topDiscard, pendingValue,
    applyMove, cardCount, clone
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = RommeCore;
}
if (typeof window !== "undefined") {
  window.RommeCore = RommeCore;
}
