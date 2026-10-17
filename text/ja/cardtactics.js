// text/ja/cardtactics.js
// Rules and history texts of cardtactics (ja). Loaded by cardtactics-rules.html and cardtactics-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    cardtactics_rules_title: "カード戦術のルール",
    cardtactics_rules_intro: "PaperGamesでのこのカード主導の対戦ゲームの遊び方を簡単にまとめました。ルールを思い出したいときにも、これから覚えるときにもどうぞ。",
    cardtactics_rules_basics_title: "基本的な考え方",
    cardtactics_term_setup: "初期配置",
    cardtactics_rules_setup: "各陣営は自陣の列に4体の弟子（パウン）と1体の師範（マスター）を並べてスタートします。師範は中央のマスに立ちます。5枚の移動カードが共有のデッキからランダムに配られ、各プレイヤーに2枚ずつ、残る1枚は予備として中央に表向きで置かれます。",
    cardtactics_term_cards: "移動カード",
    cardtactics_rules_cards: "それぞれのカードには、自分のどの駒でも、今いる場所からできる少数の相対的な動きが示されています。弟子でも師範でも同じカードが使えます。カードを無視できる駒はなく、その手番にできる動きは、カードが許すものだけです。",
    cardtactics_term_moving: "手を打つ",
    cardtactics_rules_moving: "手番では、自分の持つ2枚のカードのうち1枚を選び、次に自分の駒を1つ選び、そのカードで許されるマスへ動かします。そこに相手の駒があれば取ります。使ったカードは中央へ移り、それまで中央にあったカードが代わりに自分の手札に加わります。こうして5枚のカードは対局を通じて両者の間を回り続けます。",
    cardtactics_rules_end_title: "勝利条件",
    cardtactics_term_win: "2通りの勝ち方",
    cardtactics_rules_win: "相手の師範を取るか、自分の師範を相手陣の祠（相手の最後列の中央マス）まで進めれば勝ちです。どちらか一方を達成した時点で、即座にゲームは終了します。",
    cardtactics_history_title: "カードで駒を動かす対戦ゲームの歴史",
    cardtactics_history_origins_title: "カードが動きを決めるチェスバリアント",
    cardtactics_history_origins_p1: "駒固定の動きを何か別の仕組みに置き換えるチェスバリアントは古くから存在しますが、入れ替え可能な少数の「移動カード」を中心に据えて特別に設計されたゲームは、2010年代に盛んになったデザイン重視のテーブルトップ抽象ゲームの流れから生まれた、比較的新しい発明です。",
    cardtactics_history_origins_p2: "核となるアイデアは言葉にすればシンプルですが、驚くほど奥深いプレイを生み出します。両プレイヤーの手札が中央の共有カードを介して重なり合っているため、自分が手を打つたびに、次の手番で相手に新たな選択肢を与えてしまいます。数手先を読むには、駒の位置だけでなく、どのカードがどこへ回っていくかも追わなければなりません。",
    cardtactics_history_design_title: "小さな盤、奥深いゲーム",
    cardtactics_history_design_p1: "片側5枚の駒だけを使うコンパクトな5×5の盤で行われるこのゲームは、たいてい数分で決着がつくため、2人用のゲーム会や旅行用セットとして人気を集めました。小さな盤面の中に、本格的な読み合いが凝縮されています。",
    cardtactics_history_design_p2: "相手の師範を取るか、自分の師範を相手陣の祠まで進めるかという2つの勝利条件があることで、攻撃と、純粋に位置取りだけで進める「競走」的なプランの両方が常に生きています。そのため、駒の数で大きく劣っていても、祠への突破さえ決まれば一気に逆転勝ちすることもあります。",
    cardtactics_history_version_title: "このバージョンについて",
    cardtactics_history_version_p1: "PaperGamesでは、特定のメーカーのカードセットをそのまま再現するのではなく、独自の16種類の移動カードとそれぞれの元素の名前を用いて、このカード主導の移動の仕組みを実装しています。配る・回す・勝敗を決めるという基本ルールは共通ですが、ここで目にする実際のカードはこのアプリだけのオリジナルです。"
});
I18n.markTextLoaded("ja");
