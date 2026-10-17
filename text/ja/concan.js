// text/ja/concan.js
// Rules and history texts of concan (ja). Loaded by concan-rules.html and concan-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    sudoku_rules_basics_title: "基本的な考え方",
    concan_rules_romme_difference: "Rommé との違い：コンカンでは自分のメルドにしか付け足せません。Rommé（PaperGames でも）では、最初のメルドの後、相手のものも含めテーブル上のすべてのメルドに付け足せます。",
    concan_rules_title: "コンキアンのルール",
    concan_rules_intro: "PaperGamesでのコンキアン（コンカンとも書きます）の遊び方。このゲームは細部の異なるいくつかの形で伝わっています。ここで遊べる形を以下に説明します。",
    concan_term_setup: "カードと人数",
    concan_rules_setup: "40枚のカード。通常のカードから8・9・10を抜いたもので、4つのスートのA、2〜7、J、Q、Kです。2人に10枚ずつ配り、1枚を表向きにして捨て札の山を始めます。",
    concan_term_melds: "組",
    concan_rules_melds: "組とは、同じ数字の3〜4枚のセット、または同じスートで連続する3枚以上の順列です。順番はA、2、3、4、5、6、7、J、Q、Kです。8〜10がないので7の次はJで、7・J・Qは正しい順列です。Aは常に一番下です。",
    concan_term_turn: "あなたの手番",
    concan_rules_turn: "捨て札の一番上のカードは、すぐに場に出す場合だけ取れます。手札のカードと新しい組を作るか、自分の組に付け足します。そうでなければ山札の一番上を引きます。その後さらに組を出したり自分の組に付け足したりでき、最後にカードを1枚捨てて手番を終えます。",
    concan_term_forced: "取る義務",
    concan_rules_forced: "これがコンキアンの特徴です。捨てられたカードはすべて相手に差し出され、相手が使えるなら必ず取って場に出さなければなりません。ゲームがこれを確認し、カードを取らなければならないときは知らせてくれます。相手が使えそうなカードを捨てる前によく考えましょう。",
    concan_term_end: "勝ち",
    concan_rules_end: "先に11枚を場に出した人がすぐに勝ちます。毎回の手番は捨て札で終わるので、最後の手札は11枚目になる場合だけ場に出せます。誰も11枚を出す前に山札がなくなったら引き分けです。",
    concan_term_variant: "ここで遊べるバリエーション",
    concan_rules_variant: "コンキアンの古い説明は、引いたカードを手札に入れるか両者に見せるか、何枚場に出す必要があるかなどで異なります。PaperGamesはこのページの形で遊びます。引いたカードは手札に入り、毎回の手番は捨て札で終わり、使える捨て札は必ず取り、11枚を場に出したら勝ちです。",
    concan_history_title: "コンキアンの歴史",
    concan_history_origins_title: "メキシコからラミーの仲間へ",
    concan_history_origins_p1: "コンキアン（コンカン）は19世紀、メキシコとアメリカ南西部で、スペイン式の40枚のカードを使って遊ばれていました。トランプゲームの歴史家は、これをセットと順列を集めるラミー型ゲームの中でも最も古いものの一つに数えています。",
    concan_history_origins_p2: "ゲームそのものの起源ははっきりしません。より古いアジアのカードゲームに求める歴史家もいれば、スペインのゲームに求める歴史家もいます。確かなのは、組を作って場に出すという考え方が、コンキアンのようなゲームから今日の多くのラミー系ゲームへ広まったことです。",
    concan_history_names_title: "名前とルール",
    concan_history_names_p1: "名前はスペイン語の「con quién」（「誰と？」）と結びつけられることが多いですが、この説明は証明されていません。英語の資料ではConquianやCoon Canとも書かれます。",
    concan_history_names_p2: "ルールブックではなく遊ぶことで伝えられたため、いくつかの形があります。PaperGamesはシンプルで遊びやすい形を採用し、ルールのページで説明しています。"
});
I18n.markTextLoaded("ja");
