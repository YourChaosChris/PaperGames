// text/ja/minesweeper.js
// Rules and history texts of minesweeper (ja). Loaded by minesweeper-rules.html and minesweeper-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    minesweeper_rules_title: "マインスイーパーのルール",
    minesweeper_rules_intro: "PaperGamesでのマインスイーパーの遊び方を簡単にまとめました。ルールを思い出したいときにも、これから覚えるときにもどうぞ。",
    minesweeper_rules_basics_title: "基本的な考え方",
    minesweeper_term_board: "盤面と最初の一手",
    minesweeper_rules_board: "マス目の中に、見えない地雷が散らばっています。最初に開けるマスは必ず安全です。地雷はそのマスとその周囲のマスを避けて、開けた後に配置されるため、始まった瞬間に終わってしまうことはありません。",
    minesweeper_term_numbers: "数字の読み方",
    minesweeper_rules_numbers: "安全なマスを開けると数字が表示され、それは隣接する8マスに隠れている地雷の数を示します。空白のマスは0を意味し、そこを開けるとつながっている空白の領域がまとめて自動的に開きます。",
    minesweeper_term_flags: "フラグを立てる",
    minesweeper_rules_flags: "地雷があると思うマスには、フラグモード（タッチ操作向け）や右クリック（デスクトップのブラウザ）でフラグを立てられます。フラグを立てたマスは誤って開いてしまうことがありません。すでに開いた数字マスをクリックしたとき、その周囲に立てたフラグの数が数字と一致していれば、残りの隣接マスを一気に開けます。これはクラシックなデスクトップ版の中クリックと同じ動きですが、フラグを間違った場所に立てていると、この操作でゲームオーバーになってしまうこともあります。",
    minesweeper_rules_end_title: "ゲームの終わり方",
    minesweeper_term_win: "勝利条件",
    minesweeper_rules_win: "地雷でないマスをすべて開ければ、盤面をクリアしたことになります。",
    minesweeper_term_loss: "敗北条件",
    minesweeper_rules_loss: "地雷を開けてしまうとその時点でゲームオーバーになります。盤上のすべての地雷が表示され、自分を仕留めた地雷には他と区別する印がつきます。",
    minesweeper_history_title: "マインスイーパーの歴史",
    minesweeper_history_origins_title: "メインフレームからデスクトップへ",
    minesweeper_history_origins_p1: "マス目を開けて推理するタイプのゲームは1960年代初頭にさかのぼり、メインフレームや1980年代の初期のパーソナルコンピューター上でさまざまな名前で登場しました。1989年のWindows/OS2版「Mined-Out」や、「RLogic」「Cube」といった名前のフリーウェア版などがその例です。",
    minesweeper_history_origins_p2: "このゲームを広く知らしめた Windows 版は、マイクロソフトの2人の社員によるものです。カート・ジョンソン（Curt Johnson）がまず IBM の OS/2 向けにゲームを書き、ロバート・ドナー（Robert Donner）がそれを Windows に移植しました。1990年に Microsoft Entertainment Pack で初めて登場し、1992年からは Windows 3.1 の標準インストールに含まれ、それまでの Windows のゲーム「リバーシ」に取って代わりました。",
    minesweeper_history_spread_title: "すべてのデスクに導入されて",
    minesweeper_history_spread_p1: "1990年代から2000年代にかけて、Windowsが世界のPCの圧倒的なシェアを占めていたこともあり、マインスイーパーはほぼ自動的に、史上最も遊ばれたコンピューターゲームの一つになりました。どこにでも入っていて、説明書もいらず、本来の仕事の合間のちょっとした時間に遊べるゲームだったのです。",
    minesweeper_history_spread_p2: "今ではルールの中核とされている「最初のクリックは必ず安全」という仕組みも、実は後からの改良でした。1992年のオリジナル版では最初のクリックで地雷を踏んでしまうこともあり、その不満を解消するために、後のバージョンでは地雷の配置を最初のマスを開けた後まで先送りするよう設計が変更されました。このアプリでも同じ方式が使われています。",
    minesweeper_history_modern_title: "れっきとした難問",
    minesweeper_history_modern_p1: "懐かしさだけの話にとどまらず、マインスイーパーは数学的にも本格的な題材であることが分かっています。2000年、リチャード・ケイは、部分的に開かれたマインスイーパーの盤面が、そのヒントと矛盾しない解を持つかどうかを判定する問題がNP完全であることを証明しました。これは巡回セールスマン問題のような、悪名高く難しい問題と同じ計算複雑性のクラスに属します。",
    minesweeper_history_modern_p2: "この結果が意味するのは、任意のマインスイーパーの局面を常に素早く解く近道のアルゴリズムは存在しないということです。最も難しいケースでは、プレイヤー（あるいはコンピューター）は、論理だけでは安全なマスを導き出せず、正真正銘の五分五分の賭けを迫られることがあります。これはまさに、経験豊富なプレイヤーなら誰もが恐れることを学んでいる瞬間です。"
});
I18n.markTextLoaded("ja");
