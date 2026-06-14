import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  StreetCorner,
  StyleCategory,
  RankingList,
  RankingCategory,
  RankingTimeRange,
  StreetCornerContextType
} from '../types';
import {
  streetCorners,
  styleCategories,
  rankingLists,
  getStreetCornerById,
  getStyleCategoryById,
  getRankingListById,
  getRankingsByCategory,
  getRankingsByTimeRange,
  getStreetCornersByCity,
  getAllCities
} from '../data/streetcorners';

const StreetCornerContext = createContext<StreetCornerContextType | undefined>(undefined);

export const StreetCornerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [streetCornersState] = useState<StreetCorner[]>(streetCorners);
  const [styleCategoriesState] = useState<StyleCategory[]>(styleCategories);
  const [rankingListsState] = useState<RankingList[]>(rankingLists);

  const [favoriteRankingLists, setFavoriteRankingLists] = useState<string[]>(() => {
    const saved = localStorage.getItem('streetcorner-fav-rankings');
    return saved ? JSON.parse(saved) : [];
  });

  const [favoriteStreetCorners, setFavoriteStreetCorners] = useState<string[]>(() => {
    const saved = localStorage.getItem('streetcorner-fav-corners');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('streetcorner-fav-rankings', JSON.stringify(favoriteRankingLists));
  }, [favoriteRankingLists]);

  useEffect(() => {
    localStorage.setItem('streetcorner-fav-corners', JSON.stringify(favoriteStreetCorners));
  }, [favoriteStreetCorners]);

  const toggleFavoriteRankingList = (id: string) => {
    setFavoriteRankingLists(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleFavoriteStreetCorner = (id: string) => {
    setFavoriteStreetCorners(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const isRankingListFavorite = (id: string) => favoriteRankingLists.includes(id);
  const isStreetCornerFavorite = (id: string) => favoriteStreetCorners.includes(id);

  const getStreetCorner = (id: string) => getStreetCornerById(id);
  const getStyleCategory = (id: string) => getStyleCategoryById(id);
  const getRankingList = (id: string) => getRankingListById(id);
  const getRankingsByCategoryFn = (category: RankingCategory) => getRankingsByCategory(category);
  const getRankingsByTimeRangeFn = (timeRange: RankingTimeRange) => getRankingsByTimeRange(timeRange);
  const getStreetCornersByCityFn = (city: string) => getStreetCornersByCity(city);
  const getAllCitiesFn = () => getAllCities();

  const getSignboardRankingInfo = (signboardId: string) => {
    const result: { list: RankingList; item: RankingList['items'][number] }[] = [];
    rankingListsState.forEach(list => {
      const item = list.items.find(i => i.signboardId === signboardId);
      if (item) {
        result.push({ list, item });
      }
    });
    return result;
  };

  return (
    <StreetCornerContext.Provider
      value={{
        streetCorners: streetCornersState,
        styleCategories: styleCategoriesState,
        rankingLists: rankingListsState,
        favoriteRankingLists,
        favoriteStreetCorners,
        toggleFavoriteRankingList,
        toggleFavoriteStreetCorner,
        isRankingListFavorite,
        isStreetCornerFavorite,
        getStreetCorner,
        getStyleCategory,
        getRankingList,
        getRankingsByCategory: getRankingsByCategoryFn,
        getRankingsByTimeRange: getRankingsByTimeRangeFn,
        getStreetCornersByCity: getStreetCornersByCityFn,
        getAllCities: getAllCitiesFn,
        getSignboardRankingInfo
      }}
    >
      {children}
    </StreetCornerContext.Provider>
  );
};

export const useStreetCorner = () => {
  const context = useContext(StreetCornerContext);
  if (!context) throw new Error('useStreetCorner must be used within StreetCornerProvider');
  return context;
};
