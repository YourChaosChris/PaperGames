// text/ja/kleeberg.js
// Rules and history texts of kleeberg (ja). Loaded by kleeberg-rules.html and kleeberg-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    kb_rules_title: "Kleeberg ルール",
    kb_rules_intro: "みんなでピラミッドを積み上げ、先に自分の印を3つ一直線に並べましょう。",
    kb_rules_basics_title: "基本",
    kb_term_board: "盤",
    kb_rules_board: "盤は5段・15個の丸いマスのピラミッドで、一番上が1つ、一番下が5つです。一人はハート、もう一人はクローバーを使います。旗が頂上の印です。",
    kb_term_turn: "自分の番",
    kb_rules_turn: "自分の印を空いているマスに1つ置きます。置けるのは埋まった2つのマスの上だけで、真下の2つのマスが両方埋まっていると、そのマスは開きます。一番下の段はいつも開いています。開いているマスには輪が表示されます。タップして選びます。",
    kb_term_win: "勝ち方",
    kb_rules_win: "隣り合うマスで自分の印を最初に3つ一直線に並べた人の勝ちです。線は横、またはピラミッドの2つの斜めのどちらにも引けます。勝ちの線は太く描かれます。",
    kb_term_draw: "引き分け",
    kb_rules_draw: "15個のマスがすべて埋まって誰も3つの線を作れなかったときは、引き分けです。",
    kb_term_start: "先攻",
    kb_rules_start: "先に始める人は、ゲームの最初に抽選で決まります。先手が有利だからです。",
    kb_term_computer: "コンピュータ",
    kb_rules_computer: "コンピュータは、並べられるときは線を完成させます。そうでなければあなたの線を止めます。そうでなければ、あなたが勝てるマスを開けないようにして、残りの開いたマスからでたらめに選びます。",
    kb_term_help: "取り消し",
    kb_rules_help: "「取り消し」で自分の最後の手を戻せます。コンピュータ戦でも使えます。",
    kb_history_title: "Kleebergの歴史",
    kb_history_old_title: "3つ並べ",
    kb_history_old_p1: "二人が交代で駒を置いて3つ並べようとするゲームは、とても昔から各地で遊ばれ、板に刻まれたり紙に描かれたりしてきました。いつどこで始まったのかははっきりしていません。",
    kb_history_version_title: "この版",
    kb_history_version_p1: "Kleebergは私たち独自の考案です。ピラミッドの盤、埋まった2つのマスの上にしか置けないルール、ハートとクローバー、文章はすべて私たちのデザインで、既存のゲームのコピーではありません。"
});
I18n.markTextLoaded("ja");
