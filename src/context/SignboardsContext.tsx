import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Signboard, SignboardsContextType, ColorPreset } from '../types';
import { signboards as defaultSignboards } from '../data/signboards';

const SignboardsContext = createContext<SignboardsContextType | undefined>(undefined);

const generateId = () => `sb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateColorId = () => `clr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

const STORAGE_KEY = 'signboard-data';
const METADATA_KEY = 'signboard-metadata';

const defaultTags = ['茶庄', '布行', '菜馆', '照相馆', '药铺', '食品店', '茶楼', '书画', '鞋店', '西餐厅', '五金', '饼家', '老字号', '文房', '港式', '广式', '中西合璧', '民国', '清代', '江南民居'];
const defaultEras = ['清代', '清末', '民国', '1910s', '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
const defaultFontStyles = ['楷书', '行书', '隶书', '魏碑', '篆书', '宋体', '艺术字', '草书', '黑体'];

const defaultColorPresets: ColorPreset[] = [
  { id: 'clr-01', color: '#8B4513', name: '深木棕' },
  { id: 'clr-02', color: '#A0522D', name: '赭石' },
  { id: 'clr-03', color: '#CD853F', name: '秘鲁色' },
  { id: 'clr-04', color: '#DAA520', name: '金菊黄' },
  { id: 'clr-05', color: '#B8860B', name: '暗金' },
  { id: 'clr-06', color: '#8B7355', name: '灰褐色' },
  { id: 'clr-07', color: '#6B8E23', name: '橄榄绿' },
  { id: 'clr-08', color: '#4682B4', name: '钢蓝' },
  { id: 'clr-09', color: '#1E3A8A', name: '海军蓝' },
  { id: 'clr-10', color: '#DC143C', name: '猩红' },
  { id: 'clr-11', color: '#8B0000', name: '暗红' },
  { id: 'clr-12', color: '#FFD700', name: '金色' },
  { id: 'clr-13', color: '#000000', name: '纯黑' },
  { id: 'clr-14', color: '#2F4F4F', name: '暗灰绿' },
  { id: 'clr-15', color: '#F5F5DC', name: '米色' },
  { id: 'clr-16', color: '#FF6347', name: '番茄红' },
  { id: 'clr-17', color: '#FFFFF0', name: '象牙白' },
  { id: 'clr-18', color: '#228B22', name: '森林绿' },
  { id: 'clr-19', color: '#556B2F', name: '暗橄榄绿' },
  { id: 'clr-20', color: '#FFF8DC', name: '玉米黄' },
  { id: 'clr-21', color: '#4A4A4A', name: '深灰' },
  { id: 'clr-22', color: '#FAEBD7', name: '古董白' },
  { id: 'clr-23', color: '#800080', name: '紫色' },
  { id: 'clr-24', color: '#FF4500', name: '橙红' },
  { id: 'clr-25', color: '#191970', name: '午夜蓝' },
  { id: 'clr-26', color: '#FFC0CB', name: '粉红' },
  { id: 'clr-27', color: '#FF6B6B', name: '珊瑚红' },
  { id: 'clr-28', color: '#FFE4B5', name: '浅桃色' },
  { id: 'clr-29', color: '#E8D5B7', name: '淡褐' },
  { id: 'clr-30', color: '#2C3E50', name: '深青灰' }
];

interface MetadataState {
  tags: string[];
  eras: string[];
  fontStyles: string[];
  colorPresets: ColorPreset[];
}

const defaultMetadata: MetadataState = {
  tags: defaultTags,
  eras: defaultEras,
  fontStyles: defaultFontStyles,
  colorPresets: defaultColorPresets
};

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

  const [metadata, setMetadata] = useState<MetadataState>(() => {
    const saved = localStorage.getItem(METADATA_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          tags: parsed.tags || defaultTags,
          eras: parsed.eras || defaultEras,
          fontStyles: parsed.fontStyles || defaultFontStyles,
          colorPresets: parsed.colorPresets || defaultColorPresets
        };
      } catch {
        return defaultMetadata;
      }
    }
    return defaultMetadata;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signboards));
  }, [signboards]);

  useEffect(() => {
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  }, [metadata]);

  const addSignboard = useCallback((data: Omit<Signboard, 'id'>): Signboard => {
    const newSignboard: Signboard = {
      ...data,
      id: generateId()
    };
    setSignboards(prev => [...prev, newSignboard]);

    setMetadata(prev => {
      let updated = false;
      const newTags = [...prev.tags];
      data.tags.forEach(tag => {
        if (!newTags.includes(tag)) {
          newTags.push(tag);
          updated = true;
        }
      });
      const newEras = prev.eras.includes(data.era) ? prev.eras : [...prev.eras, data.era];
      const newFontStyles = prev.fontStyles.includes(data.fontStyle) ? prev.fontStyles : [...prev.fontStyles, data.fontStyle];
      if (updated || newEras.length !== prev.eras.length || newFontStyles.length !== prev.fontStyles.length) {
        return { ...prev, tags: newTags.sort(), eras: newEras, fontStyles: newFontStyles.sort() };
      }
      return prev;
    });

    return newSignboard;
  }, []);

  const updateSignboard = useCallback((id: string, updates: Partial<Omit<Signboard, 'id'>>) => {
    setSignboards(prev => prev.map(sb =>
      sb.id === id ? { ...sb, ...updates } : sb
    ));

    if (updates.tags || updates.era || updates.fontStyle) {
      setMetadata(prev => {
        let newTags = [...prev.tags];
        let newEras = [...prev.eras];
        let newFontStyles = [...prev.fontStyles];
        let changed = false;

        if (updates.tags) {
          updates.tags.forEach(tag => {
            if (!newTags.includes(tag)) {
              newTags.push(tag);
              changed = true;
            }
          });
          if (changed) newTags.sort();
        }
        if (updates.era && !newEras.includes(updates.era)) {
          newEras.push(updates.era);
          changed = true;
        }
        if (updates.fontStyle && !newFontStyles.includes(updates.fontStyle)) {
          newFontStyles.push(updates.fontStyle);
          changed = true;
        }

        return changed ? { ...prev, tags: newTags, eras: newEras, fontStyles: newFontStyles } : prev;
      });
    }
  }, []);

  const deleteSignboard = useCallback((id: string) => {
    setSignboards(prev => prev.filter(sb => sb.id !== id));
  }, []);

  const getSignboard = useCallback((id: string): Signboard | undefined => {
    return signboards.find(sb => sb.id === id);
  }, [signboards]);

  const getAllTags = useCallback((): string[] => {
    return [...metadata.tags].sort();
  }, [metadata.tags]);

  const getAllEras = useCallback((): string[] => {
    return [...metadata.eras].sort((a, b) => {
      const yearMatchA = a.match(/\d+/);
      const yearMatchB = b.match(/\d+/);
      if (yearMatchA && yearMatchB) {
        return parseInt(yearMatchA[0]) - parseInt(yearMatchB[0]);
      }
      return a.localeCompare(b, 'zh-CN');
    });
  }, [metadata.eras]);

  const getAllFontStyles = useCallback((): string[] => {
    return [...metadata.fontStyles].sort();
  }, [metadata.fontStyles]);

  const getAllColorPresets = useCallback((): ColorPreset[] => {
    return [...metadata.colorPresets];
  }, [metadata.colorPresets]);

  const addTag = useCallback((tag: string): boolean => {
    const trimmed = tag.trim();
    if (!trimmed) return false;
    if (metadata.tags.includes(trimmed)) return false;
    setMetadata(prev => ({
      ...prev,
      tags: [...prev.tags, trimmed].sort()
    }));
    return true;
  }, [metadata.tags]);

  const deleteTag = useCallback((tag: string, removeFromSignboards: boolean = false) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
    if (removeFromSignboards) {
      setSignboards(prev => prev.map(sb => ({
        ...sb,
        tags: sb.tags.filter(t => t !== tag)
      })));
    }
  }, []);

  const renameTag = useCallback((oldTag: string, newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed || oldTag === trimmed) return;
    if (metadata.tags.includes(trimmed)) return;
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.map(t => t === oldTag ? trimmed : t).sort()
    }));
    setSignboards(prev => prev.map(sb => ({
      ...sb,
      tags: sb.tags.map(t => t === oldTag ? trimmed : t)
    })));
  }, [metadata.tags]);

  const addEra = useCallback((era: string): boolean => {
    const trimmed = era.trim();
    if (!trimmed) return false;
    if (metadata.eras.includes(trimmed)) return false;
    setMetadata(prev => ({
      ...prev,
      eras: [...prev.eras, trimmed]
    }));
    return true;
  }, [metadata.eras]);

  const deleteEra = useCallback((era: string, replaceWith?: string) => {
    setMetadata(prev => ({
      ...prev,
      eras: prev.eras.filter(e => e !== era)
    }));
    if (replaceWith !== undefined) {
      setSignboards(prev => prev.map(sb =>
        sb.era === era ? { ...sb, era: replaceWith } : sb
      ));
    }
  }, []);

  const renameEra = useCallback((oldEra: string, newEra: string) => {
    const trimmed = newEra.trim();
    if (!trimmed || oldEra === trimmed) return;
    if (metadata.eras.includes(trimmed)) return;
    setMetadata(prev => ({
      ...prev,
      eras: prev.eras.map(e => e === oldEra ? trimmed : e)
    }));
    setSignboards(prev => prev.map(sb =>
      sb.era === oldEra ? { ...sb, era: trimmed } : sb
    ));
  }, [metadata.eras]);

  const addFontStyle = useCallback((fontStyle: string): boolean => {
    const trimmed = fontStyle.trim();
    if (!trimmed) return false;
    if (metadata.fontStyles.includes(trimmed)) return false;
    setMetadata(prev => ({
      ...prev,
      fontStyles: [...prev.fontStyles, trimmed].sort()
    }));
    return true;
  }, [metadata.fontStyles]);

  const deleteFontStyle = useCallback((fontStyle: string, replaceWith?: string) => {
    setMetadata(prev => ({
      ...prev,
      fontStyles: prev.fontStyles.filter(f => f !== fontStyle)
    }));
    if (replaceWith !== undefined) {
      setSignboards(prev => prev.map(sb =>
        sb.fontStyle === fontStyle ? { ...sb, fontStyle: replaceWith } : sb
      ));
    }
  }, []);

  const renameFontStyle = useCallback((oldFont: string, newFont: string) => {
    const trimmed = newFont.trim();
    if (!trimmed || oldFont === trimmed) return;
    if (metadata.fontStyles.includes(trimmed)) return;
    setMetadata(prev => ({
      ...prev,
      fontStyles: prev.fontStyles.map(f => f === oldFont ? trimmed : f).sort()
    }));
    setSignboards(prev => prev.map(sb =>
      sb.fontStyle === oldFont ? { ...sb, fontStyle: trimmed } : sb
    ));
  }, [metadata.fontStyles]);

  const addColorPreset = useCallback((color: string, name: string): boolean => {
    const trimmedColor = color.trim().toUpperCase();
    const trimmedName = name.trim();
    if (!trimmedColor || !trimmedName) return false;
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(trimmedColor)) return false;
    if (metadata.colorPresets.some(cp => cp.color === trimmedColor)) return false;
    setMetadata(prev => ({
      ...prev,
      colorPresets: [...prev.colorPresets, {
        id: generateColorId(),
        color: trimmedColor,
        name: trimmedName
      }]
    }));
    return true;
  }, [metadata.colorPresets]);

  const deleteColorPreset = useCallback((id: string) => {
    setMetadata(prev => ({
      ...prev,
      colorPresets: prev.colorPresets.filter(cp => cp.id !== id)
    }));
  }, []);

  const updateColorPreset = useCallback((id: string, updates: Partial<ColorPreset>) => {
    setMetadata(prev => ({
      ...prev,
      colorPresets: prev.colorPresets.map(cp =>
        cp.id === id ? { ...cp, ...updates } : cp
      )
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(METADATA_KEY);
    setSignboards(defaultSignboards);
    setMetadata(defaultMetadata);
  }, []);

  const value = useMemo<SignboardsContextType>(() => ({
    signboards,
    tags: metadata.tags,
    eras: metadata.eras,
    fontStyles: metadata.fontStyles,
    colorPresets: metadata.colorPresets,
    addSignboard,
    updateSignboard,
    deleteSignboard,
    getSignboard,
    getAllTags,
    getAllEras,
    getAllFontStyles,
    getAllColorPresets,
    addTag,
    deleteTag,
    renameTag,
    addEra,
    deleteEra,
    renameEra,
    addFontStyle,
    deleteFontStyle,
    renameFontStyle,
    addColorPreset,
    deleteColorPreset,
    updateColorPreset,
    resetToDefault
  }), [
    signboards,
    metadata.tags,
    metadata.eras,
    metadata.fontStyles,
    metadata.colorPresets,
    addSignboard,
    updateSignboard,
    deleteSignboard,
    getSignboard,
    getAllTags,
    getAllEras,
    getAllFontStyles,
    getAllColorPresets,
    addTag,
    deleteTag,
    renameTag,
    addEra,
    deleteEra,
    renameEra,
    addFontStyle,
    deleteFontStyle,
    renameFontStyle,
    addColorPreset,
    deleteColorPreset,
    updateColorPreset,
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
