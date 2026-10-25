// text/ja/hanoi.js
// Rules and history texts of hanoi (ja). Loaded by hanoi-rules.html and hanoi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    hanoi_rules_title: "ハノイの塔のルール",
    hanoi_rules_intro: "いちばん小さい円盤を上にした円盤の塔が、左の棒に立っています。これを右の棒へうつします。",
    hanoi_rules_basics_title: "ルール",
    hanoi_term_move: "1手",
    hanoi_rules_move: "棒をタッチすると、いちばん上の円盤を取ります（棒が太いわくになります）。円盤をおく棒をタッチします。同じ棒をもう一度タッチすると、もとにもどせます。",
    hanoi_term_rule: "決まり",
    hanoi_rules_rule: "動かせるのは棒のいちばん上の円盤だけで、自分より小さい円盤の上にはおけません。そういう手はことわられ、何も動きません。",
    hanoi_term_goal: "目標",
    hanoi_rules_goal: "塔をまるごと右の棒（星じるし）へ。最少手数は「2の円盤の数乗ひく1」：3枚なら7手、4枚なら15手、8枚なら255手です。",
    hanoi_term_help: "もどすとヒント",
    hanoi_rules_help: "「もどす」で手をもどせます。ヒントは2本の棒を二重のわくでしめします。1本目のいちばん上の円盤を2本目へうつしてください。いまの形からの最短の道の次の1手です。",
    hanoi_history_title: "ハノイの塔の歴史",
    hanoi_history_lucas_title: "エドゥアール・リュカ、1883年",
    hanoi_history_lucas_p1: "フランスの数学者エドゥアール・リュカは1883年、このパズルを「N. クラウス（ド・シャム）」なる人物が見つけた遊びとして発表しました。この名前は「Lucas d'Amiens」の文字をならべかえたものです。1889年には小冊子として出版しました。",
    hanoi_history_legend_title: "作られた伝説",
    hanoi_history_legend_p1: "パズルにそえられた伝説には、ベナレスの寺院の僧たちが64枚の金の円盤の塔をうつしていて、終わると世界がおわる、という話がのっていました。この伝説はゲームの物語の一部で、本当の歴史ではありません。",
    hanoi_history_math_title: "最少手数",
    hanoi_history_math_p1: "n枚の円盤をうつすには、少なくとも2^n − 1手かかります。まず小さいn − 1枚をまん中の棒へ、つぎにいちばん大きい円盤をゴールへ、さいごに小さい円盤をその上へ。64枚を1秒に1手でうつすと、宇宙の年齢よりずっと長くかかります。"
});
I18n.markTextLoaded("ja");
