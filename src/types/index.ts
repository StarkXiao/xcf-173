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

export interface OralArchive {
  signboardId: string;
  storySummary: string;
  sourceNote: string;
  recordedAt: number;
  updatedAt: number;
  informant?: string;
  recordingDate?: string;
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
  hasStatusTracking: string;
  userStatus: string;
}

export type ThemeMode = 'light' | 'dark' | 'sepia';

export interface ThemePalette {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  borderColor: string;
}

export type EraMood = 'ancient' | 'lateQing' | 'republic' | 'prc' | 'reform' | 'modern';

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

export interface OralArchivesContextType {
  archives: OralArchive[];
  saveArchive: (signboardId: string, data: Partial<Omit<OralArchive, 'signboardId' | 'recordedAt' | 'updatedAt'>>) => void;
  deleteArchive: (signboardId: string) => void;
  getArchive: (signboardId: string) => OralArchive | undefined;
  hasArchive: (signboardId: string) => boolean;
  getArchivesForSignboards: (signboardIds: string[]) => OralArchive[];
}

export type ConditionStatus = 'well-preserved' | 'weathered' | 'damaged' | 'restored';

export interface StatusRecord {
  id: string;
  signboardId: string;
  condition: ConditionStatus;
  date: string;
  note?: string;
  recordedAt: number;
  updatedAt: number;
}

export interface StatusTrackingContextType {
  records: StatusRecord[];
  addRecord: (signboardId: string, data: Omit<StatusRecord, 'id' | 'signboardId' | 'recordedAt' | 'updatedAt'>) => StatusRecord;
  updateRecord: (id: string, data: Partial<Omit<StatusRecord, 'id' | 'signboardId' | 'recordedAt'>>) => void;
  deleteRecord: (id: string) => void;
  getRecordsForSignboard: (signboardId: string) => StatusRecord[];
  getLatestStatus: (signboardId: string) => ConditionStatus | null;
  hasRecords: (signboardId: string) => boolean;
  getStatusStats: (signboardIds: string[]) => Record<ConditionStatus, number>;
}

export interface District {
  id: string;
  name: string;
  city: string;
  description: string;
  coverImage: string;
  signboardIds: string[];
  color: string;
  landmarks: string[];
}

export interface RouteStop {
  signboardId: string;
  order: number;
  note: string;
}

export interface Route {
  id: string;
  name: string;
  districtId: string;
  description: string;
  stops: RouteStop[];
  duration: string;
  distance: string;
  difficulty: 'easy' | 'moderate' | 'advanced';
  theme: string;
  coverImage: string;
}

export interface RelayItem {
  signboardId: string;
  collectedAt: number;
  note: string;
}

export type RoamingTheme = 'classic' | 'neon' | 'ink' | 'map';

export const roamingThemeConfig: Record<RoamingTheme, { label: string; icon: string; accentColor: string; bgTint: string }> = {
  classic: { label: '经典棕', icon: '📜', accentColor: '#8B4513', bgTint: '#F5E6C8' },
  neon: { label: '霓虹夜', icon: '🌃', accentColor: '#FF6B6B', bgTint: '#1A1A2E' },
  ink: { label: '水墨风', icon: '🖌️', accentColor: '#2C2C2C', bgTint: '#F0EDE8' },
  map: { label: '地图纸', icon: '🗺️', accentColor: '#6B8E23', bgTint: '#E8E0C8' }
};

export const conditionStatusLabels: Record<ConditionStatus, { text: string; className: string; icon: string; color: string }> = {
  'well-preserved': { text: '保存完好', className: 'status-good', icon: '✨', color: '#22c55e' },
  'weathered': { text: '自然风化', className: 'status-weathered', icon: '🍂', color: '#f59e0b' },
  'damaged': { text: '有所损坏', className: 'status-damaged', icon: '⚠️', color: '#ef4444' },
  'restored': { text: '经过修复', className: 'status-restored', icon: '🏛️', color: '#3b82f6' }
};

export interface ColorPreset {
  id: string;
  color: string;
  name: string;
}

