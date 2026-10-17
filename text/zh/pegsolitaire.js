// text/zh/pegsolitaire.js
// Rules and history texts of pegsolitaire (zh). Loaded by pegsolitaire-rules.html and pegsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    pegsolitaire_rules_title: "孔明棋规则",
    pegsolitaire_rules_intro: "关于 PaperGames 如何演绎孔明棋的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    pegsolitaire_rules_basics_title: "基本玩法",
    pegsolitaire_term_board: "棋盘与起始位置",
    pegsolitaire_rules_board: "开局前先选择棋盘，默认是英式棋盘（33 孔）。除了一个孔之外，所有孔一开始都插着棋子；空的是哪个孔，见“棋盘”一节中各棋盘的说明。",
    pegsolitaire_term_jump: "跳子",
    pegsolitaire_rules_jump: "选中一枚棋钉，然后选择沿直线（上、下、左或右，绝不能斜跳）方向、间隔两格的一个空孔，且中间那一格必须恰好有另一枚棋钉。该棋钉会跳入空孔，被跳过的那枚棋钉则从棋盘上移除。例外：在三角形棋盘上，还可以沿斜线斜跳。",
    pegsolitaire_rules_end_title: "完成一局",
    pegsolitaire_term_win: "已解出",
    pegsolitaire_rules_win: "经典的目标是一路跳到只剩下一枚棋钉。一旦再也没有合法的跳子着法，对局也会立即结束，无论棋盘上还剩多少枚棋钉，都视为未能解出。",
    pegsolitaire_rules_boards_title: "棋盘",
    pegsolitaire_rules_boards: "英式：7×7 的方格去掉四角的 2×2，共 33 孔，中心为空。欧式：7×7 的方格每个角只去掉三个孔，共 37 孔；从中心开始无解，因此空的是中心正上方的孔。德式（J. C. 维格勒布，1779 年）：9×9 的方格去掉四角的 3×3，共 45 孔，中心为空。正方形：完整的 6×6 方格，共 36 孔；中间四个孔中左上的那个为空。大菱形：9×9 方格上由 41 个孔组成的菱形；空的是中心上方第二行的孔——这种棋盘上能解开的开局位置本来就极少。三角形：五行，每行 1 到 5 个孔，每行错开半个孔，共 15 孔；中间三个孔中左上的那个为空。所有方格棋盘都只能横向或纵向跳，不能斜跳。只有三角形棋盘还可以沿斜线斜跳，共有六个方向。",
    pegsolitaire_history_title: "孔明棋的历史",
    pegsolitaire_history_origins_title: "一款法国宫廷游戏",
    pegsolitaire_history_origins_p1: "关于孔明棋最早的确凿证据来自 17 世纪末的法国：这款游戏出现在一幅 1697 年的版画中，并且在路易十四的宫廷里颇为流行，当时的文献中曾有提及。一个流传甚广的传说，把它的发明归功于一位被独自囚禁在孤岛上的贵族——这是一个动人的故事，却没有任何证据支持，几乎可以肯定是后人为了给这款游戏增添浪漫色彩而编造出来的。",
    pegsolitaire_history_origins_p2: "在法国确立为标准的棋盘有 37 个孔（在普通十字形基础上多加了四个角），而传到英国后流行开来的版本——本应用采用的 33 孔十字棋盘——则在 19 世纪成为更通行的英语世界标准。",
    pegsolitaire_history_spread_title: "一块棋盘，多种形状",
    pegsolitaire_history_spread_p1: "除了经典的十字形之外，孔明棋棋盘还曾被制成三角形（拥有自己独立的 15 钉版本，几十年来一直是美国餐厅餐桌上的常见摆设）、菱形以及其他各种形状——无论孔的排列成何种形状，跳子的规则始终不变。",
    pegsolitaire_history_wiegleb: "J. C. 维格勒布在 1779 年的著作《Unterricht in der natürlichen Magie》（《自然魔术教程》）中描述了一种更大的十字形棋盘：在 9×9 的方格上共有 45 个孔。",
    pegsolitaire_history_spread_p2: "由于每一步都恰好移除一枚棋钉，从 n 枚棋钉跳到剩下 1 枚，必然正好需要 n-1 次跳跃——这是极少数一局取胜所需步数在开局前就已注定的棋类游戏之一，无论具体走的是哪一种跳跃顺序都不会改变。",
    pegsolitaire_history_modern_title: "一道已被破解、却别有意味的谜题",
    pegsolitaire_history_modern_p1: "孔明棋从 20 世纪六七十年代起吸引了严肃的数学关注，包括约翰·康威（John Conway）在内的研究者，运用电阻网络类比与群论等工具，精确推算出从标准起始局面出发，最终能留下单枚棋钉的具体位置有哪些——棋盘正中央正是其中之一，但绝非唯一的一个。",
    pegsolitaire_history_modern_p2: "后来的计算机搜索为 33 孔棋盘彻底解答了这个问题：从中央为空开始的一局，总能一路跳到只剩一枚棋钉，本质上不同的获胜方式的数量也已被精确计算出来——这是实体解谜游戏演变为一个被完全解开的组合数学问题的罕见案例。"
});
I18n.markTextLoaded("zh");
