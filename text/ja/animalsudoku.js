// text/ja/animalsudoku.js
// Rules and history texts of animalsudoku (ja). Loaded by animalsudoku-rules.html and animalsudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    animalsudoku_rules_title: "動物数独のルール",
    animalsudoku_rules_intro: "子ども向けの小さな数独です。数字のかわりに動物を使い、マスは4x4か6x6だけです。",
    animalsudoku_rules_basics_title: "ルール",
    animalsudoku_term_board: "盤",
    animalsudoku_rules_board: "盤は4x4マスで2x2のブロックが4つ、または6x6マスで2行3列のブロックが6つあります。太い線がブロックを表します。",
    animalsudoku_term_animals: "動物",
    animalsudoku_rules_animals: "4x4では犬、ネコ、ウサギ、ネズミの4種類です。6x6ではフクロウとサカナが加わります。どの動物も各行・各列・各ブロックにちょうど1回ずつ入ります。",
    animalsudoku_term_given: "最初からある動物",
    animalsudoku_rules_given: "いくつかの動物は最初から盤に置かれています。太い枠があり、変えることはできません。",
    animalsudoku_term_input: "遊び方",
    animalsudoku_rules_input: "盤の下のボタンで動物を選び、空いているマスをタップします。同じ動物でもう一度タップすると取り除けます。消しゴムも使えます。同じ動物が行・列・ブロックに2回入ると、両方に点線の枠が付きます。",
    animalsudoku_term_hint: "ヒント",
    animalsudoku_rules_hint: "「ヒント」ボタンは数独と同じように働きます。間違いがあればまずそれを示し、なければ次のマスに印を付け、次に理由を説明し、3回目に動物を置きます。",
    animalsudoku_term_levels: "レベル",
    animalsudoku_rules_levels: "やさしい・ふつう・むずかしいは、最初に置かれている動物の数が違います。どの問題も答えはただ1つで、当てずっぽうなしで解けます。",
    animalsudoku_rules_example_title: "解いた例",
    animalsudoku_rules_example: "絵は解き終えた4x4の盤です。どの行・列・2x2のブロックにも、4種類の動物が1回ずつ入っています。",
    animalsudoku_rules_end_title: "問題を終える",
    animalsudoku_term_win: "完成",
    animalsudoku_rules_win: "すべてのマスに正しい動物が入ると完成です。",
    animalsudoku_history_title: "絵の数独の歴史",
    animalsudoku_history_origins_title: "ラテン方陣から数独へ",
    animalsudoku_history_origins_p1: "どの記号も各行と各列に1回ずつ現れるマス目をラテン方陣といいます。スイスの数学者レオンハルト・オイラーは18世紀にこうした方陣について書きました。",
    animalsudoku_history_origins_p2: "さらにブロックの条件を加えたパズルは、1979年にアメリカのパズル雑誌にNumber Placeという名前で載りました。考えたのはハワード・ガーンズです。日本のニコリが1984年にこれを取り上げ、数独と名付けました。",
    animalsudoku_history_small_title: "小さな盤と絵",
    animalsudoku_history_small_p1: "2000年代半ばに数独が世界中で人気になると、4x4や6x6の小さな版や、数字のかわりに絵を使う版が、特に子ども向けに登場しました。ルールは同じですが、一度に覚えておくことが少なくてすみます。",
    animalsudoku_history_modern_title: "PaperGamesの問題の作り方",
    animalsudoku_history_modern_p1: "ここの問題はすべてPaperGames独自の生成プログラムで作られます。盤全体をランダムに埋めてから動物を1つずつ取り除きますが、答えがただ1つのままで、しかも一番簡単な2つの手順――マスに入る動物が1つだけ、または行・列・ブロックの中で動物の入るマスが1つだけ――で解ける間だけです。"
});
I18n.markTextLoaded("ja");