export interface SignboardsContextType {
  signboards: Signboard[];
  tags: string[];
  eras: string[];
  fontStyles: string[];
  colorPresets: ColorPreset[];
  addSignboard: (data: Omit<Signboard, 'id'>) => Signboard;
  updateSignboard: (id: string, updates: Partial<Omit<Signboard, 'id'>>) => void;
  deleteSignboard: (id: string) => void;
  getSignboard: (id: string) => Signboard | undefined;
  getAllTags: () => string[];
  getAllEras: () => string[];
  getAllFontStyles: () => string[];
  getAllColorPresets: () => ColorPreset[];
  addTag: (tag: string) => boolean;
  deleteTag: (tag: string, removeFromSignboards?: boolean) => void;
  renameTag: (oldTag: string, newTag: string) => void;
  addEra: (era: string) => boolean;
  deleteEra: (era: string, replaceWith?: string) => void;
  renameEra: (oldEra: string, newEra: string) => void;
  addFontStyle: (fontStyle: string) => boolean;
  deleteFontStyle: (fontStyle: string, replaceWith?: string) => void;
  renameFontStyle: (oldFont: string, newFont: string) => void;
  addColorPreset: (color: string, name: string) => boolean;
  deleteColorPreset: (id: string) => void;
  updateColorPreset: (id: string, updates: Partial<ColorPreset>) => void;
  resetToDefault: () => void;
}

export interface FontStyleFeature {
  strokes: string;
  feeling: string;
  era: string;
  features: string[];
}

export interface FontEraVariant {
  era: string;
  yearRange: string;
  description: string;
  characteristics: string[];
  representativeWorks: string[];
}

export interface FontFamily {
  id: string;
  name: string;
  englishName: string;
  style: string;
  origin: string;
  originEra: string;
  description: string;
  features: FontStyleFeature;
  eraVariants: FontEraVariant[];
  signboardIds: string[];
  color: string;
  icon: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  readability: number;
  artisticValue: number;
  historicalSignificance: number;
}

export interface FontEvolutionFilters {
  style: string;
  era: string;
  difficulty: string;
  sortBy: string;
}

export interface FontEvolutionContextType {
  fontFamilies: FontFamily[];
  getFontFamily: (id: string) => FontFamily | undefined;
  getFontFamilyByStyle: (style: string) => FontFamily | undefined;
  getSignboardsForFontFamily: (fontFamilyId: string) => Signboard[];
  getEraVariantsForFontFamily: (fontFamilyId: string) => FontEraVariant[];
  getAllFontStyles: () => string[];
  getAllFontDifficulties: () => string[];
  filterFontFamilies: (filters: FontEvolutionFilters) => FontFamily[];
  sortFontFamilies: (families: FontFamily[], sortBy: string) => FontFamily[];
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'published';

export interface StoryInfo {
  title: string;
  content: string;
  author?: string;
  relationship?: string;
  year?: number;
  photos?: string[];
}

export interface SignboardSubmission {
  id: string;
  shopName: string;
  location: string;
  era: string;
  year?: number;
  description: string;
  fontStyle?: string;
  colors?: string[];
  buildingType?: string;
  photos: string[];
  contributorName: string;
  contactInfo?: string;
  stories: StoryInfo[];
  status: SubmissionStatus;
  submitTime: number;
  reviewTime?: number;
  reviewerNote?: string;
  signboardId?: string;
  tags?: string[];
}

export interface CityMemoryContextType {
  submissions: SignboardSubmission[];
  submitClue: (data: Omit<SignboardSubmission, 'id' | 'status' | 'submitTime' | 'stories'>) => SignboardSubmission;
  addStory: (submissionId: string, story: Omit<StoryInfo, 'id'>) => void;
  updateSubmission: (id: string, updates: Partial<SignboardSubmission>) => void;
  reviewSubmission: (id: string, status: 'approved' | 'rejected', note?: string) => void;
  publishToCollection: (submissionId: string, collectionId: string, note?: string) => Signboard | null;
  getSubmission: (id: string) => SignboardSubmission | undefined;
  getSubmissionsByStatus: (status: SubmissionStatus) => SignboardSubmission[];
  getSubmissionsByContributor: (name: string) => SignboardSubmission[];
  deleteSubmission: (id: string) => void;
}

export const submissionStatusLabels: Record<SubmissionStatus, { text: string; className: string; icon: string; color: string }> = {
  'pending': { text: '待审核', className: 'status-pending', icon: '⏳', color: '#f59e0b' },
  'approved': { text: '已通过', className: 'status-approved', icon: '✅', color: '#22c55e' },
  'rejected': { text: '已拒绝', className: 'status-rejected', icon: '❌', color: '#ef4444' },
  'published': { text: '已入册', className: 'status-published', icon: '📖', color: '#3b82f6' }
};
