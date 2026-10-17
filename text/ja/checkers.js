// text/ja/checkers.js
// Rules and history texts of checkers (ja). Loaded by checkers-rules.html and checkers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    checkers_rules_title: "チェッカーのルール",
    checkers_rules_intro: "PaperGamesでのチェッカー（イギリス式ドラフツ）の遊び方を簡単にまとめました。ルールを思い出したいときにも、これから覚えるときにもどうぞ。",
    checkers_rules_basics_title: "基本的な考え方",
    checkers_term_men: "駒",
    checkers_rules_men: "黒と白はそれぞれ、自陣3列分の暗いマスに12個の駒を並べてスタートします。1手ごとに斜め前方へ1マスずつ進み、黒から交互に手番が進みます。",
    checkers_term_kings: "キング",
    checkers_rules_kings: "一番奥の列に到達した駒はキングに成ります。キングは斜め方向ならどちらにも動けますが、やはり1マスずつです。",
    checkers_rules_capture_title: "駒を取る",
    checkers_term_capture: "駒を取る",
    checkers_rules_capture: "隣接する相手の駒を斜めに飛び越え、その先の空いたマスに着地することで駒を取ります。飛び越えられた駒は盤上から取り除かれます。",
    checkers_term_mandatory: "取る手が優先",
    checkers_rules_mandatory: "取れる手がある場合は必ずそのいずれかを選ばなければなりません。取れる手があるときに、駒を取らない手は指せません。取れる駒が複数ある場合、どの駒で取るかは選べます。",
    checkers_term_multijump: "連続跳び",
    checkers_rules_multijump: "一度駒を取った後、同じ駒でさらに別の駒を取れる場合は、それ以上取れなくなるまで跳び続けなければなりません。連続跳びの途中であっても、一番奥の列に到達した時点でその駒はキングに成り、手番はそこで終了します。",
    checkers_rules_end_title: "ゲームの終わり方",
    checkers_term_win: "勝利条件",
    checkers_rules_win: "相手の駒がすべてなくなるか、手番で相手に合法手がなくなった時点で勝利となります。",
    checkers_term_resignation: "投了",
    checkers_rules_resignation: "プレイヤーはいつでも投了でき、その時点で相手の勝ちとなり対局が終了します。",
    checkers_term_draw: "引き分け",
    checkers_rules_draw: "どちらの側も駒を取らないまま40手が続くと、対局は引き分けになります。",
    checkers_history_title: "チェッカーの歴史",
    checkers_history_origins_title: "古代の盤と、中世のゲーム",
    checkers_history_origins_p1: "チェッカーの盤面と初期配置は、5×5の線状の盤で行う駒取りゲーム「アルケルケ」にさかのぼります。アルケルケはエジプトや中東で3,000年以上前から知られ、後にムーア人支配下のスペインでも人気を博しました。",
    checkers_history_origins_p2: "12世紀頃、南フランスの誰かがアルケルケの斜めに駒を取るルールをチェス盤と組み合わせ、「フィエルジュ」あるいは「ジュ・ド・ダム」と呼ばれるゲームを生み出しました。これが今日遊ばれているゲームの直接の祖先です。",
    checkers_history_spread_title: "フランスから世界へ",
    checkers_history_spread_p1: "このゲームはヨーロッパ各地に広がり、イギリスでは「ドラフツ」、スペインでは「ダマ」、ドイツでは「ダーメ」など、さまざまな名前で呼ばれるようになりました。さらに入植者とともに大西洋を渡り、アメリカ合衆国で特に人気を博しました。このアプリで採用されている8×8の盤と強制的な駒取りのルール（アメリカン・チェッカー）が定着したのも、この地でのことです。",
    checkers_history_spread_p2: "19世紀以降、国内選手権や世界選手権が開催されており、イギリスやアメリカをはじめとする各地での組織的な競技活動が、名だたるプレイヤーと深く研究された序盤定跡を数多く生み出してきました。",
    checkers_history_modern_title: "解き明かされたゲーム",
    checkers_history_modern_p1: "チェッカーはゲーム理論において特別な位置を占めています。2007年、ジョナサン・シェーファーが率いるプログラム「Chinook」が、20年近くにおよぶ計算の末に、双方が最善を尽くせばチェッカーは引き分けになることを証明しました。当時としては、これほど徹底的に解き明かされた中で最も複雑なゲームでした。",
    checkers_history_modern_p2: "だからといって、チェッカーをプレイする楽しさが減るわけではありません。チェスの解明された終盤と同じように、理論的な結果を知っていても、実際に盤を挟んで対局するために必要な技量が変わることはないのです。"
});
I18n.markTextLoaded("ja");
