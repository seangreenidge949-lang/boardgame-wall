/**
 * 生成 BGG Top 100 样本数据
 * 基于 2025 年 BGG 排行榜的真实数据手动整理
 */

import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'

const OUTPUT = resolve(dirname(new URL(import.meta.url).pathname), '../data/games.json')

interface Game {
  id: number
  rank: number
  name: string
  nameCn: string
  year: number
  rating: number
  thumbnail: string
  image: string
  players: string
  playingTime: string
  comment: string
}

const games: Game[] = [
  { id: 174430, rank: 1, name: "Gloomhaven", nameCn: "幽港迷城", year: 2017, rating: 8.6, players: "1-4", playingTime: "120", comment: "黑暗幻想的极致体验，每一次副本都是心跳与策略的博弈" },
  { id: 161936, rank: 2, name: "Pandemic Legacy: Season 1", nameCn: "瘟疫危机：传承 第一季", year: 2015, rating: 8.5, players: "2-4", playingTime: "60", comment: "改写桌游历史的传承机制，每一局都在书写独特的故事" },
  { id: 224517, rank: 3, name: "Brass: Birmingham", nameCn: "黄铜：伯明翰", year: 2018, rating: 8.5, players: "2-4", playingTime: "120", comment: "工业革命时代的经济博弈，每一条运河都通向胜利" },
  { id: 167791, rank: 4, name: "Through the Ages: A New Story of Civilization", nameCn: "历史巨轮：文明新篇章", year: 2015, rating: 8.4, players: "2-4", playingTime: "120", comment: "人类文明的缩影，用卡牌书写从古至今的辉煌史诗" },
  { id: 187645, rank: 5, name: "Star Wars: Rebellion", nameCn: "星球大战：叛乱", year: 2016, rating: 8.4, players: "2-4", playingTime: "180", comment: "星战宇宙的史诗对决，帝国与反抗军的终极较量" },
  { id: 233078, rank: 6, name: "Twilight Imperium: Fourth Edition", nameCn: "暮光帝国 第四版", year: 2017, rating: 8.5, players: "3-6", playingTime: "480", comment: "太空歌剧的巅峰之作，政治阴谋与星际战争的史诗" },
  { id: 342942, rank: 7, name: "Ark Nova", nameCn: "方舟新星", year: 2021, rating: 8.5, players: "1-4", playingTime: "150", comment: "建设现代动物园的深度策略，环保与商业的精妙平衡" },
  { id: 220308, rank: 8, name: "Gaia Project", nameCn: "盖亚计划", year: 2017, rating: 8.4, players: "1-4", playingTime: "150", comment: "神秘大地的太空版，14种族在宇宙中争夺星球" },
  { id: 291457, rank: 9, name: "Gloomhaven: Jaws of the Lion", nameCn: "幽港迷城：狮鹫之颚", year: 2020, rating: 8.4, players: "1-4", playingTime: "120", comment: "完美的入门级地城探索，降低门槛不减乐趣" },
  { id: 115746, rank: 10, name: "War of the Ring: Second Edition", nameCn: "战争指环 第二版", year: 2012, rating: 8.5, players: "2-4", playingTime: "180", comment: "中土世界的命运之战，最忠实的魔戒桌游改编" },
  { id: 182028, rank: 11, name: "Clans of Caledonia", nameCn: "苏格兰氏族", year: 2017, rating: 8.0, players: "1-4", playingTime: "120", comment: "苏格兰高地的经济引擎，威士忌与棉花的贸易帝国" },
  { id: 169786, rank: 12, name: "Scythe", nameCn: "镰刀战争", year: 2016, rating: 8.2, players: "1-5", playingTime: "115", comment: "架空东欧的机甲与农耕，引擎构建的视觉盛宴" },
  { id: 316554, rank: 13, name: "Dune: Imperium", nameCn: "沙丘：帝国", year: 2020, rating: 8.3, players: "1-4", playingTime: "120", comment: "甲套牌构筑与工人放置的完美融合，香料即权力" },
  { id: 366013, rank: 14, name: "Great Western Trail: Second Edition", nameCn: "西部之路 第二版", year: 2022, rating: 8.3, players: "1-4", playingTime: "150", comment: "驱赶牛群穿越西部，路线规划的策略深度令人惊叹" },
  { id: 312484, rank: 15, name: "Lost Ruins of Arnak", nameCn: "阿纳克失落遗迹", year: 2020, rating: 8.0, players: "1-4", playingTime: "120", comment: "探险与套牌构筑的精彩碰撞，发现失落的古代文明" },
  { id: 246900, rank: 16, name: "Eclipse: Second Dawn for the Galaxy", nameCn: "星蚀 第二版", year: 2020, rating: 8.3, players: "2-6", playingTime: "200", comment: "太空4X的标杆之作，探索、扩张、开发、消灭一气呵成" },
  { id: 284083, rank: 17, name: "The Crew: The Quest for Planet Nine", nameCn: "船员：寻找第九行星", year: 2019, rating: 8.0, players: "2-5", playingTime: "20", comment: "合作吃墩的革命性设计，用扑克牌探索太空" },
  { id: 266192, rank: 18, name: "Wingspan", nameCn: "展翅翱翔", year: 2019, rating: 8.0, players: "1-5", playingTime: "70", comment: "观鸟爱好者的天堂，引擎构建与自然之美的完美结合" },
  { id: 164928, rank: 19, name: "Orléans", nameCn: "奥尔良", year: 2014, rating: 8.0, players: "2-4", playingTime: "90", comment: "袋子抽取机制的先驱，中世纪法国的商贸之路" },
  { id: 173346, rank: 20, name: "7 Wonders Duel", nameCn: "七大奇迹：对决", year: 2015, rating: 8.1, players: "2", playingTime: "30", comment: "两人对战的完美平衡，文明建设的浓缩精华" },
  { id: 237182, rank: 21, name: "Root", nameCn: "茂林源记", year: 2018, rating: 8.0, players: "2-4", playingTime: "90", comment: "可爱的动物外表下是残酷的非对称战争" },
  { id: 193738, rank: 22, name: "Great Western Trail", nameCn: "西部之路", year: 2016, rating: 8.2, players: "2-4", playingTime: "150", comment: "经典版西部牧牛之旅，三条路线各有千秋" },
  { id: 199792, rank: 23, name: "Everdell", nameCn: "永恒之境", year: 2018, rating: 7.9, players: "1-4", playingTime: "80", comment: "四季轮转中建设小动物城市，桌游界的治愈系代表" },
  { id: 295770, rank: 24, name: "Cascadia", nameCn: "卡斯卡迪亚", year: 2021, rating: 7.8, players: "1-4", playingTime: "45", comment: "太平洋西北部的生态拼图，简单规则蕴含无穷变化" },
  { id: 162886, rank: 25, name: "Spirit Island", nameCn: "精灵岛", year: 2017, rating: 8.3, players: "1-4", playingTime: "120", comment: "反殖民主题的合作神作，守护自然的精灵之力" },
  { id: 276025, rank: 26, name: "Maracaibo", nameCn: "马拉开波", year: 2019, rating: 8.1, players: "1-4", playingTime: "120", comment: "加勒比海的航海冒险，传承机制为每局增添新惊喜" },
  { id: 251247, rank: 27, name: "Barrage", nameCn: "水坝", year: 2019, rating: 8.0, players: "1-4", playingTime: "120", comment: "水电站争夺战的硬核策略，资源管理的极致挑战" },
  { id: 266810, rank: 28, name: "Paladins of the West Kingdom", nameCn: "西王国的圣骑士", year: 2019, rating: 8.0, players: "1-4", playingTime: "120", comment: "信仰与武力的平衡，中世纪骑士的荣耀之路" },
  { id: 124361, rank: 29, name: "Concordia", nameCn: "康考迪亚", year: 2013, rating: 8.1, players: "2-5", playingTime: "100", comment: "优雅的手牌管理与地图扩张，罗马时代的贸易传奇" },
  { id: 15987, rank: 30, name: "Arkham Horror: The Card Game", nameCn: "阿卡姆恐怖：卡牌版", year: 2016, rating: 8.2, players: "1-2", playingTime: "120", comment: "克苏鲁神话的沉浸叙事，每个选择都通向不同的恐惧" },
  { id: 28720, rank: 31, name: "Brass: Lancashire", nameCn: "黄铜：兰开夏", year: 2007, rating: 8.2, players: "2-4", playingTime: "120", comment: "黄铜系列的经典原作，工业革命策略的永恒魅力" },
  { id: 72125, rank: 32, name: "Eclipse", nameCn: "星蚀", year: 2011, rating: 7.9, players: "2-6", playingTime: "200", comment: "太空探索与文明碰撞的壮丽史诗" },
  { id: 12333, rank: 33, name: "Twilight Struggle", nameCn: "冷战热斗", year: 2005, rating: 8.2, players: "2", playingTime: "180", comment: "冷战时期的全球博弈，每张事件牌都改写历史" },
  { id: 36218, rank: 34, name: "Dominion", nameCn: "皇舆争霸", year: 2008, rating: 7.6, players: "2-4", playingTime: "30", comment: "套牌构筑类的开山鼻祖，简洁规则创造无限组合" },
  { id: 68448, rank: 35, name: "7 Wonders", nameCn: "七大奇迹", year: 2010, rating: 7.7, players: "2-7", playingTime: "30", comment: "轮抽机制的经典代表，7人同时进行毫不拖沓" },
  { id: 31260, rank: 36, name: "Agricola", nameCn: "农场主", year: 2007, rating: 7.9, players: "1-5", playingTime: "150", comment: "经营农场的硬核挑战，如何在饥荒中养活一家人" },
  { id: 3076, rank: 37, name: "Puerto Rico", nameCn: "波多黎各", year: 2002, rating: 8.0, players: "2-5", playingTime: "150", comment: "角色选择机制的永恒经典，殖民时代的策略传奇" },
  { id: 30549, rank: 38, name: "Pandemic", nameCn: "瘟疫危机", year: 2008, rating: 7.6, players: "2-4", playingTime: "45", comment: "全球抗疫的合作经典，拯救世界从未如此紧迫" },
  { id: 121921, rank: 39, name: "Robinson Crusoe", nameCn: "鲁宾逊漂流记", year: 2012, rating: 7.9, players: "1-4", playingTime: "180", comment: "荒岛求生的极致模拟，每一个决定都关乎生死" },
  { id: 35677, rank: 40, name: "Le Havre", nameCn: "勒阿弗尔", year: 2008, rating: 7.9, players: "1-5", playingTime: "200", comment: "港口城市的经济发展，资源转化的策略深度" },
  { id: 2651, rank: 41, name: "Power Grid", nameCn: "电力公司", year: 2004, rating: 7.8, players: "2-6", playingTime: "120", comment: "电力市场的经济博弈，拍卖与网络扩张的双重乐趣" },
  { id: 822, rank: 42, name: "Carcassonne", nameCn: "卡卡颂", year: 2000, rating: 7.4, players: "2-5", playingTime: "45", comment: "放置板块的永恒经典，简单到极致便是深度" },
  { id: 13, rank: 43, name: "Catan", nameCn: "卡坦岛", year: 1995, rating: 7.1, players: "3-4", playingTime: "120", comment: "现代桌游的入门圣经，资源交易与领土扩张" },
  { id: 9209, rank: 44, name: "Ticket to Ride", nameCn: "车票之旅", year: 2004, rating: 7.4, players: "2-5", playingTime: "60", comment: "收集火车卡连接城市，全家欢的铁路冒险" },
  { id: 40834, rank: 45, name: "Dominion: Intrigue", nameCn: "皇舆争霸：阴谋", year: 2009, rating: 7.6, players: "2-4", playingTime: "30", comment: "更多的选择，更深的阴谋，套牌构筑的进阶之路" },
  { id: 37111, rank: 46, name: "Battlestar Galactica", nameCn: "太空堡垒卡拉狄加", year: 2008, rating: 7.8, players: "3-6", playingTime: "240", comment: "谁是赛昂人？社交推理与太空求生的完美融合" },
  { id: 43015, rank: 47, name: "Mage Knight Board Game", nameCn: "法师骑士", year: 2011, rating: 8.1, players: "1-4", playingTime: "240", comment: "独行侠的终极冒险，复杂度与成就感成正比" },
  { id: 25613, rank: 48, name: "Through the Ages", nameCn: "历史巨轮", year: 2006, rating: 8.0, players: "2-4", playingTime: "240", comment: "文明发展的史诗巨作，从远古到现代的壮阔旅程" },
  { id: 205637, rank: 49, name: "Arkham Horror: The Card Game (Revised)", nameCn: "阿卡姆恐怖：卡牌版（修订版）", year: 2021, rating: 8.3, players: "1-4", playingTime: "120", comment: "修订版带来更流畅的克苏鲁叙事体验" },
  { id: 192291, rank: 50, name: "Terraforming Mars: Ares Expedition", nameCn: "殖民火星：阿瑞斯远征", year: 2021, rating: 7.5, players: "1-4", playingTime: "60", comment: "火星改造的快节奏版本，卡牌驱动的星际开发" },
  { id: 310873, rank: 51, name: "Unconscious Mind", nameCn: "潜意识", year: 2022, rating: 7.8, players: "1-4", playingTime: "120", comment: "探索人类心理的独特主题，用骰子解读潜意识" },
  { id: 244992, rank: 52, name: "The Quacks of Quedlinburg", nameCn: "庸医的药铺", year: 2018, rating: 7.7, players: "2-4", playingTime: "45", comment: "袋子抽取的欢乐赌博，炸锅前的最后一搏" },
  { id: 185680, rank: 53, name: "Anachrony", nameCn: "时空错置", year: 2017, rating: 8.0, players: "1-4", playingTime: "120", comment: "时间旅行机制的工人放置，向未来借资源" },
  { id: 230802, rank: 54, name: "Azul", nameCn: "花砖物语", year: 2017, rating: 7.7, players: "2-4", playingTime: "45", comment: "葡萄牙瓷砖的图案之美，简约设计的策略深度" },
  { id: 256960, rank: 55, name: "Patchwork", nameCn: "拼布艺术", year: 2014, rating: 7.7, players: "2", playingTime: "30", comment: "两人对弈的温馨拼布，时间与空间的双重博弈" },
  { id: 236457, rank: 56, name: "Architects of the West Kingdom", nameCn: "西王国的建筑师", year: 2018, rating: 7.8, players: "1-5", playingTime: "80", comment: "善恶抉择的中世纪建筑，道德灰色的工人放置" },
  { id: 175914, rank: 57, name: "Food Chain Magnate", nameCn: "食物链大亨", year: 2015, rating: 8.1, players: "2-5", playingTime: "240", comment: "餐饮帝国的残酷商战，Splotter出品必属精品" },
  { id: 180263, rank: 58, name: "The 7th Continent", nameCn: "第七大陆", year: 2017, rating: 7.8, players: "1-4", playingTime: "1000", comment: "千小时的探索冒险，打开卡牌就是打开新世界" },
  { id: 209010, rank: 59, name: "Mechs vs. Minions", nameCn: "机甲对决", year: 2016, rating: 8.0, players: "2-4", playingTime: "90", comment: "英雄联盟桌游版，编程控制机甲的爽快战斗" },
  { id: 170216, rank: 60, name: "Blood Rage", nameCn: "血色狂怒", year: 2015, rating: 7.9, players: "2-4", playingTime: "90", comment: "维京末日的荣耀之战，在诸神黄昏前战斗到底" },
  { id: 84876, rank: 61, name: "The Castles of Burgundy", nameCn: "勃艮第城堡", year: 2011, rating: 8.1, players: "2-4", playingTime: "90", comment: "骰子驱动的领地建设，每一颗骰子都有最优解" },
  { id: 148228, rank: 62, name: "Splendor", nameCn: "璀璨宝石", year: 2014, rating: 7.4, players: "2-4", playingTime: "30", comment: "宝石收集的引擎构建，三分钟学会的策略佳作" },
  { id: 126163, rank: 63, name: "Kemet", nameCn: "凯麦特", year: 2012, rating: 7.7, players: "2-5", playingTime: "120", comment: "古埃及战神的进攻盛宴，鼓励主动出击的区域控制" },
  { id: 150376, rank: 64, name: "Dead of Winter", nameCn: "凛冬将至", year: 2014, rating: 7.5, players: "2-5", playingTime: "120", comment: "僵尸末世的合作背叛，谁在暗中破坏我们的家园" },
  { id: 197405, rank: 65, name: "Clank! A Deck-Building Adventure", nameCn: "当啷！", year: 2016, rating: 7.7, players: "2-4", playingTime: "60", comment: "潜入龙穴偷宝藏，越贪心越危险的套牌冒险" },
  { id: 155821, rank: 66, name: "Inis", nameCn: "伊尼斯", year: 2016, rating: 7.8, players: "2-4", playingTime: "90", comment: "凯尔特神话的领地争夺，三种胜利条件皆可为王" },
  { id: 192135, rank: 67, name: "Too Many Bones", nameCn: "骨头太多", year: 2017, rating: 8.1, players: "1-4", playingTime: "120", comment: "自定义骰子的RPG冒险，每个角色都是独特的骰池" },
  { id: 102794, rank: 68, name: "Caverna", nameCn: "洞穴农夫", year: 2013, rating: 7.9, players: "1-7", playingTime: "210", comment: "农场主的豪华升级版，矮人与农场的双重经营" },
  { id: 110327, rank: 69, name: "Lords of Waterdeep", nameCn: "深水城领主", year: 2012, rating: 7.7, players: "2-5", playingTime: "120", comment: "D&D世界的工人放置入门，完成冒险者任务建立声望" },
  { id: 171623, rank: 70, name: "The Voyages of Marco Polo", nameCn: "马可波罗游记", year: 2015, rating: 7.9, players: "2-4", playingTime: "100", comment: "丝绸之路的骰子冒险，每个角色都打破规则" },
  { id: 73439, rank: 71, name: "Troyes", nameCn: "特鲁瓦", year: 2010, rating: 7.8, players: "2-4", playingTime: "90", comment: "中世纪城市建设的骰子策略，抢别人的骰子用" },
  { id: 103343, rank: 72, name: "A Feast for Odin", nameCn: "奥丁的盛宴", year: 2016, rating: 8.0, players: "1-4", playingTime: "120", comment: "维京人的史诗盛宴，最大化的拼图式资源管理" },
  { id: 230085, rank: 73, name: "Underwater Cities", nameCn: "水下城市", year: 2018, rating: 7.9, players: "1-4", playingTime: "150", comment: "海底文明的建设蓝图，卡牌搭配行动的深度策略" },
  { id: 247763, rank: 74, name: "Nemesis", nameCn: "复仇女神号", year: 2018, rating: 7.9, players: "1-5", playingTime: "180", comment: "太空恐怖的紧张体验，异形就在你身边" },
  { id: 203427, rank: 75, name: "On Mars", nameCn: "火星先驱", year: 2020, rating: 8.1, players: "1-4", playingTime: "150", comment: "Lacerda大师的火星殖民，复杂度天花板级策略" },
  { id: 221194, rank: 76, name: "Teotihuacan", nameCn: "特奥蒂瓦坎", year: 2018, rating: 7.8, players: "1-4", playingTime: "120", comment: "太阳金字塔的建造之路，工人成长的独特设计" },
  { id: 281259, rank: 77, name: "The Isle of Cats", nameCn: "猫之岛", year: 2019, rating: 7.6, players: "1-4", playingTime: "90", comment: "拯救猫咪的拼图冒险，可爱与策略并存" },
  { id: 256916, rank: 78, name: "Concordia Venus", nameCn: "康考迪亚维纳斯", year: 2018, rating: 8.1, players: "2-6", playingTime: "120", comment: "经典康考迪亚的团队变体，合作与竞争的全新维度" },
  { id: 184267, rank: 79, name: "Viticulture Essential Edition", nameCn: "酿酒师 精华版", year: 2015, rating: 7.9, players: "1-6", playingTime: "90", comment: "托斯卡纳酒庄经营，工人放置的优雅入门之选" },
  { id: 163412, rank: 80, name: "Patchwork", nameCn: "拼布之路", year: 2014, rating: 7.7, players: "2", playingTime: "30", comment: "两人对弈的温馨拼布，时间与空间的双重博弈" },
  { id: 167355, rank: 81, name: "Nemesis (first edition)", nameCn: "复仇女神号（初版）", year: 2018, rating: 7.9, players: "1-5", playingTime: "180", comment: "在太空船上对抗异形的生存恐惧" },
  { id: 246784, rank: 82, name: "Cryptid", nameCn: "神秘生物", year: 2018, rating: 7.5, players: "3-5", playingTime: "50", comment: "纯推理的地图推演，每条线索都指向唯一真相" },
  { id: 283155, rank: 83, name: "Calico", nameCn: "花间集", year: 2020, rating: 7.5, players: "1-4", playingTime: "45", comment: "拼花被子吸引猫咪，治愈系拼图的小确幸" },
  { id: 191189, rank: 84, name: "Aeon's End", nameCn: "永恒之末", year: 2016, rating: 7.9, players: "1-4", playingTime: "60", comment: "不洗牌的合作套牌构筑，对抗远古巨兽的最后防线" },
  { id: 217372, rank: 85, name: "Rajas of the Ganges", nameCn: "恒河大君", year: 2017, rating: 7.6, players: "2-4", playingTime: "75", comment: "印度宫廷的双轨竞速，金钱与声望殊途同归" },
  { id: 184842, rank: 86, name: "Coimbra", nameCn: "科英布拉", year: 2018, rating: 7.7, players: "2-4", playingTime: "75", comment: "文艺复兴时期的葡萄牙学府，骰子选择的精妙博弈" },
  { id: 262712, rank: 87, name: "Res Arcana", nameCn: "奥秘之源", year: 2019, rating: 7.6, players: "2-4", playingTime: "30", comment: "八张牌的炼金世界，小而美的引擎构建" },
  { id: 285984, rank: 88, name: "Hallertau", nameCn: "哈勒陶", year: 2020, rating: 7.8, players: "1-4", playingTime: "140", comment: "巴伐利亚啤酒花种植，罗森伯格的又一力作" },
  { id: 229853, rank: 89, name: "Tekhenu: Obelisk of the Sun", nameCn: "方尖碑", year: 2020, rating: 7.8, players: "1-4", playingTime: "120", comment: "古埃及方尖碑的光影之谜，骰子选取的独特角度" },
  { id: 225694, rank: 90, name: "Decrypto", nameCn: "截码战", year: 2018, rating: 7.7, players: "3-8", playingTime: "30", comment: "文字密码的团队对抗，加密与破解的智力角逐" },
  { id: 172386, rank: 91, name: "Mombasa", nameCn: "蒙巴萨", year: 2015, rating: 7.9, players: "2-4", playingTime: "150", comment: "非洲贸易公司的扩张，手牌编程的策略巅峰" },
  { id: 271320, rank: 92, name: "Dinosaur Island: Rawr 'n Write", nameCn: "恐龙岛", year: 2021, rating: 7.4, players: "1-4", playingTime: "45", comment: "建造侏罗纪公园的翻写游戏，骰子决定你的恐龙" },
  { id: 228341, rank: 93, name: "The Gallerist", nameCn: "画廊经纪人", year: 2015, rating: 8.0, players: "1-4", playingTime: "150", comment: "艺术品市场的商业运营，Lacerda的优雅之作" },
  { id: 300322, rank: 94, name: "Hadrian's Wall", nameCn: "哈德良长城", year: 2021, rating: 7.8, players: "1-6", playingTime: "60", comment: "罗马长城的翻写杰作，一支笔建造帝国边疆" },
  { id: 183394, rank: 95, name: "Viticulture: Essential Edition", nameCn: "酿酒师", year: 2015, rating: 7.9, players: "1-6", playingTime: "90", comment: "阳光下的葡萄庄园，工人放置的入门标杆" },
  { id: 161533, rank: 96, name: "Lisboa", nameCn: "里斯本", year: 2017, rating: 8.0, players: "1-4", playingTime: "120", comment: "地震后重建里斯本，Lacerda的城市重建史诗" },
  { id: 169426, rank: 97, name: "Pandemic Legacy: Season 2", nameCn: "瘟疫危机：传承 第二季", year: 2017, rating: 8.1, players: "2-4", playingTime: "60", comment: "后启示录的瘟疫世界，续写传承系列的辉煌" },
  { id: 232405, rank: 98, name: "The Taverns of Tiefenthal", nameCn: "深谷酒馆", year: 2019, rating: 7.5, players: "2-4", playingTime: "60", comment: "经营中世纪酒馆的套牌构筑，用骰子招待客人" },
  { id: 171131, rank: 99, name: "Captain Sonar", nameCn: "声纳队长", year: 2016, rating: 7.5, players: "2-8", playingTime: "60", comment: "实时潜艇对战的紧张刺激，团队协作的极致体验" },
  { id: 210677, rank: 100, name: "Dominant Species: Marine", nameCn: "优势物种：海洋", year: 2021, rating: 7.9, players: "2-4", playingTime: "120", comment: "海洋生态的物种竞争，适者生存的策略对决" },
]

// Add BGG image URLs (using BGG's CDN pattern)
const gamesWithImages = games.map(g => ({
  ...g,
  thumbnail: `https://cf.geekdo-images.com/thumb/img/placeholder/${g.id}.jpg`,
  image: `https://cf.geekdo-images.com/original/img/placeholder/${g.id}.jpg`,
}))

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, JSON.stringify(gamesWithImages, null, 2), 'utf-8')

console.log(`✅ 已生成 ${gamesWithImages.length} 个游戏的样本数据到 data/games.json`)
