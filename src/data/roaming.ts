import type { District, Route } from '../types';

export const districts: District[] = [
  {
    id: 'sh-huangpu',
    name: '黄浦老城',
    city: '上海',
    description: '从福州路老字号到南京东路商业街，黄浦区承载了上海最具代表性的招牌文化。百年老店与近代商业交织，每一块招牌都诉说着不同时代的故事。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20old%20town%20huangpu%20district%20vintage%20signboards%20hanging%20historic%20street%20view&image_size=landscape_16_9',
    signboardIds: ['3', '6', '8'],
    color: '#8B0000',
    landmarks: ['福州路', '南京东路', '河南南路']
  },
  {
    id: 'sh-jingan',
    name: '静安洋场',
    city: '上海',
    description: '静安区见证了上海从租界到国际都市的蜕变。南京西路上的茶庄招牌，融合了东方传统与西方审美，是海派文化的缩影。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20jingan%20district%20nanjing%20west%20road%20vintage%20tea%20shop%20signboard%20art%20deco&image_size=landscape_16_9',
    signboardIds: ['1'],
    color: '#DAA520',
    landmarks: ['南京西路']
  },
  {
    id: 'gz-liwan',
    name: '荔湾西关',
    city: '广州',
    description: '西关是老广州的灵魂所在，上下九与第十甫路的骑楼下，百年饼家与布行招牌依然鲜活。这里是广式招牌最集中的区域，霓虹与木匾共存。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guangzhou%20liwan%20xiguan%20old%20street%20arcade%20shop%20signboards%20cantonese%20neon&image_size=landscape_16_9',
    signboardIds: ['2', '12'],
    color: '#FF4500',
    landmarks: ['上下九', '第十甫路']
  },
  {
    id: 'gz-yuexiu',
    name: '越秀古街',
    city: '广州',
    description: '北京路上的照相馆与西餐厅，是广州最早接触西方文明的见证。越秀区的招牌融合了岭南传统与西洋风格，Art Deco在此绽放。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guangzhou%20yuexiu%20beijing%20road%20old%20photo%20studio%20western%20restaurant%20art%20deco%20signboard&image_size=landscape_16_9',
    signboardIds: ['4', '10'],
    color: '#191970',
    landmarks: ['北京路']
  },
  {
    id: 'bj-xicheng',
    name: '西城大栅栏',
    city: '北京',
    description: '大栅栏是北京老字号最密集的区域，同仁堂与内联升的招牌已有数百年历史。黑底金字的楷书招牌，是京城商业文化的活化石。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20dashilar%20dazhalan%20old%20street%20traditional%20chinese%20shop%20signboards%20imperial%20style&image_size=landscape_16_9',
    signboardIds: ['5', '9'],
    color: '#800000',
    landmarks: ['大栅栏']
  },
  {
    id: 'hk-central',
    name: '中环唐楼',
    city: '香港',
    description: '中环士丹利街的陆羽茶室，是港式茶楼文化的地标。橄榄绿配米黄的招牌，在水泥森林中独树一帜，记录着战后香港的市井记忆。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hong%20kong%20central%20stanley%20street%20old%20tea%20house%20tong%20lau%20vintage%20signboard&image_size=landscape_16_9',
    signboardIds: ['7'],
    color: '#556B2F',
    landmarks: ['士丹利街']
  },
  {
    id: 'hz-shangcheng',
    name: '上城河坊',
    city: '杭州',
    description: '河坊街是杭州最具历史感的步行街，张小泉剪刀的隶书招牌历经三百余年。江南民居的青瓦白墙间，传统手工艺招牌熠熠生辉。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hangzhou%20hefang%20street%20old%20scissors%20shop%20traditional%20jiangnan%20architecture%20signboard&image_size=landscape_16_9',
    signboardIds: ['11'],
    color: '#2F4F4F',
    landmarks: ['河坊街']
  }
];

