import type { StreetCorner, StyleCategory, RankingList, RankingCategory, RankingTimeRange } from '../types';

export const streetCorners: StreetCorner[] = [
  {
    id: 'sc-1',
    name: '南京西路历史街区',
    district: '静安区',
    city: '上海',
    description: '上海最具代表性的摩登街区，百年老店与时尚品牌共存。石库门建筑与Art Deco风格交相辉映，是海派文化的活化石。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20nanjing%20west%20road%20historic%20street%20vintage%20shikumen%20art%20deco%20architecture&image_size=landscape_16_9',
    signboardIds: ['1', '6'],
    tags: ['海派文化', '摩登都市', '百年老店'],
    atmosphere: '繁华而不失雅致，漫步其中仿佛穿越回十里洋场的黄金年代。',
    bestTimeToVisit: '周末下午 14:00-18:00，傍晚华灯初上时最美',
    nearbyLandmarks: ['静安寺', '张园', '美琪大戏院', '百乐门'],
    latitude: 31.2304,
    longitude: 121.4737
  },
  {
    id: 'sc-2',
    name: '上下九步行街',
    district: '荔湾区',
    city: '广州',
    description: '广州最负盛名的传统商业街，骑楼建筑群绵延千米。西关风情浓郁，老字号饼家、布行鳞次栉比。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guangzhou%20shangxiajiu%20pedestrian%20street%20arcade%20buildings%20cantonese%20traditional%20commercial&image_size=landscape_16_9',
    signboardIds: ['2', '12'],
    tags: ['西关风情', '骑楼文化', '广府美食'],
    atmosphere: '烟火气十足，粤语吆喝声此起彼伏，是老广州最地道的生活场景。',
    bestTimeToVisit: '上午 10:00-12:00，品早茶逛老街',
    nearbyLandmarks: ['陈家祠', '沙面岛', '荔枝湾', '华林寺'],
    latitude: 23.1250,
    longitude: 113.2400
  },
  {
    id: 'sc-3',
    name: '福州路文化街',
    district: '黄浦区',
    city: '上海',
    description: '被誉为"中华文化第一街"，百年菜馆、书店、文房四宝店云集。本帮菜的发源地之一，文人墨客流连忘返之地。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20fuzhou%20road%20culture%20street%20bookstores%20traditional%20chinese%20restaurants%20vintage&image_size=landscape_16_9',
    signboardIds: ['3'],
    tags: ['文化源头', '本帮菜', '书香四溢'],
    atmosphere: '墨香与菜香交织，老字号的厚重底蕴扑面而来。',
    bestTimeToVisit: '午餐时段 11:30-13:30，品尝正宗本帮菜',
    nearbyLandmarks: ['外滩', '豫园', '上海书城', '人民广场'],
    latitude: 31.2360,
    longitude: 121.4810
  },
  {
    id: 'sc-4',
    name: '北京路千年古道',
    district: '越秀区',
    city: '广州',
    description: '广州建城之始，北京路地下挖掘出唐宋元明清各朝代路面遗迹。老字号照相馆、西餐厅见证了岭南近现代商业史。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guangzhou%20beijing%20road%20pedestrian%20street%20ancient%20ruins%20display%20commercial%20milestones&image_size=landscape_16_9',
    signboardIds: ['4', '10'],
    tags: ['千年商都', '中西合璧', '岭南文化'],
    atmosphere: '现代繁华与千年底蕴重叠，玻璃地板下的宋代路面令人惊叹。',
    bestTimeToVisit: '全天皆宜，夜晚灯光璀璨更具魅力',
    nearbyLandmarks: ['南越王宫博物馆', '大佛寺', '城隍庙', '天字码头'],
    latitude: 23.1260,
    longitude: 113.2640
  },
  {
    id: 'sc-5',
    name: '大栅栏历史文化街',
    district: '西城区',
    city: '北京',
    description: '京城老字号第一街，保存最完整的清末民初商业街区。中药铺、布鞋店、戏院汇聚，是老北京民俗文化的缩影。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20dashilan%20historic%20street%20traditional%20chinese%20architecture%20red%20lanterns%20old%20shops&image_size=landscape_16_9',
    signboardIds: ['5', '9'],
    tags: ['皇家气派', '京腔京韵', '老字号集群'],
    atmosphere: '朱门红柱，旗幡招展，冰糖葫芦的吆喝声中尽是京城烟火。',
    bestTimeToVisit: '上午 9:00-11:00，避开人流高峰细细品味',
    nearbyLandmarks: ['天安门广场', '故宫', '前门楼', '琉璃厂'],
    latitude: 39.8990,
    longitude: 116.3970
  },
  {
    id: 'sc-6',
    name: '中环士丹利街',
    district: '中西区',
    city: '香港',
    description: '香港最具港式风情的老街，传统茶楼与金融摩天大楼比邻而居。唐楼建筑诉说着殖民地时期的独特历史。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hong%20kong%20central%20stanley%20street%20tea%20house%20tang%20building%20contrast%20with%20skyscrapers&image_size=landscape_16_9',
    signboardIds: ['7'],
    tags: ['港式怀旧', '东西交融', '茶楼文化'],
    atmosphere: '点心推车的叮当声与西装革履的行人形成奇妙的和谐。',
    bestTimeToVisit: '早茶时段 8:00-11:00，体验港式饮茶',
    nearbyLandmarks: ['中环半山扶梯', '兰桂坊', '终审法院', '香港动植物公园'],
    latitude: 22.2780,
    longitude: 114.1580
  },
  {
    id: 'sc-7',
    name: '河南南路文化街',
    district: '黄浦区',
    city: '上海',
    description: '海派书画艺术的发源地，百年文房老店朵云轩在此发祥。书画装裱、金石篆刻、旧书收藏的气息弥漫整条街道。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20calligraphy%20art%20street%20traditional%20chinese%20painting%20supplies%20store%20elegant%20culture&image_size=landscape_16_9',
    signboardIds: ['8'],
    tags: ['文人雅集', '书画艺术', '海派文化'],
    atmosphere: '墨香悠远，书画雅致，文人气息与市井烟火在此完美融合。',
    bestTimeToVisit: '下午 14:00-17:00，适合静心品味艺术',
    nearbyLandmarks: ['城隍庙', '豫园', '上海老街', '文庙'],
    latitude: 31.2270,
    longitude: 121.4870
  },
  {
    id: 'sc-8',
    name: '河坊街历史街区',
    district: '上城区',
    city: '杭州',
    description: '南宋御街的延续，江南水乡的温婉风情。老字号张小泉剪刀等传统工艺店与胡庆余堂国药号闻名遐迩。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hangzhou%20hefang%20street%20historic%20district%20jiangnan%20water%20town%20style%20traditional%20crafts%20shops&image_size=landscape_16_9',
    signboardIds: ['11'],
    tags: ['江南水乡', '南宋遗韵', '传统工艺'],
    atmosphere: '小桥流水，粉墙黛瓦，吴侬软语中尽是江南雅致。',
    bestTimeToVisit: '春季和秋季，雨天更有江南韵味',
    nearbyLandmarks: ['西湖', '胡雪岩故居', '鼓楼', '南宋御街遗址'],
    latitude: 30.2440,
    longitude: 120.1650
  }
];

