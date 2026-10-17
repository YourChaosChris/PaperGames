// text/ja/klappenkasten.js
// Rules and history texts of klappenkasten (ja). Loaded by klappenkasten-rules.html and klappenkasten-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    kk_rules_title: "Klappenkastenのルール",
    kk_rules_intro: "サイコロを2つ振り、合計になる番号のふたを閉じます。",
    kk_rules_basics_title: "ルール",
    kk_term_flaps: "ふた",
    kk_rules_flaps: "各手番の最初は、1〜9のふたがすべて開いています。12枚の遊び方では1〜12です。",
    kk_term_turn: "手番",
    kk_rules_turn: "サイコロを2つ振ります。合計と同じ番号のふた、または合計になる複数の開いたふたを閉じます。5と3なら、8、または1+7、2+6、3+5、1+2+5、1+3+4です。そのあとまた振ります。",
    kk_term_one: "サイコロ1つ",
    kk_rules_one: "7番とそれより大きいふたがすべて閉じたら、サイコロを2つではなく1つだけ振ってもかまいません。",
    kk_term_end: "手番の終わり",
    kk_rules_end: "出た目に合う開いたふたがなければ、手番は終わりです。開いたまま残ったふたの数字の合計が、その手番の点数です。次の人は、またすべてのふたを開いた状態から始めます。",
    kk_term_win: "勝ち方",
    kk_rules_win: "決めたラウンド数のあと、合計点がいちばん少ない人の勝ちです。同点なら引き分けです。すべてのふたを閉じた人は箱を閉めたことになり、その場で勝ちです。",
    kk_term_computer: "コンピューター",
    kk_rules_computer: "高い番号のふたから先に閉じ、サイコロ1つのほうが閉じられる見込みが高いときだけ1つで振ります。",
    kk_term_help: "ヘルプ",
    kk_rules_help: "「元に戻す」で直前に閉じた分を取り消せます。時間制限はありません。",
    kk_history_title: "Klappenkastenの歴史",
    kk_history_old_title: "酒場と船の遊び",
    kk_history_old_p1: "英語圏で「シャット・ザ・ボックス」と呼ばれるこのゲームは、番号つきのふたが並ぶ箱、2つのサイコロ、少しの暗算でできる伝統的なサイコロゲームです。漁師や船乗り、酒場と結びつけて語られることが多いものの、いつどこで始まったのかは確かな記録がありません。9枚や12枚の箱は今も売られていて、サイコロを1つだけ振ってよい条件など、ルールは家ごとに少しずつ違います。",
    kk_history_version_title: "このバージョン",
    kk_history_version_p1: "Klappenkastenは広く知られたルールを使っています。ふたは1〜9または1〜12、高い番号のふたが閉じたらサイコロは1つ、開いたふたが点数です。名前はドイツ語でゲームをそのまま表したもので、絵はPaperGames用に描きました。"
});
I18n.markTextLoaded("ja");
