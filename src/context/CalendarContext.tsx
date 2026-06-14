import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CalendarContextType, MonthlyTheme, DailySign } from '../types';
import { monthlyThemes } from '../data/calendar';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const formatNoteKey = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, '0')}`;

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());

  const [savedDailySigns, setSavedDailySigns] = useState<string[]>(() => {
    const saved = localStorage.getItem('signboard-calendar-saved');
    return saved ? JSON.parse(saved) : [];
  });

  const [monthlyNotes, setMonthlyNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('signboard-calendar-notes');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('signboard-calendar-saved', JSON.stringify(savedDailySigns));
  }, [savedDailySigns]);

  useEffect(() => {
    localStorage.setItem('signboard-calendar-notes', JSON.stringify(monthlyNotes));
  }, [monthlyNotes]);

  const getMonthlyTheme = useCallback((year: number, month: number): MonthlyTheme | undefined => {
    return monthlyThemes.find(t => t.year === year && t.month === month);
  }, []);

  const getDailySign = useCallback((date: string): DailySign | undefined => {
    for (const theme of monthlyThemes) {
      const sign = theme.dailySigns.find(s => s.date === date);
      if (sign) return sign;
    }
    return undefined;
  }, []);

  const getDailySignsForMonth = useCallback((year: number, month: number): DailySign[] => {
    const theme = getMonthlyTheme(year, month);
    return theme ? theme.dailySigns : [];
  }, [getMonthlyTheme]);

  const toggleSaveDailySign = useCallback((date: string) => {
    setSavedDailySigns(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  }, []);

  const isDailySignSaved = useCallback((date: string): boolean => {
    return savedDailySigns.includes(date);
  }, [savedDailySigns]);

  const getSavedDailySigns = useCallback((): DailySign[] => {
    const signs: DailySign[] = [];
    for (const date of savedDailySigns) {
      const sign = getDailySign(date);
      if (sign) signs.push(sign);
    }
    return signs.sort((a, b) => a.date.localeCompare(b.date));
  }, [savedDailySigns, getDailySign]);

  const saveMonthlyNote = useCallback((year: number, month: number, note: string) => {
    const key = formatNoteKey(year, month);
    setMonthlyNotes(prev => ({ ...prev, [key]: note }));
  }, []);

  const getMonthlyNote = useCallback((year: number, month: number): string => {
    const key = formatNoteKey(year, month);
    return monthlyNotes[key] || '';
  }, [monthlyNotes]);

  const value = useMemo<CalendarContextType>(() => ({
    monthlyThemes,
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    getMonthlyTheme,
    getDailySign,
    getDailySignsForMonth,
    savedDailySigns,
    toggleSaveDailySign,
    isDailySignSaved,
    getSavedDailySigns,
    monthlyNotes,
    saveMonthlyNote,
    getMonthlyNote
  }), [
    currentMonth,
    currentYear,
    getMonthlyTheme,
    getDailySign,
    getDailySignsForMonth,
    savedDailySigns,
    toggleSaveDailySign,
    isDailySignSaved,
    getSavedDailySigns,
    monthlyNotes,
    saveMonthlyNote,
    getMonthlyNote
  ]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) throw new Error('useCalendar must be used within CalendarProvider');
  return context;
};