export const styleCategories: StyleCategory[] = [
  {
    id: 'sty-1',
    name: '楷书端庄派',
    description: '楷书笔力遒劲，结构端正，是老字号招牌最常用的字体。既有唐楷的严谨法度，又有海派楷书的灵动之气。',
    icon: '📜',
    color: '#8B4513',
    signboardIds: ['1', '5', '7', '9', '12'],
    fontStyles: ['楷书'],
    eras: ['清代', '清末', '民国', '1910s', '1920s', '1930s', '1940s', '1950s']
  },
  {
    id: 'sty-2',
    name: '隶书古朴派',
    description: '隶书蚕头燕尾，古朴典雅，多见于食品、医药等行业招牌。沉稳大气的风格传递着老字号的厚重底蕴。',
    icon: '🏛️',
    color: '#2F4F4F',
    signboardIds: ['6', '11'],
    fontStyles: ['隶书'],
    eras: ['清代', '民国', '1930s']
  },
  {
    id: 'sty-3',
    name: '行书飘逸派',
    description: '行书流畅飘逸，如行云流水，艺术感极强。照相馆、文艺类店铺偏爱此种字体，尽显文人雅士之风。',
    icon: '✒️',
    color: '#2C3E50',
    signboardIds: ['4'],
    fontStyles: ['行书'],
    eras: ['1920s']
  },
  {
    id: 'sty-4',
    name: '魏碑雄浑派',
    description: '魏碑脱胎于北朝石刻，笔画方折厚重，气势雄浑。百年菜馆、中药铺等讲究底蕴的老店最爱此体。',
    icon: '🗿',
    color: '#8B0000',
    signboardIds: ['3'],
    fontStyles: ['魏碑'],
    eras: ['清末']
  },
  {
    id: 'sty-5',
    name: '篆书金石派',
    description: '篆书源自甲骨文金文，古朴神秘，金石味十足。书画店、文房四宝店以此标榜其文化底蕴和艺术品位。',
    icon: '🔮',
    color: '#4A4A4A',
    signboardIds: ['8'],
    fontStyles: ['篆书'],
    eras: ['清末']
  },
  {
    id: 'sty-6',
    name: '宋体规范派',
    description: '宋体横细竖粗，规范工整，是印刷术发展的产物。建国初期合作社、国营商店招牌大量采用此种字体。',
    icon: '📖',
    color: '#1E3A8A',
    signboardIds: ['2'],
    fontStyles: ['宋体'],
    eras: ['1950s']
  },
  {
    id: 'sty-7',
    name: '艺术新潮派',
    description: '艺术字融合中西元素，Art Deco风格与汉字结合，形态新颖独特。民国时期西餐厅、洋派店铺的标志性设计。',
    icon: '🎨',
    color: '#191970',
    signboardIds: ['10'],
    fontStyles: ['艺术字'],
    eras: ['1920s']
  }
];

const allSignboardIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const generateRankingItems = (ids: string[], baseScores?: Record<string, number>) => {
  const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
  const heatSourceOptions = ['社交媒体热议', '游客打卡', '媒体报道', '学者研究', '本地推荐', '网红探店'];
  
  return ids
    .map(id => {
      const baseScore = baseScores?.[id] ?? Math.random() * 60 + 40;
      return {
        signboardId: id,
        score: Math.round(baseScore * 10) / 10,
        trend: trends[Math.floor(Math.random() * 3)],
        trendValue: Math.round(Math.random() * 30),
        heatSources: heatSourceOptions.slice(0, Math.floor(Math.random() * 3) + 1)
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
};

const heatScores: Record<string, number> = {
  '5': 98, '9': 95, '3': 93, '1': 90, '6': 88,
  '7': 86, '10': 84, '4': 82, '8': 80, '11': 78,
  '2': 76, '12': 74
};

export const rankingLists: RankingList[] = [
  {
    id: 'rk-blk-1',
    title: '静安区·南京西路招牌榜',
    category: 'block',
    timeRange: 'weekly',
    subtitle: '摩登街区的百年风华',
    description: '海派文化发源地，石库门与Art Deco建筑林立，百年茶庄与老字号在此共存，每一块招牌都诉说着十里洋场的传奇故事。',
    icon: '🏙️',
    accentColor: '#8B4513',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20jing%20an%20district%20nanjing%20west%20road%20vintage%20signboards%20shikumen%20evening&image_size=landscape_16_9',
    items: generateRankingItems(streetCorners[0].signboardIds),
    streetCornerId: 'sc-1',
    updatedAt: '2026-06-13',
    totalItems: streetCorners[0].signboardIds.length
  },
  {
    id: 'rk-blk-2',
    title: '荔湾区·上下九招牌榜',
    category: 'block',
    timeRange: 'weekly',
    subtitle: '西关骑楼的广府记忆',
    description: '骑楼绵延千米，老字号饼家布行鳞次栉比。粤语吆喝声声入耳，广府美食香气四溢，这里是老广州最地道的生活切片。',
    icon: '🏮',
    accentColor: '#1E3A8A',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guangzhou%20liwan%20district%20shangxiajiu%20arcade%20street%20cantonese%20old%20signs%20red%20lanterns&image_size=landscape_16_9',
    items: generateRankingItems(streetCorners[1].signboardIds),
    streetCornerId: 'sc-2',
    updatedAt: '2026-06-13',
    totalItems: streetCorners[1].signboardIds.length
  },
  {
    id: 'rk-blk-3',
    title: '西城区·大栅栏招牌榜',
    category: 'block',
    timeRange: 'monthly',
    subtitle: '京城老字号第一街',
    description: '朱门红柱，旗幡招展。同仁堂、内联升等百年老店在此扎根数百年，每一块招牌都是国家级文物，每一家店都有传奇故事。',
    icon: '🏯',
    accentColor: '#8B0000',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20dashilan%20street%20traditional%20red%20gold%20signboards%20imperial%20architecture&image_size=landscape_16_9',
    items: generateRankingItems(streetCorners[4].signboardIds),
    streetCornerId: 'sc-5',
    updatedAt: '2026-06-10',
    totalItems: streetCorners[4].signboardIds.length
  },
  {
    id: 'rk-blk-4',
    title: '越秀区·北京路招牌榜',
    category: 'block',
    timeRange: 'weekly',
    subtitle: '千年商都的繁华见证',
    description: '玻璃地板下是宋代路面遗迹，头顶是百年老字号招牌。唐宋元明清民国，层层叠叠的历史在此交汇，令人叹为观止。',
    icon: '⛩️',
    accentColor: '#191970',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guangzhou%20yuexiu%20beijing%20road%20ancient%20ruins%20modern%20commercial%20signboards%20night&image_size=landscape_16_9',
    items: generateRankingItems(streetCorners[3].signboardIds),
    streetCornerId: 'sc-4',
    updatedAt: '2026-06-13',
    totalItems: streetCorners[3].signboardIds.length
  },
  {
    id: 'rk-sty-1',
    title: '楷书端庄风·TOP榜',
    category: 'style',
    timeRange: 'allTime',
    subtitle: '笔力遒劲，法度森严',
    description: '楷书是老字号招牌最经典的字体，端庄方正的结构传递着诚信经营的理念。从唐楷法度到海派灵动，楷书之美在招牌上展现得淋漓尽致。',
    icon: '📜',
    accentColor: '#8B4513',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20kai%20shu%20calligraphy%20signboards%20elegant%20brushwork%20vintage&image_size=landscape_16_9',
    items: generateRankingItems(styleCategories[0].signboardIds),
    styleCategoryId: 'sty-1',
    updatedAt: '2026-06-01',
    totalItems: styleCategories[0].signboardIds.length
  },
  {
    id: 'rk-sty-2',
    title: '隶书古朴风·TOP榜',
    category: 'style',
    timeRange: 'monthly',
    subtitle: '蚕头燕尾，典雅厚重',
    description: '隶书脱胎于秦代小篆，化圆为方，笔画如波。食品店、中药铺偏爱此体，沉稳大气的字形传递着百年老店的可靠与底蕴。',
    icon: '🏛️',
    accentColor: '#2F4F4F',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20li%20shu%20clerical%20script%20signboards%20classical%20elegant&image_size=landscape_16_9',
    items: generateRankingItems(styleCategories[1].signboardIds),
    styleCategoryId: 'sty-2',
    updatedAt: '2026-06-08',
    totalItems: styleCategories[1].signboardIds.length
  },
  {
    id: 'rk-sty-3',
    title: '魏碑雄浑风·TOP榜',
    category: 'style',
    timeRange: 'allTime',
    subtitle: '方折峻丽，气势开张',
    description: '魏碑源自北朝摩崖石刻，刀刻斧凿般的笔画力透纸背。百年菜馆选用此体，正如其烹制的本帮菜一般，浓油赤酱，厚重实在。',
    icon: '🗿',
    accentColor: '#8B0000',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wei%20bei%20stone%20carving%20style%20chinese%20calligraphy%20signboards%20powerful%20bold&image_size=landscape_16_9',
    items: generateRankingItems(styleCategories[3].signboardIds),
    styleCategoryId: 'sty-4',
    updatedAt: '2026-06-01',
    totalItems: styleCategories[3].signboardIds.length
  },
  {
    id: 'rk-sty-4',
    title: '艺术新潮风·TOP榜',
    category: 'style',
    timeRange: 'weekly',
    subtitle: '中西合璧，摩登先锋',
    description: '民国时期西风东渐，Art Deco风格与汉字艺术结合，产生了独特的艺术字招牌。西餐厅、照相馆率先采用，尽显摩登时尚。',
    icon: '🎨',
    accentColor: '#191970',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=art%20deco%20chinese%20signboard%20design%201920s%20shanghai%20modern%20vintage&image_size=landscape_16_9',
    items: generateRankingItems(styleCategories[6].signboardIds),
    styleCategoryId: 'sty-7',
    updatedAt: '2026-06-13',
    totalItems: styleCategories[6].signboardIds.length
  },
  {
    id: 'rk-heat-1',
    title: '全国招牌热度榜·周榜',
    category: 'heat',
    timeRange: 'weekly',
    subtitle: '本周最火招牌TOP12',
    description: '综合社交媒体讨论、游客打卡、媒体报道、学者研究等多维度数据，科学计算出本周全国最具话题性和关注度的招牌排行。',
    icon: '🔥',
    accentColor: '#DC2626',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20vintage%20signboards%20collage%20hot%20trending%20popular%20social%20media&image_size=landscape_16_9',
    items: generateRankingItems(allSignboardIds, heatScores),
    updatedAt: '2026-06-13',
    totalItems: allSignboardIds.length
  },
  {
    id: 'rk-heat-2',
    title: '全国招牌热度榜·月榜',
    category: 'heat',
    timeRange: 'monthly',
    subtitle: '六月最具人气招牌',
    description: '以月为维度，综合考察招牌的持续热度和长线影响力。排除短期波动，真正反映那些经过时间检验、深入人心的招牌传奇。',
    icon: '📈',
    accentColor: '#EA580C',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20heritage%20signboards%20monthly%20ranking%20prestigious%20historic%20landmarks&image_size=landscape_16_9',
    items: generateRankingItems(allSignboardIds, {
      '5': 99, '3': 97, '9': 96, '1': 92, '7': 90,
      '8': 87, '11': 85, '6': 83, '4': 81, '10': 79,
      '12': 76, '2': 74
    }),
    updatedAt: '2026-06-10',
    totalItems: allSignboardIds.length
  },
  {
    id: 'rk-heat-3',
    title: '百年老字号·传世榜',
    category: 'heat',
    timeRange: 'allTime',
    subtitle: '跨越世纪的招牌传奇',
    description: '收录创业超过百年，历经朝代更迭、战火纷飞、时代变迁却依然屹立不倒的招牌传奇。每一块都是活着的文化遗产。',
    icon: '👑',
    accentColor: '#CA8A04',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=century%20old%20chinese%20heritage%20shop%20signboards%20prestigious%20gold%20crown%20legacy&image_size=landscape_16_9',
    items: generateRankingItems(['5', '3', '11', '9', '8', '1', '12'], {
      '5': 100, '3': 98, '11': 96, '9': 95, '8': 92, '1': 88, '12': 85
    }),
    updatedAt: '2026-06-01',
    totalItems: 7
  }
];

export const getStreetCornerById = (id: string) => streetCorners.find(sc => sc.id === id);
export const getStyleCategoryById = (id: string) => styleCategories.find(st => st.id === id);
export const getRankingListById = (id: string) => rankingLists.find(rk => rk.id === id);

export const getRankingsByCategory = (category: RankingCategory) =>
  rankingLists.filter(rk => rk.category === category);

export const getRankingsByTimeRange = (timeRange: RankingTimeRange) =>
  rankingLists.filter(rk => rk.timeRange === timeRange);

export const getStreetCornersByCity = (city: string) =>
  streetCorners.filter(sc => sc.city === city);

export const getAllCities = () =>
  Array.from(new Set(streetCorners.map(sc => sc.city)));

export const categoryLabels: Record<RankingCategory, { text: string; icon: string; color: string }> = {
  block: { text: '街区榜', icon: '🏘️', color: '#8B4513' },
  style: { text: '风格榜', icon: '🎨', color: '#2563EB' },
  heat: { text: '热度榜', icon: '🔥', color: '#DC2626' }
};

export const timeRangeLabels: Record<RankingTimeRange, { text: string; icon: string }> = {
  weekly: { text: '周榜', icon: '📅' },
  monthly: { text: '月榜', icon: '📆' },
  allTime: { text: '总榜', icon: '🏆' }
};
