// text/zh/fanorona.js
// Rules and history texts of fanorona (zh). Loaded by fanorona-rules.html and fanorona-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    fanorona_rules_title: "法诺罗纳棋规则",
    fanorona_rules_intro: "PaperGames中法诺罗纳棋玩法的简要说明——无论是重新上手还是刚开始学习都很有用。",
    fanorona_rules_basics_title: "基本玩法",
    fanorona_term_board: "棋盘",
    fanorona_rules_board: "棋盘由5x9网格上的45个点组成,通过横线、竖线以及部分斜线相连——斜线的方向逐格交替,因此大约一半的点('强点')与全部8个相邻点相连,其余的点('弱点')则只与横竖方向的邻点相连。每位玩家开局有22枚棋子,占据离自己最近的两行,再加上中间一行的一半(交替排列),棋盘正中央的那一点留空。白方先行。",
    fanorona_term_capture: "吃子",
    fanorona_rules_capture: "沿一条线将棋子滑到相邻的空点。根据移动方向的不同,这一步可以通过接近吃、后退吃,或者(若两者皆可)由你选择其一,吃掉一条直线上的敌方棋子——见下方示例。吃子是强制性的:只要棋盘上任何位置存在可吃的走法,就必须走吃子,而不能走不吃子的普通(paika)走法。",
    fanorona_term_approach: "接近吃",
    fanorona_rules_approach: "移动棋子,使其新位置的正前方(即刚才移动的同一方向上)紧邻一枚敌方棋子。该棋子以及沿同一直线紧随其后、不间断排列的所有敌方棋子都会被吃掉。",
    fanorona_term_withdrawal: "后退吃",
    fanorona_rules_withdrawal: "将棋子从原位置正后方(即与本次移动方向恰好相反的方向)紧邻的敌方棋子处移开。该棋子以及沿同一直线紧随其后、不间断排列的所有敌方棋子都会被吃掉。",
    fanorona_rules_example_title: "示例讲解",
    fanorona_rules_example_intro: "下方小图中,●代表白方,○代表黑方,虚线圆圈表示白方即将移动到的点。",
    fanorona_rules_example_approach_caption: "接近吃:白方走A→B。由于同一直线上、紧邻B之后的位置有黑子,它们被吃掉。",
    fanorona_rules_example_withdrawal_caption: "后退吃:白方走A→B,正好离开了原本在A后方的黑子。由于白方沿这条直线远离它们,这些黑子同样被吃掉。",
    fanorona_term_chain: "连续吃子",
    fanorona_rules_chain: "吃子之后,同一枚棋子可以从新位置继续吃子——但与跳棋不同,这从不是强制的:你可以在任意一次吃子后停下。连续吃子时还有两条额外规则:棋子不能连续两次朝完全相同的方向移动,也绝不能落在本回合中已经走过的点上。",
    fanorona_rules_end_title: "对局如何结束",
    fanorona_term_win: "获胜",
    fanorona_rules_win: "吃光对方所有棋子即获胜;若轮到对方走棋时对方完全无棋可走,你也获胜。",
    fanorona_term_resignation: "认输",
    fanorona_rules_resignation: "玩家可以随时认输,对局立即以对手获胜结束。",
    fanorona_history_title: "法诺罗纳棋的历史",
    fanorona_history_origins_title: "从阿尔盖尔克到马达加斯加高地",
    fanorona_history_origins_p1: "据信法诺罗纳棋源自阿尔盖尔克(Alquerque),一种历史悠久的跳吃棋类游戏,很可能是由阿拉伯或东南亚商人带到马达加斯加的。阿尔盖尔克同时也是西洋跳棋(checkers/draughts)的共同祖先,这使得法诺罗纳棋与跳棋算得上是远亲:两者都保留了跳吃的基本理念,却各自独立发展出了截然不同的规则。",
    fanorona_history_origins_p2: "马达加斯加人将这种外来的游戏改造成了完全属于自己的样子:更大的5x9棋盘,混合了直线与斜线,以及阿尔盖尔克和跳棋都没有的接近/后退吃子机制。在塔那那利佛附近发现的一些现存最古老的、刻在石头上的法诺罗纳棋盘,据估计可追溯至16或17世纪。",
    fanorona_history_legend_title: "一局(据传)决定了王位归属的对弈",
    fanorona_history_legend_p1: "据一则广为流传的马达加斯加传说,拉拉姆博国王曾用一种方法考验自己的两个儿子,以判断谁更适合继承王位:他假装身患重病,派人召唤两位王子前来,想看谁先到。据说长子当时正沉浸在一局艰难的法诺罗纳棋局中,留下把棋下完,结果弟弟先赶到,并按传说所言最终继承了王位。正如大多数经过数百年口耳相传的故事一样,细节因版本而异,这一事件也无法被证实为确凿的历史事实——但至今人们仍常以此为例,说明法诺罗纳棋在马达加斯加自古以来受重视的程度。",
    fanorona_history_modern_title: "至今仍是马达加斯加的国民游戏",
    fanorona_history_modern_p1: "如今法诺罗纳棋在马达加斯加各地仍被广泛游玩,常被称为该国的国家棋类游戏——既是村庄和城镇里随性而玩的消遣,也是竞技层面认真研究的对象。此外还存在更小的变体:3x3版本(Fanoron-Telo,深度大致相当于井字棋)和5x5版本(Fanoron-Dimy),但本页介绍的5x9棋盘(Fanoron-Tsivy)才是最标准、最广为人知的形式。",
    fanorona_history_modern_p2: "这款游戏也引起了真正的学术兴趣:2008年发表的一项计算机分析对法诺罗纳棋进行了弱解,证明双方都下出最佳走法时对局将以和棋收场——这使它与跳棋一样,跻身被现代计算机精确解出的为数不多的古老棋类之列。"
});
I18n.markTextLoaded("zh");
