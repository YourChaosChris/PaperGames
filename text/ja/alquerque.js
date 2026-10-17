// text/ja/alquerque.js
// Rules and history texts of alquerque (ja). Loaded by alquerque-rules.html and alquerque-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    alquerque_rules_title: "アルケルケのルール",
    alquerque_rules_intro: "PaperGamesでのアルケルケの遊び方を簡単にまとめました。カスティーリャ王アルフォンソ10世の『遊戯の書』に記された、駒を跳び越えるゲームです。",
    alquerque_rules_basics_title: "基本的な考え方",
    alquerque_term_board: "盤面",
    alquerque_rules_board: "盤には5x5の格子状に25個の点があります。隣り合う点は縦と横につながっており、一部は斜めにもつながっています。斜めの線は1つおきの点しか通らないため、四隅と中央の点は8方向すべてにつながっています。駒は描かれた線に沿ってしか動けません。",
    alquerque_term_setup: "初期配置",
    alquerque_rules_setup: "各陣営は12個の駒を持ちます。白（リング）が下、黒（塗りつぶした円盤）が上です。各陣営は自分に近い2列と、中央の列のうち自分から見て右側にある2つの点を埋めます。中央の点は空けておきます。白が先手です。",
    alquerque_term_move: "駒の動かし方",
    alquerque_rules_move: "自分の番には、自分の駒を1つ線に沿って隣の空いた点へ動かします。動かせるのは前・横・斜め前で、後ろへは斜めでも動かせません。前とは相手側の方向です。",
    alquerque_term_capture: "駒を取る",
    alquerque_rules_capture: "駒は、線に沿って隣にある相手の駒を飛び越え、そのすぐ先の空いた点に着地することで取ります。飛び越えられた駒は取り除かれます。同じ駒がさらに跳べる場合は、方向を変えてでも同じ手番のうちに続けて跳びます。跳び越しはどの方向でもよく、後ろ向きも可能です。これは PaperGames の取り決めで、出典が禁じているのは後ろへ動くことだけです。",
    alquerque_term_forced: "取るのは義務",
    alquerque_rules_forced: "取れる場合は必ず取らなければなりません。取れる手がある間、PaperGamesでは駒を取る手しか指せず、さらに跳び続けられる駒は跳べなくなるまで続けなければなりません。取り方が複数ある場合は、最も長いものに限らず、どれを選んでもかまいません。",
    alquerque_rules_end_title: "ゲームの終わり方",
    alquerque_term_win: "勝利条件",
    alquerque_rules_win: "相手の駒がすべてなくなるか、駒が残っていても相手の手番に合法手がなくなった時点で勝利となります。",
    alquerque_term_resignation: "投了",
    alquerque_term_dead: "もう出会えない両陣営",
    alquerque_rules_dead: "PaperGames の取り決め：白の駒がすべて黒のどの駒よりも2段以上上にあると、両陣営はもう二度と出会えません（白は上か横、黒は下か横にしか動けないため）。誰も駒を取れず対局が終わらなくなるので、その時点で終了します。駒の多い側の勝ちで、同数なら引き分けです。",
    alquerque_rules_resignation: "プレイヤーはいつでも投了でき、その時点で相手の勝ちとなり対局が終了します。",
    alquerque_rules_versions_title: "ここで遊べるルール",
    alquerque_rules_versions: "アルケルケの古い記述には、はっきりしない点があります。下に挙げた出典では取りは強制ではなく、取れたのに取らなかった駒が代わりに取り除かれます（英語で「huffing」）。PaperGames ではアプリがもともと正しい手しか示さないため、取りの強制を続けます。駒は後ろへは動けませんが、跳び越しはどの方向でもできます（PaperGames の取り決め）。白が先手です。",
    alquerque_rules_sources_title: "出典",
    alquerque_rules_sources: "後ろへ動けないこと、およびゲームの終わり方は次の出典によります：Wikipedia, „Alquerque“, section Rules: https://en.wikipedia.org/wiki/Alquerque（2026年10月6日閲覧）。",
    alquerque_history_title: "アルケルケの歴史",
    alquerque_history_origins_title: "アラビア語に由来する名前",
    alquerque_history_origins_p1: "この名前は、アラブ世界で知られていた盤上ゲームの名であるアラビア語のal-qirkatに由来します。ムーア人の支配下でスペインに伝わり、そこでalquerqueとして生き続けました。",
    alquerque_history_book_title: "『遊戯の書』",
    alquerque_history_book_p1: "1283年、カスティーリャ王アルフォンソ10世はLibro de los juegos、すなわち『遊戯の書』を完成させました。チェス、サイコロ遊び、盤双六の類に加えてアルケルケもルールと挿絵付きで記されており、このゲームに関する最古の文献の一つとなっています。",
    alquerque_history_checkers_title: "アルケルケからチェッカーへ",
    alquerque_history_checkers_p1: "チェッカーは一般にアルケルケの子孫とみなされています。飛び越えて取る方法と、取れるときは取らなければならないというルールが、チェス盤のマス目へと持ち込まれたのです。アルケルケ自体もその後も遊ばれ続け、似たゲームが多くの地域で知られています。",
    alquerque_history_modern_title: "PaperGamesでは",
    alquerque_history_modern_p1: "PaperGamesでは、5x5の盤で12対12、取るのが義務のルールで遊びます。盤の線はすべて描かれています。どの斜めの動きが可能かは、線でしか分からないからです。"
});
I18n.markTextLoaded("ja");
