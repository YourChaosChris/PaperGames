// text/ja/marblepush.js
// Rules and history texts of marblepush (ja). Loaded by marblepush-rules.html and marblepush-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    marblepush_rules_title: "玉押しのルール",
    marblepush_rules_intro: "PaperGamesでの玉押しの遊び方を簡単にまとめました。ルールを思い出したいときにも、これから覚えるときにもどうぞ。",
    marblepush_rules_basics_title: "基本的な考え方",
    marblepush_term_board: "盤面",
    marblepush_rules_board: "5・6・7・8・9・8・7・6・5のマス目からなる61マスの六角形の盤です。各プレイヤーは14個のマーブルで始まり、自分に近い2列を完全に埋め、さらにその次の列の中央3マスを埋めます。黒が先手です。",
    marblepush_term_move: "マーブル1個の移動",
    marblepush_rules_single: "マーブルを1個選び、隣接する空きマスへ動かします。",
    marblepush_term_line: "列の移動",
    marblepush_rules_line: "まっすぐ途切れなく並んだ自分のマーブルを2個または3個選び、盤の6方向のいずれかへ列全体を1マス動かします。列の移動には2種類あり、以下で説明します。",
    marblepush_term_sidestep: "サイドステップ移動",
    marblepush_rules_sidestep: "列がその軸から外れて横方向に移動します。列が移動する先のマスはすべて空いていなければならず、サイドステップ移動では何かを押し出すことは決してできません。",
    marblepush_term_linestep: "軸方向の移動",
    marblepush_rules_linestep: "列はその軸に沿って、両端のいずれかが向いている方向へ移動します。すぐ前のマスが空いていれば、列全体がそのまま前進します。",
    marblepush_term_pushing: "押し出し",
    marblepush_rules_pushing: "軸方向の移動先に相手のマーブルがある場合、押し出すことができます。ただし、自分の列がそれを塞いでいる相手の連続した列より厳密に長い場合に限ります（3個は1個または2個を、2個は1個を押し出せますが、1個は決して押し出せません）。さらに、押し出す先の余地が必要です。相手の列のすぐ先が空きマスであるか、盤の端である必要があります。相手の列が盤の端を越える場合、その先頭のマーブルは盤外に排除されます。これが得点の方法です。",
    marblepush_rules_example_title: "例：3個で1個を押す",
    marblepush_rules_example_intro: "下の小さな図では、●が黒、○が白を表します。黒は3個のマーブルが一列（A、B、C）に並び、白のマーブル1個（D）に向き合っており、そのすぐ先には空きマス（E）、または盤の端があります。",
    marblepush_rules_example_caption: "黒の3個の列（A、B、C）は白の単独のマーブル（D）より数で勝り、マスEは空いているため、黒は押し出せます。列全体が1マス前進し、Dはマスへ押し出され、黒の列はB、CとDの元のマスを占めることになります。もしEの代わりに盤の端であれば、Dは完全に排除されます。",
    marblepush_rules_end_title: "対局の終了",
    marblepush_term_win: "勝利条件",
    marblepush_rules_win: "先に相手のマーブルを6個盤外へ押し出したプレイヤーの勝ちです。",
    marblepush_term_resignation: "投了",
    marblepush_rules_resignation: "プレイヤーはいつでも投了でき、その時点で対局は相手の勝利として即座に終了します。",
    marblepush_history_title: "玉押しの歴史",
    marblepush_history_origins_title: "六角形の盤で遊ぶ押し合いのゲーム",
    marblepush_history_origins_p1: "駒を飛び越えたりその場で取ったりせず、押して動かすゲームには長い伝統があり、六角形の盤も同じです。各マスには4つではなく6つの隣があるので、駒が動ける方向が増え、正方形の盤の扱いにくい斜めもなくなります。",
    marblepush_history_origins_p2: "玉押しはこの仲間に属します。マーブルは飾り気がなくすべて同じで、ゲーム全体がただ一つの考えに基づいています。長い列のマーブルは短い列を押すことができる、というものです。",
    marblepush_history_award_title: "ルールは一つ、奥行きは深い",
    marblepush_history_award_p1: "マーブルが失われるのは、はっきり長い列に盤の外へ押し出されたときだけなので、マーブルを固まった集団にまとめておくことが何より大切です。1個だけのマーブルは決して押せず、盤の端にいる集団は常に危険にさらされます。",
    marblepush_history_award_p2: "そのため、どの対局も盤の中央を巡る粘り強い戦いになります。中央を押さえた側はあらゆる方向へ外に押し出せ、もう一方は端へと追い詰められます。",
    marblepush_history_legacy_title: "運のないゲーム",
    marblepush_history_legacy_p1: "サイコロも隠れた情報も特別な駒もなく、同じマーブルが2組と、どの列がどの列を押せるかという簡単なルールがいくつかあるだけです。そのため、囲碁やチェッカーのような古い抽象ゲームと同じく、純粋に計画力を試すゲームです。"
});
I18n.markTextLoaded("ja");
