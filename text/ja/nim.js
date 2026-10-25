// text/ja/nim.js
// Rules and history texts of nim (ja). Loaded by nim-rules.html and nim-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    nim_rules_title: "ニムのルール",
    nim_rules_intro: "2人がかわりばんこに、いくつかの山から石を取ります。ふつうのルールでは、最後の石を取った人のかちです。",
    nim_rules_basics_title: "ルール",
    nim_term_move: "1手",
    nim_rules_move: "列を1つえらんで、そこから好きなだけ石を取ります（1つ以上）。取りたいところまでの石をタッチすると、その石と右がわの石に×がつきます。それから「石を取る」をタッチします。",
    nim_term_end: "おわり",
    nim_rules_end: "ふつう：最後の石を取った人のかち。ミゼール：最後の石を取った人のまけ。",
    nim_term_heaps: "山",
    nim_rules_heaps: "3・4・5個（ふつうの設定）、昔からある1・3・5・7個、またはランダム（1〜7個の山が3つか4つ）。",
    nim_term_secret: "必勝法",
    nim_rules_secret: "それぞれの山の数を2進数で書き、くり上がりなしで足します（xor）。これがニム和です。0なら、手番の人は相手が完ぺきに打つと負けます。0でなければ、いつでもニム和を0にする手があります。ミゼールでは、1個の山だけが残る直前まで同じように打ち、そのとき1個の山が奇数個残るようにします。",
    nim_term_computer: "コンピューター",
    nim_rules_computer: "かんたんは好きな手、ふつうは半分の確率でいちばんよい手、むずかしいはいつもいちばんよい手を打ちます。勝ちの形からは、むずかしいには勝てません。だから山の下の行で、はじめる人にとってスタートが勝ちか負けかを知らせます。それを見て、だれがはじめるかえらんでください。",
    nim_history_title: "ニムの歴史",
    nim_history_origins_title: "石を取るあそび",
    nim_history_origins_p1: "山からものを取りあうあそびは大昔からあり、ニムがどこで生まれたかははっきりしません。中国のあそび「捡石子」（石ひろい）と結びつけられることが多く、ヨーロッパでいちばん古い記録は16世紀のはじめのものです。",
    nim_history_bouton_title: "ブートン、1901年",
    nim_history_bouton_p1: "1901年、ハーバード大学のチャールズ・L・ブートンがこのゲームの完全な理論を発表し、「ニム」と名づけました。名前の由来は説明しませんでしたが、ドイツ語の「nimm（取れ）」から来たとよく言われます。",
    nim_history_machines_title: "ニムの機械",
    nim_history_machines_p1: "ニムは、機械が遊んだ最初のゲームのひとつです。1940年のニューヨーク万国博覧会のニマトロン、1951年の英国祭で展示されたフェランティのコンピューターがあります。"
});
I18n.markTextLoaded("ja");
