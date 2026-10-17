// text/zh/baghchal.js
// Rules and history texts of baghchal (zh). Loaded by baghchal-rules.html and baghchal-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    baghchal_rules_title: "虎棋规则",
    baghchal_rules_intro: "关于PaperGames如何呈现虎棋(\"老虎与山羊\")的简要说明 - 无论你是久未接触还是刚开始学习,都会有帮助。",
    baghchal_rules_basics_title: "基本理念",
    baghchal_term_board: "棋盘",
    baghchal_rules_board: "棋盘由5x5网格上的25个点组成,用水平线、垂直线和一些对角线相连 - 与Fanorona棋盘相同的阿尔克格式网格,只是呈正方形:四个角和中心是完整的8方向枢纽点,对角线由此向外延伸,构成棋盘特有的三角形网格图案。4只老虎从四个角开始。其余21个点起初为空 - 20只山羊尚未上盘。",
    baghchal_term_placement: "布子阶段",
    baghchal_rules_placement: "每回合山羊方先行:山羊方在任意空点上放置一只新山羊。随后老虎方行动(见下文) - 老虎从第一回合起就已经可以移动和吃子,即使山羊仍在陆续上盘。这个阶段一直持续到全部20只山羊都已放置到棋盘上。",
    baghchal_term_movement: "行棋阶段",
    baghchal_rules_movement: "一旦所有山羊都已上盘,双方就只是移动棋子:每回合,将你自己的一枚棋子沿连接线移动一步到相邻的空点。",
    baghchal_term_capture: "吃子",
    baghchal_rules_capture: "与山羊相邻的老虎,可以沿棋盘上一条真实的连接线,直线跳过该山羊,落到紧邻其后的空点上,并吃掉这只山羊。这里的吃子是可选的,而非强制的:即使有吃子机会,老虎也可以选择走一步普通的棋。(有些传统规则规定只要有机会就必须吃子 - 本作品有意选择了在现代对局中更常见的规则,并在此明确说明,而非疏漏。)山羊永远不能吃子。",
    baghchal_rules_example_title: "实例讲解:老虎的一次吃子",
    baghchal_rules_example_intro: "在下方的小示意图中,▲代表老虎,○代表山羊,虚线圆圈是老虎即将跳到的空点。",
    baghchal_rules_example_caption: "A处的老虎与B处的山羊相邻,而紧随其后的C点(沿同一方向,沿棋盘上真实的连线)是空的。老虎可以从A跳到C,吃掉B处的山羊。如果C点已被占用,或者A-B-C不是沿棋盘真实连线构成的一条直线,这次跳跃就不合法。",
    baghchal_rules_end_title: "对局如何结束",
    baghchal_term_tiger_win: "老虎获胜",
    baghchal_rules_tiger_win: "共吃掉5只山羊即获胜 - 这是标准的门槛(有些地区变体使用不同的数字,但5是最常见的)。",
    baghchal_term_goat_win: "山羊获胜",
    baghchal_rules_goat_win: "将全部4只老虎困住,使轮到行棋的老虎完全没有合法着法可走 - 无论普通移动还是吃子,任何一只老虎都无棋可走。",
    baghchal_term_resignation: "认输",
    baghchal_rules_resignation: "玩家可以随时认输,对局立即以对手获胜结束。",
    baghchal_history_title: "虎棋的历史",
    baghchal_history_origins_title: "起源不明的古老游戏",
    baghchal_history_origins_p1: "没有人能确切考证虎棋起源的年代。和大多数传统棋类游戏一样,它是刻画在泥地或石头上流传下来的,而非记录在保存至今的手稿中,因此没有留下任何单一的创始文献 - 只有一段在尼泊尔全境延续不断的悠久游戏传统,在加德满都谷地周边的丘陵地区尤为盛行。这个名字本身简单而直白:\"bagh\"意为老虎,\"chal\"意为移动 - 意即\"虎之步\",英语通常译作Tigers and Goats(老虎与山羊)。",
    baghchal_history_origins_p2: "棋盘本身 - 由正交线和对角线组成的5x5网格 - 遵循与亚洲、欧洲和非洲许多其他传统游戏相同的阿尔克格(alquerque)家族几何结构(PaperGames自己收录的、源自马达加斯加的Fanorona,就是这一更广泛家族中一个有据可查的例子)。真正让虎棋与众不同的不是棋盘本身,而是建立在棋盘之上的不对称性:少数强大的猎手,对抗一群起初还不在棋盘上、试图以数量优势将其困死的羊群。",
    baghchal_history_family_title: "世界性狩猎类游戏家族的一员",
    baghchal_history_family_p1: "虎棋属于一个在世界各地独立产生的庞大\"狩猎类游戏\"家族:双方棋子数量不等、目标也截然不同,而非彼此对称的军队。几个世纪以来在欧洲流行的\"狐狸与鹅\"在精神上与之十分相近;北欧各种版本的Tafl(维京棋)也是如此,那类游戏中国王的少量卫队试图从数量远超己方的围攻大军中逃脱。目前尚无证据表明这些游戏中的任何一种是从另一种演变而来 - 更恰当的理解是,同一个简单却引人入胜的构想(少量强子对抗众多弱子,逃脱/生存对抗捕获/困死)在不同文化中被各自独立地重新发现。",
    baghchal_history_family_p2: "在尼泊尔,虎棋长期以来一直与达善节(Dashain)联系在一起,这是该国规模最大、最重要的印度教节日:一场持续数周的秋季庆典,期间大家族团聚一堂,而棋类游戏 - 尤其是虎棋 - 与纸牌等其他游戏一样,是消磨长时间探亲时光的传统方式。这种与节日的联系,即使在其他娱乐方式出现之后,也帮助这款游戏代代相传、延续至今。",
    baghchal_history_modern_title: "今日尼泊尔的棋类游戏 - 也是计算机研究的对象",
    baghchal_history_modern_p1: "虎棋至今仍被广泛视为尼泊尔的国民棋类游戏,或是其最具代表性的传统棋类游戏;人们常常随手用手绘的棋盘、瓶盖或小石子作为棋子来玩,其频繁程度不亚于使用雕刻精美的木制棋具,并且它也随着尼泊尔侨民传播到了海外。它还进入了手机应用和网络对战领域,让从未接触过实体棋盘的玩家也认识了这款游戏。",
    baghchal_history_modern_p2: "这款游戏也引起了真正的学术关注:它曾被纳入组合博弈论的研究范畴,并通过计算机分析被弱解出;针对某些规则变体的结果表明,在双方都发挥出最佳水平的情况下,山羊一方至少可以逼和 - 这是一项来之不易的稀有确定性结论,而在此之前,这款游戏更深层次的策略长期以来一直是人类玩家争论的话题。"
});
I18n.markTextLoaded("zh");
