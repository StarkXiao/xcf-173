import type { MonthlyTheme, DailySign } from '../types';

const formatDate = (year: number, month: number, day: number): string => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

const createDailySigns = (year: number, month: number, signboardIds: string[], quotes: string[], themes: string[], stories: string[], knowledge: string[], trivia: string[]): DailySign[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const signs: DailySign[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const idx = (day - 1) % signboardIds.length;
    signs.push({
      id: `daily-${year}-${month + 1}-${day}`,
      date: formatDate(year, month, day),
      signboardId: signboardIds[idx],
      quote: quotes[idx % quotes.length],
      theme: themes[idx % themes.length],
      story: stories[idx % stories.length],
      knowledge: knowledge[idx % knowledge.length],
      trivia: trivia[idx % trivia.length]
    });
  }
  
  return signs;
};

const springQuotes = [
  '春风十里，不如招牌一纸',
  '万物复苏，老字号焕发新生',
  '一年之计在于春，百年老店焕新颜',
  '春风拂过老字号，新岁展开新画卷'
];

const springThemes = ['春日焕新', '老字号春天', '春风雅韵', '春和景明'];

const springStories = [
  '春日里，老招牌在暖阳下熠熠生辉，诉说着百年故事',
  '春风徐来，老店飘出新气象，传统与现代在此交融',
  '春光明媚，走在老街上，每一块招牌都是春天的诗篇'
];

const springKnowledge = [
  '传统招牌制作讲究选料精良，春木材质细腻不易变形',
  '春日是招牌油彩选用天然桐油，防潮防蛀经久耐用',
  '老字号招牌多选用楠木、樟木等硬木，寓意长久'
];

const springTrivia = [
  '古代商家多选在春日挂牌，取"开张大吉"之意',
  '传统招牌字体讲究"横平竖直，如春风和煦"',
  '清代商号多在清明前后修缮招牌，迎接新岁'
];

const summerQuotes = [
  '夏日炎炎，老字号凉',
  '暑气蒸腾，招牌熠熠',
  '蝉鸣夏意浓，古街韵味长',
  '夏日悠长，老店清凉'
];

const summerThemes = ['夏日悠长', '老字号夏韵', '消暑纳凉', '夏意盎然'];

const summerStories = [
  '盛夏午后，老街上的招牌在阳光下泛着温润的光泽',
  '夏夜凉风，老字号的霓虹灯次第亮起，夜色温柔',
  '炎炎夏日，老字号的凉茶铺、茶楼最是消暑好去处'
];

const summerKnowledge = [
  '招牌漆面在夏日需要特别养护，防止暴晒开裂',
  '传统工艺中，招牌会在入夏前做一次全面保养',
  '南方骑楼设计既遮阳又防雨，保护招牌'
];

const summerTrivia = [
  '旧时茶楼多在夏季推出解暑凉茶，招牌也会特别醒目',
  '夏日招牌的金箔字在阳光下最是耀眼',
  '民国时期上海南京路的霓虹招牌是夏夜盛景'
];

const autumnQuotes = [
  '秋高气爽，古韵悠长',
  '一叶知秋，招牌忆旧',
  '金风玉露，老字号相逢',
  '秋意浓，招牌红'
];

const autumnThemes = ['金秋古韵', '老字号秋收', '秋意绵绵', '丹桂飘香'];

const autumnStories = [
  '秋风起，蟹脚痒，老字号的月饼招牌早早挂起',
  '秋日暖阳，斑驳的光影在老招牌上流淌',
  '金秋时节，老字号迎来一年中最热闹的季节'
];

const autumnKnowledge = [
  '秋日干燥，是招牌髹漆的最佳时节',
  '传统工艺讲究"秋漆春油"，秋日上漆色泽最佳',
  '古代匠人多选秋季制作招牌，取"秋实"之意'
];

const autumnTrivia = [
  '旧时中秋前后是商号装修招牌的旺季',
  '老字号月饼招牌多用红金字，寓意金秋丰收',
  '民国时期秋季是各大商号更换招牌的传统时节'
];

const winterQuotes = [
  '冬日暖阳，老店温情',
  '瑞雪兆丰年，老字号贺新春',
  '寒冬腊月，招牌暖心',
  '岁暮天寒，古韵绵长'
];

const winterThemes = ['冬日温情', '老字号岁末', '瑞雪迎新', '寒冬暖韵'];

const winterStories = [
  '冬日里，老字号的招牌在寒风中依然挺立',
  '瑞雪纷飞，老招牌披上银装，别有一番韵味',
  '年关将至，老字号最为忙碌，招牌也换上了年节的装饰'
];

const winterKnowledge = [
  '冬季寒冷干燥，招牌木质最易保存',
  '传统招牌会在入冬前做防潮处理',
  '北方冬季招牌多有特殊的防冻工艺'
];

const winterTrivia = [
  '旧时年关前商家会"换新招牌"以示辞旧迎新',
  '春联与招牌同悬，是年节一景',
  '北方冬季招牌上的冰挂是老街独特风景'
];

