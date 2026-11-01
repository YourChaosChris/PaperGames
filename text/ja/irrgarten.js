// text/ja/irrgarten.js
// Rules and history texts of irrgarten (ja). Loaded by irrgarten-rules.html and irrgarten-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    ig_rules_title: "迷路のルール",
    ig_rules_intro: "マスと壁でできた四角い迷路です。スタートからゴールまでの道を見つけよう。",
    ig_rules_basics_title: "ルール",
    ig_term_move: "進み方",
    ig_rules_move: "左上の丸があるマスから始めます。ゴールは右下の旗です。隣のマスをタップすると進みます。まっすぐで開いた道なら、先のマスをタップして一気に進めます。通った道は太い線で表示されます。",
    ig_term_draw: "指でなぞる",
    ig_rules_draw: "設定で「指でなぞる」を選べます。道に沿って指を動かすと、丸がマスごとについてきます。タップでも進めます。",
    ig_term_walls: "壁と戻り方",
    ig_rules_walls: "壁は通れません。短いお知らせが表示されます。来たマスに戻ると、そのマスは道から消えます。自分の道のマスをタップすると、そこまで戻れます。",
    ig_term_goal: "ゴール",
    ig_rules_goal: "旗に着くと迷路クリアです。どの迷路にもスタートからゴールまでの道は1つだけです。",
    ig_term_levels: "レベル",
    ig_rules_levels: "かんたん（子ども向け）：6 x 6マス、広い道。ふつう：10 x 10。むずかしい：15 x 15。とてもむずかしい：20 x 20。各レベルに迷路が5つあり、順番に遊びます。固定の数をもとにプログラムが作るので、毎回同じ迷路です。",
    ig_term_help: "戻るとヒント",
    ig_rules_help: "「戻る」は1マス戻ります。「ヒント」は正しい道の次の3マスを点線の輪で示します。行き止まりでも使えます。",
    ig_history_title: "迷路の歴史",
    ig_history_old_title: "とても古い模様",
    ig_history_old_p1: "中心へ続く曲がりくねった模様は、昔の多くの文化の石やコイン、床に見つかります。道が1つで分かれ道のないものが多く、行き止まりのあるパズルは後に登場しました。",
    ig_history_puzzle_title: "生け垣とパズル本",
    ig_history_puzzle_p1: "16世紀ごろから、庭に生け垣の迷路が作られ、訪れた人が迷うこともありました。19〜20世紀には紙の迷路が子ども向け雑誌やパズル本の定番になりました。数学ではグラフとして表され、コンピューターは新しい迷路をいくらでも作れます。",
    ig_history_here_title: "このゲーム",
    ig_history_here_p1: "ここにある迷路はすべてプログラムが作ります。マス目を進み、すべてのマスに行けるまで壁を取り除きます。本から写した迷路はありません。"
});
I18n.markTextLoaded("ja");
