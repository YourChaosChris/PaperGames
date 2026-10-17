// text/ja/catplaces.js
// Rules and history texts of catplaces (ja). Loaded by catplaces-rules.html and catplaces-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    kz_rules_title: "ねこの居場所のルール",
    kz_rules_intro: "ねこの居場所はロジックパズルです。どのねこにも正しい場所はひとつだけ。すべて一歩ずつ導けるので、当て推量は不要です。",
    kz_rules_basics_title: "ルール",
    kz_term_place: "行・列・部屋に1匹ずつ",
    kz_rules_place: "盤の行と列の数は部屋の数と同じで、5・7・8のいずれかです。どの行・どの列・どの部屋（太線で囲まれた区画）にもねこがちょうど1匹います。",
    kz_term_touch: "触れない",
    kz_rules_touch: "ねこ同士は決して触れません。横に並ぶのも、縦に並ぶのも、角で接するのもだめです。ねこのまわり8マスは空いたままです。",
    kz_term_play: "遊び方",
    kz_rules_play: "マスを1回タップするとねこ、2回目で点（ここにねこはいないという自分用のメモ）、3回目で空に戻ります。ルールに反するねこには点線の枠が付きます。",
    kz_term_levels: "レベル",
    kz_rules_levels: "やさしい：5×5、ふつう：7×7、むずかしい：8×8。やさしいでは行・列・部屋をひとつずつ見れば足ります。ふつうではねこ1匹先を考え、むずかしいでは複数の部屋と複数の行を見比べる必要があります。",
    kz_term_help: "ヘルプ",
    kz_rules_help: "「元に戻す」で最後のタップを取り消します。「ヒント」はまちがった場所のねこか、ねこが入るマスを枠で示します。時間制限はありません。",
    kz_rules_example_title: "例",
    kz_rules_example: "4つの部屋がある小さな盤：どの行・列・部屋にもねこが1匹ずつ、角でも触れ合うねこはいません。",
    kz_history_title: "ねこの居場所の歴史",
    kz_history_genre_title: "2003年生まれのパズル",
    kz_history_genre_p1: "パズル愛好家の間では、この種類のパズルは「Star Battle」と呼ばれます。オランダのパズル作家ハンス・エーンデバクが、2003年にオランダで開かれた世界パズル選手権のために考案しました。以来、雑誌や新聞、アプリでさまざまな名前で登場し、大きな盤で各行・列・区画に星を2つずつ置く形もよく見られます。",
    kz_history_cats_title: "なぜねこ？",
    kz_history_cats_p1: "ねこの居場所は、行・列・部屋に1つずつという最も簡単な形を使います。星の代わりに眠るねこがいて、どのねこも自分だけの場所がほしく、となりのねこに触れたくありません。絵はこのゲームのために描きました。"
});
I18n.markTextLoaded("ja");
