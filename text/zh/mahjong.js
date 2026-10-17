// text/zh/mahjong.js
// Rules and history texts of mahjong (zh). Loaded by mahjong-rules.html and mahjong-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    mahjong_rules_title: "麻将接龙规则",
    mahjong_rules_intro: "关于 PaperGames 如何演绎麻将接龙的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    mahjong_rules_basics_title: "基本玩法",
    mahjong_term_layout: "牌局布局",
    mahjong_rules_layout: "80 张牌堆叠成金字塔般的三层结构。一张牌只有在其上方没有任何牌压着、且同一层左右两侧至少有一侧相邻的位置为空或已被清走时，才算“自由”，可以拿取。",
    mahjong_term_matching: "配对",
    mahjong_rules_matching: "点击一张自由的牌，再点击另一张图案相同的自由牌，即可把两张牌一起从牌局中清走。每一局的牌面都经过特别生成，保证从起始局面就一定存在全部清空的解法，不过如果配对顺序不当，仍有可能在中途卡住。",
    mahjong_term_shuffle: "卡住时怎么办",
    mahjong_rules_shuffle: "如果棋盘上再也找不到任何合法配对，可以使用“重排剩余牌”，为剩下的牌重新分配图案——从那一刻起必定会有新的解法，所以一次卡住并不意味着必须从头重新开始整局游戏。",
    mahjong_rules_end_title: "完成一局",
    mahjong_term_win: "已清空",
    mahjong_rules_win: "当所有牌都被配对清走时，牌局即宣告清空。",
    mahjong_history_title: "麻将接龙的历史",
    mahjong_history_origins_title: "借来的牌，全新的游戏",
    mahjong_history_origins_p1: "麻将接龙（也叫上海麻将）并不是一款传统的中国游戏——它是 20 世纪早中期由西方人发明的产物，借用了四人游戏麻将（本身是 19 世纪的中国发明）中那套绘制精美的牌面，用来玩一种完全不同的单人配对解谜游戏，不含原版麻将中的“吃碰杠”、打牌或番种计分等任何元素。",
    mahjong_history_origins_p2: "究竟是谁最先把这种两两配对的单人玩法与麻将牌结合在一起，至今仍不十分清楚，各种说法互相竞争，追溯到电脑时代之前的几十年——可以肯定的是，这种组合直到搬上个人电脑之后，才真正成为一种全球现象。",
    mahjong_history_spread_title: "1980 年代电脑屏幕上的常客",
    mahjong_history_spread_p1: "这款游戏通过 1980 年代早期的电脑版本走向大众，其中最著名的是 Activision 公司 1986 年为 Macintosh 推出的“Shanghai”——它的流行程度之高，以至于“Shanghai”这个名字后来（在许多地方至今仍然）成了整个基于经典层叠牌型的单人配对游戏类型的代称。",
    mahjong_history_spread_p2: "让这款游戏得名的那种牌型布局——阶梯状、金字塔般的牌堆，昵称“乌龟”——与这一游戏类型的关联极为紧密，以至于包括本应用在内的绝大多数实现，都默认采用它的某种变体，而不是另外发明一种新形状。",
    mahjong_history_modern_title: "一种“天生可解”的谜题",
    mahjong_history_modern_p1: "与数独或数织这类先设计出谜题、再检验其解是否唯一的游戏不同，麻将接龙的一局通常是以另一种方式保证可解的：包括 PaperGames 在内的许多实现，都是从一个空棋盘开始反向构建牌局——反着重放一段合法的移除顺序，以此决定每个位置该放哪张牌。",
    mahjong_history_modern_p2: "这保证了从第一张牌被摆上棋盘的那一刻起，至少存在一条通向胜利的路径，但——正如一副真正的接龙纸牌一样——它并不能保证玩家实际做出的任何一种配对顺序都能走到那条路径上，这正是为什么在一局明明可解的牌局中途卡住，是这款游戏正常且意料之中的一部分，而不是哪里出了差错。"
});
I18n.markTextLoaded("zh");
