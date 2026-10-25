// text/ja/bullsandcows.js
// Rules and history texts of bullsandcows (ja). Loaded by bullsandcows-rules.html and bullsandcows-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    bullsandcows_rules_title: "ブルズ・アンド・カウズのルール",
    bullsandcows_rules_intro: "PaperGamesでのブルズ・アンド・カウズの遊び方を簡単にまとめました。ルールを思い出したいときにも、これから覚えるときにもどうぞ。",
    bullsandcows_rules_basics_title: "基本のアイデア",
    bullsandcows_term_code: "秘密のコード",
    bullsandcows_rules_code: "新しいゲームを始めると、コンピューターが4つの位置からなる隠しコードを選びます。それぞれの位置には、丸・四角・三角・ひし形・星・十字の6種類の図形のいずれかが入ります。難易度によっては、同じ図形がコードの中に複数回使われることがあります。",
    bullsandcows_term_guess: "予想を立てる",
    bullsandcows_rules_guess: "枠をタップすると6種類の図形が順に切り替わります。試したい図形が4つの枠すべてに表示されたら、「予想を送信」をタップしてください。秘密のコード自体に重複があるかどうかにかかわらず、予想の中では図形を自由に繰り返して構いません。",
    bullsandcows_term_feedback: "ヒントの読み方",
    bullsandcows_rules_feedback: "予想を送信するたびに、ピンの列が返ってきます。図形も位置も正しい場合は黒いピン、図形は正しいが位置が違う場合は白いピンが付きます。例えば、コードが「丸・丸・四角・三角」で、あなたの予想が「丸・四角・四角・四角」だった場合、黒いピンが2個(最初の丸と3番目の四角が完全に正解)、白いピンは0個になります。これは、予想の中で余った四角に対応する図形がコード側にもう残っていないためです。ピンはどの枠に対応しているかを教えてくれないので、それを推理すること自体がこのパズルの醍醐味です。",
    bullsandcows_rules_end_title: "ゲームの終了",
    bullsandcows_term_win: "勝利",
    bullsandcows_rules_win: "予想が4個の黒いピンを獲得した瞬間に勝利します。すべての図形が正確に正しい位置にあるということです。",
    bullsandcows_term_loss: "予想回数を使い切ったとき",
    bullsandcows_rules_loss: "各難易度には決まった予想回数があります。コードを当てられないまま使い切ると、そこでゲームは終了し、秘密のコードが公開されます。",
    bullsandcows_term_levels: "難易度",
    bullsandcows_rules_levels: "「かんたん」では12回の予想が可能ですが、秘密のコードに同じ図形は使われません。「ふつう」では10回の予想が可能で、重複も許されます。これが伝統的な遊び方です。「むずかしい」では予想回数がわずか8回になり、重複も許されるため、同じ図形の重複には注意が必要です。",
    bullsandcows_history_title: "ブルズ・アンド・カウズの歴史",
    bullsandcows_history_origins_title: "紙と鉛筆の古典",
    bullsandcows_history_origins_p1: "隠されたコードを推理し、完全に合っている数と部分的に合っている数だけを教えてもらい、どこが合っているかは決して教えてもらえない――この中心となる考えは、1970年より前からある（一説にはずっと古いともいわれる）紙と鉛筆の当てっこ遊び「ブルズ・アンド・カウズ（雄牛と雌牛）」から来ています。伝統的には秘密の数字で遊び、正しい数字が正しい位置にあれば「ブル」、正しい数字が違う位置にあれば「カウ」です。",
    bullsandcows_history_origins_p2: "このゲームは早くからコンピューターにも移され、「Moo」と呼ばれることの多い版が1960年代後半から大学のコンピューターで動いていました。今でもプログラミングの定番の練習問題です。",
    bullsandcows_history_spread_title: "ボードゲームと名前",
    bullsandcows_history_spread_p1: "1970年、このアイデアは色付きのピンを使うボードゲームになり、Mastermindという名前で世界的に知られるようになりました。Mastermindは商標で、権利はInvicta Plasticsにあります。PaperGamesはInvicta Plasticsともそのボードゲームとも関係がないため、より古い名前であるブルズ・アンド・カウズを使っています。",
    bullsandcows_history_modern_title: "計算機科学者に愛されるパズル",
    bullsandcows_history_modern_p1: "一致した数だけを手がかりに隠れた答えを探すという性質から、このゲームは推理戦略や探索アルゴリズムを研究する計算機科学や組合せ論の定番の題材になりました。",
    bullsandcows_history_modern_p2: "1976/77年の有名な論文で、ドナルド・クヌースは、4つの位置と6種類の記号を使う古典的な形なら、最適な戦略で必ず5回以内に解けることを示しました。この結果は、探索アルゴリズムの話題になると今でも引用されます。"
});
I18n.markTextLoaded("ja");