export const monthlyThemes: MonthlyTheme[] = [
  {
    id: 'theme-2026-1',
    month: 0,
    year: 2026,
    title: '正月贺岁·老字号年味',
    subtitle: '新年新气象，古街古韵长',
    description: '正月里来贺新春，百年老字号张灯结彩，招牌上的金漆映着红灯笼，年味浓郁。跟随月历，探寻那些承载着年节记忆的老招牌故事。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20new%20year%20signboard%20red%20gold%20lanterns%20festive%20vintage&image_size=landscape_16_9',
    accentColor: '#C62828',
    themeType: 'festival',
    featuredSignboardIds: ['3', '5', '9', '12'],
    dailySigns: createDailySigns(2026, 0, ['3', '5', '9', '12', '6'], winterQuotes, winterThemes, winterStories, winterKnowledge, winterTrivia),
    tags: ['春节', '年味', '老字号', '团圆']
  },
  {
    id: 'theme-2026-2',
    month: 1,
    year: 2026,
    title: '早春二月·万物复苏',
    subtitle: '春风送暖，古意盎然',
    description: '二月春风似剪刀，裁出老街新面貌。老招牌在春光中苏醒，让我们跟随春天的脚步，探寻那些在春日里焕发新生的老字号。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=early%20spring%20chinese%20old%20street%20signboard%20cherry%20blossom%20vintage&image_size=landscape_16_9',
    accentColor: '#6B8E23',
    themeType: 'season',
    featuredSignboardIds: ['1', '7', '8'],
    dailySigns: createDailySigns(2026, 1, ['1', '7', '8', '4'], springQuotes, springThemes, springStories, springKnowledge, springTrivia),
    tags: ['立春', '早春', '万物复苏', '踏青']
  },
  {
    id: 'theme-2026-3',
    month: 2,
    year: 2026,
    title: '阳春三月·墨香书韵',
    subtitle: '文人雅韵，字里乾坤',
    description: '三月暮春，正是读书天。书画铺、文房四宝老店的招牌最是雅致，一笔一画间流淌着千年文化传承。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20calligraphy%20brush%20ink%20scholar%20vintage%20elegant&image_size=landscape_16_9',
    accentColor: '#4A4A4A',
    themeType: 'craft',
    featuredSignboardIds: ['8', '11', '5'],
    dailySigns: createDailySigns(2026, 2, ['8', '11', '5', '3'], springQuotes, springThemes, springStories, springKnowledge, springTrivia),
    tags: ['书法', '文房四宝', '文人雅集', '墨香']
  },
  {
    id: 'theme-2026-4',
    month: 3,
    year: 2026,
    title: '人间四月·茶韵悠长',
    subtitle: '春茶飘香，雅趣横生',
    description: '四月清明谷雨间，春茶飘香。老字号茶庄的招牌历经百年，记录着中华茶文化的源远流长。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20tea%20house%20signboard%20green%20elegant%20traditional&image_size=landscape_16_9',
    accentColor: '#556B2F',
    themeType: 'season',
    featuredSignboardIds: ['1', '7', '12'],
    dailySigns: createDailySigns(2026, 3, ['1', '7', '12', '8'], springQuotes, springThemes, springStories, springKnowledge, springTrivia),
    tags: ['茶文化', '春茶', '茶楼', '品茗']
  },
  {
    id: 'theme-2026-5',
    month: 4,
    year: 2026,
    title: '五月初夏·光影流年',
    subtitle: '民国风韵，摩登时代',
    description: '五月初夏，时光倒流回那个中西合璧的民国年代。Art Deco风格的招牌讲述着摩登上海、老广州的风华岁月。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=1930s%20shanghai%20art%20deco%20signboard%20vintage%20neon&image_size=landscape_16_9',
    accentColor: '#191970',
    themeType: 'era',
    featuredSignboardIds: ['4', '6', '10'],
    dailySigns: createDailySigns(2026, 4, ['4', '6', '10', '1'], summerQuotes, summerThemes, summerStories, summerKnowledge, summerTrivia),
    tags: ['民国', 'Art Deco', '摩登', '怀旧']
  },
  {
    id: 'theme-2026-6',
    month: 5,
    year: 2026,
    title: '仲夏六月·食在广州',
    subtitle: '粤味百年，西关风情',
    description: '六月盛夏，粤菜飘香。骑楼街上的饼家、茶楼、西餐厅招牌林立，构成了独特的岭南商业文化长卷。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guangzhou%20cantonese%20restaurant%20signboard%20arcade%20building%20vintage&image_size=landscape_16_9',
    accentColor: '#FF4500',
    themeType: 'season',
    featuredSignboardIds: ['2', '12', '10', '7'],
    dailySigns: createDailySigns(2026, 5, ['2', '12', '10', '7'], summerQuotes, summerThemes, summerStories, summerKnowledge, summerTrivia),
    tags: ['粤菜', '西关', '骑楼', '岭南文化']
  },
  {
    id: 'theme-2026-7',
    month: 6,
    year: 2026,
    title: '七月流火·京韵风华',
    subtitle: '皇城根下，百年传承',
    description: '七月盛夏，老北京的胡同里，布鞋铺、中药铺、饭庄的招牌承载着皇城根下的百年记忆。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20hutong%20traditional%20signboard%20red%20gold%20imperial&image_size=landscape_16_9',
    accentColor: '#8B0000',
    themeType: 'era',
    featuredSignboardIds: ['5', '9', '3'],
    dailySigns: createDailySigns(2026, 6, ['5', '9', '3', '11'], summerQuotes, summerThemes, summerStories, summerKnowledge, summerTrivia),
    tags: ['老北京', '胡同', '皇城', '非遗']
  },
  {
    id: 'theme-2026-8',
    month: 7,
    year: 2026,
    title: '八月金秋·硕果飘香',
    subtitle: '中秋月圆，饼家飘香',
    description: '八月金秋，月饼飘香。广式月饼老字号的金字招牌熠熠生辉，承载着家家户户的团圆记忆。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mid-autumn%20mooncake%20bakery%20signboard%20golden%20festive&image_size=landscape_16_9',
    accentColor: '#DAA520',
    themeType: 'festival',
    featuredSignboardIds: ['12', '6', '7'],
    dailySigns: createDailySigns(2026, 7, ['12', '6', '7', '2'], autumnQuotes, autumnThemes, autumnStories, autumnKnowledge, autumnTrivia),
    tags: ['中秋', '月饼', '团圆', '金秋']
  },
  {
    id: 'theme-2026-9',
    month: 8,
    year: 2026,
    title: '九月江南·烟雨朦胧',
    subtitle: '江南水乡，匠心独运',
    description: '九月秋高气爽，江南水乡的老字号招牌，在烟雨朦胧中诉说着千年匠人的坚守与传承。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=jiangnan%20water%20town%20traditional%20craft%20signboard%20misty&image_size=landscape_16_9',
    accentColor: '#2F4F4F',
    themeType: 'season',
    featuredSignboardIds: ['11', '8', '1'],
    dailySigns: createDailySigns(2026, 8, ['11', '8', '1', '3'], autumnQuotes, autumnThemes, autumnStories, autumnKnowledge, autumnTrivia),
    tags: ['江南', '水乡', '手工艺', '匠人精神']
  },
  {
    id: 'theme-2026-10',
    month: 9,
    year: 2026,
    title: '十月金秋·百年字号',
    subtitle: '百年传承，匠心永恒',
    description: '十月金秋，举国同庆。让我们回望那些跨越百年的老字号招牌，它们是城市最珍贵的文化遗产。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=century%20old%20chinese%20heritage%20signboard%20autumn%20festive&image_size=landscape_16_9',
    accentColor: '#8B4513',
    themeType: 'era',
    featuredSignboardIds: ['3', '5', '9', '11'],
    dailySigns: createDailySigns(2026, 9, ['3', '5', '9', '11', '12'], autumnQuotes, autumnThemes, autumnStories, autumnKnowledge, autumnTrivia),
    tags: ['百年老字号', '文化遗产', '国庆', '传承']
  },
  {
    id: 'theme-2026-11',
    month: 10,
    year: 2026,
    title: '冬月温情·暖在老店',
    subtitle: '冬日进补，老字号暖心',
    description: '十一月寒冬，走进老字号，一碗热汤、一壶热茶，老招牌下的温暖，是冬日里最暖心的记忆。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=winter%20chinese%20restaurant%20signboard%20warm%20cozy%20steam&image_size=landscape_16_9',
    accentColor: '#A0522D',
    themeType: 'season',
    featuredSignboardIds: ['3', '7', '1'],
    dailySigns: createDailySigns(2026, 10, ['3', '7', '1', '5'], winterQuotes, winterThemes, winterStories, winterKnowledge, winterTrivia),
    tags: ['冬日', '暖食', '进补', '温暖']
  },
  {
    id: 'theme-2026-12',
    month: 11,
    year: 2026,
    title: '腊月年关·辞旧迎新',
    subtitle: '岁末年初，万象更新',
    description: '腊月里，辞旧迎新。各大老字号换上新漆的招牌在冬日暖阳中，迎接又一个新年的到来。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20new%20year%20eve%20signboard%20red%20festive%20lanterns&image_size=landscape_16_9',
    accentColor: '#C62828',
    themeType: 'festival',
    featuredSignboardIds: ['12', '3', '6', '5'],
    dailySigns: createDailySigns(2026, 11, ['12', '3', '6', '5', '9'], winterQuotes, winterThemes, winterStories, winterKnowledge, winterTrivia),
    tags: ['腊月', '新年', '辞旧迎新', '团圆']
  }
];

export const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
export const weekDayNames = ['日', '一', '二', '三', '四', '五', '六'];

export const themeTypeLabels: Record<MonthlyTheme['themeType'], { text: string; icon: string; color: string }> = {
  season: { text: '时令节气', icon: '🍃', color: '#6B8E23' },
  festival: { text: '传统节日', icon: '🏮', color: '#C62828' },
  era: { text: '年代风貌', icon: '🏛️', color: '#8B4513' },
  craft: { text: '工艺传承', icon: '✂️', color: '#4A4A4A' }
};
