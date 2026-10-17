// text/zh/klondike.js
// Rules and history texts of klondike (zh). Loaded by klondike-rules.html and klondike-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    klondike_rules_title: "克朗代克规则",
    klondike_rules_intro: "PaperGames 版克朗代克玩法的简明速览 - 无论是手生了还是刚开始学，都能用得上。",
    klondike_rules_basics_title: "基本玩法",
    klondike_term_layout: "牌局摆放",
    klondike_rules_layout: "牌被发到 7 列牌堆中，每列 1 到 7 张不等，只有每列最上面的一张牌是正面朝上的。四个基础堆（每种花色一个）从 A 一路建到 K。牌堆剩下的牌组成发牌堆，每次抽一张翻到弃牌堆上。",
    klondike_term_tableau: "移动牌",
    klondike_rules_tableau: "一张牌只能移到某一列的顶牌上，且那张顶牌必须恰好大一点、颜色相反，或者移到空列上——空列只能放国王（K）。已经按同样的递减、颜色交替顺序正面朝上叠放的一整串牌，可以作为一个整体一起移动到合法的目标位置。",
    klondike_term_foundation: "基础堆",
    klondike_rules_foundation: "基础堆只接受本花色的牌，从 A 开始，每次只能往上加一个点数。牌一旦放到基础堆上就会留在那里——基础堆只接收牌，绝不会把牌还给牌堆。",
    klondike_term_stock: "发牌堆与弃牌堆",
    klondike_rules_stock: "点击发牌堆，可以把最上面的一张牌翻到弃牌堆上，每次一张。发牌堆抽空之后，再次点击会把整个弃牌堆重新洗回发牌堆，让你可以再抽一轮——PaperGames 不限制你可以重新洗牌的次数。",
    klondike_rules_end_title: "结束一局游戏",
    klondike_term_win: "获胜",
    klondike_rules_win: "四个基础堆全部集齐、从 A 到 K 的那一刻即为获胜。并不是每一次洗牌都能赢——与空当接龙（FreeCell）不同，克朗代克的牌局有可能在中途真正变得无解，因为一开始每列只能看到最上面的一张牌。",
    klondike_history_title: "克朗代克的历史",
    klondike_history_origins_title: "也许来自淘金热的名字",
    klondike_history_origins_p1: "克朗代克属于一个庞大的单人\"耐心牌\"（patience）家族，这类纸牌游戏在 19 世纪流传于欧洲和北美，大多只需要一副标准扑克牌和一块平整的桌面。如今玩的这套具体规则——七列层叠的牌堆、按花色从 A 建到 K 的四个基础堆、供反复抽取的发牌堆和弃牌堆——到 19 世纪末已在各地以不同的地方名称基本定型为今天的样子。",
    klondike_history_origins_p2: "它究竟是怎么被叫作\"克朗代克\"的，其实并不确定。流传最广的说法把这个名字和 19 世纪 90 年代末的克朗代克淘金热联系在一起，说是前往育空地区或在那里过冬的淘金者靠这款游戏打发时间——这是一个生动而听起来颇为可信的起源，但和许多纸牌游戏的名称由来一样，从未被追溯到有文献记载的最早使用记录。PaperGames 在这里只是把它作为流传甚广的说法来讲述，而非确凿的历史。",
    klondike_history_spread_title: "随 Windows 附赠",
    klondike_history_spread_p1: "克朗代克如今压倒性的知名度，与其说源自 19 世纪牌桌上的起源，不如说来自一款非常具体的软件：1990 年，微软在 Windows 3.0 中附带了一个简单命名为\"接龙\"（Solitaire）的版本——据说部分原因是想借此温和地教会新一代 Windows 用户如何用鼠标点击和拖放。",
    klondike_history_spread_p2: "这一招几乎起到了过头的效果：短短几年内，Windows 版接龙就被认为是全世界使用最广泛的软件之一，几乎装在每一台预装 Windows 的电脑上，不管机主是否真打算打开哪款游戏来玩。它重新定义了\"接龙\"这个词，对数百万从未以这个名字玩过一局实体纸牌的人来说都是如此。",
    klondike_history_modern_title: "本站的这个版本",
    klondike_history_modern_p1: "PaperGames 采用经典的单张抽牌规则，且不限制重新洗牌的次数，就像本站的空当接龙（FreeCell）一样，选择了摩擦更小的规则版本——每局都是真正全新的洗牌，而不是固定编号的一套牌局，也不限制你可以把发牌堆再过几遍。"
});
I18n.markTextLoaded("zh");
