// text/ja/futoshiki.js
// Rules and history texts of futoshiki (ja). Loaded by futoshiki-rules.html and futoshiki-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    futoshiki_rules_title: "不等式のルール",
    futoshiki_rules_intro: "PaperGamesでの不等式（日本生まれの不等号パズル）の遊び方をまとめた早見表です。",
    futoshiki_rules_basics_title: "基本的な考え方",
    futoshiki_term_grid: "盤面",
    futoshiki_rules_grid: "盤面は4 x 4、5 x 5、6 x 6マスのいずれかです。1から盤面のサイズまでの数字を、どの行にもちょうど1回、どの列にもちょうど1回ずつ入るように埋めます。",
    futoshiki_term_signs: "記号",
    futoshiki_rules_signs: "隣り合うマスの間に、小さな三角形が置かれていることがあります。これは不等号（小なり）と同じ働きをし、細い先は小さい数字のマスを、広い側は大きい数字のマスを指します。完成した盤面では、すべての記号が成り立っていなければなりません。",
    futoshiki_term_givens: "最初から入っている数字",
    futoshiki_rules_givens: "いくつかの数字が最初から太字で入っている問題もありますが、まったく入っていない問題も多くあります。最初から入っている数字は変更できません。",
    futoshiki_term_unique: "答えは1通り",
    futoshiki_rules_unique: "どの問題も新しく作られ、答えがちょうど1通りで、当てずっぽうなしに一歩ずつ見つけられることを確認しています。",
    futoshiki_rules_play_title: "遊び方",
    futoshiki_term_entering: "数字の入力",
    futoshiki_rules_entering: "マスを選び、盤面の下から数字を選びます。「消す」で選んだマスを空にし、「元に戻す」で最後の入力を取り消します。同じ行や列で重なっている数字や、記号に反している2つの数字は白黒反転で表示されます。",
    futoshiki_term_hint: "ヒント",
    futoshiki_rules_hint: "「ヒント」は次の一手を3回の押下で示します。1回目でマスに印を付け、2回目で理由を示し、3回目で数字を入れます。当てずっぽうは決してしません。ヒントを使った勝ちは統計で別に数えられます。",
    futoshiki_term_daily: "今日の課題と印刷",
    futoshiki_rules_daily: "今日の課題は、同じ日なら誰にとっても同じ5 x 5の問題です。「印刷」を使うと、空の問題がA4用紙1枚に収まり、紙の上で解けます。",
    futoshiki_rules_end_title: "問題を解き終える",
    futoshiki_term_win: "完成",
    futoshiki_rules_win: "すべてのマスが埋まり、どの行や列にも同じ数字が重ならず、すべての記号が成り立った時点で完成です。",
    futoshiki_history_title: "不等式の歴史",
    futoshiki_history_name_title: "名前がすべてを語る",
    futoshiki_history_name_p1: "Futoshiki（不等式）は、日本語でそのまま不等式を意味する言葉です。ラテン方陣、つまりブロックのない数独、あるいはケージのないCalcudokuと同じ盤面で遊び、追加の手がかりはマスの間の記号だけです。",
    futoshiki_history_spread_title: "日本から新聞へ",
    futoshiki_history_spread_p1: "この種の多くの数字パズルと同じく、まず日本で知られるようになりました。2000年代半ばの数独ブームを受けて、ほかの国々の新聞やパズル雑誌にも掲載されるようになりました。",
    futoshiki_history_modern_title: "PaperGamesでは",
    futoshiki_history_modern_p1: "ここでの問題はすべてお使いの端末上で作られ、当てずっぽうなしでたどり着ける答えがちょうど1通りであることを確認しています。記号は入力した文字ではなく小さな三角形として描かれるので、電子ペーパーの画面でも大きくはっきり見えます。"
});
I18n.markTextLoaded("ja");
