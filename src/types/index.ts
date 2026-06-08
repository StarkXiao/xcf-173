export interface RestorationEvent {
  year: number;
  era: string;
  type: 'creation' | 'renovation' | 'restoration' | 'repaint' | 'relocation' | 'damaged' | 'weathered';
  title: string;
  description: string;
  changes?: {
    colors?: string[];
    fontStyle?: string;
    material?: string;
    condition?: Signboard['condition'];
  };
}

export interface EraStage {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  description: string;
  color: string;
}

export interface Signboard {
  id: string;
  name: string;
  shopName: string;
  era: string;
  year: number;
  location: string;
  fontStyle: string;
  fontFamily: string;
  colors: string[];
  description: string;
  image: string;
  tags: string[];
  condition: 'well-preserved' | 'weathered' | 'damaged' | 'restored';
  buildingType: string;
  restorationHistory: RestorationEvent[];
}

export interface Filters {
  era: string;
  fontStyle: string;
  tag: string;
  condition: string;
  eraStage: string;
  hasRestoration: string;
}

export type ThemeMode = 'light' | 'dark' | 'sepia';

export const eraStages: EraStage[] = [
  {
    id: 'qing-early',
    label: '清代早期',
    startYear: 1644,
    endYear: 1800,
    description: '康乾盛世，传统招牌形制确立',
    color: '#8B4513'
  },
  {
    id: 'qing-late',
    label: '清代晚期',
    startYear: 1801,
    endYear: 1911,
    description: '清末民初，西风东渐萌芽',
    color: '#A0522D'
  },
  {
    id: 'republic-early',
    label: '民国早期',
    startYear: 1912,
    endYear: 1930,
    description: '新文化运动，中西合璧风格',
    color: '#CD853F'
  },
  {
    id: 'republic-mid',
    label: '民国中期',
    startYear: 1931,
    endYear: 1945,
    description: 'Art Deco与民族品牌崛起',
    color: '#DAA520'
  },
  {
    id: 'republic-late',
    label: '民国晚期',
    startYear: 1946,
    endYear: 1949,
    description: '战后恢复，港式风格兴起',
    color: '#B8860B'
  },
  {
    id: 'prc-early',
    label: '建国初期',
    startYear: 1950,
    endYear: 1978,
    description: '新中国成立，规范化设计',
    color: '#8B7355'
  },
  {
    id: 'reform-era',
    label: '改革开放',
    startYear: 1979,
    endYear: 1999,
    description: '老字号复兴，传统与现代交融',
    color: '#6B8E23'
  },
  {
    id: 'modern-era',
    label: '现代时期',
    startYear: 2000,
    endYear: 2030,
    description: '数字化时代，非遗保护与焕新',
    color: '#4682B4'
  }
];

export const getEraStageByYear = (year: number): EraStage | undefined => {
  return eraStages.find(stage => year >= stage.startYear && year <= stage.endYear);
};

export const getSignboardEraStages = (signboard: Signboard): EraStage[] => {
  const stages = new Map<string, EraStage>();
  signboard.restorationHistory.forEach(event => {
    const stage = getEraStageByYear(event.year);
    if (stage) stages.set(stage.id, stage);
  });
  return Array.from(stages.values());
};

export const hasEventInEraStage = (signboard: Signboard, stageId: string): boolean => {
  const stage = eraStages.find(s => s.id === stageId);
  if (!stage) return false;
  return signboard.restorationHistory.some(
    event => event.year >= stage.startYear && event.year <= stage.endYear
  );
};

export const getEventsInEraStage = (signboard: Signboard, stageId: string): RestorationEvent[] => {
  const stage = eraStages.find(s => s.id === stageId);
  if (!stage) return [];
  return signboard.restorationHistory.filter(
    event => event.year >= stage.startYear && event.year <= stage.endYear
  );
};

export interface CollectionItem {
  signboardId: string;
  note?: string;
  addedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverSignboardId?: string;
  items: CollectionItem[];
  createdAt: number;
  updatedAt: number;
}

export interface CollectionsContextType {
  collections: Collection[];
  createCollection: (name: string, description?: string) => Collection;
  updateCollection: (id: string, updates: Partial<Omit<Collection, 'id' | 'createdAt'>>) => void;
  deleteCollection: (id: string) => void;
  addToCollection: (collectionId: string, signboardId: string, note?: string) => void;
  removeFromCollection: (collectionId: string, signboardId: string) => void;
  updateItemNote: (collectionId: string, signboardId: string, note: string) => void;
  reorderItems: (collectionId: string, signboardIds: string[]) => void;
  setCollectionCover: (collectionId: string, signboardId: string | undefined) => void;
  getCollectionsContainingSignboard: (signboardId: string) => Collection[];
  isSignboardInCollection: (collectionId: string, signboardId: string) => boolean;
}
