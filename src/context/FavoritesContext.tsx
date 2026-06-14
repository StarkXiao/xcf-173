import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Signboard, FontFamily } from '../types';
import { fontFamilies } from '../data/fontFamilies';

interface FavoritesContextType {
  favorites: string[];
  fontFamilyFavorites: string[];
  compareList: string[];
  reportList: string[];
  maxCompare: number;
  maxReport: number;
  toggleFavorite: (id: string) => void;
  toggleFontFamilyFavorite: (id: string) => void;
  isFontFamilyFavorite: (id: string) => boolean;
  getFavoriteFontFamilies: () => FontFamily[];
  toggleCompare: (id: string) => void;
  addToCompare: (id: string) => { success: boolean; reason?: string; alreadyIn: boolean };
  clearCompare: () => void;
  toggleReport: (id: string) => void;
  setReportList: (ids: string[]) => void;
  clearReport: () => void;
  isFavorite: (id: string) => boolean;
  isInCompare: (id: string) => boolean;
  isInReport: (id: string) => boolean;
  getFavoriteSignboards: (all: Signboard[]) => Signboard[];
  getCompareSignboards: (all: Signboard[]) => Signboard[];
  getReportSignboards: (all: Signboard[]) => Signboard[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const MAX_COMPARE = 4;
  const MAX_REPORT = 6;

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('signboard-favorites');
    const raw: string[] = saved ? JSON.parse(saved) : [];
    const fontFamilyIdSet = new Set(fontFamilies.map(f => f.id));
    return raw.filter(id => !fontFamilyIdSet.has(id));
  });

  const [fontFamilyFavorites, setFontFamilyFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('font-family-favorites');
    const fromFav: string[] = saved ? JSON.parse(saved) : [];
    const oldSaved = localStorage.getItem('signboard-favorites');
    const oldRaw: string[] = oldSaved ? JSON.parse(oldSaved) : [];
    const fontFamilyIdSet = new Set(fontFamilies.map(f => f.id));
    const migrated = oldRaw.filter(id => fontFamilyIdSet.has(id));
    const merged = [...new Set([...fromFav, ...migrated])];
    return merged;
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    const saved = localStorage.getItem('signboard-compare');
    return saved ? JSON.parse(saved) : [];
  });

  const [reportList, setReportList] = useState<string[]>(() => {
    const saved = localStorage.getItem('signboard-report');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('signboard-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('font-family-favorites', JSON.stringify(fontFamilyFavorites));
  }, [fontFamilyFavorites]);

  useEffect(() => {
    localStorage.setItem('signboard-compare', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('signboard-report', JSON.stringify(reportList));
  }, [reportList]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleFontFamilyFavorite = (id: string) => {
    setFontFamilyFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const isFontFamilyFavorite = (id: string) => fontFamilyFavorites.includes(id);

  const getFavoriteFontFamilies = (): FontFamily[] => {
    return fontFamilyFavorites
      .map(fid => fontFamilies.find(f => f.id === fid))
      .filter((f): f is FontFamily => f !== undefined);
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const addToCompare = (id: string): { success: boolean; reason?: string; alreadyIn: boolean } => {
    if (compareList.includes(id)) {
      return { success: false, alreadyIn: true, reason: '已在对比列表中' };
    }
    if (compareList.length >= MAX_COMPARE) {
      return { success: false, alreadyIn: false, reason: `对比列表已满（最多 ${MAX_COMPARE} 块）` };
    }
    setCompareList(prev => [...prev, id]);
    return { success: true, alreadyIn: false };
  };

  const clearCompare = () => setCompareList([]);

  const toggleReport = (id: string) => {
    setReportList(prev => {
      if (prev.includes(id)) {
        return prev.filter(r => r !== id);
      }
      if (prev.length >= MAX_REPORT) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const clearReport = () => setReportList([]);

  const isFavorite = (id: string) => favorites.includes(id);
  const isInCompare = (id: string) => compareList.includes(id);
  const isInReport = (id: string) => reportList.includes(id);

  const getFavoriteSignboards = (all: Signboard[]) =>
    all.filter(s => favorites.includes(s.id));

  const getCompareSignboards = (all: Signboard[]) =>
    all.filter(s => compareList.includes(s.id));

  const getReportSignboards = (all: Signboard[]) =>
    all.filter(s => reportList.includes(s.id));

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        fontFamilyFavorites,
        compareList,
        reportList,
        maxCompare: MAX_COMPARE,
        maxReport: MAX_REPORT,
        toggleFavorite,
        toggleFontFamilyFavorite,
        isFontFamilyFavorite,
        getFavoriteFontFamilies,
        toggleCompare,
        addToCompare,
        clearCompare,
        toggleReport,
        setReportList,
        clearReport,
        isFavorite,
        isInCompare,
        isInReport,
        getFavoriteSignboards,
        getCompareSignboards,
        getReportSignboards
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
