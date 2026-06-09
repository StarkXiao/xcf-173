import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Signboard } from '../types';

interface FavoritesContextType {
  favorites: string[];
  compareList: string[];
  maxCompare: number;
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  addToCompare: (id: string) => { success: boolean; reason?: string; alreadyIn: boolean };
  clearCompare: () => void;
  isFavorite: (id: string) => boolean;
  isInCompare: (id: string) => boolean;
  getFavoriteSignboards: (all: Signboard[]) => Signboard[];
  getCompareSignboards: (all: Signboard[]) => Signboard[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const MAX_COMPARE = 4;

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('signboard-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    const saved = localStorage.getItem('signboard-compare');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('signboard-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('signboard-compare', JSON.stringify(compareList));
  }, [compareList]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
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

  const isFavorite = (id: string) => favorites.includes(id);
  const isInCompare = (id: string) => compareList.includes(id);

  const getFavoriteSignboards = (all: Signboard[]) =>
    all.filter(s => favorites.includes(s.id));

  const getCompareSignboards = (all: Signboard[]) =>
    all.filter(s => compareList.includes(s.id));

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        compareList,
        maxCompare: MAX_COMPARE,
        toggleFavorite,
        toggleCompare,
        addToCompare,
        clearCompare,
        isFavorite,
        isInCompare,
        getFavoriteSignboards,
        getCompareSignboards
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
