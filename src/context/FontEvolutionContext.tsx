import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { FontFamily, FontEvolutionFilters, FontEvolutionContextType, Signboard } from '../types';
import { fontFamilies } from '../data/fontFamilies';
import { useSignboards } from './SignboardsContext';

const FontEvolutionContext = createContext<FontEvolutionContextType | undefined>(undefined);

export const FontEvolutionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { signboards, getSignboard } = useSignboards();

  const getFontFamily = (id: string): FontFamily | undefined => {
    return fontFamilies.find(f => f.id === id);
  };

  const getFontFamilyByStyle = (style: string): FontFamily | undefined => {
    return fontFamilies.find(f => f.style === style);
  };

  const getSignboardsForFontFamily = (fontFamilyId: string): Signboard[] => {
    const fontFamily = getFontFamily(fontFamilyId);
    if (!fontFamily) return [];
    return fontFamily.signboardIds
      .map(id => getSignboard(id))
      .filter((s): s is Signboard => s !== undefined);
  };

  const getEraVariantsForFontFamily = (fontFamilyId: string) => {
    const fontFamily = getFontFamily(fontFamilyId);
    return fontFamily?.eraVariants || [];
  };

  const getAllFontStyles = (): string[] => {
    return [...new Set(fontFamilies.map(f => f.style))];
  };

  const getAllFontDifficulties = (): string[] => {
    return ['basic', 'intermediate', 'advanced'];
  };

  const filterFontFamilies = (filters: FontEvolutionFilters): FontFamily[] => {
    let result = [...fontFamilies];

    if (filters.style && filters.style !== '全部') {
      result = result.filter(f => f.style === filters.style);
    }

    if (filters.era && filters.era !== '全部') {
      result = result.filter(f => 
        f.eraVariants.some(v => v.era.includes(filters.era) || filters.era.includes(v.era))
      );
    }

    if (filters.difficulty && filters.difficulty !== '全部') {
      result = result.filter(f => f.difficulty === filters.difficulty);
    }

    return result;
  };

  const sortFontFamilies = (families: FontFamily[], sortBy: string): FontFamily[] => {
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
  };

  const value = useMemo(() => ({
    fontFamilies,
    getFontFamily,
    getFontFamilyByStyle,
    getSignboardsForFontFamily,
    getEraVariantsForFontFamily,
    getAllFontStyles,
    getAllFontDifficulties,
    filterFontFamilies,
    sortFontFamilies
  }), [signboards]);

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
