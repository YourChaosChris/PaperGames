// text/ja/sternjagd.js
// Rules and history texts of sternjagd (ja). Loaded by sternjagd-rules.html and sternjagd-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    sj_rules_title: "Sternjagd ルール",
    sj_rules_intro: "サイコロ1個で盤の上を追いかけ、相手の星をもらいます。最後まで星が残った人の勝ちです。",
    sj_rules_basics_title: "基本",
    sj_term_board: "盤",
    sj_rules_board: "盤には矢印でつながった12のマスがあります。四隅、辺の上の円4つ、内側の円4つです。どのマスからも矢印が2本出ています。四隅がスタートのマスです。",
    sj_term_turn: "自分の番",
    sj_rules_turn: "サイコロを振り、こまを矢印に沿ってちょうどその歩数だけ進めます。道すじは自分で選べます。そのような道が終わりうるマスには輪が付くので、1つタップします。進めるなら必ず進みますが、出発したマスで止まることはできません。",
    sj_term_catch: "つかまえる",
    sj_rules_catch: "移動が相手のこまのいるマスで終わると、そのこまをつかまえます。相手は星を1つ失い、空いているスタートの角に戻ります。こまの上を通り過ぎるだけなら何も起こりません。",
    sj_term_stars: "星",
    sj_rules_stars: "全員が3つの星で始めます。星がなくなった人は脱落です。",
    sj_term_win: "勝ち",
    sj_rules_win: "最後まで残った人の勝ちです。600手たっても決まらないときは引き分けです。",
    sj_term_start: "先手",
    sj_rules_start: "先手は毎回ゲームの始めにくじで決まります。先に動くことが少し有利だからです。2人のときは、そうしないと先手が10回中およそ7回勝つため、後手が最初の番だけ2回続けて動けます（開始前に「後手への補正」でオフにできます）。",
    sj_term_computer: "コンピュータ",
    sj_rules_computer: "コンピュータは捕まえられるときは必ず捕まえます。そうでなければ、次の番に相手が届きにくいマスを選びます。",
    sj_term_help: "元に戻す",
    sj_rules_help: "「元に戻す」で、コンピュータ相手でも直前の自分の手を戻せます。サイコロの目は出た数のままです。",
    sj_history_title: "Sternjagd の歴史",
    sj_history_old_title: "追いかけっこゲーム",
    sj_history_old_p1: "こまが道の上で互いを追い、サイコロが歩数を決めるゲームは多くの文化にあり、相手のこまをつかまえるルールは子どもたちにも人気です。この種のゲームがいつどこで生まれたのかは、はっきりしません。",
    sj_history_version_title: "この版について",
    sj_history_version_p1: "Sternjagd は、伝統的なサイコロの追いかけっこゲームの形に沿っています。矢印のある星形の盤、3つの星、つかまえるルールは独自の設計で、歴史的な盤を写したものではありません。"
});
I18n.markTextLoaded("ja");
