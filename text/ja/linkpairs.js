// text/ja/linkpairs.js
// Rules and history texts of linkpairs (ja). Loaded by linkpairs-rules.html and linkpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    linkpairs_rules_title: "ペアをつなぐのルール",
    linkpairs_rules_intro: "同じ記号のペアを線でつなぎます。線は交差してはいけません。すべての線で盤全体が埋まります。",
    linkpairs_rules_basics_title: "ルール",
    linkpairs_term_board: "盤",
    linkpairs_rules_board: "マスでできた正方形の盤です。いくつかのマスに記号（数字か動物）があり、どの記号もちょうど2回出てきます。",
    linkpairs_term_lines: "線",
    linkpairs_rules_lines: "それぞれのペアを線でつなぎます。線はマスからマスへ縦か横に進み、斜めには進みません。線は交差できず、同じマスを使えず、ほかの記号を通れません。",
    linkpairs_term_goal: "目標",
    linkpairs_rules_goal: "すべてのペアがつながり、すべてのマスが線で使われたら完成です。どの問題も答えはちょうど1つです。",
    linkpairs_term_draw: "描き方",
    linkpairs_rules_draw: "記号から指でなぞるか、記号をタップしてから順にマスをタップします。ほかの線にぶつかると、その線は短くなります。線のマスをタップすると線はそこで終わり、そのマスから続けて描けます。記号をタップするとその線は最初からになります。線の始まりの記号をタップすると線が消えます。",
    linkpairs_term_symbols: "数字か動物",
    linkpairs_rules_symbols: "メニューで数字か動物を選びます。線のどのマスにも記号の小さな印があるので、色がなくてもどの線がどのペアのものかわかります。",
    linkpairs_term_tools: "元に戻すとヒント",
    linkpairs_rules_tools: "「元に戻す」は何手でも戻せます。「ヒント」は正しい線を1本まるごと描きます。じゃまな線は短くなります。",
    linkpairs_term_levels: "レベル",
    linkpairs_rules_levels: "やさしい：5 x 5。ふつう：7 x 7。むずかしい：9 x 9。",
    linkpairs_rules_example_title: "解いた例",
    linkpairs_rules_example: "絵は解き終わった5×5の問題です。すべてのペアがつながり、線は交差せず、すべてのマスが使われています。",
    linkpairs_history_title: "線つなぎパズルの歴史",
    linkpairs_history_origins_title: "初期の形",
    linkpairs_history_origins_p1: "1897年、このパズルの少し違う形が、ブルックリン・デイリー・イーグル紙のサム・ロイドのコラムに載りました。1917年にはヘンリー・アーネスト・デュードニーが、アルファベットのペアを使った版を著書『Amusements in Mathematics』に自動車ドライバー向けのパズルとして収めました。",
    linkpairs_history_japan_title: "数字と文字",
    linkpairs_history_japan_p1: "日本ではパズル出版社ニコリが、このパズルを文字のペアと数字のペアの2つの形で広めました。パズルの一般的な名前はナンバーリンク（Numberlink）です。答えがちょうど1つで、線がすべてのマスを埋める問題がよい問題とされています。",
    linkpairs_history_modern_title: "PaperGamesの問題の作り方",
    linkpairs_history_modern_p1: "ここの問題はPaperGames独自の生成プログラムで前もって作りました。すべてのマスを通るようにランダムな線を引き、ペアのつなぎ方がちょうど1通りかをソルバーが確かめます。2通り目が見つかれば線を2つのペアに分け、端どうしが接する線は答えが1つのままである限り再びつなげます。"
});
I18n.markTextLoaded("ja");
