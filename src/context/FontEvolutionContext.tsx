import React, { createContext, useContext, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FontFamily, FontEvolutionFilters, FontEvolutionContextType, Signboard } from '../types';
import { fontFamilies } from '../data/fontFamilies';
import { useSignboards } from './SignboardsContext';
import { useFilterState } from '../hooks';

const FontEvolutionContext = createContext<FontEvolutionContextType | undefined>(undefined);

const defaultFontFilters: FontEvolutionFilters = {
  style: '全部',
  era: '全部',
  difficulty: '全部',
  sortBy: 'historicalSignificance'
};

export const FontEvolutionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getSignboard } = useSignboards();

  const {
    filter: filters,
    setFilter: setFilters,
    resetFilter: resetFilters
  } = useFilterState<FontEvolutionFilters>({
    defaultFilter: defaultFontFilters
  });

  const getFontFamily = useCallback(
    (id: string): FontFamily | undefined => {
      return fontFamilies.find(f => f.id === id);
    },
    []
  );

  const getFontFamilyByStyle = useCallback(
    (style: string): FontFamily | undefined => {
      return fontFamilies.find(f => f.style === style);
    },
    []
  );

  const getSignboardsForFontFamily = useCallback(
    (fontFamilyId: string): Signboard[] => {
      const fontFamily = getFontFamily(fontFamilyId);
      if (!fontFamily) return [];
      return fontFamily.signboardIds
        .map(id => getSignboard(id))
        .filter((s): s is Signboard => s !== undefined);
    },
    [getFontFamily, getSignboard]
  );

  const getEraVariantsForFontFamily = useCallback(
    (fontFamilyId: string) => {
      const fontFamily = getFontFamily(fontFamilyId);
      return fontFamily?.eraVariants || [];
    },
    [getFontFamily]
  );

  const getAllFontStyles = useCallback((): string[] => {
    return [...new Set(fontFamilies.map(f => f.style))];
  }, []);

  const getAllFontDifficulties = useCallback((): string[] => {
    return ['basic', 'intermediate', 'advanced'];
  }, []);

  const filterFontFamilies = useCallback(
    (filterOverrides?: Partial<FontEvolutionFilters>): FontFamily[] => {
      const activeFilters = filterOverrides || filters;
      let result = [...fontFamilies];

      if (activeFilters.style && activeFilters.style !== '全部') {
        result = result.filter(f => f.style === activeFilters.style);
      }

      if (activeFilters.era && activeFilters.era !== '全部') {
        result = result.filter(f =>
          f.eraVariants.some(
            v => v.era.includes(activeFilters.era!) || activeFilters.era!.includes(v.era)
          )
        );
      }

      if (activeFilters.difficulty && activeFilters.difficulty !== '全部') {
        result = result.filter(f => f.difficulty === activeFilters.difficulty);
      }

      return result;
    },
    [filters]
  );

  const sortFontFamilies = useCallback(
    (families: FontFamily[], sortBy: string): FontFamily[] => {
      const result = [...families];

      switch (sortBy) {
        case 'historicalSignificance':
          return result.sort((a, b) => b.historicalSignificance - a.historicalSignificance);
        case 'artisticValue':
          return result.sort((a, b) => b.artisticValue - a.artisticValue);
        case 'readability':
          return result.sort((a, b) => b.readability - a.readability);
        case 'signboardCount':
          return result.sort((a, b) => b.signboardIds.length - a.signboardIds.length);
        case 'name':
        default:
          return result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      }
    },
    []
  );

  const handleFilterChange = useCallback(
    (key: keyof FontEvolutionFilters, value: string) => {
      setFilters({ [key]: value } as Partial<FontEvolutionFilters>);
    },
    [setFilters]
  );

  const value = useMemo(
    () => ({
      fontFamilies,
      filters,
      setFilters,
      resetFilters,
      handleFilterChange,
      getFontFamily,
      getFontFamilyByStyle,
      getSignboardsForFontFamily,
      getEraVariantsForFontFamily,
      getAllFontStyles,
      getAllFontDifficulties,
      filterFontFamilies,
      sortFontFamilies
    }),
    [
      fontFamilies,
      filters,
      setFilters,
      resetFilters,
      handleFilterChange,
      getFontFamily,
      getFontFamilyByStyle,
      getSignboardsForFontFamily,
      getEraVariantsForFontFamily,
      getAllFontStyles,
      getAllFontDifficulties,
      filterFontFamilies,
      sortFontFamilies
    ]
  );

  return (
    <FontEvolutionContext.Provider value={value}>
      {children}
    </FontEvolutionContext.Provider>
  );
};

export const useFontEvolution = () => {
  const context = useContext(FontEvolutionContext);
  if (!context) throw new Error('useFontEvolution must be used within FontEvolutionProvider');
  return context;
};