export const routes: Route[] = [
  {
    id: 'route-sh-huangpu-classic',
    name: '黄浦百年字号巡礼',
    districtId: 'sh-huangpu',
    description: '从老正兴的百年红底金字出发，经南京东路冠生园的红绿新潮，到朵云轩的篆书文人风，一条路线阅尽上海商业招牌的三个时代。',
    stops: [
      { signboardId: '3', order: 1, note: '起点：福州路老正兴，百年红底金字' },
      { signboardId: '6', order: 2, note: '沿南京东路东行，冠生园的红绿配色' },
      { signboardId: '8', order: 3, note: '终点：河南南路朵云轩，篆书文人风' }
    ],
    duration: '约2小时',
    distance: '约1.8公里',
    difficulty: 'easy',
    theme: '经典巡礼',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20huangpu%20walking%20route%20map%20vintage%20style%20old%20shops%20signboards%20illustration&image_size=landscape_16_9'
  },
  {
    id: 'route-gz-liwan-xiguan',
    name: '西关骑楼招牌漫步',
    districtId: 'gz-liwan',
    description: '在上下九与第十甫路的骑楼间穿行，永盛布行的蓝白红与莲香楼的橙红金，两种风格映照出广州商业文化的双重面貌。',
    stops: [
      { signboardId: '2', order: 1, note: '起点：上下九永盛布行，建国初期蓝白红' },
      { signboardId: '12', order: 2, note: '步行至第十甫路，莲香楼的广式橙红金' }
    ],
    duration: '约1小时',
    distance: '约0.8公里',
    difficulty: 'easy',
    theme: '岭南风情',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guangzhou%20xiguan%20arcade%20walk%20route%20cantonese%20shop%20signboards%20illustrated%20map&image_size=landscape_16_9'
  },
  {
    id: 'route-gz-yuexiu-artdeco',
    name: '越秀中西合璧探秘',
    districtId: 'gz-yuexiu',
    description: '北京路是广州最早融合中西文化的商业街，艳芳照相馆的行书与太平馆的Art Deco，带你穿越民国时期的中西交融美学。',
    stops: [
      { signboardId: '4', order: 1, note: '起点：艳芳照相馆，行书飘逸的民国照相馆' },
      { signboardId: '10', order: 2, note: '同街相邻，太平馆的Art Deco深蓝金字' }
    ],
    duration: '约1小时',
    distance: '约0.5公里',
    difficulty: 'easy',
    theme: '中西合璧',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guangzhou%20beijing%20road%20art%20deco%20western%20restaurant%20photo%20studio%20vintage%20illustration&image_size=landscape_16_9'
  },
  {
    id: 'route-bj-dashilar',
    name: '大栅栏老字号朝圣',
    districtId: 'bj-xicheng',
    description: '同仁堂与内联升，两家康熙年间创立的老字号比邻而居。三百年黑底金字的楷书招牌，是京城商业文化的活化石。',
    stops: [
      { signboardId: '5', order: 1, note: '起点：同仁堂，三百余年黑底金字' },
      { signboardId: '9', order: 2, note: '同街相邻，内联升的百年布鞋楷书' }
    ],
    duration: '约1.5小时',
    distance: '约0.3公里',
    difficulty: 'easy',
    theme: '京城老字号',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20dashilar%20old%20brand%20shops%20tongrentang%20neiliansheng%20illustrated%20walking%20route&image_size=landscape_16_9'
  },
  {
    id: 'route-sh-jingan-tea',
    name: '静安茶香旧梦',
    districtId: 'sh-jingan',
    description: '南京西路上的德兴茶庄，金底黑字的楷书招牌是静安洋场的缩影。一块招牌，一段海派茶文化的百年往事。',
    stops: [
      { signboardId: '1', order: 1, note: '全程：德兴茶庄，金底黑字民国楷书' }
    ],
    duration: '约30分钟',
    distance: '约0.2公里',
    difficulty: 'easy',
    theme: '海派风情',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20jingan%20tea%20house%20gold%20black%20calligraphy%20signboard%20vintage%20walking%20tour&image_size=landscape_16_9'
  },
  {
    id: 'route-hk-central-tea',
    name: '中环港式茶楼记',
    districtId: 'hk-central',
    description: '陆羽茶室的橄榄绿招牌，是中环水泥森林中的一抹旧时光。在士丹利街驻足，品味战后港式茶楼的悠然岁月。',
    stops: [
      { signboardId: '7', order: 1, note: '全程：陆羽茶室，橄榄绿港式茶楼' }
    ],
    duration: '约45分钟',
    distance: '约0.3公里',
    difficulty: 'easy',
    theme: '港式记忆',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hong%20kong%20central%20tea%20house%20vintage%20signboard%20olive%20green%20walking%20tour%20illustration&image_size=landscape_16_9'
  },
  {
    id: 'route-hz-shangcheng-craft',
    name: '河坊手艺寻踪',
    districtId: 'hz-shangcheng',
    description: '河坊街上的张小泉剪刀，隶书苍劲的深灰底金字招牌，是杭州传统手工艺的活标本。在江南民居间寻觅三百年的匠人精神。',
    stops: [
      { signboardId: '11', order: 1, note: '全程：张小泉剪刀，隶书深灰底金字' }
    ],
    duration: '约40分钟',
    distance: '约0.5公里',
    difficulty: 'easy',
    theme: '江南手艺',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hangzhou%20hefang%20street%20scissors%20shop%20craftsman%20signboard%20jiangnan%20walking%20tour&image_size=landscape_16_9'
  }
];

export const getDistrictsByCity = (city: string): District[] => {
  return districts.filter(d => d.city === city);
};

export const getRoutesByDistrict = (districtId: string): Route[] => {
  return routes.filter(r => r.districtId === districtId);
};

export const getCities = (): string[] => {
  return [...new Set(districts.map(d => d.city))];
};
