// text/zh/cardduel.js
// Rules and history texts of cardduel (zh). Loaded by cardduel-rules.html and cardduel-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    cd_rules_title: "卡牌对决规则",
    cd_rules_intro: "两位法师用生物和法术对战。谁先把对方法师的生命从 20 打到 0，谁就获胜。",
    cd_rules_basics_title: "规则",
    cd_term_decks: "牌组",
    cd_rules_decks: "每位玩家从四套各 30 张的现成牌组中选一套（十种牌，每种三张）：森林有许多会再生的小生物，火直接造成伤害，水能抽牌并把生物送回，石的守卫不多但很强。两人可以选同一套牌组。",
    cd_term_power: "法力",
    cd_rules_power: "你的第一回合有 1 点法力，之后每回合多 1 点，最多 10 点。每张牌都要花法力（圆圈里的数字）；没用完的法力在回合结束时作废。",
    cd_term_turn: "回合",
    cd_rules_turn: "抽一张牌，出牌，用生物攻击，然后点“结束回合”。每方最多 6 个生物，手牌最多 10 张；手牌已满时抽到的牌会被弃掉。牌库空了以后，每次抽牌改为让你的法师失去 2 点生命。",
    cd_term_cards: "生物与法术",
    cd_rules_cards: "生物带着攻击和生命留在桌上（3 / 5 表示攻击 3、生命 5）。法术生效一次后就消失。生物受到的伤害会一直保留，直到生命为 0 被击败。",
    cd_term_attack: "攻击",
    cd_rules_attack: "生物在打出后的下一回合起才能攻击，每回合一次。目标由你选择：对方法师或对方的一个生物。两个生物会同时用各自的攻击力互相伤害。",
    cd_term_start: "谁先手",
    cd_rules_start: "先手随机决定。为了平衡，后手开局有 4 张牌而不是 3 张，第一回合多 1 点法力；整局游戏的第一个回合不抽牌。",
    cd_term_abilities: "能力",
    cd_rules_abilities: "有些牌带有六种能力之一；在游戏中点一张牌或一个生物，就会显示说明：",
    cd_term_playing: "操作",
    cd_rules_playing: "点你手牌中的一张牌，再点“出牌”；需要目标的法术会请你选择目标。要攻击，先点你一个已就绪的生物（粗边框），再点一个虚线边框的目标。下方列表显示最近的行动，也包括电脑的。对战电脑：简单经常随意出牌，中等选择眼下看起来最好的一步，困难还会考虑对方的应对。两人同一设备时，回合之间会遮住手牌。",
    cd_rules_example_title: "示例",
    cd_rules_example: "你的灰烬狼（3 / 3）攻击雾水獭（2 / 4，守卫）。水獭受到 3 点伤害，剩 1 点生命；狼受到 2 点伤害，剩 1 点生命。只要水獭还在，就不能攻击对方法师。",
    cd_history_title: "卡牌对决的历史",
    cd_history_origin_title: "自带规则的卡牌",
    cd_history_origin_p1: "扑克牌已有数百年历史，但每张都带有自己规则文字的卡牌要年轻得多。1993 年，美国出现了一款通常被视为第一款集换式卡牌游戏的游戏：每人用购买的卡包组成牌组，许多牌会稍稍改变规则。此后几年里，出现了许多这类游戏。",
    cd_history_today_title: "现成牌组与屏幕",
    cd_history_today_p1: "很早就有了无需收集、拿来就能玩的现成入门牌组。自 2010 年代起，这类游戏常在屏幕上进行，由电脑计算法力、生命和伤害。",
    cd_history_here_title: "PaperGames 中的卡牌对决",
    cd_history_here_p1: "卡牌对决保留了基本思路——两位法师、生物与法术、每回合多一点法力——但使用四套固定牌组，人物、名称和术语都是原创的。无需购买或收集。这些牌组经过数千局电脑对局调整，使每套牌组对其他任何一套都能赢下大约一半的对局。"
});
I18n.markTextLoaded("zh");
