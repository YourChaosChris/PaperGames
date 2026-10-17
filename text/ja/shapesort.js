// text/ja/shapesort.js
// Rules and history texts of shapesort (ja). Loaded by shapesort-rules.html and shapesort-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    shapesort_rules_title: "形の仕分けのルール",
    shapesort_rules_intro: "色のかわりに形を使う仕分けパズルです。どの筒にも1種類の形だけが残るまで石を移します。",
    shapesort_rules_basics_title: "ルール",
    shapesort_term_tubes: "筒",
    shapesort_rules_tubes: "どの筒にも「1本の石の数」で選んだ数(4、6、8、10)まで石が入ります。最初は石が混ざっていて、2本の筒が空です。",
    shapesort_term_move: "1手",
    shapesort_rules_move: "筒をタップすると、いちばん上の石と、そのすぐ下にある同じ形の石に印が付きます。次にほかの筒をタップします。その筒が空か、いちばん上が同じ形なら、入るだけの石が移ります。印の付いた筒をもう一度タップすると、石を置き直します。",
    shapesort_term_goal: "目的",
    shapesort_rules_goal: "どの筒も空か、同じ形の石でいっぱいになったら完成です。",
    shapesort_term_shapes: "形",
    shapesort_rules_shapes: "円、四角、三角、星、ハート、十字、ひし形、月です。輪郭で見分けます。塗りつぶしたものと輪郭だけのものがありますが、それは補助にすぎません。",
    shapesort_term_levels: "レベル",
    shapesort_rules_levels: "やさしい:4種類を6本の筒で。ふつう:6種類を8本で。むずかしい:8種類を10本で。1本の石の数はこれとは別に選びます。石が多いほど形は小さく、筒は高くなります。幅の狭い画面では筒が何列かに並びます。",
    shapesort_term_tools: "元に戻す・混ぜ直す・ヒント",
    shapesort_rules_tools: "「元に戻す」は何手でも戻せます。「混ぜ直す」は新しい問題を配ります。「ヒント」は2本の筒に印を付けます。1本目の上の石を2本目へ移しましょう。どの問題も解けることを確かめてあります。行き詰まったらヒントがそう伝えるので、何手か戻してください。",
    shapesort_rules_example_title: "例",
    shapesort_rules_example: "絵は遊んでいる途中の筒です。1本目の上の印の付いた石は、いちばん上が同じ形の筒か、空の筒へ移せます。",
    shapesort_history_title: "仕分けパズルの歴史",
    shapesort_history_origins_title: "部品と棒とルール",
    shapesort_history_origins_p1: "決まったルールで部品を入れ物から入れ物へ移すパズルは古くからあります。フランスの数学者エドゥアール・リュカが1883年に発表したハノイの塔では、円盤を1枚ずつ3本の棒の間で移し、大きい円盤を小さい円盤の上に置いてはいけません。",
    shapesort_history_sort_title: "種類ごとに分ける",
    shapesort_history_sort_p1: "近年、混ざった部品を入れ物の間で移して、どの入れ物も1種類だけにするパズルがたくさん登場しました。多くはスマートフォン向けのゲームで、ほとんどが色を使います。白黒の電子ペーパーでは色が使えないので、PaperGamesは形を仕分けます。",
    shapesort_history_modern_title: "PaperGamesの問題の作り方",
    shapesort_history_modern_p1: "ここの問題はランダムに配られます。次に解答プログラムがすべて仕分ける方法を探し、方法が見つかった配り方だけを使います。最初から完成している筒はありません。ヒントも同じ解答プログラムが出します。"
});
I18n.markTextLoaded("ja");
