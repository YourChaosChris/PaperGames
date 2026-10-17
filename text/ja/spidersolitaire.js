// text/ja/spidersolitaire.js
// Rules and history texts of spidersolitaire (ja). Loaded by spidersolitaire-rules.html and spidersolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    spidersolitaire_rules_title: "スパイダーソリティアのルール",
    spidersolitaire_rules_intro: "PaperGamesでのスパイダーソリティアの遊び方の簡単なまとめです - 久しぶりに遊ぶ方や、これから覚える方に役立ちます。",
    spidersolitaire_rules_basics_title: "基本の考え方",
    spidersolitaire_term_layout: "配置",
    spidersolitaire_rules_layout: "2組の完全なカード（104枚）が10列の場札に配られます - 最初の4列には各6枚、残り6列には各5枚が配られ、各列の一番上のカードだけが表向きになります。組札はありません。残りの50枚は山札となり、後で10枚ずつまとめて配られます。",
    spidersolitaire_term_difficulty: "難易度を選ぶ",
    spidersolitaire_rules_difficulty: "開始前に、使用するスート数を選びます。1スートが最も簡単（正しいランクのカードならどれでもどの並びも延長できます）、2スートは普通、4スートは伝統的で最も難しいバージョン - 本物の2組のカードをそのまま混ぜ合わせたのと同じです。",
    spidersolitaire_term_tableau: "1枚のカードの移動",
    spidersolitaire_rules_tableau: "カードは、場札の列ではちょうど1つ上のランクのカードの上にしか移動できません - この場合スートは関係ありません。空の列にはどんなカードや有効な並びでも、ランクの制限なしに置けます。",
    spidersolitaire_term_group: "カードのグループの移動",
    spidersolitaire_rules_group: "すでに積まれた複数のカードをまとめて1つの単位として移動できるのは、それらがすでに同じスートの正しく降順に並んだ列になっている場合だけです（例えばハートの5-4-3が、まさにその順番で並んでいる場合）。ランクは正しく降順でも、スートが混ざった並びを移動することはできません。グループの移動でも、上記の「1つ上のランク」という配置ルールに従います。カードが移動すると、その列の新たに一番上になったカードは自動的に表向きになります。",
    spidersolitaire_term_stock: "山札",
    spidersolitaire_rules_stock: "山札をタップすると、次の10枚がまとめて配られ、10列それぞれに表向きのカードが1枚ずつ追加されます。列のどれかが空になっている間は配れません - まずそれを空でなくしてから（カードをどこかへ移動するか、そこで並びを完成させて）、再び配れるようにしてください。",
    spidersolitaire_term_sequences: "並びの完成",
    spidersolitaire_rules_sequences: "キングからエースまでの完全な並びが、すべて同じスートで順番通りに1つの列の中で連続していると、自動的に検出されて取り除かれます - その列にある他のカードは関係なく、自然に一緒に持ち上げられる位置に正しく積まれていれば十分です。並びが1つ完成するたびに、盤面上のカウンターが1つ増えます。",
    spidersolitaire_rules_end_title: "ゲームの終了",
    spidersolitaire_term_win: "勝利",
    spidersolitaire_rules_win: "キングからエースまでの並びが8つすべて完成して取り除かれた時点でゲームに勝利します - これは104枚 ÷ 13で、選んだスート数の難易度にかかわらず同じ合計です。",
    spidersolitaire_history_title: "スパイダーソリティアの歴史",
    spidersolitaire_history_origins_title: "記録に残らない人気者",
    spidersolitaire_history_origins_p1: "由来をたどれる発明者がいる一部のカードゲームとは異なり、スパイダーソリティアの正確な起源は明確には記録されていません - 多くのペイシェンスゲームと同様、特定の一人や一つの最初の出版物によるものではなく、広く遊ばれる中で発展してきました。はっきりしているのは、20世紀前半から半ばまでには、コンピューターが登場するはるか以前から、紙とフェルトの上で遊ばれる2組使いのペイシェンスゲームの仲間の中で、すでによく知られた人気ゲームになっていたということです。",
    spidersolitaire_history_origins_p2: "その名前は、カードにクモの絵柄があるからというよりも、ほぼ確実にゲーム自体の難しさや構造にちなんだものです。10本の長く広がる場札の列から、クモの8本の脚を思わせる8つの組札のような並びを織り上げていく必要があり、4スートで遊ぶ場合は色や組札スートによる助けは一切ありません。",
    spidersolitaire_history_spread_title: "Windowsへの同梱",
    spidersolitaire_history_spread_p1: "スパイダーソリティアが爆発的に広まった最も有名な瞬間は1998年、Microsoftがこれを標準搭載ゲームとしてWindowsに組み込んだ時です - 最初はWindows 98 Plus!パックとWindows Me世代に登場し、その後Windows XP以降は標準搭載になりました。",
    spidersolitaire_history_spread_p2: "その一つの決定が、Windowsが以前クロンダイク（単に「ソリティア」と呼ばれていました）で、そして後にFreeCellで行ったのと同じように、スパイダーを世界中の膨大な数の人々に紹介することになりました。何十年もの間、実際のカードテーブルでひっそりと遊ばれてきたカードゲームは、プレイヤーが実物のトランプを一切持たなくても、世界で最もよく使われるソフトウェアの一つへと姿を変えたのです。",
    spidersolitaire_history_modern_title: "このバージョンについて",
    spidersolitaire_history_modern_p1: "PaperGamesでは、1スート・2スート・4スートという伝統的な3つのスート数の難易度を最初から選べる標準ルールで遊びます - このコレクションのクロンダイクやFreeCellがすでに採用している、毎回本当に新しくシャッフルされる、より手間の少ないアプローチを、スパイダー独自の10列・組札なしのレイアウトに合わせて採用しています。"
});
I18n.markTextLoaded("ja");
