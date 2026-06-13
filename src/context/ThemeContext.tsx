import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ThemeMode, ThemePalette, EraMood, Signboard } from '../types';
import { getEraStageByYear } from '../types';

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const adjustLuminance = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex);
  if (amount >= 0) {
    return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
  }
  return rgbToHex(r * (1 + amount), g * (1 + amount), b * (1 + amount));
};

const getLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const [R, G, B] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const mixColors = (hex1: string, hex2: string, ratio: number): string => {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return rgbToHex(
    c1.r * (1 - ratio) + c2.r * ratio,
    c1.g * (1 - ratio) + c2.g * ratio,
    c1.b * (1 - ratio) + c2.b * ratio
  );
};

const getEraMood = (year: number): EraMood => {
  if (year <= 1800) return 'ancient';
  if (year <= 1911) return 'lateQing';
  if (year <= 1949) return 'republic';
  if (year <= 1978) return 'prc';
  if (year <= 1999) return 'reform';
  return 'modern';
};

const eraTintColors: Record<EraMood, string> = {
  ancient: '#8B4513',
  lateQing: '#A0522D',
  republic: '#CD853F',
  prc: '#8B7355',
  reform: '#6B8E23',
  modern: '#4682B4'
};

const applyEraTint = (palette: ThemePalette, mood: EraMood, strength: number = 0.12): ThemePalette => {
  const tint = eraTintColors[mood];
  return {
    primaryColor: mixColors(palette.primaryColor, tint, strength),
    secondaryColor: mixColors(palette.secondaryColor, tint, strength),
    accentColor: mixColors(palette.accentColor, tint, strength * 1.5),
    bgPrimary: mixColors(palette.bgPrimary, tint, strength * 0.5),
    bgSecondary: mixColors(palette.bgSecondary, tint, strength * 0.6),
    bgCard: mixColors(palette.bgCard, tint, strength * 0.4),
    textPrimary: palette.textPrimary,
    textSecondary: palette.textSecondary,
    textMuted: palette.textMuted,
    borderColor: mixColors(palette.borderColor, tint, strength * 0.8)
  };
};

const generatePaletteFromColor = (primaryHex: string, mode: ThemeMode): ThemePalette => {
  const luminance = getLuminance(primaryHex);
  const isDark = luminance < 0.4;

  let primaryColor = primaryHex;
  let secondaryColor: string;
  let accentColor: string;
  let textPrimary: string;
  let textSecondary: string;
  let textMuted: string;
  let bgPrimary: string;
  let bgSecondary: string;
  let bgCard: string;
  let borderColor: string;

  if (mode === 'dark') {
    secondaryColor = adjustLuminance(primaryColor, 0.25);
    accentColor = adjustLuminance(primaryColor, -0.15);
    bgPrimary = '#14100C';
    bgSecondary = '#1F1812';
    bgCard = '#2A2018';
    textPrimary = '#F0E6D8';
    textSecondary = '#B8A998';
    textMuted = '#7A6B5A';
    borderColor = '#3D3026';
    if (isDark) primaryColor = adjustLuminance(primaryHex, 0.2);
  } else if (mode === 'sepia') {
    secondaryColor = adjustLuminance(primaryColor, 0.15);
    accentColor = adjustLuminance(primaryColor, -0.1);
    bgPrimary = '#F5E6C8';
    bgSecondary = '#E8D5B7';
    bgCard = '#FBF2DF';
    textPrimary = '#3E2723';
    textSecondary = '#5D4037';
    textMuted = '#8D6E63';
    borderColor = '#C9B896';
  } else {
    secondaryColor = adjustLuminance(primaryColor, 0.3);
    accentColor = adjustLuminance(primaryColor, -0.1);
    bgPrimary = '#FDF8F0';
    bgSecondary = '#F5EDE0';
    bgCard = '#FFFFFF';
    textPrimary = '#2C2416';
    textSecondary = '#5C4A3A';
    textMuted = '#8B7355';
    borderColor = '#D4C4B0';
  }

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    textPrimary,
    textSecondary,
    textMuted,
    bgPrimary,
    bgSecondary,
    bgCard,
    borderColor
  };
};

const applyPaletteToRoot = (palette: ThemePalette) => {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', palette.primaryColor);
  root.style.setProperty('--secondary-color', palette.secondaryColor);
  root.style.setProperty('--accent-color', palette.accentColor);
  root.style.setProperty('--text-primary', palette.textPrimary);
  root.style.setProperty('--text-secondary', palette.textSecondary);
  root.style.setProperty('--text-muted', palette.textMuted);
  root.style.setProperty('--bg-primary', palette.bgPrimary);
  root.style.setProperty('--bg-secondary', palette.bgSecondary);
  root.style.setProperty('--bg-card', palette.bgCard);
  root.style.setProperty('--border-color', palette.borderColor);
  root.style.setProperty('--shadow', `0 2px 8px ${palette.primaryColor}1A`);
  root.style.setProperty('--shadow-hover', `0 4px 16px ${palette.primaryColor}33`);
};

const clearPaletteFromRoot = () => {
  const root = document.documentElement;
  [
    '--primary-color', '--secondary-color', '--accent-color',
    '--text-primary', '--text-secondary', '--text-muted',
    '--bg-primary', '--bg-secondary', '--bg-card', '--border-color',
    '--shadow', '--shadow-hover'
  ].forEach(prop => root.style.removeProperty(prop));
};

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  autoTheme: boolean;
  setAutoTheme: (enabled: boolean) => void;
  activeSignboardId: string | null;
  applyContentTheme: (signboard: Signboard) => void;
  resetContentTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('signboard-theme');
    return (saved as ThemeMode) || 'sepia';
  });

  const [autoTheme, setAutoThemeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('signboard-autotheme');
    return saved === null ? true : saved === 'true';
  });

  const [activeSignboardId, setActiveSignboardId] = useState<string | null>(null);

  const applyThemeAttribute = useCallback((t: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  useEffect(() => {
    localStorage.setItem('signboard-theme', theme);
    applyThemeAttribute(theme);
    if (!activeSignboardId) {
      clearPaletteFromRoot();
    }
  }, [theme, activeSignboardId, applyThemeAttribute]);

  useEffect(() => {
    localStorage.setItem('signboard-autotheme', String(autoTheme));
  }, [autoTheme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  const setAutoTheme = (enabled: boolean) => {
    setAutoThemeState(enabled);
  };

  const applyContentTheme = useCallback((signboard: Signboard) => {
    if (!autoTheme) return;
    const mainColor = signboard.colors[0] || '#8B4513';
    const mood = getEraMood(signboard.year);
    let palette = generatePaletteFromColor(mainColor, theme);
    palette = applyEraTint(palette, mood, 0.15);

    const eraStage = getEraStageByYear(signboard.year);
    if (eraStage) {
      palette.secondaryColor = mixColors(palette.secondaryColor, eraStage.color, 0.25);
      palette.accentColor = mixColors(palette.accentColor, eraStage.color, 0.35);
    }

    applyPaletteToRoot(palette);
    setActiveSignboardId(signboard.id);
  }, [autoTheme, theme]);

  const resetContentTheme = useCallback(() => {
    clearPaletteFromRoot();
    setActiveSignboardId(null);
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      autoTheme,
      setAutoTheme,
      activeSignboardId,
      applyContentTheme,
      resetContentTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
