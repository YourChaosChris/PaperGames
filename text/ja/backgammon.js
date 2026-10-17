// text/ja/backgammon.js
// Rules and history texts of backgammon (ja). Loaded by backgammon-rules.html and backgammon-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    backgammon_rules_title: "バックギャモンのルール",
    backgammon_rules_intro: "PaperGamesでのバックギャモンの遊び方を簡単にまとめました。ルールを思い出したいときにも、これから覚えるときにもどうぞ。",
    backgammon_rules_basics_title: "基本的な考え方",
    backgammon_term_pieces: "駒と盤面",
    backgammon_rules_pieces: "各プレイヤーは24のポイントからなる盤上に15個の駒を持ちます。黒はポイント1からポイント24へ、白はポイント24からポイント1へ向かって進みます。それぞれ自分の駒すべてを自陣（ホームボード）に集め、そこから盤外に出していきます。",
    backgammon_term_dice: "サイコロ",
    backgammon_rules_dice: "手番ごとに2個のサイコロを振り、それぞれの目の数だけ2回動かせます。ゾロ目が出た場合は、その数字で4回動かせます。合法的に打てるサイコロの目は、必ずすべて使わなければなりません。",
    backgammon_term_blocking: "ブロックとヒット",
    backgammon_rules_blocking: "相手の駒が2個以上あるポイントはブロックされていて、そこには止まれません。駒がちょうど1個だけのポイント（「ブロット」と呼びます）には乗ることができ、その駒はバーに送られます。バーに送られた駒は、相手のホームボードから盤に戻ってこない限り、他のどの駒も動かすことができません。",
    backgammon_rules_end_title: "ベアオフと勝利",
    backgammon_term_bearoff: "ベアオフ",
    backgammon_rules_bearoff: "自分の15個の駒すべてがホームボードに入ると、ベアオフ（駒を盤外に出すこと）を始められます。駒のあるポイントと同じ出目が出ればその駒を上げられ、それより大きい出目が出た場合はそれより奥にある駒を上げることができます。",
    backgammon_term_win: "勝利条件",
    backgammon_rules_win: "15個すべての駒を先にベアオフしたプレイヤーの勝ちです。",
    backgammon_term_resignation: "投了",
    backgammon_rules_resignation: "プレイヤーはいつでも投了でき、その時点で相手の勝ちとなり対局が終了します。",
    backgammon_term_doubling: "ダブリングキューブ",
    backgammon_rules_doubling: "サイコロを振る前に、キューブを持っている（あるいは共有している）プレイヤーは賭け金を倍にする提案ができます。相手はそれを受けてキューブを引き継ぎ賭け金を倍にするか、拒否してその時点の賭け金でただちに負けを認めるかを選びます。ガモン（相手が1つも上げられなかった場合）は2倍、バックギャモン（相手の駒が勝者のホームボードやバーにまだ残っている場合）は3倍になり、いずれもキューブの倍率にさらに掛け合わされます。",
    backgammon_history_title: "バックギャモンの歴史",
    backgammon_history_origins_title: "文字より古いサイコロゲーム",
    backgammon_history_origins_p1: "バックギャモンの系譜は、ウルの王家のゲームや、ローマのゲーム「ルドゥス・ドゥオデキム・スクリプトルム（12本の線のゲーム）」までさかのぼり、これは後に「タブラ」というシンプルな形へと変わりました。タブラは2つのサイコロと片側15個の駒を使うすごろくで、古代末期にはすでにバックギャモンとかなり近い姿になっていました。",
    backgammon_history_origins_p2: "皇帝クラウディウスはタブラを非常に愛好し、そのための戦略書（現存していません）を著したと伝えられ、移動中にも遊べるよう自分の馬車に盤を組み込ませたとも言われています。",
    backgammon_history_spread_title: "「テーブル」、トリックトラック、そして英語名の由来",
    backgammon_history_spread_p1: "中世ヨーロッパを通じて、バックギャモンに似たすごろくは総称して「テーブル」と呼ばれ、フランスのトリックトラックのように、地域ごとの得点方式の違いも生まれました。英語名「バックギャモン」が初めて記録に現れるのは17世紀で、「back（戻る）」と、古い言葉で「ゲーム」を意味する語に由来するとされています。駒が盤に戻ってもう一度盤を横切らなければならないことがある点にちなんだ名前です。",
    backgammon_history_spread_p2: "どちらのプレイヤーもゲームの途中で賭け金を吊り上げられるダブリングキューブは、1920年代にニューヨークで導入され、バックギャモンを単なるすごろくから、今日のトーナメントプレイヤーが知るような、鋭いリスク管理を求められるゲームへと変えました（PaperGamesにもキューブがあります。詳しくはルールのページをご覧ください）。",
    backgammon_history_modern_title: "人工知能の初期の成功例",
    backgammon_history_modern_p1: "バックギャモンは人工知能の歴史において特別な位置を占めています。1992年、IBMの研究者ジェラルド・テサウロが開発した「TD-Gammon」というプログラムは、自分自身と何百万回も対局することで学習するニューラルネットワークを使いました。これは今でいう強化学習の最も初期の成功例の一つです。",
    backgammon_history_modern_p2: "TD-Gammonは、同様の技術がチェスや囲碁を制覇するよりも何年も前に、世界最高峰の人間プレイヤーたちと渡り合えるレベルに達しており、その型破りな戦略的アイデアは、トップクラスの人間プレイヤーたちのこのゲームへの取り組み方そのものを変えることになりました。"
});
I18n.markTextLoaded("ja");
