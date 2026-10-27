// text/ja/cardtactics.js
// Rules and history texts of cardtactics (ja). Loaded by cardtactics-rules.html and cardtactics-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    cardtactics_rules_title: "カード戦術のルール",
    cardtactics_rules_intro: "PaperGamesによる、カードで進める盤上レースの遊び方を簡単に紹介。",
    cardtactics_rules_basics_title: "基本の考え方",
    cardtactics_term_setup: "準備",
    cardtactics_rules_setup: "盤は7行6列。黒の石6個を下の列に、白の石6個を上の列に並べる。黒が先手。",
    cardtactics_term_cards: "移動カード",
    cardtactics_rules_cards: "移動カードは全部で12枚、すべて使う。盤の下に3枚が表向きで置かれ、両プレイヤーが使える。残り9枚は裏向きの山札に置かれる。各カードは移動を矢印で示す：↑↑は前に2マス、↑←は前に1マスと左に1マス、↗は斜めに1マスを意味する。各プレイヤーは自分の進む向きにカードを使うため、手番側から見た矢印が常に表示される。",
    cardtactics_term_moving: "手の進め方",
    cardtactics_rules_moving: "表向きの3枚からカードを1枚、自分の石を1つ、カードで行けるマスを1つ選ぶ。空きマスか相手の石のあるマスに進める。相手の石は取られる。自分の石は通り道をふさぐ。",
    cardtactics_term_cycle: "カードの山札",
    cardtactics_rules_cycle: "裏向きの山札の一番上のカードが使ったカードの場所に入り、使ったカードは山札の見えない位置に戻る。次のカードが何かは誰にもわからない。",
    cardtactics_term_opening: "初手",
    cardtactics_rules_opening: "ゲーム最初の手は最大1列まで進める。これで先手の有利さを抑える。",
    cardtactics_term_pass: "動ける手がない",
    cardtactics_rules_pass: "動けない場合はパスし、最初の表向きカードを山札に戻す。",
    cardtactics_rules_end_title: "勝利条件",
    cardtactics_term_win: "石を2つゴール",
    cardtactics_rules_win: "石が相手側の最後列（ゴール列）に着くと盤を横断したことになり、盤を離れてゴールしたものとして数える。その列に相手の石がいれば取る。先に石を2つゴールさせた側が勝ち。相手の盤上とゴール済みの石が合わせて2つ未満になった場合も勝ち。",
    cardtactics_term_limit: "手数制限",
    cardtactics_rules_limit: "120手でゲーム終了。ゴールした石が多い側が勝ち、同数なら盤上の石が多い側が勝つ。それも同じなら引き分け。",
    cardtactics_history_title: "カード戦術の歴史",
    cardtactics_history_origins_title: "向こう側を目指すゲーム",
    cardtactics_history_origins_p1: "自分の駒を盤の反対側へ進めることは、ボードゲームの古くからある目標だ。1883年または1884年にアメリカ人外科医ジョージ・ハワード・モンクスが考案したハルマは、自分の駒をすべて反対側の隅の陣地へ先に移した人が勝つ。",
    cardtactics_history_origins_p2: "ハルマやチェスでは、駒ごとに決まった動き方がある。カード戦術では石に固有の動き方はなく、表向きのカードが可能な移動を決める。両プレイヤーは同じカードから選ぶ。",
    cardtactics_history_version_title: "このバージョン",
    cardtactics_history_version_p1: "2026年10月、PaperGamesはルールを書き直した。盤は7行6列、各側に同じ石が6個、共有の表向きカード3枚と裏向きの山札があり、石を2つホームに届けることが目的。12枚のカード、その矢印と名前はPaperGames独自のもの。"
});
I18n.markTextLoaded("ja");
