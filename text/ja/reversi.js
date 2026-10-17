// text/ja/reversi.js
// Rules and history texts of reversi (ja). Loaded by reversi-rules.html and reversi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    reversi_rules_title: "リバーシのルール",
    reversi_rules_intro: "PaperGamesにおけるリバーシの遊び方のクイックリファレンス - ルールを忘れた人にも、これから学ぶ人にも役立つ。",
    reversi_rules_basics_title: "基本的な考え方",
    reversi_term_discs: "石と初期配置",
    reversi_rules_discs: "リバーシは8x8の盤で行う。ゲームは中央の4マスに各色2枚ずつの駒を対角線状に配置してスタートする。黒が常に先手となる。",
    reversi_term_flanking: "挟む",
    reversi_rules_flanking: "空いているマスに石を置き、自分の新しい石と別の自分の石とで、相手の石を1個以上まっすぐな一直線上（縦・横・斜め）に挟むことで手を打ちます。挟まれた相手の石はすべて即座に自分の色にひっくり返ります。",
    reversi_rules_pass_title: "動けないとき",
    reversi_term_pass: "合法手なし",
    reversi_rules_pass: "合法手が一つもない場合、その手番は自動的に飛ばされ、相手の手番に移ります。合法手があるのに自分の意思でパスすることはできません。両者ともに合法手がなくなった時点で、ゲームはただちに終了します。",
    reversi_rules_end_title: "ゲームの終わり方",
    reversi_term_win: "勝利条件",
    reversi_rules_win: "どちらのプレイヤーにも合法手がなくなった時点（通常は盤面が埋まったとき）でゲームは終了します。盤上に石が多い方の勝ちで、同数の場合は引き分けです。",
    reversi_term_resignation: "投了",
    reversi_rules_resignation: "プレイヤーはいつでも投了でき、その時点で相手の勝ちとなり対局が終了します。",
    reversi_history_title: "リバーシの歴史",
    reversi_history_origins_title: "ヴィクトリア朝生まれのオリジナル",
    reversi_history_origins_p1: "リバーシは1880年代初頭のイギリスで初めて登場し、いかにもビクトリア朝らしい論争の渦中にあった。ルイス・ウォーターマンとジョン・W・モレットという2人の人物が、それぞれ自分がこのゲームを発明したと主張し、1888年にはお互いにアイデアを盗んだと非難し合うパンフレットを出版した。実際に誰の功績とすべきかは、歴史家の間でも今なお定かではない。",
    reversi_history_origins_p2: "初期のリバーシでは、最初の数個の駒を盤上のどこにでも置くことができ、一部のビクトリア朝時代のルールでは、完全に包囲された側が一手で盤全体の支配権を失うというものもあった - こうした変則ルールは、標準化が進むにつれて次第に姿を消していった。",
    reversi_history_spread_title: "日本での再発明",
    reversi_history_spread_p1: "このゲームは1973年に日本で再び脚光を浴びる。長谷川五郎がリバーシのルールを洗練させ - おなじみの対角線状に4つの初期配置駒を固定し、古い変則ルールを取り除いて - ツクダオリジナルから新しい名前で発売した。その名は「オセロ」。シェイクスピアの戯曲と、その中心にある黒対白の対立にちなんだ名前である。",
    reversi_history_spread_p2: "オセロは日本で、そしてやがて世界中で大きな人気を博し、1977年から毎年開催されている世界オセロ選手権を生み出しました。そして、このアプリで使われているのと同じ標準ルールが、今日競技として遊ばれるバージョンとして定着しました。",
    reversi_history_modern_title: "コンピューターの戦場に",
    reversi_history_modern_p1: "オセロは、コンピューターによるゲームプレイ研究にとって、意外なほど格好の題材であることが分かりました。ルール自体はシンプルですが、到達しうる局面の数があまりに膨大で、長らく単純な戦略ではうまく攻略できなかったのです。",
    reversi_history_modern_p2: "1997年8月、マイケル・ビューロのプログラム「Logistello」が、当時の人間の世界チャンピオンだった村上健を6戦全勝で下しました。これはチェスのディープブルーの勝利と同じ年に達成された画期的な結果でした。それ以来オセロのエンジンはさらに強くなり続けており、今では非常に広い範囲の局面において、このゲームはほぼ解明された、あるいは解明されたと考えられています。",
    reversi_history_names_title: "リバーシという名前について",
    reversi_history_names_p1: "リバーシそのものは19世紀に生まれ、パブリックドメインです。Othelloは登録商標です。PaperGamesはこの商標の権利者と関係がないため、より古い名前であるリバーシを使っています。"
});
I18n.markTextLoaded("ja");
