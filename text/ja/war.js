// text/ja/war.js
// Rules and history texts of war (ja). Loaded by war-rules.html and war-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    war_rules_title: "戦争のルール",
    war_rules_intro: "2人で遊ぶ運だけのトランプ遊び。強いカードが勝ち、同じ数なら戦争です。",
    war_rules_basics_title: "ルール",
    war_term_cards: "カード",
    war_rules_cards: "32枚：4つのマークの7、8、9、10、ジャック、クイーン、キング、エース。エースがいちばん強く、マークは関係ありません。それぞれ16枚を伏せた山にして持ちます。",
    war_term_round: "1回の流れ",
    war_rules_round: "2人とも自分の山のいちばん上のカードをめくります。強いほうが2枚とも取り、勝った人の山の下に入れます。",
    war_term_war: "戦争",
    war_rules_war: "2枚が同じ数なら戦争です。それぞれ1枚を伏せて、もう1枚をめくります。めくった強いほうが場のカードを全部取ります。また同じなら、戦争が続きます。",
    war_term_empty: "カードがなくなったら",
    war_rules_empty: "戦争のときにカードが1枚しかない人は、伏せずにその1枚をめくります。めくるカードがもうない人は負けです。",
    war_term_modes: "短いゲームか最後までか",
    war_rules_modes: "短い（初期設定）：30回のあと、カードの多いほうの勝ち。同じ枚数なら引き分けです。最後まで：だれかが32枚全部を集めるまで続けます。長いゲームが同じことを繰り返さないように、取ったカードは順番を混ぜて山の下に入れ、2000回で引き分けにします。",
    war_term_play: "ここでの遊び方",
    war_rules_play: "コンピューターと対戦します。判断することはありません。自分の山をタップすると2人のカードがめくられます。場にはその回のカードが並び、戦争で伏せたカードはしま模様の裏面で表示されます。どちらの山にも枚数が出ています。",
    war_rules_example_title: "戦争の例",
    war_rules_example: "絵は戦争の場面です。2人とも9をめくり、1枚ずつ伏せたあと、キングが8に勝ちました。",
    war_history_title: "戦争の歴史",
    war_history_origins_title: "昔からの子どもの遊び",
    war_history_origins_p1: "戦争はいちばんかんたんなトランプ遊びのひとつで、子どもが最初に覚えることの多いゲームです。イギリスでは Battle とも呼ばれます。ドイツの変種は1833年にはすでに、C・F・シェンケルの百科事典に出てきます。似た遊びに Beggar-my-neighbour があります。",
    war_history_end_title: "必ず終わるの？",
    war_history_end_p1: "戦争はとても長く続くことがあり、理論上は終わらないかもしれません。戦争の途中でカードがなくなったらどうするかも、たいていの説明でははっきりしません。数学者はこのゲームが必ず終わるかどうかを研究しています。取ったカードを山の下に戻す順番だけでも、結果が変わることがあります。",
    war_history_modern_title: "PaperGamesの戦争",
    war_history_modern_p1: "戦争は長くなることがあるので、PaperGamesでは30回の短いゲームを初期設定にしています。取ったカードは順番を混ぜて山の下に入れ、戦争のときに1枚しかない人はその1枚をめくります。これはこの問題のよくある決め方のひとつです。"
});
I18n.markTextLoaded("ja");
