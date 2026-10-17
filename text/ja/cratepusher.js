// text/ja/cratepusher.js
// Rules and history texts of cratepusher (ja). Loaded by cratepusher-rules.html and cratepusher-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    sudoku_rules_basics_title: "基本的な考え方",
    cratepusher_rules_title: "箱押しのルール",
    cratepusher_rules_intro: "PaperGamesの箱押しの遊び方。小さな倉庫で箱を動かす、1人用のパズルです。",
    cratepusher_term_board: "盤面",
    cratepusher_rules_board: "壁（黒一色）と床（白）でできた長方形のマス目です。床の上にはあなた（塗りつぶした円）、いくつかの箱（×印の入った四角）、そして箱と同じ数のゴール（小さな白抜きの四角）があります。ゴールに乗った箱は塗りつぶした四角になります。",
    cratepusher_term_move: "移動",
    cratepusher_rules_move: "上下左右に1マスずつ動きます。斜めには動けません。壁や箱は通り抜けられません。",
    cratepusher_rules_move_targets: "空いている目標マスの上は歩けます。進路をふさぐのは壁と箱だけです。",
    cratepusher_rules_hint: "「ヒント」は押す手を1つだけ示します。今の局面からの最短解の最初の1手です。押す箱には破線の枠、箱を運ぶマスには実線の枠が付き、盤の下に行・列・方向が文で表示されます（外側の壁は数えません）。ヒントは手を示すだけで、押すのは自分です。次の手が知りたければ、もう一度「ヒント」を押してください。今の局面から解がもうない場合は、そう表示されます。ヒントは保存されず、統計にも影響しません。",
    cratepusher_term_push: "押す",
    cratepusher_rules_push: "箱に向かって進むと箱を1マス押せますが、箱の向こうのマスが空いている（壁も別の箱もない）ときだけです。一度に押せる箱は1つだけで、箱を自分のほうへ引くことは決してできません。",
    cratepusher_term_goal: "目的",
    cratepusher_rules_goal: "すべての箱がゴールに乗った時点でクリアです。どの箱がどのゴールに乗ってもかまいません。",
    cratepusher_term_stuck: "詰み",
    cratepusher_rules_stuck: "箱は引けないので、うっかり押すとレベルが解けなくなることがあります。たとえばゴールではない角に箱を押し込んだ場合です。そのような角に箱がはまるとゲームが知らせます。ほかの行き詰まりは知らせないので、先を読み、「1手戻す」を好きなだけ使ってください。",
    cratepusher_term_controls: "操作",
    cratepusher_rules_controls: "隣のマスをタップするとそこへ進みます（そこにある箱は押されます）。離れた床のマスをタップすると最短の道でそこまで歩きますが、箱を押さずに行ける場合だけです。矢印キーとW・A・S・Dでも動けます。「1手戻す」は手を1つずつ好きなだけ戻し、「レベルをやり直す」はレベルを最初から始めます。",
    cratepusher_term_levels: "レベル",
    cratepusher_rules_levels: "どのレベルもPaperGamesが毎回新しく作ります。やさしいは7x7に箱3個、ふつうは9x9に4個、むずかしいは10x10に5個です。プログラムは解けた状態から逆向きにレベルを組み立てるので必ず解けます。さらに独自のソルバーでもう一度確認します。最短解の押し回数が盤面の上に、あなたの歩数・押した回数・ゴール上の箱の数と一緒に表示されます。",
    cratepusher_history_title: "箱押しの歴史",
    cratepusher_history_origins_title: "1981年のアイデア",
    cratepusher_history_origins_p1: "箱を1つずつ決められた場所へ押し、決して引かないという仕組みは、1981年に今林宏行によって考案されました。1982年、日本の会社シンキングラビットがこれをSokobanという名前のコンピューターゲームとして発売しました。",
    cratepusher_history_origins_p2: "単純なルールの裏には本物の奥深さがあります。小さな部屋でも長く慎重に計画した手順が必要になることがあり、計算機科学者はこの種のパズルを一般に解くのが非常に難しいことを示しています。その後このアイデアは数えきれないパズルゲームに取り入れられました。",
    cratepusher_history_names_title: "別の名前を使う理由",
    cratepusher_history_names_p1: "SokobanはFalcon Co., Ltd.の登録商標です。PaperGamesはFalconとも元のゲームとも関係がないため、独自の名前「箱押し」を使っています。同じ理由で独自の名前で遊べるCalcudokuと同じ扱いです。",
    cratepusher_history_names_p2: "ここにあるレベルは、元のゲームやレベル集から取ったものは1つもありません。すべてのレベルは、あなたが求めたときにPaperGames独自のプログラムが作ります。解けた状態から逆向きに組み立て、独自のソルバーで確認しています。"
});
I18n.markTextLoaded("ja");
