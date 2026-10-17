// text/ja/amazons.js
// Rules and history texts of amazons (ja). Loaded by amazons-rules.html and amazons-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    amazons_rules_title: "アマゾンのルール",
    amazons_rules_intro: "PaperGamesにおける「アマゾンのゲーム」のプレイ方法の簡単な参考資料です。ルールを忘れてしまった方にも、これから学ぶ方にも便利です。",
    amazons_rules_basics_title: "基本的な考え方",
    amazons_term_setup: "初期配置",
    amazons_rules_setup: "各プレイヤーは10x10の盤上に4体のアマゾンを持ち、標準的な対称の初期位置に配置されます。このゲームには捕獲が一切ありません - 勝敗は移動と陣地の確保だけで決まります。",
    amazons_term_moving: "アマゾンを動かす",
    amazons_rules_moving: "手番では、自分のアマゾンの1体を、空いているマスならいくつでも直線上に動かせます - 水平、垂直、斜めのいずれかに、チェスのクイーンとまったく同じように。他のアマゾンや燃えたマスを飛び越えることはできません。",
    amazons_term_shooting: "矢を放つ",
    amazons_rules_shooting: "移動した直後、そのアマゾンは新しい位置から矢を放たなければなりません。これもクイーンと同じ動き方で、8方向のいずれかに、空いているマスだけを通り、空いているマスに着地します。",
    amazons_term_burned: "燃えたマス",
    amazons_rules_burned: "矢が着地した場所は、そのゲームが終わるまで燃えたマスとなります - 二度とどのアマゾンも、どんな矢も通過したり着地したりできない、永久に通行不能な地形です。",
    amazons_rules_end_title: "勝利条件",
    amazons_term_win: "ゲームの終わり方",
    amazons_rules_win: "自分の手番で、自分のどのアマゾンにも合法手が1つも残っていない場合 - 他のアマゾン、燃えたマス、盤の端によってあらゆる方向を塞がれている場合 - あなたの負けです。最後まで動けたプレイヤーが勝ちます。",
    amazons_history_title: "アマゾンのゲームの歴史",
    amazons_history_origins_title: "1988年に考案",
    amazons_history_origins_p1: "アマゾンのゲームは1988年、アルゼンチンのゲームデザイナーであるワルテル・サムカウスカスによって考案され、アルゼンチンのパズル雑誌『エル・アセルティホ』(スペイン語で発行)に最初に掲載されました。",
    amazons_history_origins_p2: "クイーンのように動く駒はチェスを思わせますが、各手番の後半にあたる矢を放つ動作 - 1手ごとにマスを永久に燃やす - はまったく独自のアイデアであり、ゲームを競走から、相手の動ける空間をじわじわと締め上げていくものへと変えています。",
    amazons_history_design_title: "組合せゲーム理論のお気に入り",
    amazons_history_design_p1: "アマゾンには引き分けも捕獲もなく、そのゲーム木は実に巨大です - 一部の推定では囲碁よりも大きいとされ - これが組合せゲーム理論の研究者にとって自然な研究対象となり、1990年代後半以降、コンピュータゲームの大会やオリンピアードで定番の種目となりました。",
    amazons_history_design_p2: "コンピュータに強くプレイさせることも、それ自体が大きな課題でした。合法な駒の移動先が数十通りあり、そのそれぞれについてさらに数十通りの合法な矢の着地先があるため、1手番だけで千通りをゆうに超える合法手が存在することもあります - これはチェスよりもはるかに多く - そのため、アマゾンをプレイするプログラムは、単純な力任せの探索よりも、入念な手の並べ替えと終盤の陣地分析に頼るようになりました。",
    amazons_history_version_title: "このバージョンについて",
    amazons_history_version_p1: "PaperGamesは標準的な10x10の盤で、各プレイヤー4体のアマゾンという標準ルールでプレイします。各手番はシンプルな3回タップの手順です - アマゾンをタップし、移動先をタップし、そこから矢を放つ場所をタップします。"
});
I18n.markTextLoaded("ja");
