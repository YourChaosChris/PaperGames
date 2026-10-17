// text/ja/gomoku.js
// Rules and history texts of gomoku (ja). Loaded by gomoku-rules.html and gomoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    gomoku_rules_title: "五目並べのルール",
    gomoku_rules_intro: "PaperGamesでの五目並べの遊び方を簡単にまとめました。ルールを思い出したいときにも、これから覚えるときにもどうぞ。",
    gomoku_rules_basics_title: "基本的な考え方",
    gomoku_term_board: "盤面と石の置き方",
    gomoku_rules_board: "囲碁とまったく同じように、15×15の盤の交点に石を置いていきます。一度置いた石は動かさず、取られることもありません。黒が常に先手です。",
    gomoku_rules_end_title: "ゲームの終わり方",
    gomoku_term_win: "勝利条件",
    gomoku_rules_win: "自分の石を縦・横・斜めのいずれかに5つ以上途切れることなく並べた時点で、即座に勝利となります。",
    gomoku_term_draw: "引き分け",
    gomoku_rules_draw: "盤面が完全に埋まっても、どちらの側も5つを並べられなかった場合は引き分けです。",
    gomoku_term_resignation: "投了",
    gomoku_rules_resignation: "プレイヤーはいつでも投了でき、その時点で相手の勝ちとなり対局が終了します。",
    gomoku_history_title: "五目並べの歴史",
    gomoku_history_origins_title: "古くからのルーツ、現代の名前",
    gomoku_history_origins_p1: "盤上に石を並べていくゲームは東アジア各地で何世紀にもわたって存在してきましたが、現在「五目並べ」として知られる具体的なルールは日本で形作られました。その名前が示す通り、「5つの目（点）を並べる」という意味です。",
    gomoku_history_origins_p2: "伝統的には囲碁と同じ黒白の石と交点の盤を使って遊ばれ、道具を新たに用意する必要がないことから、多くの囲碁愛好家が息抜きの一局として気軽に楽しんできました。",
    gomoku_history_spread_title: "気軽な遊びから連珠へ",
    gomoku_history_spread_p1: "五目並べの単純なルールでは、先手（伝統的には黒）が大きく有利になってしまいます。そこで20世紀初頭の日本で、より厳格な競技用ルール「連珠」が生まれました。黒に対して特定の「三々」や「四々」といった禁じ手を設けることで、公平さを保っています。",
    gomoku_history_spread_p2: "連珠は本格的なトーナメントの標準ルールとなった一方で、ここで採用されているようなシンプルで制限のないルール（しばしば「自由五目」と呼ばれます）は、世界中でより一般的なカジュアル向けのバージョンであり続けました。",
    gomoku_history_modern_title: "解明された先手必勝",
    gomoku_history_modern_p1: "1994年、研究者のL・ヴィクター・アリスは、「証明数探索」と呼ばれる手法による徹底的なコンピューター解析によって、標準的な盤での自由五目は双方が最善を尽くした場合、先手の必勝であることを証明しました。",
    gomoku_history_modern_p2: "この結果こそが、競技用の連珠が存在する理由そのものです。黒に対する追加の制限がなければ、トーナメントの五目並べは真剣勝負ではなく解明済みの形式に過ぎなくなってしまいます。解明されたゲームが、単なる豆知識にとどまらず、実際の競技のあり方そのものを直接変えてしまった珍しい例と言えるでしょう。"
});
I18n.markTextLoaded("ja");
