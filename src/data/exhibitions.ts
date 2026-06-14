import type { Signboard } from '../types';

export interface ExhibitionTheme {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  accentColor: string;
  bgColor: string;
  signboardIds: string[];
  curatorNote: string;
  tags: string[];
}

export interface TourRoute {
  id: string;
  name: string;
  description: string;
  duration: string;
  distance: string;
  difficulty: 'easy' | 'moderate' | 'advanced';
  icon: string;
  color: string;
  stops: {
    signboardId: string;
    order: number;
    highlight: string;
  }[];
}

export const exhibitionThemes: ExhibitionTheme[] = [
  {
    id: 'time-honored',
    name: '百年老字号',
    subtitle: 'Century-Old Heritage',
    description: '穿越百年时光，见证中华老字号的兴衰与传承。从清代始创到现代焕新，每一块招牌都承载着几代人的记忆与匠心。',
    icon: '🏛️',
    accentColor: '#8B0000',
    bgColor: '#FDF5E6',
    signboardIds: ['3', '5', '9', '11'],
    curatorNote: '本展厅精选四块跨越百年的老字号招牌，它们不仅是商业标志，更是中华商业文化的活化石。每一块招牌都经历了至少三次重大修缮，见证了中国近现代史的沧桑巨变。',
    tags: ['老字号', '历史悠久', '文化传承']
  },
  {
    id: 'calligraphy-art',
    name: '书法艺术长廊',
    subtitle: 'Calligraphy Art Gallery',
    description: '从篆书到行书，从魏碑到艺术字，探索中国书法艺术在招牌设计中的魅力与演变。',
    icon: '✍️',
    accentColor: '#2C3E50',
    bgColor: '#F5F5DC',
    signboardIds: ['1', '3', '4', '8', '10'],
    curatorNote: '书法是中国招牌的灵魂。本展厅展示了楷书、行书、隶书、魏碑、篆书、艺术字等六种不同书体的招牌设计，让观众领略中华书法之美在商业空间中的独特表达。',
    tags: ['书法', '艺术', '字体设计']
  },
  {
    id: 'color-aesthetics',
    name: '色彩美学馆',
    subtitle: 'Color Aesthetics Hall',
    description: '探索传统招牌的配色智慧，从典雅的黑金配到喜庆的红金配，感受色彩背后的文化意涵。',
    icon: '🎨',
    accentColor: '#8B4513',
    bgColor: '#FFF8DC',
    signboardIds: ['1', '5', '6', '7', '12'],
    curatorNote: '中国传统招牌的配色蕴含着深厚的文化内涵。黑色代表庄重，金色象征富贵，红色寓意喜庆，绿色体现生机。本展厅通过不同配色方案的招牌，展现中国传统色彩美学。',
    tags: ['色彩', '美学', '配色设计']
  },
  {
    id: 'republic-era',
    name: '民国风尚馆',
    subtitle: 'Republic Era Style',
    description: '回到那个中西交融的黄金年代，感受民国时期招牌设计的独特魅力与时代精神。',
    icon: '🎩',
    accentColor: '#CD853F',
    bgColor: '#FAEBD7',
    signboardIds: ['1', '4', '6', '10', '12'],
    curatorNote: '民国时期是中国现代设计的启蒙期。西风东渐之下，传统书法与Art Deco风格碰撞融合，产生了独具特色的民国设计美学。本展厅精选五块民国时期的招牌，带您领略那个时代的风尚。',
    tags: ['民国', '复古', '中西合璧']
  },
  {
    id: 'regional-style',
    name: '地域风格馆',
    subtitle: 'Regional Style Pavilion',
    description: '从北京的四合院到广州的骑楼，从上海的石库门到香港的唐楼，领略不同地域的招牌文化特色。',
    icon: '🗺️',
    accentColor: '#4682B4',
    bgColor: '#F0F8FF',
    signboardIds: ['1', '2', '3', '5', '7', '11'],
    curatorNote: '中国地大物博，各地的招牌文化也各具特色。京派的庄重、海派的洋气、广派的务实、港式的精致——本展厅通过六个城市的招牌，展现中华大地丰富多彩的商业文化景观。',
    tags: ['地域', '城市', '文化差异']
  },
  {
    id: 'restoration-story',
    name: '修缮故事馆',
    subtitle: 'Restoration Story Hall',
    description: '每一块老招牌都有自己的故事。本展厅通过招牌的修缮历程，讲述它们如何在岁月中涅槃重生。',
    icon: '🔧',
    accentColor: '#6B8E23',
    bgColor: '#F5FFFA',
    signboardIds: ['3', '4', '5', '8', '10', '11'],
    curatorNote: '这些招牌都经历了至少一次重大损坏与修复。从战乱损毁到文革破坏，从自然风化到专业修复，每一块招牌的故事都是一部微型的文化遗产保护史。',
    tags: ['修缮', '保护', '文化遗产']
  }
];

