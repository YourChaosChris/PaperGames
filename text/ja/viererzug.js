// text/ja/viererzug.js
// Rules and history texts of viererzug (ja). Loaded by viererzug-rules.html and viererzug-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    viererzug_rules_title: "フォー・ムーブスのルール",
    viererzug_rules_intro: "二人がそれぞれ4つの石を5 x 5の盤に置き、そのあと動かします。自分の石4つを先に一列、または正方形に並べた人の勝ちです。",
    viererzug_rules_basics_title: "ルール",
    viererzug_term_place: "置く",
    viererzug_rules_place: "黒から始めます。交互に、空いているマスに石を1つずつ置き、両者の盤上の石が4つになるまで続けます。",
    viererzug_term_move: "動かす",
    viererzug_rules_move: "そのあとは交互に、自分の石を1つ、斜めも含めて空いている隣のマスへ1歩動かします。石は飛び越えることも、取られることもありません。自分の石をタップし、次に行き先のマスをタップします。",
    viererzug_term_win: "勝ち",
    viererzug_rules_win: "自分の石4つが直線(横、縦、斜め)または2 x 2の正方形に並べば、すぐに勝ちです。最後の石を置くときも同じです。",
    viererzug_term_draw: "引き分け",
    viererzug_rules_draw: "同じ局面で同じ側の番になることが3回目になると、引き分けです。動かせない側は番を飛ばします。",
    viererzug_term_computer: "コンピュータ",
    viererzug_rules_computer: "「やさしい」はランダムに打ちますが、勝てる手が見えれば打ちます。「ふつう」は1手先を読み、すぐに相手が勝つ手を避けます。「むずかしい」は数手先まで考えます。ヒントボタンは「むずかしい」が打つ手を示します。",
    viererzug_history_title: "フォー・ムーブスの歴史",
    viererzug_history_origins_title: "先に置いて、あとで動かす",
    viererzug_history_origins_p1: "石を先に置いてから動かすゲームは、何世紀も前から遊ばれてきました。3つの石や9つの石で遊ぶナイン・メンズ・モリスもその一つです。前半は単純で後半は選択に満ちているので、この型は覚えやすいのが特徴です。",
    viererzug_history_modern_title: "5 x 5の盤に4つの石",
    viererzug_history_modern_p1: "20世紀に、この型はとても小さな盤に応用されました。1945年にアメリカで、5 x 5の盤にそれぞれ4つの石を使い、4つが一列または正方形に並べば勝ちという市販のゲームが出ています。のちに木製のゲームが、独自のルールで同じ発想を使いました。数個の石を1歩ずつ動かして形を作るという原理そのものは、だれのものでもありません。",
    viererzug_history_here_title: "ここでのフォー・ムーブス",
    viererzug_history_here_p1: "PaperGamesは、この古い原理を使って、独自の名前の独自のゲームを作りました。盤はどの電子書籍リーダーにも収まる小ささで、時計は要りません。コンピュータは3段階で対戦します。"
});
I18n.markTextLoaded("ja");
