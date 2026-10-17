// text/zh/gomoku.js
// Rules and history texts of gomoku (zh). Loaded by gomoku-rules.html and gomoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    gomoku_rules_title: "五子棋规则",
    gomoku_rules_intro: "关于 PaperGames 如何演绎五子棋的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    gomoku_rules_basics_title: "基本玩法",
    gomoku_term_board: "棋盘与落子",
    gomoku_rules_board: "棋子落在 15x15 网格的交叉点上，与围棋完全相同——一旦落子便不再移动，也不会被提走。黑方总是先行。",
    gomoku_rules_end_title: "对局如何结束",
    gomoku_term_win: "获胜",
    gomoku_rules_win: "率先将己方五枚或以上棋子连成不间断的一条线——横、竖或斜线均可——的一方立即获胜。",
    gomoku_term_draw: "和棋",
    gomoku_rules_draw: "如果棋盘被完全填满，双方都未能连成五子，则此局为和棋。",
    gomoku_term_resignation: "认输",
    gomoku_rules_resignation: "任何一方都可以随时认输，对局立即结束，对手获胜。",
    gomoku_history_title: "五子棋的历史",
    gomoku_history_origins_title: "古老的根源，现代的名字",
    gomoku_history_origins_p1: "在网格上把棋子连成一线的游戏，在整个东亚都有着数百年的历史；如今被称为“五子棋”的这套具体规则则成型于日本，其日文名（五目並べ，gomokunarabe）字面意思就是“五点连成一行”。",
    gomoku_history_origins_p2: "它传统上使用与围棋相同的黑白棋子和交叉点棋盘，是一款几乎不需要额外器材的轻松变体，历代围棋爱好者都会把它当作一种简单的余兴游戏。",
    gomoku_history_spread_title: "从休闲游戏到连珠",
    gomoku_history_spread_p1: "由于五子棋朴素的规则会给先手方（传统上是黑方）带来明显的先天优势，20 世纪初，日本出现了一套更严格的竞技规则“连珠”（Renju），增加了额外限制——禁止黑方使用某些“双三”或“双四”的布局——以求让双方站在更公平的起跑线上。",
    gomoku_history_spread_p2: "连珠成为了严肃锦标赛的标准规则，而这里所采用的更简单、不加限制的规则（常被称为“自由式”五子棋）则在世界各地依旧是更常见的休闲版本。",
    gomoku_history_modern_title: "被证明先手必胜",
    gomoku_history_modern_p1: "1994 年，研究者 L·维克多·阿利斯（L. Victor Allis）通过一种名为“证明数搜索”的详尽计算机分析方法，证明了在标准棋盘上，自由式五子棋在双方都下出最佳着法的情况下是先手方的必胜局。",
    gomoku_history_modern_p2: "这正是竞技连珠之所以存在的原因：如果没有对黑方的这些额外限制，锦标赛级别的五子棋就只会是一场已被解开的形式游戏，而非真正的较量——这是一个罕见的例子，说明一款“被破解”的游戏，直接改变了它在竞技层面的玩法，而不仅仅是一则有趣的注脚。"
});
I18n.markTextLoaded("zh");
