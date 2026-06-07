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
}

export interface Filters {
  era: string;
  fontStyle: string;
  tag: string;
  condition: string;
}

export type ThemeMode = 'light' | 'dark' | 'sepia';
