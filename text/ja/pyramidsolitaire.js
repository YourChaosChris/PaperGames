// text/ja/pyramidsolitaire.js
// Rules and history texts of pyramidsolitaire (ja). Loaded by pyramidsolitaire-rules.html and pyramidsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    pyramidsolitaire_rules_title: "ピラミッド・ソリティアのルール",
    pyramidsolitaire_rules_intro: "PaperGamesでのピラミッド・ソリティアの遊び方の簡単な確認です - 久しぶりに遊ぶときや、これから覚えるときに役立ちます。",
    pyramidsolitaire_rules_basics_title: "基本的な考え方",
    pyramidsolitaire_term_layout: "配置",
    pyramidsolitaire_rules_layout: "28枚のカードが表向きで7段の三角形に配られます: 一番上に1枚、その下に2枚、というように増えていき、一番下の段は7枚になります。それぞれのカードは、その下の段にある2枚のカードの上、その間に位置します。残りの24枚は山札となり、1枚ずつ表向きで捨て札にめくられます。",
    pyramidsolitaire_term_pairing: "13になるように組み合わせる",
    pyramidsolitaire_rules_pairing: "ここでのカードの値は額面どおりです: エース = 1、2から10は印刷された数字のまま、ジャック = 11、クイーン = 12、キング = 13。値の合計がちょうど13になる、取れる状態の2枚を取り除きます - 例えば5と8、9と4、あるいはジャック(11)と2など。キングはそれだけで13になるので、相手なしで単独で取り除けます。",
    pyramidsolitaire_term_exposed: "公開されているカード",
    pyramidsolitaire_rules_exposed: "ピラミッドのカードは、その下の段で支えている2枚のカードが両方ともなくなって初めて取れるようになります - 一番下の段は下に何もないので、最初から公開された状態です。取り除けるのは、ピラミッドの公開カードと捨て札の現在の一番上のカードだけです。覆われたピラミッドのカードは暗く表示され、どのカードかは見えていても、まだ取ることはできません。",
    pyramidsolitaire_term_stock: "山札・捨て札・やり直し",
    pyramidsolitaire_rules_stock: "山札をタップすると、一番上のカードが表向きで捨て札にめくられます(1枚ずつ)。組み合わせに使えるのは捨て札の一番上のカードだけです。山札がなくなったら、もう一度タップすると捨て札全体が山札に配り直され、1ゲームにつき最大2回まで再びめくり直せます。残りのやり直し回数は常に山札の横に表示されます。",
    pyramidsolitaire_rules_example_title: "具体的な例",
    pyramidsolitaire_term_example: "ペアを取り除く",
    pyramidsolitaire_rules_example: "例えば、一番下の段に公開された9があり、ピラミッドの別の場所に公開された4があるとします - 9をクリックしてから4をクリックすると、9 + 4 = 13なので両方取り除かれます。その4が、上の段にある6を支える唯一のカードで、その6のもう一方の下のカードもすでになくなっていれば、6が公開され、今度はそれも組み合わせられるようになります - 例えば捨て札の一番上にある7と組み合わせます。このようにカードを取り除いていくと、上の段が少しずつ開いていき、理想的にはピラミッド全体がなくなります。",
    pyramidsolitaire_rules_end_title: "ゲームの終了",
    pyramidsolitaire_term_win: "勝利",
    pyramidsolitaire_rules_win: "ピラミッドの28枚すべてを取り除いた瞬間にゲームに勝利します - 山札と捨て札まで空にする必要はなく、これがこのゲームのほとんどのバージョンで使われている標準的な勝利条件です。",
    pyramidsolitaire_term_lose: "手詰まり",
    pyramidsolitaire_rules_lose: "山札が空で、やり直しも残っておらず、公開されているピラミッドのカードと捨て札の一番上のカードの中にキングも13になるペアも見つからない場合、このゲームは敗北で終了します - PaperGamesは、説明もなく手詰まりのままにするのではなく、この状態をはっきりと表示します。",
    pyramidsolitaire_history_title: "ピラミッド・ソリティアの歴史",
    pyramidsolitaire_history_origins_title: "起源があまり記録されていない古いゲーム",
    pyramidsolitaire_history_origins_p1: "ピラミッドは、クロンダイクやフリーセルと同じ、一人用の\"ペイシェンス\"カードゲームの大きな系統に属しており、そのほとんどは19世紀から20世紀初頭にかけてヨーロッパや北米に広まり、地域ごとにさまざまな名前やルールの細かな違いを持っていました。多くの古典的なソリティアと同じく、ピラミッドの正確な起源 - 誰が最初に28枚を三角形に並べ、13になるように組み合わせ始めたのか - は、特定の記録された出典や日付にたどり着くことができません。",
    pyramidsolitaire_history_origins_p2: "はっきりしているのは、このゲームを同じ系統の他のゲームと分ける点です: クロンダイク、フリーセル、スパイダーはどれも、根本的にはカードの降順の数列を作ることが中心ですが、ピラミッドを特徴づける仕組みは計算です - 値の合計がちょうど13になるペアと、それだけですでに13であるキング単独を取り除いていきます。この13になるように組み合わせるというルールこそ、このゲームの歴史的に最も際立った特徴であり、数列を作る親戚たちと見分ける最も明確な手がかりです。",
    pyramidsolitaire_history_spread_title: "再びWindowsに同梱",
    pyramidsolitaire_history_spread_p1: "ピラミッド・ソリティアは、それ以前から何年もカードゲームの解説書や初期のデジタルソリティア集に登場していましたが、本当に幅広い層に広まったのは、何十年も前にクロンダイクがそうだったのと同じ方法でした: Windowsに同梱されることです。Microsoftは、Windows 8以降に組み込まれたMicrosoft Solitaire Collectionのゲームの一つとして、クロンダイク、スパイダー、フリーセルと並べてピラミッドを収録しました。",
    pyramidsolitaire_history_spread_p2: "Windowsのソリティアといえばクロンダイクのことだと思って育った非常に多くのプレイヤーにとって、このSolitaire Collectionは、ピラミッドが代表するペア合わせ型のペイシェンスに初めて本格的に触れる機会になりました - 同じおなじみの\"ソリティア\"という名前の下に隠れていた、まったく別種のパズルです。",
    pyramidsolitaire_history_modern_title: "このバージョンについて",
    pyramidsolitaire_history_modern_p1: "PaperGamesでは標準的なルールで遊びます: 毎回本当に新しいシャッフルを行い、28枚のピラミッドのカードは最初からすべて表向きで配られ、山札・捨て札は1枚引きで最大2回までやり直しでき、勝利条件は一般的な\"ピラミッドを片付ける\"というものです - 山札と捨て札まで空にする必要はなく、これはこのゲームのほとんどの現代的な実装と同じです。"
});
I18n.markTextLoaded("ja");
