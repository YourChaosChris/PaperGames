// text/ja/noneighbors.js
// Rules and history texts of noneighbors (ja). Loaded by noneighbors-rules.html and noneighbors-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    sudoku_rules_basics_title: "基本的な考え方",
    sudoku_term_goal: "目標",
    sudoku_term_input: "数字の入力",
    sudoku_rules_end_title: "問題を解き終える",
    sudoku_term_win: "完成",
    sudoku_term_difficulty: "難易度",
    puzzle_rules_hint: "「ヒント」ボタンは3段階で助けます。1回目は次の一手の場所に印を付けます。2回目はその理由、つまりそこで働くルールを示します。3回目でその一手を実行します（数字を入れるか、橋をかけます）。ヒントは今の盤面から考えます。どこかに間違った数字や橋があれば、まずそれを知らせます。当てずっぽうは決してしません。試さないと進めないときは、正直にそう伝えます。ヒントは何回でも使えます。ヒントを使って解いたパズルも普通に勝ちとして数えられ、統計にはそのうちヒントを使った勝ちの数も表示されます。",
    numberblocks_rules_title: "となりなしのルール",
    numberblocks_rules_intro: "PaperGamesでのとなりなしの遊び方をまとめた早見表です。おさらいや初めての方に。",
    numberblocks_term_board: "盤面",
    numberblocks_rules_board: "盤面は太線で1〜5マスのブロックに分けられています。最初から数字が入っているマス（太字）は変更できません。",
    numberblocks_rules_goal: "nマスのブロックに1からnまでの数字がちょうど1回ずつ入るように、空いているマスを埋めます。3マスのブロックなら1、2、3が入ります。PaperGamesが作るパズルの答えは必ず1通りです。",
    numberblocks_term_regions: "接触のルール",
    numberblocks_rules_regions: "同じ数字どうしは決して接してはいけません。左右にも上下にも斜めにも並べられません。数字の周りの最大8マスには、別のブロックであっても同じ数字を入れられません。",
    numberblocks_rules_input: "マスを選び、盤面の下の数字パッドから数字を選びます（キーボードで入力しても構いません）。数字がブロック内で重なっている、ブロックに対して大きすぎる、または同じ数字と接しているときは、関係するすべてのマスの数字が白黒反転で表示されます。",
    numberblocks_rules_difficulty: "やさしいは6x6、ふつうは7x7、むずかしいは8x8の盤面で、段階が上がるごとに最初から入っている数字が減ります。",
    numberblocks_rules_win: "すべてのマスが埋まり、ブロックのルールにも接触のルールにも反していなければ完成です。",
    numberblocks_history_title: "となりなしの歴史",
    numberblocks_history_origins_title: "ある考案者のパズル",
    numberblocks_history_origins_p1: "となりなしは日本のパズル作家、稲葉直貴氏が考案し、2001年に発表しました。稲葉氏は非常に多くの論理パズルを生み出しており、その多くはひとつの明快なルールから驚くほど深い推理が生まれるものです。",
    numberblocks_history_origins_p2: "このパズルは2つのよく知られた考えを組み合わせています。数独のブロックのように決まった数字の組を入れる領域と、チェスのキングの動きにならった近所のルールです。キングが進めるマスには同じ数字を置けません。",
    numberblocks_history_names_title: "ほかの名前で",
    numberblocks_history_names_p1: "このパズルはSuguruやTectonicの名でも知られています。いずれも領域と隣接に関する同じルールです。",
    numberblocks_history_names_p2: "ここのパズルはすべてお使いの端末で新しく作られます。ブロックと正しい答えを1マスずつ一緒に組み立て、内蔵のソルバーが答えをちょうど1通り見つけられる限り、数字を1つずつ取り除いていきます。"
});
I18n.markTextLoaded("ja");
