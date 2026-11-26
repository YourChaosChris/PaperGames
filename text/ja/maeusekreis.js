// text/ja/maeusekreis.js
// Rules and history texts of maeusekreis (ja). Loaded by maeusekreis-rules.html and maeusekreis-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    maeusekreis_rules_title: "ねずみの輪のルール",
    maeusekreis_rules_intro: "点を結んだ輪の上で、猫とねずみが追いかけっこをします。ねずみは輪の上だけを進み、猫は輪を横切る直線も使えます。猫は手数が尽きる前にねずみを捕まえられるでしょうか。",
    maeusekreis_rules_basics_title: "ルール",
    maeusekreis_term_board: "盤",
    maeusekreis_rules_board: "点は輪にならび、それぞれ隣の2点とつながっています。点線の道が輪をいくつか横切ります。かんたんは8点、ふつうは10点、むずかしいは12点です。猫とねずみはランダムな点から始まり、少なくとも3点離れています。",
    maeusekreis_term_moves: "動き方",
    maeusekreis_rules_moves: "ねずみが先に動き、次に猫が動きます。毎回、駒は隣の点へ1歩進みます。その場にとどまることはできません。ねずみは輪だけを進みます。猫は輪と点線の道を進めます。ねずみは猫のいる点には進めません。印の付いた点をタップして移動します。",
    maeusekreis_term_end: "捕まるか逃げるか",
    maeusekreis_rules_end: "猫がねずみの点に進むと、ねずみを捕まえて猫の勝ちです。誰もけがはしません。ゲームが終わるだけです。猫の歩数は決まっていて、盤の上に表示されます。歩数を使い切ってもねずみが逃げていれば、ねずみの勝ちです。",
    maeusekreis_term_steps: "歩数について",
    maeusekreis_rules_steps: "歩数は毎回の開始位置に合わせて計算されます。2人対戦であなたが猫なら、猫にはねずみを捕まえるのにちょうど足りる歩数があります。ただし、1歩も無駄にできません。コンピューター相手にねずみを選ぶと、猫の歩数は1つ少なくなり、慎重に動けば逃げられます。",
    maeusekreis_term_computer: "コンピューター",
    maeusekreis_rules_computer: "コンピューターとの対戦では猫かねずみを選びます。かんたんはよく間違え、ふつうは少し間違え、むずかしいは間違えません。ヒントボタンで最善の一手を見られます。「戻す」で最後の手を取り消せます。",
    maeusekreis_history_title: "ねずみの輪の歴史",
    maeusekreis_history_origins_title: "昔からある追いかけっこ",
    maeusekreis_history_origins_p1: "追う側と逃げる側に分かれるゲームは、さまざまな国にあります。ヨーロッパでは、線と点の盤を使うキツネとガチョウが何世紀も遊ばれてきました。アジアにも似た狩りのゲームがあります。一方は強く、もう一方は駒の数や動ける場所で工夫します。",
    maeusekreis_history_maths_title: "点と線の追いかけっこ",
    maeusekreis_history_maths_p1: "1970年代後半から、数学者たちは点と線のネットワーク上の追いかけっこを研究し始めました。どんなネットワークなら、追う側は必ず逃げる側を捕まえられるのでしょう。この遊びは「警官と泥棒」と呼ばれることもあります。単純な輪では逃げる側がいつも逃げ切りますが、輪を横切る近道があると変わります。",
    maeusekreis_history_here_title: "ここで遊ぶねずみの輪",
    maeusekreis_history_here_p1: "輪の上の猫とねずみというアイデアは、プレイヤーから届きました。PaperGames独自のルールでは、ねずみは輪の上だけを進み、猫は横切ることができます。すべての位置を調べて猫の歩数を決めています。"
});
I18n.markTextLoaded("ja");
