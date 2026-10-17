// text/ja/dotsandboxes.js
// Rules and history texts of dotsandboxes (ja). Loaded by dotsandboxes-rules.html and dotsandboxes-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    dotsandboxes_rules_title: "点と箱のルール",
    dotsandboxes_rules_intro: "PaperGamesでの点と箱の遊び方の簡単なまとめです。久しぶりの人にも、これから覚える人にも役立ちます。",
    dotsandboxes_rules_basics_title: "基本のアイデア",
    dotsandboxes_term_board: "盤面と線を引くこと",
    dotsandboxes_rules_board: "対局の前に盤を選びます：4x4、5x5、6x6、8x8の箱（点は5x5、6x6、7x7、9x9）で、初期設定は6x6です。自分の手番では、隣り合う2つの点をつなぐ線を1本 - 水平または垂直に - 引きます。プレイヤー1の線は実線、プレイヤー2の線は点線で描かれます。プレイヤー1が常に先手です。",
    dotsandboxes_term_completing: "箱を完成させる",
    dotsandboxes_rules_completing: "引いた線が箱の4番目で最後の辺になった場合、その箱はあなたのものになります。あなたの印（プレイヤー1は×、プレイヤー2は○）が付き、得点に加えられます。1本の線が両方の箱にとって最後の1辺であれば、一度に2つの箱を完成させることもできます。",
    dotsandboxes_term_extra_turn: "追加の手番",
    dotsandboxes_rules_extra_turn: "少なくとも1つの箱を完成させると、すぐにもう一度手番が回ってきます。これは連鎖することがあります。次の線でさらに箱を完成させれば、また手番が続きます。箱を何も完成させない線を引いたときに初めて、手番が相手に移ります。",
    dotsandboxes_rules_end_title: "ゲームの終わり方",
    dotsandboxes_term_win: "勝利",
    dotsandboxes_rules_win: "盤面のすべての線が引かれるとゲームは終了します（このときすべての箱に持ち主がいます：16個、25個、36個、または64個）。箱をより多く持っているプレイヤーの勝ちです。",
    dotsandboxes_term_draw: "引き分け",
    dotsandboxes_rules_draw: "両プレイヤーの箱の数が同じであれば、引き分けになります。5x5の盤（箱は25個で奇数）では引き分けは起こりません。",
    dotsandboxes_term_resignation: "投了",
    dotsandboxes_rules_resignation: "プレイヤーはいつでも投了でき、その場合ただちに相手の勝ちでゲームが終了します。",
    dotsandboxes_history_title: "点と箱の歴史",
    dotsandboxes_history_origins_title: "19世紀フランスのパズル",
    dotsandboxes_history_origins_p1: "点と箱は1880年代に、フランスの数学者エドゥアール・リュカによって初めて文章で紹介されました。リュカは今日では数論の研究(リュカ数を含む)やハノイの塔パズルの考案者として知られています。リュカはこのゲームをフランス語で「la pipopipette」と呼んでいました。",
    dotsandboxes_history_origins_p2: "鉛筆と点のグリッドさえあればできるこのゲームは、多くの紙とペンのゲームと同じように、誰かが商標登録や製品化を考えるよりずっと前から、教室やノートを通じて非公式に広まっていきました。",
    dotsandboxes_history_spread_title: "「Dots and Boxes」と呼ばれるようになるまで",
    dotsandboxes_history_spread_p1: "英語圏では、このゲームは単に「Dots and Boxes」として知られるようになりました。これは今日の多くのプレイヤーが知っている名前ですが、その記録に残る歴史は19世紀のリュカによるフランス語の記述にまでさかのぼります。",
    dotsandboxes_history_modern_title: "ゲーム理論における真剣な研究対象",
    dotsandboxes_history_modern_p1: "そのシンプルさにもかかわらず、点と箱には驚くほど奥深い戦略があることが分かり、組合せゲーム理論のお気に入りの研究対象となりました。数学者エルウィン・バーレカンプは、ジョン・コンウェイやリチャード・ガイとともに執筆した画期的な著作『Winning Ways for Your Mathematical Plays』の中で、この終盤戦を正式に分析し、「ダブルクロス戦略」や「ロングチェーン・ルール」を示しました。これは、熟練したプレイヤーが連鎖の最後でわざといくつかの箱を犠牲にし、次の連鎖を開かざるを得ない相手を決める主導権を保つという考え方です。",
    dotsandboxes_history_modern_p2: "バーレカンプは後に、このゲームだけを扱った一冊の本『The Dots and Boxes Game: Sophisticated Child's Play』を著し、子どもでも1分で覚えられるほど単純なゲームの裏に、いかに多くの戦略的な奥深さが隠れているかを説明しました。"
});
I18n.markTextLoaded("ja");
