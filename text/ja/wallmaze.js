// text/ja/wallmaze.js
// Rules and history texts of wallmaze (ja). Loaded by wallmaze-rules.html and wallmaze-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    wallmaze_rules_title: "壁の迷路のルール",
    wallmaze_rules_intro: "PaperGamesにおける壁の迷路の遊び方のクイックリファレンス - ルールを忘れた人にも、これから学ぶ人にも役立つ。",
    wallmaze_rules_basics_title: "基本的な考え方",
    wallmaze_term_setup: "初期配置",
    wallmaze_rules_setup: "各プレイヤーは9×9の盤の自陣の辺の中央から始まる駒を1つと、手持ちの壁を10枚持ちます。プレイヤー1は盤の下端の列を、プレイヤー2は上端の列を目指し、先に自分の駒をそこへ到達させた方が勝ちです。",
    wallmaze_term_moving: "駒を動かす",
    wallmaze_rules_moving: "手番では、自分の駒を上下左右いずれかに1マス動かすか、壁を1枚置きます。2つの駒が隣接している場合、相手の駒をまっすぐ飛び越えることができます。壁や盤の端に阻まれてその飛び越えができない場合は、代わりに斜めに回り込むことができます。",
    wallmaze_term_walls: "壁を置く",
    wallmaze_rules_walls: "壁は2マス分の長さがあり、両プレイヤーにとって、そこをまっすぐ横切る動きを塞ぎます。壁同士が重なったり交差したりすることは決してできず、また、どちらかのプレイヤーがゴールの列へ至る最後の経路を完全に塞いでしまうような場所には壁を置けません。常に少なくとも1つの通り道が残ります。",
    wallmaze_rules_end_title: "勝利条件",
    wallmaze_term_win: "ゲームの終わり方",
    wallmaze_rules_win: "プレイヤーの駒がゴールの列のどのマスかに到達した瞬間に勝利です。どの列に到達したかは関係ありません。",
    wallmaze_history_title: "壁の迷路の歴史",
    wallmaze_history_origins_title: "壁と道のゲーム",
    wallmaze_history_origins_p1: "遊びながら盤の形を変えていく競走ゲームは、抽象戦略ゲームの古くからあるアイデアです。前に進むだけでなく、1手を使って相手の行く手に障害物を置くこともできます。",
    wallmaze_history_origins_p2: "このゲームは、より広い「ブロッキング迷路」ゲームの一族に属しています。このジャンルでは、チェス盤のように盤面が固定されているのではなく、対局が進むにつれて盤そのものの形が変化していきます。プレイヤーが置く壁の一枚一枚が、その後の対局を通じて両方の駒が通れる経路を恒久的に作り変えていくのです。",
    wallmaze_history_design_title: "シンプルなルール、本物の奥深さ",
    wallmaze_history_design_p1: "ルール全体はカード1枚に収まってしまうほどシンプルです。駒を動かすか壁を置くか、反対側に着いたら勝ち。それだけです。それでも、先に進むことと、手番を使って相手を妨害することの間の緊張関係が、本物の戦略的な奥深さを生み出しています。",
    wallmaze_history_design_p2: "こうしたゲームは、コンピュータープログラムのよい練習問題にもなります。局面の数はとても多いものの、どの局面も簡単に表せます（2つの駒、盤上の壁、そして道を必ず1本は残すというルール）。PaperGamesのコンピューター対戦相手は、主にそれぞれの駒がゴールまであと何歩必要かを比べて局面を判断します。",
    wallmaze_history_names_title: "別の名前を使う理由",
    wallmaze_history_names_p1: "同じ遊び方のゲームは、Quoridorという名前でも販売されています。QuoridorはGigamicの登録商標です。PaperGamesはGigamicともそのゲームとも関係がないため、壁の迷路という独自の名前を使っています。",
    wallmaze_history_version_title: "このバージョンについて",
    wallmaze_history_version_p1: "PaperGamesでは、9×9の盤で、1人あたり10枚の壁を使って遊びます。壁を置く操作はそれ専用の小さなモードになっています。「壁を置く」をタップし、盤上のどこかをタップすると、そこに置ける一番近い合法な壁が表示され、確定できます。正確な場所を狙わなくてもよい、タッチスクリーンにやさしい仕様です。"
});
I18n.markTextLoaded("ja");
