// text/ja/killersudoku.js
// Rules and history texts of killersudoku (ja). Loaded by killersudoku-rules.html and killersudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    sudoku_rules_basics_title: "基本的な考え方",
    sudoku_term_goal: "目標",
    sudoku_term_input: "数字の入力",
    sudoku_rules_end_title: "問題を解き終える",
    sudoku_term_win: "完成",
    sudoku_term_difficulty: "難易度",
    puzzle_rules_hint: "「ヒント」ボタンは3段階で助けます。1回目は次の一手の場所に印を付けます。2回目はその理由、つまりそこで働くルールを示します。3回目でその一手を実行します（数字を入れるか、橋をかけます）。ヒントは今の盤面から考えます。どこかに間違った数字や橋があれば、まずそれを知らせます。当てずっぽうは決してしません。試さないと進めないときは、正直にそう伝えます。ヒントは何回でも使えます。ヒントを使って解いたパズルも普通に勝ちとして数えられ、統計にはそのうちヒントを使った勝ちの数も表示されます。",
    killersudoku_rules_title: "サムナンプレのルール",
    killersudoku_rules_intro: "PaperGamesでのサムナンプレの遊び方をまとめた早見表です。おさらいや初めての方に。",
    killersudoku_term_board: "盤面",
    killersudoku_rules_board: "数独と同じく、9x9の盤面は太線で9つの3x3ブロックに分けられています。さらに点線で1〜5マスのケージに分けられています。最初から入っている数字はわずか、またはありません。",
    killersudoku_rules_goal: "各マスに1〜9の数字を入れ、どの行、どの列、どの3x3ブロックにも各数字がちょうど1回ずつ入るようにします。PaperGamesが作るパズルの答えは必ず1通りです。",
    killersudoku_term_regions: "ケージ",
    killersudoku_rules_regions: "ケージの左上のマスにある小さな数がその合計です。ケージ内の数字を足すとその数になります。Calcudokuと違い、ケージの中で同じ数字を繰り返すことはできません。",
    killersudoku_rules_input: "マスを選び、盤面の下の数字パッドから数字を選びます（キーボードで入力しても構いません）。白黒反転で表示された数字は、同じ行・列・ブロック・ケージに重なりがあるか、合計の合わないケージを埋め終えたことを示します。",
    killersudoku_rules_difficulty: "やさしいパズルは小さなケージが中心で、最初から入っている数字が少し多めです。むずかしいパズルはケージが大きく、答えを1通りにするのに必要な数字だけで、ほとんどないこともよくあります。",
    killersudoku_rules_win: "すべてのマスが埋まり、どの行・列・ブロック・ケージもルールに反していなければ完成です。",
    killersudoku_history_title: "サムナンプレの歴史",
    killersudoku_history_origins_title: "ナンプレの盤面に合計を",
    killersudoku_history_origins_p1: "数独のルールとケージの合計を組み合わせたパズルは、カックロのような合計パズルが人気だった日本で、1990年代にはすでに掲載されていました。2005年、世界的な数独ブームのさなかにイギリスの新聞がKiller Sudokuという名前で掲載し始めたことで、このアイデアは広く知られるようになりました。",
    killersudoku_history_origins_p2: "この名前は商標ではなく説明的なものです。「キラー」は、最初の数字がほとんどないため普通の数独より手ごわい、という意味を込めたにすぎません。",
    killersudoku_history_names_title: "ここでのパズルの作り方",
    killersudoku_history_names_p1: "ここのキラー数独はすべて、新しく作った完全に解けた数独の盤面から始まり、どのケージにも同じ数字が入らないように、つながったケージに分けられます。",
    killersudoku_history_names_p2: "次に内蔵のソルバーが、ケージの合計だけで答えが1通りに決まるかを調べます。決まらなければ、2つの答えが食い違うマスの数字を1つ公開し、答えがちょうど1通りになるまで確認を繰り返します。"
});
I18n.markTextLoaded("ja");