export const tourRoutes: TourRoute[] = [
  {
    id: 'classic-tour',
    name: '经典精华游',
    description: '最受欢迎的游览路线，带您领略展厅的精华展品，感受招牌文化的独特魅力。',
    duration: '约45分钟',
    distance: '约200米',
    difficulty: 'easy',
    icon: '⭐',
    color: '#8B4513',
    stops: [
      { signboardId: '5', order: 1, highlight: '中华老字号的代表，三百余年历史的中药铺招牌' },
      { signboardId: '3', order: 2, highlight: '百年本帮菜馆，魏碑体招牌古朴厚重' },
      { signboardId: '1', order: 3, highlight: '民国茶庄招牌，楷书遒劲有力' },
      { signboardId: '4', order: 4, highlight: '岭南风韵，行书流畅飘逸' },
      { signboardId: '10', order: 5, highlight: '中西合璧的艺术字设计，民国风尚代表' }
    ]
  },
  {
    id: 'calligraphy-tour',
    name: '书法艺术深度游',
    description: '专为书法爱好者设计的路线，系统展示不同书体在招牌设计中的应用。',
    duration: '约60分钟',
    distance: '约300米',
    difficulty: 'moderate',
    icon: '🖌️',
    color: '#2C3E50',
    stops: [
      { signboardId: '8', order: 1, highlight: '篆书：古朴典雅，金石韵味' },
      { signboardId: '11', order: 2, highlight: '隶书：蚕头燕尾，苍劲有力' },
      { signboardId: '3', order: 3, highlight: '魏碑：雄浑古朴，气势开张' },
      { signboardId: '5', order: 4, highlight: '楷书：端庄肃穆，堂堂正正' },
      { signboardId: '4', order: 5, highlight: '行书：流畅飘逸，节奏感强' },
      { signboardId: '10', order: 6, highlight: '艺术字：中西合璧，时尚新潮' }
    ]
  },
  {
    id: 'history-tour',
    name: '历史穿越之旅',
    description: '按年代顺序游览，从清代到现代，见证招牌设计的百年变迁。',
    duration: '约90分钟',
    distance: '约400米',
    difficulty: 'advanced',
    icon: '⏳',
    color: '#6B8E23',
    stops: [
      { signboardId: '11', order: 1, highlight: '清代康熙年间，中华老字号' },
      { signboardId: '5', order: 2, highlight: '清代康熙年间，御药房供奉' },
      { signboardId: '3', order: 3, highlight: '清末同治元年，百年本帮菜' },
      { signboardId: '8', order: 4, highlight: '清末光绪年间，文人书画店' },
      { signboardId: '12', order: 5, highlight: '民国初年，广式饼家' },
      { signboardId: '4', order: 6, highlight: '民国1920年代，照相馆' },
      { signboardId: '6', order: 7, highlight: '民国1930年代，民族品牌' },
      { signboardId: '7', order: 8, highlight: '民国1940年代，港式茶楼' },
      { signboardId: '2', order: 9, highlight: '1950年代，新中国成立初期' }
    ]
  },
  {
    id: 'compare-tour',
    name: '对比鉴赏游',
    description: '对比不同地域、不同风格的招牌，培养审美眼光，发现设计之妙。',
    duration: '约50分钟',
    distance: '约250米',
    difficulty: 'moderate',
    icon: '⚖️',
    color: '#4682B4',
    stops: [
      { signboardId: '5', order: 1, highlight: '北派：京式庄重典雅' },
      { signboardId: '7', order: 2, highlight: '南派：港式精致温润' },
      { signboardId: '1', order: 3, highlight: '海派：中西交融' },
      { signboardId: '2', order: 4, highlight: '广派：务实鲜明' },
      { signboardId: '11', order: 5, highlight: '江南：古朴雅致' },
      { signboardId: '10', order: 6, highlight: '艺术：中西合璧' }
    ]
  }
];

export const getExhibitionById = (id: string): ExhibitionTheme | undefined => {
  return exhibitionThemes.find(theme => theme.id === id);
};

export const getTourById = (id: string): TourRoute | undefined => {
  return tourRoutes.find(tour => tour.id === id);
};

export const getExhibitionsContainingSignboard = (signboardId: string): ExhibitionTheme[] => {
  return exhibitionThemes.filter(theme => theme.signboardIds.includes(signboardId));
};

export const getSignboardsForExhibition = (exhibitionId: string, allSignboards: Signboard[]): Signboard[] => {
  const exhibition = getExhibitionById(exhibitionId);
  if (!exhibition) return [];
  return exhibition.signboardIds
    .map(id => allSignboards.find(s => s.id === id))
    .filter((s): s is Signboard => s !== undefined);
};
