// text/ja/advent.js
// Rules and history texts of advent (ja). Loaded by advent-rules.html and advent-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    adv_rules_title: "パズルアドベントカレンダーの遊び方",
    adv_rules_intro: "12月1日から24日までの24個の扉に、それぞれ小さなパズルがあります。24日に近づくにつれて、少しずつ難しくなります。",
    adv_rules_basics_title: "ルール",
    adv_term_doors: "扉",
    adv_rules_doors: "扉nは、端末の時計に従って12月n日に開きます。ただし、扉n - 1を解いている場合に限ります。12月1日より前はすべて閉じており、12月25日以降はすべて開きます。閉じた扉は縞模様の背景に点線の縁、開いた扉は太い縁、解決済みの扉は黒地にチェックマークで表示されます。",
    adv_term_kinds: "パズル",
    adv_rules_kinds: "ライトスイッチ、ミニ数独（4 x 4と6 x 6）、ノノグラム、Futoshiki、ビルディングパズル、Calcudokuがあり、どれも解はひとつです。どの端末でも、同じ扉には同じパズルが表示されます。",
    adv_term_input: "遊び方",
    adv_rules_input: "マスをタップしてから下の数字を選びます。「消去」でマスを空にできます。ノノグラムではタップするたびに、塗りつぶし、バツ印、空白の順に切り替わります。ライトスイッチではライトと隣のライトが切り替わります。すべて正しくなると扉が解決済みになります。",
    adv_term_try: "お試し",
    adv_rules_try: "メニューの「すべての扉を開く（お試し）」を選ぶと、すべての扉が一度に開きます。初期設定ではオフです。進行状況はこの端末に保存され、外部に送信されません。",
    adv_history_title: "アドベントカレンダーの歴史",
    adv_history_home_title: "チョークの線と絵",
    adv_history_home_p1: "19世紀、ドイツの家庭では、ドアにチョークで線を引いて毎日一本消したり、絵を一枚ずつ飾ったりして、クリスマスまでの日数を数えていました。現存する最古の手作りカレンダーは、19世紀半ばごろのものと考えられています。",
    adv_history_print_title: "最初の印刷カレンダー",
    adv_history_print_p1: "印刷カレンダーは20世紀初頭に登場しました。1902年にはハンブルクの書店が子ども向けの「クリスマス時計」を発売し、その少し後にはミュンヘンの出版社Gerhard Langが絵入りカレンダーを作りました（資料によって1903年または1908年）。",
    adv_history_doors_title: "小さな扉",
    adv_history_doors_p1: "開けられる小さな扉や窓のあるカレンダーは、1920年ごろから広まりました。第二次世界大戦中は紙が配給制となり、こうしたカレンダーの印刷はほぼ停止しました。1945年以降に再び作られるようになり、シュトゥットガルトの出版社Richard Sellmerもその一社で、最初のカレンダーは1946年向けに発売されました。",
    adv_history_today_title: "チョコレートとパズル",
    adv_history_today_p1: "チョコレート入りのカレンダーは1950年代から知られています。現在は、扉ごとにパズルがあるカレンダーもあります。このカレンダーにはPaperGamesの小さな論理パズルが入っています。",
});
I18n.markTextLoaded("ja");
