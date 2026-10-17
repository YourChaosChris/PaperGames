// text/ja/steckwuerfeln.js
// Rules and history texts of steckwuerfeln (ja). Loaded by steckwuerfeln-rules.html and steckwuerfeln-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    sw_rules_title: "Steckwürfelnのルール",
    sw_rules_intro: "サイコロを2つ振って、2〜12の穴にペグを差します。点数が少ない人の勝ちです。",
    sw_rules_basics_title: "ルール",
    sw_term_holes: "穴",
    sw_rules_holes: "2〜12の番号がついた穴が11個あります。手番の最初は、どの穴にもペグはありません。",
    sw_term_turn: "手番",
    sw_rules_turn: "サイコロを2つ振ります。合計の穴に1本、またはそれぞれの目の2つの穴に1本ずつペグを差します。2と4なら、6の穴、または2と4の穴です。1つの穴にはペグ1本だけです。同じ目(3と3)のときは合計だけが使え、1の穴はありません。",
    sw_term_go_on: "続けること",
    sw_rules_go_on: "差せる限り、振って差すことを続けます。差せない目が出たら手番は終わりです。空いている穴の数字を足した合計があなたの点数です。",
    sw_term_sixes: "6のゾロ目",
    sw_rules_sixes: "6のゾロ目はジョーカーで、その意味は遊ぶ人どうしで決めます。ここでは選べます。もう一度振る(何も差さない)、すぐに手番終了、または特別ルールなし(その場合は6と6で、ほかの合計と同じく12の穴に差します)。",
    sw_term_win: "勝ち方",
    sw_rules_win: "決めたラウンド数のあと、合計点がいちばん少ない人の勝ちです。同点なら引き分けです。11個の穴すべてに差せば0点で、その場で勝ちです。",
    sw_term_shared: "共通ボード",
    sw_rules_shared: "このバリエーションでは、全員が1つのボードを使い、順番に1回ずつ振ります。差せなくなった人は脱落し、最後に残った人の勝ちです。",
    sw_term_computer: "コンピューター",
    sw_rules_computer: "自分のボードでは、あとの目をできるだけ多く差せるように差します。共通ボードではその逆で、次の人が差せる目をできるだけ少なくします。",
    sw_term_help: "ヘルプ",
    sw_rules_help: "「元に戻す」で直前のペグを戻せます。時間制限はありません。",
    sw_history_title: "Steckwürfelnの歴史",
    sw_history_old_title: "小さな木のゲーム",
    sw_history_old_p1: "番号つきの穴、ばらばらのペグ、2つのサイコロ。こうしたゲームは小さな木製のポケットゲームとして作られ、子どもから大人まで遊べる簡単なサイコロゲームとして売られています。何社かが自社の名前で出しています。ルールはとても単純で、遊びながら伝わってきたため、6のゾロ目の意味や、全員が同じボードを使うかどうかなど、細部は違います。",
    sw_history_version_title: "このバージョン",
    sw_history_version_p1: "Steckwürfelnは一般的なルールに従います。穴は2〜12、1回の目で1本または2本のペグ、空いた穴が点数です。6のゾロ目、ラウンド数、共通ボードは選べます。名前も絵も独自のものです。"
});
I18n.markTextLoaded("ja");
