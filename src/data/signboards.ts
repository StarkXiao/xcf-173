import type { Signboard } from '../types';

export const signboards: Signboard[] = [
  {
    id: '1',
    name: '德兴茶庄',
    shopName: '德兴茶庄',
    era: '民国',
    year: 1935,
    location: '上海静安区南京西路',
    fontStyle: '楷书',
    fontFamily: 'Traditional Kai',
    colors: ['#8B4513', '#FFD700', '#2F4F4F'],
    description: '典型的民国时期茶庄招牌，采用传统楷书书写，字体遒劲有力。金底黑字的配色在当时十分流行，招牌经历了近百年风雨，漆面虽有剥落，但韵味犹存。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20chinese%20tea%20shop%20signboard%201930s%20gold%20and%20black%20calligraphy%20weathered%20wood&image_size=square',
    tags: ['茶庄', '民国', '楷书'],
    condition: 'weathered',
    buildingType: '石库门',
    restorationHistory: [
      { year: 1935, era: '民国', type: 'creation', title: '创立初制', description: '茶庄开业，由本地书法家题写招牌，楠木为底，贴金箔字。', changes: { colors: ['#8B4513', '#FFD700', '#2F4F4F'], condition: 'well-preserved' } },
      { year: 1958, era: '1950s', type: 'renovation', title: '公私合营改制', description: '全行业公私合营，招牌文字保留，边框简化，去除部分装饰纹样。', changes: { condition: 'well-preserved' } },
      { year: 1987, era: '1980s', type: 'repaint', title: '改革开放重漆', description: '重新油漆保养，金字颜色略有加深，恢复开业时的气派。', changes: { condition: 'well-preserved' } },
      { year: 2015, era: '2010s', type: 'restoration', title: '老字号修缮工程', description: '列入上海老字号保护名录，聘请老工匠按原式样全面修缮。', changes: { condition: 'restored' } }
    ]
  },
  {
    id: '2',
    name: '永盛布行',
    shopName: '永盛布行',
    era: '1950s',
    year: 1956,
    location: '广州荔湾区上下九',
    fontStyle: '宋体',
    fontFamily: 'Song Ti',
    colors: ['#1E3A8A', '#F5F5DC', '#DC143C'],
    description: '建国初期的布行招牌，宋体字工整规范，蓝底白字配红色边框，带有鲜明的时代印记。招牌至今仍在使用，是老广州商业文化的活化石。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=1950s%20chinese%20fabric%20store%20sign%20blue%20white%20red%20border%20song%20typeface%20vintage&image_size=square',
    tags: ['布行', '建国初期', '宋体'],
    condition: 'well-preserved',
    buildingType: '骑楼',
    restorationHistory: [
      { year: 1956, era: '1950s', type: 'creation', title: '合作社创立', description: '公私合营后成立布业合作社，新式宋体招牌，具有鲜明的新中国成立初期风格。', changes: { colors: ['#1E3A8A', '#F5F5DC', '#DC143C'], condition: 'well-preserved' } },
      { year: 1976, era: '1970s', type: 'repaint', title: '文革后维护', description: '局部褪色，重新刷漆，基本保持原样。', changes: { condition: 'well-preserved' } },
      { year: 2002, era: '2000s', type: 'restoration', title: '上下九步行街改造', description: '骑楼街整体修缮，招牌加固，LED背光加装。', changes: { condition: 'well-preserved' } },
      { year: 2021, era: '2020s', type: 'renovation', title: '西关老字号焕新', description: '荔湾区老字号焕新计划，保留原招牌，仅做清洁保养。', changes: { condition: 'well-preserved' } }
    ]
  },
  {
    id: '3',
    name: '老正兴菜馆',
    shopName: '老正兴菜馆',
    era: '清末',
    year: 1862,
    location: '上海黄浦区福州路',
    fontStyle: '魏碑',
    fontFamily: 'Wei Bei',
    colors: ['#8B0000', '#DAA520', '#000000'],
    description: '创建于清同治元年的百年老字号，招牌采用魏碑体，古朴厚重。红底金字是传统菜馆的经典配色，这块招牌历经百年，见证了本帮菜的发展历程。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=qing%20dynasty%20chinese%20restaurant%20signboard%20red%20gold%20ancient%20calligraphy%20wei%20bei%20style&image_size=square',
    tags: ['菜馆', '清末', '魏碑', '老字号'],
    condition: 'restored',
    buildingType: '中式传统',
    restorationHistory: [
      { year: 1862, era: '清末', type: 'creation', title: '同治元年始创', description: '创办人祝正本在上海县城老校场开馆，请秀才题写魏碑体招牌。', changes: { colors: ['#8B0000', '#DAA520', '#000000'], condition: 'well-preserved' } },
      { year: 1908, era: '清末', type: 'renovation', title: '迁址福州路', description: '生意兴隆迁址福州路，重制招牌，尺寸加大，增设雕花边框。', changes: { condition: 'well-preserved' } },
      { year: 1937, era: '民国', type: 'damaged', title: '抗战时期受损', description: '淞沪会战期间，店面遭轰炸，招牌部分受损，战后紧急修复。', changes: { condition: 'damaged' } },
      { year: 1956, era: '1950s', type: 'restoration', title: '合营后大修', description: '公私合营，全面修缮招牌，替换受损木构件。', changes: { condition: 'restored' } },
      { year: 1998, era: '1990s', type: 'restoration', title: '百年大庆重光', description: '老店创建136周年，邀请木雕大师按原式样全面复原。', changes: { condition: 'restored' } },
      { year: 2020, era: '2020s', type: 'renovation', title: '国家级非遗保护', description: '列入国家级非遗保护项目，定期专业维护。', changes: { condition: 'restored' } }
    ]
  },
  {
    id: '4',
    name: '艳芳照相馆',
    shopName: '艳芳照相馆',
    era: '1920s',
    year: 1923,
    location: '广州越秀区北京路',
    fontStyle: '行书',
    fontFamily: 'Xing Shu',
    colors: ['#2C3E50', '#E8D5B7', '#8B7355'],
    description: '民国时期著名的照相馆，招牌行书流畅飘逸，艺术感极强。米色底配深褐色字，优雅大气，是当时新文化运动时期审美风格的体现。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=1920s%20chinese%20photo%20studio%20signboard%20elegant%20calligraphy%20beige%20brown%20art%20deco&image_size=square',
    tags: ['照相馆', '民国', '行书'],
    condition: 'weathered',
    buildingType: '洋楼',
    restorationHistory: [
      { year: 1923, era: '1920s', type: 'creation', title: '民初开业', description: '华侨集资创办，引入西洋摄影技术，请岭南书画家题写行书招牌。', changes: { colors: ['#2C3E50', '#E8D5B7', '#8B7355'], condition: 'well-preserved' } },
      { year: 1938, era: '1930s', type: 'damaged', title: '广州沦陷期', description: '日军占领广州，店铺被迫关闭，招牌被拆下藏匿。', changes: { condition: 'damaged' } },
      { year: 1945, era: '1940s', type: 'restoration', title: '抗战胜利复业', description: '抗战胜利后复业，重新安装招牌，修复损坏部分。', changes: { condition: 'restored' } },
      { year: 1966, era: '1960s', type: 'damaged', title: '文革冲击', description: '破四旧运动中招牌被红漆涂抹，字迹受损严重。', changes: { condition: 'damaged' } },
      { year: 1985, era: '1980s', type: 'restoration', title: '改革开放复原', description: '政策放开，老字号恢复，请老工匠清除红漆，按旧照片恢复。', changes: { condition: 'restored' } },
      { year: 2010, era: '2010s', type: 'weathered', title: '岁月风化', description: '长期风吹日晒，漆面再次出现自然剥落，形成独特的年代质感。', changes: { condition: 'weathered' } }
    ]
  },
  {
    id: '5',
    name: '同仁堂',
    shopName: '北京同仁堂',
    era: '清代',
    year: 1669,
    location: '北京西城区大栅栏',
    fontStyle: '楷书',
    fontFamily: 'Kai Shu',
    colors: ['#800000', '#FFD700', '#000000'],
    description: '创建于清康熙八年的中华老字号，招牌楷书端庄肃穆。黑底金字配红木边框，是中药铺最经典的样式，三百余年传承至今。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20pharmacy%20tcm%20shop%20signboard%20black%20gold%20red%20wood%20frame%20traditional&image_size=square',
    tags: ['药铺', '清代', '楷书', '老字号'],
    condition: 'restored',
    buildingType: '四合院',
    restorationHistory: [
      { year: 1669, era: '清代', type: 'creation', title: '康熙八年创立', description: '乐显扬创办同仁堂药室，悬挂第一块楷书黑底金字招牌。', changes: { colors: ['#800000', '#FFD700', '#000000'], condition: 'well-preserved' } },
      { year: 1723, era: '清代', type: 'renovation', title: '御药房供奉', description: '开始为清宫御药房供药，招牌尺寸加大，边框改用皇室御用红木。', changes: { condition: 'well-preserved' } },
      { year: 1889, era: '清末', type: 'restoration', title: '光绪年间大修', description: '招牌使用两百余年，全面修缮，金箔重贴。', changes: { condition: 'restored' } },
      { year: 1900, era: '清末', type: 'damaged', title: '庚子之变焚毁', description: '八国联军入侵北京，大栅栏遭火焚，招牌化为灰烬。', changes: { condition: 'damaged' } },
      { year: 1902, era: '清末', type: 'creation', title: '光绪二十八年重制', description: '按原样式重新制作，延续至今。', changes: { condition: 'well-preserved' } },
      { year: 1992, era: '1990s', type: 'restoration', title: '集团成立大修', description: '同仁堂集团成立，招牌列入文物保护单位，专业修缮。', changes: { condition: 'restored' } },
      { year: 2019, era: '2010s', type: 'renovation', title: '350周年大庆', description: '创建350周年，金箔重贴，木材做防虫处理。', changes: { condition: 'restored' } }
    ]
  },
  {
    id: '6',
    name: '冠生园',
    shopName: '冠生园食品店',
    era: '1930s',
    year: 1934,
    location: '上海黄浦区南京东路',
    fontStyle: '隶书',
    fontFamily: 'Li Shu',
    colors: ['#FF6347', '#FFFFF0', '#228B22'],
    description: '民国时期著名的食品品牌，招牌采用隶书，古朴中透着活泼。红绿配色在当年十分新潮，是民族品牌崛起时期的代表设计。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=1930s%20chinese%20food%20store%20signboard%20red%20green%20li%20shu%20calligraphy%20vintage%20advertising&image_size=square',
    tags: ['食品店', '民国', '隶书'],
    condition: 'well-preserved',
    buildingType: '百货大楼',
    restorationHistory: [
      { year: 1934, era: '1930s', type: 'creation', title: '冼冠生创办', description: '民族实业家冼冠生在上海开设总店，请书法家题写隶书招牌，红绿配色大胆新颖。', changes: { colors: ['#FF6347', '#FFFFF0', '#228B22'], condition: 'well-preserved' } },
      { year: 1956, era: '1950s', type: 'renovation', title: '公私合营', description: '公私合营后，招牌保留，部分装饰图案简化。', changes: { condition: 'well-preserved' } },
      { year: 1979, era: '1970s', type: 'repaint', title: '恢复老字号', description: '改革开放后，恢复老字号名称，招牌重新油漆。', changes: { condition: 'well-preserved' } },
      { year: 2001, era: '2000s', type: 'restoration', title: '品牌升级大修', description: '公司上市，门店整体升级，招牌按原样式专业修复。', changes: { condition: 'well-preserved' } },
      { year: 2018, era: '2010s', type: 'renovation', title: '南京东路步行街改造', description: '步行街整体改造，招牌加装照明系统。', changes: { condition: 'well-preserved' } }
    ]
  },
  {
    id: '7',
    name: '陆羽茶室',
    shopName: '陆羽茶室',
    era: '1940s',
    year: 1947,
    location: '香港中环士丹利街',
    fontStyle: '楷书',
    fontFamily: 'Kai Shu',
    colors: ['#556B2F', '#FFF8DC', '#8B4513'],
    description: '香港老牌茶楼，招牌楷书温润典雅，橄榄绿配米黄色是港式茶楼的经典配色。七十多年来，这块招牌见证了香港茶文化的变迁。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hong%20kong%20tea%20house%20signboard%201940s%20olive%20green%20cream%20traditional%20chinese%20calligraphy&image_size=square',
    tags: ['茶楼', '1940s', '楷书', '港式'],
    condition: 'well-preserved',
    buildingType: '唐楼',
    restorationHistory: [
      { year: 1947, era: '1940s', type: 'creation', title: '战后开业', description: '二战后香港经济复苏，陆羽茶室在中环开业，港式橄榄绿配色招牌。', changes: { colors: ['#556B2F', '#FFF8DC', '#8B4513'], condition: 'well-preserved' } },
      { year: 1967, era: '1960s', type: 'repaint', title: '六七暴动后修复', description: '香港暴动期间街道受影响，招牌受损，战后重新油漆。', changes: { condition: 'well-preserved' } },
      { year: 1987, era: '1980s', type: 'renovation', title: '中英谈判期维护', description: '唐楼整体加固，招牌做防台风处理。', changes: { condition: 'well-preserved' } },
      { year: 2007, era: '2000s', type: 'restoration', title: '香港非遗保护', description: '列入香港非物质文化遗产清单，专业团队按原式样修缮。', changes: { condition: 'well-preserved' } },
      { year: 2022, era: '2020s', type: 'renovation', title: '开业75周年', description: '开业75周年，招牌清洁保养，加装LED暖光照明。', changes: { condition: 'well-preserved' } }
    ]
  },
  {
    id: '8',
    name: '朵云轩',
    shopName: '朵云轩书画店',
    era: '清末',
    year: 1900,
    location: '上海黄浦区河南南路',
    fontStyle: '篆书',
    fontFamily: 'Zhuan Shu',
    colors: ['#4A4A4A', '#FAEBD7', '#800080'],
    description: '百年文房四宝老店，招牌采用古朴的篆书，与书画店的气质相得益彰。米黄底配灰色篆字，紫色点缀，文人气息浓厚。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20calligraphy%20art%20supply%20shop%20signboard%20seal%20script%20zhuan%20shu%20vintage%20elegant&image_size=square',
    tags: ['书画', '清末', '篆书', '文房'],
    condition: 'restored',
    buildingType: '中式传统',
    restorationHistory: [
      { year: 1900, era: '清末', type: 'creation', title: '光绪二十六年创设', description: '孙吉甫创办朵云轩，请海派金石书法家题写篆书招牌。', changes: { colors: ['#4A4A4A', '#FAEBD7', '#800080'], condition: 'well-preserved' } },
      { year: 1932, era: '民国', type: 'damaged', title: '一二八事变', description: '淞沪抗战期间，店面受损，招牌开裂。', changes: { condition: 'damaged' } },
      { year: 1933, era: '民国', type: 'restoration', title: '战后紧急修复', description: '按旧貌修复，更换破损木板。', changes: { condition: 'restored' } },
      { year: 1960, era: '1960s', type: 'renovation', title: '与荣宝斋齐名', description: '南北书画名店齐名，招牌重新装饰。', changes: { condition: 'well-preserved' } },
      { year: 1978, era: '1970s', type: 'restoration', title: '改革开放恢复', description: '文房四宝业复苏，招牌按原式样全面复原。', changes: { condition: 'restored' } },
      { year: 2010, era: '2010s', type: 'restoration', title: '上海世博会焕新', description: '世博会期间，百年老店全面升级，招牌专业修缮。', changes: { condition: 'restored' } }
    ]
  },
  {
    id: '9',
    name: '内联升',
    shopName: '内联升鞋店',
    era: '清代',
    year: 1853,
    location: '北京西城区大栅栏',
    fontStyle: '楷书',
    fontFamily: 'Kai Shu',
    colors: ['#8B0000', '#FFD700', '#000000'],
    description: '创建于清咸丰三年的百年布鞋老字号，招牌楷书工整大气，黑底金字是京城老字号的标配。这块牌匾本身就是国家级文物。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=qing%20dynasty%20chinese%20shoe%20store%20signboard%20black%20gold%20beijing%20traditional%20imperial%20style&image_size=square',
    tags: ['鞋店', '清代', '楷书', '老字号'],
    condition: 'well-preserved',
    buildingType: '四合院',
    restorationHistory: [
      { year: 1853, era: '清代', type: 'creation', title: '咸丰三年创立', description: '赵廷创办内联升，专为官员制作朝靴，请翰林题写楷书招牌。', changes: { colors: ['#8B0000', '#FFD700', '#000000'], condition: 'well-preserved' } },
      { year: 1900, era: '清末', type: 'damaged', title: '庚子之变受损', description: '大栅栏遭火焚，招牌部分受损。', changes: { condition: 'damaged' } },
      { year: 1901, era: '清末', type: 'restoration', title: '光绪二十七年修复', description: '战乱后迅速修复招牌，更换受损金箔。', changes: { condition: 'restored' } },
      { year: 1956, era: '1950s', type: 'renovation', title: '公私合营', description: '合营后招牌保留，基本原样。', changes: { condition: 'well-preserved' } },
      { year: 2003, era: '2000s', type: 'restoration', title: '150周年大庆', description: '创建150周年，列入国家级文物保护，专业大修。', changes: { condition: 'well-preserved' } },
      { year: 2023, era: '2020s', type: 'renovation', title: '170周年维护', description: '创建170周年，招牌做防虫、防潮处理。', changes: { condition: 'well-preserved' } }
    ]
  },
  {
    id: '10',
    name: '太平馆',
    shopName: '太平馆西餐厅',
    era: '1920s',
    year: 1927,
    location: '广州越秀区北京路',
    fontStyle: '艺术字',
    fontFamily: 'Art Deco Chinese',
    colors: ['#191970', '#FFD700', '#FFC0CB'],
    description: '广州最早的西餐厅之一，招牌融合了中西元素，艺术字带有Art Deco风格。深蓝底金字配粉色点缀，是民国时期中西合璧审美的典范。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=1920s%20chinese%20western%20restaurant%20signboard%20art%20deco%20style%20navy%20blue%20gold%20pink%20accents&image_size=square',
    tags: ['西餐厅', '民国', '艺术字', '中西合璧'],
    condition: 'weathered',
    buildingType: '骑楼',
    restorationHistory: [
      { year: 1927, era: '1920s', type: 'creation', title: '西餐先驱', description: '广州最早的西餐厅之一，招牌采用中西合璧的Art Deco艺术字。', changes: { colors: ['#191970', '#FFD700', '#FFC0CB'], condition: 'well-preserved' } },
      { year: 1938, era: '1930s', type: 'damaged', title: '日军占领期关闭', description: '广州沦陷，店铺关闭，招牌被封存。', changes: { condition: 'damaged' } },
      { year: 1946, era: '1940s', type: 'restoration', title: '战后复业', description: '抗战胜利复业，招牌重新安装。', changes: { condition: 'restored' } },
      { year: 1968, era: '1960s', type: 'damaged', title: '文革破坏', description: '被视为"资本主义"象征，招牌遭到破坏。', changes: { condition: 'damaged' } },
      { year: 1983, era: '1980s', type: 'restoration', title: '改革开放恢复', description: '恢复西餐厅经营，按老照片复原招牌。', changes: { condition: 'restored' } },
      { year: 2008, era: '2000s', type: 'weathered', title: '北京路骑楼保护', description: '自然风化，部分漆皮剥落，被保留作为岁月见证。', changes: { condition: 'weathered' } }
    ]
  },
  {
    id: '11',
    name: '张小泉',
    shopName: '张小泉剪刀店',
    era: '清代',
    year: 1663,
    location: '杭州上城区河坊街',
    fontStyle: '隶书',
    fontFamily: 'Li Shu',
    colors: ['#2F4F4F', '#FFD700', '#FF4500'],
    description: '中华老字号，始创于清康熙二年。招牌隶书苍劲有力，深灰底配金色字，红色点缀，是传统手工艺店铺的代表设计。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20scissors%20craft%20shop%20signboard%20dark%20gray%20gold%20red%20li%20shu%20calligraphy&image_size=square',
    tags: ['五金', '清代', '隶书', '老字号'],
    condition: 'restored',
    buildingType: '江南民居',
    restorationHistory: [
      { year: 1663, era: '清代', type: 'creation', title: '康熙二年始创', description: '张小泉在杭州大井巷开设剪刀铺，请当地文人题写隶书招牌。', changes: { colors: ['#2F4F4F', '#FFD700', '#FF4500'], condition: 'well-preserved' } },
      { year: 1759, era: '清代', type: 'renovation', title: '乾隆御赐之后', description: '剪刀被列为贡品，招牌加大，装饰双龙戏珠图案。', changes: { condition: 'well-preserved' } },
      { year: 1861, era: '清末', type: 'damaged', title: '太平天国战乱', description: '太平军攻入杭州，店铺受损，招牌部分被毁。', changes: { condition: 'damaged' } },
      { year: 1864, era: '清末', type: 'restoration', title: '战乱后重修', description: '按原式样重制招牌。', changes: { condition: 'restored' } },
      { year: 1956, era: '1950s', type: 'renovation', title: '公私合营', description: '合营后招牌保留，增设注册商标图案。', changes: { condition: 'well-preserved' } },
      { year: 1997, era: '1990s', type: 'restoration', title: '河坊街改造', description: '河坊街历史街区修复，招牌按清代样式全面复原。', changes: { condition: 'restored' } },
      { year: 2023, era: '2020s', type: 'renovation', title: '360周年庆典', description: '创立360周年，招牌金箔重贴，木材专业保养。', changes: { condition: 'restored' } }
    ]
  },
  {
    id: '12',
    name: '莲香楼',
    shopName: '莲香楼饼家',
    era: '1910s',
    year: 1915,
    location: '广州荔湾区第十甫路',
    fontStyle: '楷书',
    fontFamily: 'Kai Shu',
    colors: ['#FF4500', '#FFFACD', '#8B4513'],
    description: '百年广式月饼老字号，招牌楷书饱满圆润，橙红底配金黄色字，是广式饼家的经典配色。至今仍是广州人中秋送礼的首选。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=1910s%20cantonese%20bakery%20mooncake%20shop%20signboard%20orange%20red%20gold%20yellow%20traditional%20chinese&image_size=square',
    tags: ['饼家', '民国', '楷书', '广式'],
    condition: 'well-preserved',
    buildingType: '骑楼',
    restorationHistory: [
      { year: 1915, era: '1910s', type: 'creation', title: '民初糕酥名师创业', description: '创办人陈维清在第十甫路开店，橙红底金字招牌醒目讨喜。', changes: { colors: ['#FF4500', '#FFFACD', '#8B4513'], condition: 'well-preserved' } },
      { year: 1938, era: '1930s', type: 'damaged', title: '日占时期受损', description: '广州沦陷期间店铺受损，招牌拆下保存。', changes: { condition: 'damaged' } },
      { year: 1945, era: '1940s', type: 'restoration', title: '光复后复业', description: '抗战胜利复业，招牌重新上漆。', changes: { condition: 'restored' } },
      { year: 1974, era: '1970s', type: 'renovation', title: '月饼外销时期', description: '月饼开始出口港澳及东南亚，招牌加装霓虹灯。', changes: { condition: 'well-preserved' } },
      { year: 1995, era: '1990s', type: 'restoration', title: '上下九步行街改造', description: '步行街改造，招牌按原式样复原，霓虹灯改为LED。', changes: { condition: 'well-preserved' } },
      { year: 2015, era: '2010s', type: 'renovation', title: '百年华诞', description: '开业百年，招牌清洁保养，加装暖色调照明。', changes: { condition: 'well-preserved' } }
    ]
  }
];

export const eras = ['全部', '清代', '清末', '民国', '1910s', '1920s', '1930s', '1940s', '1950s'];
export const fontStyles = ['全部', '楷书', '行书', '隶书', '魏碑', '篆书', '宋体', '艺术字'];
export const conditions = [
  { value: '全部', label: '全部状态' },
  { value: 'well-preserved', label: '保存完好' },
  { value: 'weathered', label: '自然风化' },
  { value: 'damaged', label: '有所损坏' },
  { value: 'restored', label: '经过修复' }
];
export const allTags = ['茶庄', '布行', '菜馆', '照相馆', '药铺', '食品店', '茶楼', '书画', '鞋店', '西餐厅', '五金', '饼家', '老字号', '文房', '港式', '广式', '中西合璧', '民国', '清代', '江南民居'];
