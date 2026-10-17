// text/zh/pyramidsolitaire.js
// Rules and history texts of pyramidsolitaire (zh). Loaded by pyramidsolitaire-rules.html and pyramidsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    pyramidsolitaire_rules_title: "金字塔接龙规则",
    pyramidsolitaire_rules_intro: "关于PaperGames如何玩金字塔接龙的简要说明——如果你生疏了，或者正在学习，都可以参考。",
    pyramidsolitaire_rules_basics_title: "基本玩法",
    pyramidsolitaire_term_layout: "牌局布局",
    pyramidsolitaire_rules_layout: "28张牌正面朝上排成7行的三角形:顶端1张，往下2张，依此类推,最底一行有7张,每张牌都压在下面一行的两张牌之上、位于二者中间。剩下的24张牌组成发牌堆,每次翻开一张放到弃牌堆上。",
    pyramidsolitaire_term_pairing: "凑成和为13的一对",
    pyramidsolitaire_rules_pairing: "这里的牌按面值计算:A = 1，2到10按面值,J = 11，Q = 12，K = 13。移除任意两张可用的牌,只要它们的点数之和恰好等于13——例如5和8、9和4，或者J（11）和2。K本身的点数就是13，所以可以单独移除，不需要搭配。",
    pyramidsolitaire_term_exposed: "明牌（可选中的牌）",
    pyramidsolitaire_rules_exposed: "金字塔中的一张牌,只有当压在它下面一行的两张牌都被移除之后,才能被拿走——最底一行从一开始就是明牌，因为它下面没有牌。只有金字塔里的明牌和弃牌堆当前最上面的那张牌才能被移除;被压住的金字塔牌会以变暗的样式显示，虽然你能看清是哪张牌，但暂时不能选中它。",
    pyramidsolitaire_term_stock: "发牌堆、弃牌堆与重洗",
    pyramidsolitaire_rules_stock: "点击发牌堆，把它最上面的一张牌翻开放到弃牌堆上，每次一张——只有弃牌堆最上面的那张牌才能用来配对。发牌堆用完后，再次点击会把整个弃牌堆重新洗回发牌堆，让你可以再抽一遍，每局最多可以这样做2次。剩余的重洗次数会一直显示在发牌堆旁边。",
    pyramidsolitaire_rules_example_title: "示例讲解",
    pyramidsolitaire_term_example: "移除一对",
    pyramidsolitaire_rules_example: "假设最底一行有一张明牌9，金字塔里其他地方还有一张明牌4——先点9再点4，两张都会被移除，因为9 + 4 = 13。如果这张4是压在上一行某张6上面的唯一一张牌，而6下面的另一张邻牌也已经不在了，那么这张6就会变成明牌，也可以拿去配对了——比如和弃牌堆最上面的一张7配对。像这样不断移除牌，会逐渐露出上面的行，理想情况下最终整座金字塔都会被清空。",
    pyramidsolitaire_rules_end_title: "结束一局游戏",
    pyramidsolitaire_term_win: "获胜",
    pyramidsolitaire_rules_win: "当金字塔的28张牌全部被移除时，游戏即获胜——发牌堆和弃牌堆不需要也清空，这是大多数版本的这款游戏采用的标准获胜条件。",
    pyramidsolitaire_term_lose: "陷入僵局",
    pyramidsolitaire_rules_lose: "如果发牌堆已空、没有重洗次数了，而且在金字塔的明牌和弃牌堆最上面那张牌中既凑不出K，也凑不出和为13的一对，游戏就会以失败告终——PaperGames会清楚地显示这一点，而不会让你毫无提示地卡在无棋可走的局面里。",
    pyramidsolitaire_history_title: "金字塔接龙的历史",
    pyramidsolitaire_history_origins_title: "一款历史较早、记载较少的游戏",
    pyramidsolitaire_history_origins_p1: "金字塔接龙与克朗代克、空当接龙同属一个庞大的单人\"耐心牌\"纸牌游戏家族，其中大多数游戏在19世纪至20世纪初流传于欧洲和北美，各地叫法不同，规则也略有差异。和大多数经典接龙一样，金字塔接龙的确切起源——是谁最先把28张牌摆成三角形，并开始把它们配对凑成13——已经无法追溯到某个单一、有据可查的出处或年代。",
    pyramidsolitaire_history_origins_p2: "但可以确定的是,是什么让它有别于这个家族的其他成员:克朗代克、空当接龙和蜘蛛纸牌本质上都是围绕构建递减的牌序展开的,而金字塔接龙的核心机制却是算术——移除数值之和恰好为13的牌对，再加上本身就等于13、可以单独移除的K。这条\"凑13\"配对规则，正是这款游戏在历史上最具辨识度的特征，也是把它与那些构建序列的\"表亲们\"区分开来的最明显方式。",
    pyramidsolitaire_history_spread_title: "再度随Windows一同推出",
    pyramidsolitaire_history_spread_p1: "金字塔接龙早在多年前就已出现在纸牌游戏的参考书籍和早期的数字接龙合集中，但它真正走向大众，靠的是和当年克朗代克一样的方式:随Windows一起附带发行。微软将它收录进Windows 8及后续版本内置的Microsoft Solitaire Collection中,与克朗代克、蜘蛛纸牌和空当接龙并列。",
    pyramidsolitaire_history_spread_p2: "对于许多从小以为Windows上的\"接龙\"专指克朗代克的玩家来说，这套Solitaire Collection往往是他们第一次真正接触到金字塔接龙所代表的这种以配对为核心的接龙玩法——一种藏在同一个熟悉的\"接龙\"名字之下、却截然不同的解谜游戏。",
    pyramidsolitaire_history_modern_title: "本站的这个版本",
    pyramidsolitaire_history_modern_p1: "PaperGames采用标准规则:每局都是真正全新的洗牌，全部28张金字塔牌从一开始就正面朝上摆放，发牌堆/弃牌堆每次翻一张，最多可以重洗2次，并采用常见的\"清空金字塔\"获胜条件——发牌堆和弃牌堆不需要也清空，这与大多数现代版本的这款游戏做法一致。"
});
I18n.markTextLoaded("zh");
