import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Signboard, SignboardsContextType } from '../types';
import { signboards as defaultSignboards } from '../data/signboards';

const SignboardsContext = createContext<SignboardsContextType | undefined>(undefined);

const generateId = () => `sb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const STORAGE_KEY = 'signboard-data';

export const SignboardsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [signboards, setSignboards] = useState<Signboard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultSignboards;
      }
    }
    return defaultSignboards;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signboards));
  }, [signboards]);

  const addSignboard = useCallback((data: Omit<Signboard, 'id'>): Signboard => {
    const newSignboard: Signboard = {
      ...data,
      id: generateId()
    };
    setSignboards(prev => [...prev, newSignboard]);
    return newSignboard;
  }, []);

  const updateSignboard = useCallback((id: string, updates: Partial<Omit<Signboard, 'id'>>) => {
    setSignboards(prev => prev.map(sb =>
      sb.id === id ? { ...sb, ...updates } : sb
    ));
  }, []);

  const deleteSignboard = useCallback((id: string) => {
    setSignboards(prev => prev.filter(sb => sb.id !== id));
  }, []);

  const getSignboard = useCallback((id: string): Signboard | undefined => {
    return signboards.find(sb => sb.id === id);
  }, [signboards]);

  const getAllTags = useCallback((): string[] => {
    const tagSet = new Set<string>();
    signboards.forEach(sb => {
      sb.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [signboards]);

  const getAllEras = useCallback((): string[] => {
    const eraSet = new Set<string>();
    signboards.forEach(sb => eraSet.add(sb.era));
    return Array.from(eraSet).sort((a, b) => {
      const yearMatchA = a.match(/\d+/);
      const yearMatchB = b.match(/\d+/);
      if (yearMatchA && yearMatchB) {
        return parseInt(yearMatchA[0]) - parseInt(yearMatchB[0]);
      }
      return a.localeCompare(b);
    });
  }, [signboards]);

  const getAllFontStyles = useCallback((): string[] => {
    const fontSet = new Set<string>();
    signboards.forEach(sb => fontSet.add(sb.fontStyle));
    return Array.from(fontSet).sort();
  }, [signboards]);

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (getAllTags().includes(trimmed)) return;
    setSignboards(prev => [...prev]);
  }, [getAllTags]);

  const addEra = useCallback((era: string) => {
    const trimmed = era.trim();
    if (!trimmed) return;
    if (getAllEras().includes(trimmed)) return;
    setSignboards(prev => [...prev]);
  }, [getAllEras]);

  const addFontStyle = useCallback((fontStyle: string) => {
    const trimmed = fontStyle.trim();
    if (!trimmed) return;
    if (getAllFontStyles().includes(trimmed)) return;
    setSignboards(prev => [...prev]);
  }, [getAllFontStyles]);

  const resetToDefault = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSignboards(defaultSignboards);
  }, []);

  const value = useMemo<SignboardsContextType>(() => ({
    signboards,
    addSignboard,
    updateSignboard,
    deleteSignboard,
    getSignboard,
    getAllTags,
    getAllEras,
    getAllFontStyles,
    addTag,
    addEra,
    addFontStyle,
    resetToDefault
  }), [
    signboards,
    addSignboard,
    updateSignboard,
    deleteSignboard,
    getSignboard,
    getAllTags,
    getAllEras,
    getAllFontStyles,
    addTag,
    addEra,
    addFontStyle,
    resetToDefault
  ]);

  return (
    <SignboardsContext.Provider value={value}>
      {children}
    </SignboardsContext.Provider>
  );
};

export const useSignboards = () => {
  const context = useContext(SignboardsContext);
  if (!context) throw new Error('useSignboards must be used within SignboardsProvider');
  return context;
};
