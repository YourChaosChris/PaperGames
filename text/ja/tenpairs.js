// text/ja/tenpairs.js
// Rules and history texts of tenpairs (ja). Loaded by tenpairs-rules.html and tenpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    tp_rules_title: "10になるペアのルール",
    tp_rules_intro: "数字のペアを消していき、最後に1つも残らないようにします。",
    tp_rules_basics_title: "ルール",
    tp_term_field: "盤",
    tp_rules_field: "1から9の数字が9列に並び、文章のように1行ずつ読みます。",
    tp_term_pairs: "ペア",
    tp_rules_pairs: "2つの数字は、同じ数（3と3）か合わせて10（1と9、2と8、3と7、4と6、5と5）のとき、一緒に消せます。",
    tp_term_see: "互いに見える",
    tp_rules_see: "2つは互いに見えていなければなりません。横・縦・斜めですぐ隣にあるか、その線上で間に消したマスしかないこと。横は行の終わりもまたぎます。ある行の最後の数字は次の行の最初の数字が見え、以下読む順に続きます。",
    tp_term_add: "書き足し",
    tp_rules_add: "手詰まりになったら「書き足し」をタップします。まだ消していない数字がすべて同じ順に盤の最後に書かれます。1ゲームで最大5回です。",
    tp_term_rows: "空の行",
    tp_rules_rows: "9マスすべてを消した行は消えます。",
    tp_term_end: "勝ちと負け",
    tp_rules_end: "すべての数字を消せば勝ちです。ペアも書き足しも残っていないとき、または盤が40行を超えたときは負けです。",
    tp_term_start: "スタート",
    tp_rules_start: "クラシック：1 2 3 4 5 6 7 8 9、続いて1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9（10を除く1から19までの数）。ランダム：3、4、5行。レベルがやさしいほど、隣り合うペアが多くなります。",
    tp_term_help: "ヘルプ",
    tp_rules_help: "「元に戻す」は何手でも戻れます。「ヒント」は消せるペアに印をつけるか、書き足すしかないことを教えます。",
    tp_rules_example_title: "例",
    tp_rules_example: "クラシックスタートです。左上の1とその下の1は縦に見えていて、同じ数です。1行目の最後の9と2行目の最初の1は行の終わりをまたいで見えていて、合わせて10になります。",
    tp_history_title: "10になるペアの歴史",
    tp_history_origins_title: "学校のノートから",
    tp_history_origins_p1: "このパズルの起源は、PaperGamesが確認できた資料には記録されていません。ロシアのサイトHabrの2011年の記事は、学校や大学で遊んだことを回想しています。方眼のノートで遊び、「数」「数字」「ひまわりの種」「19」などと呼ばれ、正式な名前はありませんでした。そこでは10を除く1から19までの数を並べて書いて始めます（ここでのクラシックスタートと同じ数字）。ペアがなくなったら残りの数字を最後に書き写します。",
    tp_history_name_title: "名前",
    tp_history_name_p1: "「10になるペア」は、内容をそのまま表した名前です。同じアイデアのアプリはいくつかありますが、それぞれ独自の名前で、PaperGamesはそれらを使いません。斜めのペア、書き足し5回と40行の上限はPaperGamesのルールです。"
});
I18n.markTextLoaded("ja");
