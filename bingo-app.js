(function () {
  const $ = (id) => document.getElementById(id);
  const state = { game: null, cards: [], active: 0, current: null };
  const PICTURES = ["dog","cat","rabbit","mouse","owl","fish","turtle","snail","duck","frog","pig","elephant","butterfly","bee","lion","giraffe","sheep","apple","pear","car","boat","ball","flower","house"];
  const DRAWINGS = {
    dog:'<circle cx="50" cy="52" r="24"/><path d="M28 39 20 18 41 30M72 39l8-21-21 12"/><circle cx="42" cy="50" r="2"/><circle cx="58" cy="50" r="2"/><ellipse cx="50" cy="60" rx="7" ry="5"/>',
    cat:'<circle cx="50" cy="52" r="24"/><path d="M30 38 27 18 44 31M70 38l3-20-17 13"/><circle cx="42" cy="50" r="2"/><circle cx="58" cy="50" r="2"/><path d="M45 61h10m-5-4v8M27 60l14 2m-14 5 14-2m32-5-14 2m14 5-14-2"/>',
    rabbit:'<ellipse cx="39" cy="29" rx="8" ry="23"/><ellipse cx="61" cy="29" rx="8" ry="23"/><circle cx="50" cy="58" r="23"/><circle cx="42" cy="54" r="2"/><circle cx="58" cy="54" r="2"/><circle cx="50" cy="64" r="4"/>',
    mouse:'<circle cx="50" cy="53" r="22"/><circle cx="33" cy="34" r="12"/><circle cx="67" cy="34" r="12"/><circle cx="43" cy="51" r="2"/><circle cx="57" cy="51" r="2"/><ellipse cx="50" cy="61" rx="5" ry="3"/>',
    owl:'<path d="M26 76V37l16 9 8-12 8 12 16-9v39z"/><circle cx="41" cy="53" r="8"/><circle cx="59" cy="53" r="8"/><circle cx="41" cy="53" r="2"/><circle cx="59" cy="53" r="2"/><path d="m47 66 3 5 3-5"/>',
    fish:'<path d="M18 50q32-35 62 0-30 35-62 0l-12 14V36z"/><circle cx="65" cy="47" r="2"/>',
    turtle:'<ellipse cx="50" cy="52" rx="26" ry="19"/><path d="M31 38v28m19-33v38m19-33v28M25 40l-9-9m9 35-9 9m50-35 9-9m-9 35 9 9"/><circle cx="78" cy="50" r="8"/><circle cx="80" cy="48" r="1"/>',
    snail:'<path d="M18 68h65q-2-17-18-17h-5a22 22 0 1 0-9 17"/><circle cx="44" cy="47" r="17"/><path d="M44 47q14-2 8-13-7-8-14 0-5 9 6 13M73 50V35m10 15V35"/><circle cx="73" cy="34" r="2"/><circle cx="83" cy="34" r="2"/>',
    duck:'<ellipse cx="48" cy="56" rx="27" ry="20"/><circle cx="62" cy="34" r="16"/><path d="m75 34 17 6-17 5"/><circle cx="66" cy="31" r="2"/>',
    frog:'<circle cx="50" cy="56" r="27"/><circle cx="34" cy="30" r="10"/><circle cx="66" cy="30" r="10"/><circle cx="34" cy="30" r="2"/><circle cx="66" cy="30" r="2"/><path d="M36 60q14 16 28 0"/>',
    pig:'<ellipse cx="50" cy="54" rx="29" ry="23"/><path d="m31 37-5-16 20 12m17 4 5-16-20 12"/><ellipse cx="50" cy="59" rx="10" ry="7"/><circle cx="46" cy="59" r="1"/><circle cx="54" cy="59" r="1"/><circle cx="39" cy="48" r="2"/><circle cx="61" cy="48" r="2"/>',
    elephant:'<path d="M25 43q0-20 26-20t26 20v30H66V57H38v16H27V54q-15-4-9-21 2-7 10-7"/><circle cx="62" cy="39" r="2"/><path d="M25 43q0 17 15 11"/>',
    butterfly:'<path d="M49 50Q15 10 15 42q0 18 34 12Q15 88 25 91q18 3 25-37 7 40 25 37 10-3-24-37 34 6 34-12 0-32-35 8"/><path d="M50 28q-8-14-13-12m13 12q8-14 13-12"/>',
    bee:'<ellipse cx="50" cy="56" rx="18" ry="25"/><path d="M39 36v40m22-40v40"/><ellipse cx="39" cy="27" rx="11" ry="16"/><ellipse cx="61" cy="27" rx="11" ry="16"/><circle cx="45" cy="48" r="2"/><circle cx="55" cy="48" r="2"/>',
    lion:'<circle cx="50" cy="52" r="34"/><circle cx="50" cy="54" r="22"/><circle cx="43" cy="50" r="2"/><circle cx="57" cy="50" r="2"/><path d="M46 61h8m-4-4v7"/>',
    giraffe:'<path d="M35 84V46q0-22 15-22t15 22v38M35 45h30M42 32l-5-14m26 14 5-14"/><circle cx="44" cy="39" r="2"/><circle cx="56" cy="39" r="2"/><path d="M46 48h8m-4-4v8"/>',
    sheep:'<circle cx="34" cy="52" r="15"/><circle cx="50" cy="42" r="17"/><circle cx="67" cy="52" r="15"/><ellipse cx="50" cy="61" rx="20" ry="17"/><path d="M39 76v10m22-10v10"/><circle cx="44" cy="58" r="2"/><circle cx="56" cy="58" r="2"/>',
    apple:'<path d="M50 35q-28-15-31 11-2 25 22 39 8 5 9-2 1 7 9 2 23-14 22-39-3-26-31-11zM50 35q-1-14 11-21m-7 9q12-10 22-2-7 12-19 9"/>',
    pear:'<path d="M50 23q-8 0-7 14 0 8-9 18-18 25 1 36h30q19-11 1-36-9-10-9-18 1-14-7-14zM50 26q-1-13 11-19"/>',
    car:'<path d="M15 61h74v18H15zM25 61l10-23h34l14 23"/><circle cx="31" cy="80" r="8"/><circle cx="73" cy="80" r="8"/>',
    boat:'<path d="M12 67h76L76 85H28zM48 20v45H25zM53 29l26 30H53z"/>',
    ball:'<circle cx="50" cy="50" r="37"/><path d="M50 13q-22 20 0 37 22-17 0-37zm0 37q-27-8-37 12m37-12q10 27 30 32M13 50q24-7 37 0m0 0q4 25-10 36"/>',
    flower:'<circle cx="50" cy="50" r="10"/><g><circle cx="50" cy="25" r="12"/><circle cx="75" cy="50" r="12"/><circle cx="50" cy="75" r="12"/><circle cx="25" cy="50" r="12"/></g><path d="M50 60v29m0-11q-18-12-22 0 13 9 22 0"/>',
    house:'<path d="M12 48 50 15l38 33M22 43v43h56V43M43 86V59h16v27M31 53h8v9h-8zm24 0h8v9h-8z"/>'
  };
  function drawIcon(value) { const key = String(value).replace("picture", ""); return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g fill="none" stroke="#111" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' + DRAWINGS[PICTURES[Number(key)]] + '</g></svg>'; }
  function start() {
    const kind = $('bingo-kind').value, size = Number($('bingo-size').value), mode = $('bingo-mode').value, count = mode === 'caller' ? 0 : (mode === 'computer' ? Math.max(2, Number($('bingo-count').value)) : Number($('bingo-count').value));
    state.game = { kind, size, mode, pattern: $('bingo-pattern').value, drawn: [] };
    state.cards = Array.from({ length: count }, () => BingoCore.createDeck(kind, size)); state.active = 0; state.current = null;
    render(); $('bingo-status').textContent = I18n.t("ui_status_your_turn");
  }
  function render() {
    const printable = $('bingo-print-cards'); printable.innerHTML = '';
    state.cards.forEach((card, ci) => { const article = document.createElement('article'); article.className = 'bingo-card print-card' + (ci === (state.game.mode === 'computer' ? 0 : state.active) ? ' active' : ''); article.innerHTML = '<h3>' + I18n.t('bingo_card') + ' ' + (ci + 1) + '</h3><div class="bingo-grid" style="--bingo-n:' + card.size + '"></div>'; const grid = article.querySelector('.bingo-grid'); card.board.forEach((v, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'bingo-cell' + (card.marked[i] ? ' marked' : '') + (state.game.kind === 'pictures' ? ' picture-cell' : ''); b.setAttribute('aria-label', v === null ? I18n.t('bingo_free') : state.game.kind === 'pictures' ? I18n.t('bingo_picture_' + PICTURES[Number(String(v).replace('picture',''))]) : String(v)); b.innerHTML = v === null ? '★' : state.game.kind === 'pictures' ? drawIcon(v) : String(v); b.addEventListener('click', () => { if (state.game.mode === 'caller') return; card.marked[i] = !card.marked[i]; render(); }); grid.appendChild(b); }); printable.appendChild(article); });
    $('bingo-current').textContent = state.current === null ? '—' : state.game.kind === 'pictures' ? drawIcon(state.current) + I18n.t('bingo_picture_' + PICTURES[Number(String(state.current).replace('picture',''))]) : state.current;
    $('bingo-print-cards').classList.toggle('hidden', !state.cards.length);
  }
  $('bingo-new').addEventListener('click', start);
  $('bingo-draw').addEventListener('click', () => { if (!state.game) start(); if (state.game.over) return; const deck = state.game.kind === 'pictures' ? Array.from({length:24},(_,i)=>'picture'+i) : Array.from({length:75},(_,i)=>i+1); const used = state.game.drawn || (state.game.drawn=[]); const left = deck.filter(x=>!used.includes(x)); state.current = left.length ? left[Math.floor(Math.random()*left.length)] : null; if(state.current!==null){used.push(state.current);state.cards.forEach(c=>{c.drawn=used.slice();const i=c.board.indexOf(state.current);if(i>=0&&state.game.mode==='computer'&&c!==state.cards[0])c.marked[i]=true;});} const aiWin=state.game.mode==='computer'&&state.cards.slice(1).some(c=>BingoCore.check(c,state.game.pattern).valid); if(aiWin){state.game.over=true;if(typeof GameStats!=='undefined')GameStats.record('bingo','loss');} $('bingo-status').textContent = state.current === null ? I18n.t('bingo_draw_empty') : (aiWin ? I18n.t("ui_status_computer_wins") : I18n.t("ui_status_your_turn")); render(); });
  $('bingo-next').addEventListener('click', () => { if (!state.cards.length) return; state.active = (state.active + 1) % state.cards.length; $('bingo-status').textContent = I18n.t("ui_status_your_turn"); render(); });
  $('bingo-check').addEventListener('click', () => { if(!state.cards.length||state.game.over)return; const result = BingoCore.check(state.cards[state.active], state.game.pattern); $('bingo-status').textContent = I18n.t(result.valid ? (state.game.mode === 'computer' && state.active > 0 ? "ui_status_computer_wins" : "ui_status_you_win") : 'bingo_incorrect'); if (result.valid) { state.game.over = true; if (state.game.mode === 'computer' && typeof GameStats !== 'undefined') GameStats.record('bingo', state.active === 0 ? 'win' : 'loss'); } const cells = $('bingo-print-cards').children[state.active].querySelectorAll('.bingo-cell'); cells.forEach((el,i)=>el.classList.toggle('wrong',result.incorrect.includes(i))); });
  $('bingo-mode').addEventListener('change', () => { const count = $('bingo-count'); count.disabled = $('bingo-mode').value === 'caller'; count.options[0].disabled = $('bingo-mode').value === 'computer'; if (count.options[0].disabled && count.value === '1') count.value = '2'; });
  document.addEventListener('DOMContentLoaded', () => {});
  if (document.readyState !== 'loading') start(); else document.addEventListener('DOMContentLoaded', start);
})();
