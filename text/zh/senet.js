// text/zh/senet.js
// Rules and history texts of senet (zh). Loaded by senet-rules.html and senet-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    senet_rules_title: "塞尼特棋规则",
    senet_rules_intro: "关于 PaperGames 如何演绎塞尼特棋的简明参考——这款游戏的原始规则早已失传，如今的玩法只是现代人的一种复原方案，而非唯一定论。",
    senet_rules_basics_title: "基本玩法",
    senet_term_pieces: "棋子与路径",
    senet_rules_pieces: "每位玩家有 5 枚棋子，行走于一条 30 格的曲折路径上，编号方式呈“牛耕式”走向：最上一排从左到右，中间一排从右到左，最下一排再从左到右。轮到你时，先掷投掷棒，再把点数走在自己的一枚棋子上。",
    senet_term_sticks: "掷投掷棒",
    senet_rules_sticks: "四根双面投掷棒代替骰子使用：点数为标记面朝上的投掷棒数量，唯一的例外是——没有一根朝上时，视为最好的结果，也就是 6 点，而不是 0 点。掷出 1、4 或 6 可以再走一手。",
    senet_term_stacking: "叠子与吃子",
    senet_rules_stacking: "两枚或以上己方棋子可以共享一格，从而受到保护——对方无法落在这一格上。孤身站立的单枚棋子则可能被吃：对方棋子落在其上时，只是与它互换位置。",
    senet_term_houses: "三个特殊格",
    senet_rules_houses: "第 15 格“重生之屋”对占据它的一方永远安全。第 26 格“美丽之屋”不能被越过——棋子必须恰好落在这一格上才能继续前进。第 27 格“水之屋”十分凶险：落在这里的棋子会立刻被冲回重生之屋（如果那里已被占据，则冲回第 1 格）。",
    senet_rules_end_title: "对局如何结束",
    senet_term_win: "获胜",
    senet_rules_win: "棋子需要恰好合适的点数才能走出路径终点。率先让全部五枚棋子都走出终点的玩家获胜。",
    senet_term_resignation: "认输",
    senet_rules_resignation: "任何一方都可以随时认输，对局立即结束，对手获胜。",
    senet_history_title: "塞尼特棋的历史",
    senet_history_origins_title: "前王朝时期的起源",
    senet_history_origins_p1: "塞尼特棋盘与棋子曾在可追溯至公元前 3100 年左右的埃及墓葬中被发现，使它成为世界上已知最古老的棋类游戏之一——甚至比乌尔皇室游戏还要早上好几个世纪。这个名字在古埃及语中大致意为“通过之戏”。",
    senet_history_origins_p2: "早期的棋盘被雕刻在石头上，或刻画在家具上；到后来，精雕细琢、镶嵌华丽的塞尼特棋具成了埃及贵族珍视的财产，被与主人一同下葬，供来世使用。",
    senet_history_spread_title: "从消遣到来世",
    senet_history_spread_p1: "到新王国时期（约公元前 1550 至前 1070 年），塞尼特棋已被赋予深厚的宗教含义：它被重新诠释为灵魂穿越冥界、走向重生的一段象征性旅程，棋盘上的格子也被赋予了名字——重生之屋、美丽之屋、水之屋——分别对应这段旅程中的凶险与祝福。",
    senet_history_spread_p2: "最著名的一幅描绘，是纳芙塔莉王后（Nefertari，公元前 13 世纪）墓室中的一幅壁画，画中她独自一人在下塞尼特棋——这个场景通常被理解为祈求来世旅途平安，而不是单纯的休闲娱乐。",
    senet_history_modern_title: "一块没有规则手册的棋盘",
    senet_history_modern_p1: "从未发现过任何一份古代文献详细记载塞尼特棋的确切规则。如今人们玩的每一个版本，包括 PaperGames 的这套，都是现代人根据棋盘布局、墓葬中发现的棋子数量，以及后来带有相关规则记录的希腊罗马时期棋盘拼凑重建而成。",
    senet_history_modern_p2: "埃及学家蒂莫西·肯德尔（Timothy Kendall）在 1978 年提出的重建方案，是这些现代规则最常被采用的出发点之一，不过——与四子棋这样已被彻底破解的游戏不同——没有人能确切知道，这些重建规则与三千年前塞尼特棋的真实玩法究竟有多接近。"
});
I18n.markTextLoaded("zh");
