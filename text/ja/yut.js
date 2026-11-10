// text/ja/yut.js
// Rules and history texts of yut (ja). Loaded by yut-rules.html and yut-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    yut_rules_title: "Yutのルール",
    yut_rules_intro: "韓国の棒投げレースゲーム：4本の棒を投げ、他のプレイヤーよりも先に自分の4つのコマすべてをボードの外周を一周させてゴールへ導きます。",
    yut_rules_basics_title: "基本ルール",
    yut_term_throw: "投げ（出目）",
    yut_rules_throw: "4本の棒を投げます。上を向いている平らな面の数を数えます：1つなら do 도（1歩）、2つなら gae 개（2歩）、3つなら geol 걸（3歩）、4つなら yut 윷（4歩）、0個なら mo 모（5歩）となります。yut と mo を出すともう一度投げられます。印のついた1本の棒だけが平らな場合は backdo 빽도 となり、1歩後退します。使わなかった出目は、使用するまで保持されます。スタート直後の最初のマスで backdo が出たときは、コマはスタートに戻り、もう一度待機します。",
    yut_term_move: "移動",
    yut_rules_move: "保持している出目を1つ選び、コマを選んで、移動先のマスを指定します。スタートで待機しているコマは、出目を使ってボードに進入します。同じマスにあるコマは重なって一緒に移動します。外周は20マスあり、スタートとゴールは右下隅にあります。",
    yut_term_shortcuts: "ショートカット",
    yut_rules_shortcuts: "上部にある2つの印がついた角のいずれかで移動を開始するコマは、外周を進む代わりにボードを横切るショートカットを使うことができます。中央のマスに止まった駒は、より短い道を通ってゴールに向かいます。右上の角から来た駒は、代わりにまっすぐ左下の角へ進むこともできます。角に止まらずに通過した場合は、ショートカットを利用できません。",
    yut_term_capture: "捕獲",
    yut_rules_capture: "相手のコマがあるマスに止まると、相手のコマはスタートに戻り、もう一度投げることができます。そのマスに自分のコマがあれば、重なって一緒に進みます。",
    yut_term_finish: "ゴール",
    yut_rules_finish: "スタートのマスを越えて進んだコマはゴールとなります。4つのコマすべてを最初にゴールさせたプレイヤーが勝利します。",
    yut_term_players: "プレイヤー",
    yut_rules_players: "2〜4人プレイ。自分の側（AからD）と、誰が先に始めるか（自分、コンピュータ、またはランダム）を選べます。残りはコンピュータが「簡単」または「難しい」でプレイします。コマは形と文字で区別されます：丸がA、四角がB、三角がC、ダイヤがDです。",
    yut_history_title: "Yutの歴史",
    yut_history_origins_title: "韓国の民俗ゲーム",
    yut_history_origins_p1: "ユンノリ（yunnori）は韓国の伝統的なゲームです。家族や近所の人々と一緒に、特に旧正月（Seollal）に遊ばれます。正確な起源は不明ですが、一般に韓国の古い民俗ゲームの一つに数えられています。韓国の伝統では、出目に動物の名前がついています：do、gae、geol、yut、mo。",
    yut_history_modern_title: "PaperGamesでのYut",
    yut_history_modern_p1: "PaperGamesでは独自のボード描画とテキストを使用しています。ルールは一般的なゲームのバージョンに従っています：4本の棒、プレイヤーごとに4つのコマ、角でのショートカット、そして yut、mo、捕獲での追加の投げ。"
});
I18n.markTextLoaded("ja");
