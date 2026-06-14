import type { FontFamily } from '../types';

export const fontFamilies: FontFamily[] = [
  {
    id: 'kai-shu',
    name: '楷书',
    englishName: 'Kai Shu / Regular Script',
    style: '楷书',
    origin: '中国',
    originEra: '汉代',
    description: '楷书也叫正楷、真书、正书，由隶书逐渐演变而来，更趋简化，横平竖直。楷书是汉字书法中常见的一种手写字体风格，是现代通行的汉字手写正体字。其特点是形体方正，笔画平直，可作楷模，故名楷书。',
    features: {
      strokes: '笔画工整',
      feeling: '端庄典雅',
      era: '通用',
      features: ['结构方正', '横平竖直', '易读性强', '法度严谨']
    },
    eraVariants: [
      {
        era: '唐代',
        yearRange: '618-907',
        description: '唐代是楷书发展的鼎盛时期，出现了欧阳询、颜真卿、柳公权等楷书大家，形成了各具特色的楷书风格。',
        characteristics: ['法度森严', '结构严谨', '笔法精妙', '气势雄浑'],
        representativeWorks: ['九成宫醴泉铭', '颜勤礼碑', '玄秘塔碑']
      },
      {
        era: '宋代',
        yearRange: '960-1279',
        description: '宋代楷书在唐代基础上有所发展，更加注重意趣和个性表达。',
        characteristics: ['尚意重趣', '结体灵动', '笔法自然', '文人气息'],
        representativeWorks: ['万安桥记', '醉翁亭记']
      },
      {
        era: '明清',
        yearRange: '1368-1912',
        description: '明清时期楷书广泛用于官方文书和牌匾刻字，馆阁体盛行。',
        characteristics: ['工整规范', '乌黑方正', '大小一律', '官方标准'],
        representativeWorks: ['永乐大典', '四库全书']
      },
      {
        era: '民国',
        yearRange: '1912-1949',
        description: '民国时期楷书继续作为招牌书写的主流字体，兼具传统功力与时代气息。',
        characteristics: ['雅俗共赏', '端庄大方', '商业实用', '名家辈出'],
        representativeWorks: ['德兴茶庄', '同仁堂', '陆羽茶室']
      }
    ],
    signboardIds: ['1', '5', '7', '9', '12'],
    color: '#8B4513',
    icon: '📜',
    difficulty: 'basic',
    readability: 95,
    artisticValue: 85,
    historicalSignificance: 90
  },
  {
    id: 'xing-shu',
    name: '行书',
    englishName: 'Xing Shu / Running Script',
    style: '行书',
    origin: '中国',
    originEra: '东汉',
    description: '行书是介于楷书和草书之间的一种字体，是为了弥补楷书的书写速度太慢和草书的难于辨认而产生的。"行"是"行走"的意思，因此它不像草书那样潦草，也不像楷书那样端正。实质上它是楷书的草化或草书的楷化。',
    features: {
      strokes: '笔画流畅',
      feeling: '飘逸灵动',
      era: '民国流行',
      features: ['连笔自然', '节奏感强', '艺术感高', '书写快捷']
    },
    eraVariants: [
      {
        era: '东晋',
        yearRange: '317-420',
        description: '东晋是行书艺术的巅峰时期，王羲之被誉为"书圣"，其《兰亭序》被称为"天下第一行书"。',
        characteristics: ['飘逸自然', '气韵生动', '变化多姿', '随心所欲'],
        representativeWorks: ['兰亭序', '丧乱帖', '伯远帖']
      },
      {
        era: '唐代',
        yearRange: '618-907',
        description: '唐代行书在继承晋代传统的基础上有所创新，颜真卿的《祭侄文稿》被誉为"天下第二行书"。',
        characteristics: ['雄浑大气', '情感充沛', '笔法多变', '气势磅礴'],
        representativeWorks: ['祭侄文稿', '争座位帖', '温泉铭']
      },
      {
        era: '宋代',
        yearRange: '960-1279',
        description: '宋代行书注重意趣，"宋四家"苏轼、黄庭坚、米芾、蔡襄各具特色。',
        characteristics: ['尚意重韵', '个性鲜明', '文人意趣', '挥洒自如'],
        representativeWorks: ['黄州寒食诗帖', '松风阁诗', '蜀素帖']
      },
      {
        era: '民国',
        yearRange: '1912-1949',
        description: '民国时期行书广泛应用于商业招牌，飘逸灵动的风格深受市民喜爱。',
        characteristics: ['雅俗共赏', '艺术性强', '文化气息', '商业应用'],
        representativeWorks: ['艳芳照相馆']
      }
    ],
    signboardIds: ['4'],
    color: '#2C3E50',
    icon: '✒️',
    difficulty: 'intermediate',
    readability: 75,
    artisticValue: 95,
    historicalSignificance: 90
  },
  {
    id: 'li-shu',
    name: '隶书',
    englishName: 'Li Shu / Clerical Script',
    style: '隶书',
    origin: '中国',
    originEra: '秦朝',
    description: '隶书，有秦隶、汉隶等，一般认为由篆书发展而来，字形多呈宽扁，横画长而竖画短，讲究"蚕头燕尾"、"一波三折"。隶书是汉字中常见的一种庄重的字体，书写效果略微宽扁，横画长而直画短，呈长方形状。',
    features: {
      strokes: '蚕头燕尾',
      feeling: '古朴厚重',
      era: '清代传统',
      features: ['字形扁方', '波磔分明', '端庄大气', '古朴典雅']
    },
    eraVariants: [
      {
        era: '汉代',
        yearRange: '前202-220',
        description: '汉代是隶书发展的黄金时期，汉隶笔法娴熟，结构平整，是隶书的典范。',
        characteristics: ['蚕头燕尾', '一波三折', '气势开张', '古朴雄浑'],
        representativeWorks: ['曹全碑', '乙瑛碑', '礼器碑']
      },
      {
        era: '唐代',
        yearRange: '618-907',
        description: '唐代隶书在继承汉隶基础上有所发展，更加规整华丽。',
        characteristics: ['规整华丽', '法度谨严', '庙堂之气', '丰腴华丽'],
        representativeWorks: ['纪太山铭', '石台孝经']
      },
      {
        era: '清代',
        yearRange: '1636-1912',
        description: '清代碑学兴盛，隶书复兴，出现了邓石如、伊秉绶等隶书大家。',
        characteristics: ['碑学复兴', '古朴厚重', '气势磅礴', '篆隶结合'],
        representativeWorks: ['邓石如隶书', '伊秉绶隶书']
      },
      {
        era: '民国',
        yearRange: '1912-1949',
        description: '民国时期隶书常用于传统行业招牌，古朴厚重的风格彰显老字号底蕴。',
        characteristics: ['古朴厚重', '传统韵味', '老字号首选', '文化底蕴'],
        representativeWorks: ['冠生园', '张小泉']
      }
    ],
    signboardIds: ['6', '11'],
    color: '#556B2F',
    icon: '🖋️',
    difficulty: 'intermediate',
    readability: 80,
    artisticValue: 90,
    historicalSignificance: 95
  },
  {
    id: 'wei-bei',
    name: '魏碑',
    englishName: 'Wei Bei / Wei Stele Script',
    style: '魏碑',
    origin: '中国',
    originEra: '南北朝',
    description: '魏碑是我国南北朝时期（公元420-588年）北朝文字刻石的通称，以北魏为最精，大体可分为碑刻、墓志、造像题记和摩崖刻石四种。魏碑是一种承前启后、继往开来的过渡性书法体系，对后世书法影响深远。',
    features: {
      strokes: '笔力遒劲',
      feeling: '雄浑古朴',
      era: '北朝风格',
      features: ['方笔为主', '棱角分明', '气势开张', '朴拙自然']
    },
    eraVariants: [
      {
        era: '北魏',
        yearRange: '386-534',
        description: '北魏是魏碑艺术的鼎盛时期，石刻书法艺术达到高峰。',
        characteristics: ['方折峻利', '气势雄强', '结体欹侧', '天真烂漫'],
        representativeWorks: ['龙门二十品', '张猛龙碑', '郑文公碑']
      },
      {
        era: '清代',
        yearRange: '1636-1912',
        description: '清代碑学运动中，魏碑受到高度重视，成为学习的重要范本。',
        characteristics: ['碑学典范', '复古革新', '雄强古拙', '影响深远'],
        representativeWorks: ['艺舟双楫', '广艺舟双楫']
      },
      {
        era: '清末民国',
        yearRange: '1840-1949',
        description: '清末民初魏碑风格常用于传统店铺招牌，雄浑古朴的风格极具感染力。',
        characteristics: ['雄浑古朴', '笔力千钧', '传统厚重', '老店风范'],
        representativeWorks: ['老正兴菜馆']
      }
    ],
    signboardIds: ['3'],
    color: '#8B0000',
    icon: '🗿',
    difficulty: 'advanced',
    readability: 70,
    artisticValue: 90,
    historicalSignificance: 95
  },
  {
    id: 'zhuan-shu',
    name: '篆书',
    englishName: 'Zhuan Shu / Seal Script',
    style: '篆书',
    origin: '中国',
    originEra: '商代',
    description: '篆书是大篆、小篆的统称。甲骨文、金文、籀文、六国文字，它们保存着古代象形文字的明显特点。小篆也称"秦篆"，是秦国的通用文字，大篆的简化字体，其特点是形体均匀齐整、字体较籀文容易书写。',
    features: {
      strokes: '线条匀净',
      feeling: '高古典雅',
      era: '先秦古风',
      features: ['曲线优美', '装饰性强', '辨识度低', '古朴典雅']
    },
    eraVariants: [
      {
        era: '先秦',
        yearRange: '前21世纪-前221',
        description: '先秦时期的甲骨文、金文、石鼓文等是篆书的早期形态。',
        characteristics: ['象形意味', '线条质朴', '变化丰富', '古奥神秘'],
        representativeWorks: ['甲骨文', '毛公鼎', '石鼓文']
      },
      {
        era: '秦代',
        yearRange: '前221-前207',
        description: '秦统一六国后，推行"书同文"政策，小篆成为标准字体。',
        characteristics: ['标准统一', '线条圆润', '结构对称', '端庄秀丽'],
        representativeWorks: ['泰山刻石', '琅邪台刻石']
      },
      {
        era: '清代',
        yearRange: '1636-1912',
        description: '清代篆书复兴，邓石如、赵之谦等大家将篆书艺术推向新高度。',
        characteristics: ['篆隶结合', '笔墨丰富', '个性鲜明', '名家辈出'],
        representativeWorks: ['邓石如篆书', '赵之谦篆书']
      },
      {
        era: '清末民国',
        yearRange: '1840-1949',
        description: '清末民初篆书常用于文房四宝、书画店等文化气息浓厚的店铺招牌。',
        characteristics: ['高古典雅', '文化气息', '文人气质', '装饰性强'],
        representativeWorks: ['朵云轩']
      }
    ],
    signboardIds: ['8'],
    color: '#800080',
    icon: '🔮',
    difficulty: 'advanced',
    readability: 40,
    artisticValue: 95,
    historicalSignificance: 100
  },
  {
    id: 'song-ti',
    name: '宋体',
    englishName: 'Song Ti / Song Typeface',
    style: '宋体',
    origin: '中国',
    originEra: '宋代',
    description: '宋体，是为适应印刷术而出现的一种汉字字体。笔画有粗细变化，而且一般是横细竖粗，末端有装饰部分（即"字脚"或"衬线"），点、撇、捺、钩等笔画有尖端，属于衬线字体，常用于书籍、杂志、报纸印刷的正文排版。',
    features: {
      strokes: '横细竖粗',
      feeling: '规范工整',
      era: '建国后普及',
      features: ['印刷标准', '棱角分明', '现代感强', '易读性高']
    },
    eraVariants: [
      {
        era: '宋代',
        yearRange: '960-1279',
        description: '宋代活字印刷术发明后，逐渐形成了适合印刷的字体形态。',
        characteristics: ['雕版印刷', '横轻竖重', '结构方正', '阅读舒适'],
        representativeWorks: ['开宝藏', '册府元龟']
      },
      {
        era: '明代',
        yearRange: '1368-1644',
        description: '明代印刷业发达，宋体字逐渐定型，成为印刷的主要字体。',
        characteristics: ['字形方正', '横细竖粗', '笔锋清晰', '版刻标准'],
        representativeWorks: ['永乐大典', '古今图书集成']
      },
      {
        era: '清代',
        yearRange: '1636-1912',
        description: '清代宋体字更加成熟，形成了多种风格流派。',
        characteristics: ['风格多样', '精雕细琢', '宫廷风格', '民间风格'],
        representativeWorks: ['四库全书', '武英殿本']
      },
      {
        era: '现代',
        yearRange: '1949至今',
        description: '新中国成立后，宋体字得到广泛应用，成为官方文书和商业招牌的常用字体。',
        characteristics: ['规范标准', '广泛应用', '现代设计', '多种字重'],
        representativeWorks: ['永盛布行']
      }
    ],
    signboardIds: ['2'],
    color: '#1E3A8A',
    icon: '📖',
    difficulty: 'basic',
    readability: 90,
    artisticValue: 70,
    historicalSignificance: 85
  },
  {
    id: 'art-deco',
    name: '艺术字',
    englishName: 'Artistic Chinese Characters',
    style: '艺术字',
    origin: '中国',
    originEra: '民国',
    description: '民国时期，随着西风东渐，中西文化交流日益频繁，出现了融合传统书法与现代设计的艺术字体。这些字体往往结合了Art Deco风格、西洋广告画风格与中国传统书法元素，具有鲜明的时代特色。',
    features: {
      strokes: '造型多变',
      feeling: '时尚新潮',
      era: '民国西风东渐',
      features: ['中西合璧', '装饰性强', '个性鲜明', '商业气息']
    },
    eraVariants: [
      {
        era: '民国早期',
        yearRange: '1912-1930',
        description: '新文化运动后，西方设计理念传入中国，艺术字开始出现在报刊广告中。',
        characteristics: ['西风东渐', '探索创新', '中西融合', '广告应用'],
        representativeWorks: ['申报广告', '良友画报']
      },
      {
        era: '民国中期',
        yearRange: '1931-1945',
        description: 'Art Deco风格风靡全球，中国设计师将其与汉字结合，形成独特的艺术字体风格。',
        characteristics: ['几何造型', '装饰艺术', '摩登时尚', '商业繁荣'],
        representativeWorks: ['和平饭店', '百乐门']
      },
      {
        era: '民国晚期',
        yearRange: '1946-1949',
        description: '战后恢复时期，艺术字继续发展，更加注重实用性与美观性的结合。',
        characteristics: ['实用美观', '商业应用', '城市文化', '消费主义'],
        representativeWorks: ['太平馆西餐厅']
      }
    ],
    signboardIds: ['10'],
    color: '#FF6347',
    icon: '🎨',
    difficulty: 'intermediate',
    readability: 75,
    artisticValue: 90,
    historicalSignificance: 75
  }
];

export const fontDifficulties = [
  { value: '全部', label: '全部难度' },
  { value: 'basic', label: '入门级' },
  { value: 'intermediate', label: '进阶级' },
  { value: 'advanced', label: '专家级' }
];

export const fontSortOptions = [
  { value: 'name', label: '按名称排序' },
  { value: 'historicalSignificance', label: '按历史价值排序' },
  { value: 'artisticValue', label: '按艺术价值排序' },
  { value: 'readability', label: '按易读性排序' },
  { value: 'signboardCount', label: '按招牌数量排序' }
];

export const fontStyleCategories = [
  { value: '全部', label: '全部字体风格' },
  { value: '楷书', label: '楷书' },
  { value: '行书', label: '行书' },
  { value: '隶书', label: '隶书' },
  { value: '魏碑', label: '魏碑' },
  { value: '篆书', label: '篆书' },
  { value: '宋体', label: '宋体' },
  { value: '艺术字', label: '艺术字' }
];
