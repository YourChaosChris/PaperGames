// text/ja/calcudoku.js
// Rules and history texts of calcudoku (ja). Loaded by calcudoku-rules.html and calcudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    sudoku_rules_basics_title: "基本的な考え方",
    sudoku_term_goal: "目標",
    sudoku_term_input: "数字の入力",
    sudoku_rules_end_title: "問題を解き終える",
    sudoku_term_win: "完成",
    sudoku_term_difficulty: "難易度",
    puzzle_rules_hint: "「ヒント」ボタンは3段階で助けます。1回目は次の一手の場所に印を付けます。2回目はその理由、つまりそこで働くルールを示します。3回目でその一手を実行します（数字を入れるか、橋をかけます）。ヒントは今の盤面から考えます。どこかに間違った数字や橋があれば、まずそれを知らせます。当てずっぽうは決してしません。試さないと進めないときは、正直にそう伝えます。ヒントは何回でも使えます。ヒントを使って解いたパズルも普通に勝ちとして数えられ、統計にはそのうちヒントを使った勝ちの数も表示されます。",
    calcudoku_rules_title: "Calcudokuのルール",
    calcudoku_rules_intro: "PaperGamesでのCalcudokuの遊び方をまとめた早見表です。おさらいや初めての方に。",
    calcudoku_term_board: "盤面",
    calcudoku_rules_board: "盤面は4x4から7x7の正方形です。数独と違ってブロックはなく、太線で「ケージ」に分けられています。ケージは隣り合う1〜4マスのまとまりです。",
    calcudoku_rules_goal: "各マスに1から盤面のサイズまでの数字（5x5なら1〜5）を入れ、どの行とどの列にも各数字がちょうど1回ずつ入るようにします。PaperGamesが作るパズルの答えは必ず1通りです。",
    calcudoku_term_regions: "ケージと演算",
    calcudoku_rules_regions: "ケージの左上のマスにある小さな表示が、目標の数と演算を示します。＋や×のケージでは、中の数字を順不同で足すか掛けると目標の数になります。–や÷のケージは必ず2マスで、大きい数から小さい数を引くか、大きい数を小さい数で割ると目標の数になります。1マスだけのケージはその数字そのものを示します。行と列が許す限り、1つのケージに同じ数字が2回入ってもかまいません。",
    calcudoku_rules_input: "マスを選び、盤面の下の数字パッドから数字を選びます（キーボードで入力しても構いません）。白黒反転で表示された数字は、同じ行や列の別の数字と重なっているか、目標の数にならないケージを埋め終えたことを示します。",
    calcudoku_rules_difficulty: "始める前に盤面のサイズと難易度を選びます。盤面が大きく難易度が高いほど、ケージは大きくなり、手がかりの多い1マスのケージは減ります。",
    calcudoku_rules_win: "すべてのマスが埋まり、どの行・列・ケージもルールに反していなければ完成です。",
    calcudoku_history_title: "Calcudokuの歴史",
    calcudoku_history_origins_title: "日本の教室から",
    calcudoku_history_origins_p1: "この種のパズルは一般に、日本の数学教師、宮本哲也氏の考案とされています。2004年ごろ、解き方を教えずに生徒の計算力と論理的思考を鍛えるために作られました。このアイデアはやがてパズル本や新聞を通じて教室の外へ広まりました。",
    calcudoku_history_origins_p2: "計算の下にあるのはラテン方陣、つまりどの記号も各行・各列にちょうど1回ずつ現れる表です。18世紀にはレオンハルト・オイラーら数学者が研究し、数独の中心にもなっています。",
    calcudoku_history_names_title: "名前は違っても同じパズル",
    calcudoku_history_names_p1: "同じ種類のパズルは、KenKenという名前でも商業的に出版されています。KenKenはNextoy LLCの登録商標です。PaperGamesはNextoy LLCとは一切関係がなく、代わりに一般的な名前であるCalcudokuを使っています。",
    calcudoku_history_names_p2: "ここのCalcudokuはすべてお使いの端末で新しく作られます。ランダムなラテン方陣をケージに分け、各ケージに答えが整数になる演算を割り当て、内蔵のソルバーが答えがちょうど1通りになる分け方だけを残します。"
});
I18n.markTextLoaded("ja");
