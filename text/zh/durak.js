// text/zh/durak.js
// Rules and history texts of durak (zh). Loaded by durak-rules.html and durak-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sudoku_rules_basics_title: "基本玩法",
    durak_rules_title: "杜拉克规则",
    durak_rules_intro: "PaperGames 中杜拉克的玩法，采用可以追加牌的常见形式。",
    durak_term_setup: "牌和王牌",
    durak_rules_setup: "一副 36 张牌（四种花色的 6 到 A），2 到 4 人，每人六张。下一张牌正面朝上压在牌堆下面：它的花色是整局的王牌，也是最后被摸走的牌。王牌花色总是显示在牌桌上方。",
    durak_term_attack: "进攻和防守",
    durak_rules_attack: "有最小王牌的玩家先进攻。进攻方打出一张正面朝上的牌；下一位玩家防守，必须用同花色更大的牌压住它，或者在进攻牌不是王牌时用任意一张王牌压住。王牌只能被更大的王牌压住。",
    durak_term_throw: "追加",
    durak_rules_throw: "第一张牌打出后，进攻方和其他玩家可以追加更多的牌——但只能是桌上已有的点数，不论是进攻牌还是压牌。防守方必须压住每一张。一轮中进攻牌最多六张，而且不能超过防守方在本轮开始时的手牌数。",
    durak_term_take: "收牌",
    durak_rules_take: "如果防守方不能或不想压住某张牌，就把桌上所有的牌收进手里；在此之前其他人还可以追加合适的牌。然后由防守方的下一位玩家进攻——防守方被跳过。如果防守方全部压住，这些牌离开游戏，接下来由防守方进攻。",
    durak_term_draw: "补牌",
    durak_rules_draw: "每轮结束后，所有人从牌堆把手牌补到六张：进攻方先补，然后依次轮流，防守方最后。",
    durak_term_end: "结束",
    durak_rules_end: "牌堆用完后就不再补牌，没有牌的玩家退出。最后手里还有牌的玩家就是杜拉克——傻瓜——输掉游戏。如果最后几位玩家同时出完牌，则为平局。",
    durak_term_transfer: "可选：转移进攻",
    durak_rules_transfer: "除非你在开局前打开，这条规则是关闭的。在压任何牌之前，防守方可以打出一张和进攻牌点数相同的牌，把整个进攻转给下一位玩家，由他来防守所有的牌。下一位玩家必须有足够的牌。",
    durak_history_title: "杜拉克的历史",
    durak_history_origins_title: "俄罗斯民间游戏",
    durak_history_origins_p1: "一般认为杜拉克在 19 世纪的俄罗斯普通百姓中流传开来，用当地常见的 36 张牌来玩。到 20 世纪，它成为整个苏联及周边国家最流行的纸牌游戏之一，人们在家里、火车上和军队里学会了它。",
    durak_history_origins_p2: "和大多数纸牌游戏不同，它没有赢家，只有输家：“杜拉克”意思是“傻瓜”，最后手里还有牌的玩家在下一局开始前都被这样称呼。",
    durak_history_names_title: "多种玩法",
    durak_history_names_p1: "这里可以追加牌的玩法叫“追加杜拉克”（podkidnoy durak）。另一种流行玩法“转移杜拉克”（perevodnoy durak）中，防守方可以用同点数的牌转移进攻——PaperGames 将其作为选项提供。",
    durak_history_names_p2: "此外还有数不清的家规，例如第一轮最多可以追加几张牌。家人之间常为此争论，这也是游戏魅力的一部分。"
});
I18n.markTextLoaded("zh");
