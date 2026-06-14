import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  ResearchNote,
  ColorComparisonGroup,
  EraAnalysisSnapshot,
  SampleFilterCriteria,
  ResearchLabContextType,
  Signboard,
  ConditionStatus
} from '../types';

const ResearchLabContext = createContext<ResearchLabContextType | undefined>(undefined);

const generateNoteId = () => `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateGroupId = () => `cg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
const generateSnapshotId = () => `snap-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

const NOTES_KEY = 'research-lab-notes';
const COLOR_GROUPS_KEY = 'research-lab-color-groups';
const ERA_SNAPSHOTS_KEY = 'research-lab-era-snapshots';
const FILTER_KEY = 'research-lab-filter';

const defaultFilter: SampleFilterCriteria = {
  yearRange: null,
  eras: [],
  fontStyles: [],
  conditions: [],
  colors: [],
  tags: [],
  locations: [],
  hasRestoration: null,
  buildingTypes: []
};

export const ResearchLabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<ResearchNote[]>(() => {
    const saved = localStorage.getItem(NOTES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [colorGroups, setColorGroups] = useState<ColorComparisonGroup[]>(() => {
    const saved = localStorage.getItem(COLOR_GROUPS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [eraSnapshots, setEraSnapshots] = useState<EraAnalysisSnapshot[]>(() => {
    const saved = localStorage.getItem(ERA_SNAPSHOTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeFilter, setActiveFilterState] = useState<SampleFilterCriteria>(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    return saved ? JSON.parse(saved) : defaultFilter;
  });

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(COLOR_GROUPS_KEY, JSON.stringify(colorGroups));
  }, [colorGroups]);

  useEffect(() => {
    localStorage.setItem(ERA_SNAPSHOTS_KEY, JSON.stringify(eraSnapshots));
  }, [eraSnapshots]);

  useEffect(() => {
    localStorage.setItem(FILTER_KEY, JSON.stringify(activeFilter));
  }, [activeFilter]);

  const addNote = useCallback((data: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt'>): ResearchNote => {
    const now = Date.now();
    const newNote: ResearchNote = {
      ...data,
      id: generateNoteId(),
      createdAt: now,
      updatedAt: now
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Omit<ResearchNote, 'id' | 'createdAt'>>) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
    ));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const getNote = useCallback((id: string): ResearchNote | undefined => {
    return notes.find(n => n.id === id);
  }, [notes]);

  const getNotesByCategory = useCallback((category: ResearchNote['category']): ResearchNote[] => {
    return notes.filter(n => n.category === category);
  }, [notes]);

  const getNotesForSignboard = useCallback((signboardId: string): ResearchNote[] => {
    return notes.filter(n => n.signboardId === signboardId || n.relatedSignboardIds.includes(signboardId));
  }, [notes]);

  const addColorGroup = useCallback((data: Omit<ColorComparisonGroup, 'id' | 'createdAt'>): ColorComparisonGroup => {
    const newGroup: ColorComparisonGroup = {
      ...data,
      id: generateGroupId(),
      createdAt: Date.now()
    };
    setColorGroups(prev => [newGroup, ...prev]);
    return newGroup;
  }, []);

  const updateColorGroup = useCallback((id: string, updates: Partial<Omit<ColorComparisonGroup, 'id' | 'createdAt'>>) => {
    setColorGroups(prev => prev.map(group =>
      group.id === id ? { ...group, ...updates } : group
    ));
  }, []);

  const deleteColorGroup = useCallback((id: string) => {
    setColorGroups(prev => prev.filter(group => group.id !== id));
  }, []);

  const toggleSignboardInColorGroup = useCallback((groupId: string, signboardId: string) => {
    setColorGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;
      const has = group.signboardIds.includes(signboardId);
      return {
        ...group,
        signboardIds: has
          ? group.signboardIds.filter(id => id !== signboardId)
          : [...group.signboardIds, signboardId]
      };
    }));
  }, []);

  const addEraSnapshot = useCallback((data: Omit<EraAnalysisSnapshot, 'id' | 'createdAt'>): EraAnalysisSnapshot => {
    const newSnapshot: EraAnalysisSnapshot = {
      ...data,
      id: generateSnapshotId(),
      createdAt: Date.now()
    };
    setEraSnapshots(prev => [newSnapshot, ...prev]);
    return newSnapshot;
  }, []);

  const updateEraSnapshot = useCallback((id: string, updates: Partial<Omit<EraAnalysisSnapshot, 'id' | 'createdAt'>>) => {
    setEraSnapshots(prev => prev.map(snap =>
      snap.id === id ? { ...snap, ...updates } : snap
    ));
  }, []);

  const deleteEraSnapshot = useCallback((id: string) => {
    setEraSnapshots(prev => prev.filter(snap => snap.id !== id));
  }, []);

  const setActiveFilter = useCallback((filter: Partial<SampleFilterCriteria>) => {
    setActiveFilterState(prev => ({ ...prev, ...filter }));
  }, []);

  const resetActiveFilter = useCallback(() => {
    setActiveFilterState(defaultFilter);
  }, []);

  const filterSignboards = useCallback((signboards: Signboard[], criteria: SampleFilterCriteria): Signboard[] => {
    return signboards.filter(sb => {
      if (criteria.yearRange) {
        const [minY, maxY] = criteria.yearRange;
        if (sb.year < minY || sb.year > maxY) return false;
      }
      if (criteria.eras.length > 0 && !criteria.eras.includes(sb.era)) return false;
      if (criteria.fontStyles.length > 0 && !criteria.fontStyles.includes(sb.fontStyle)) return false;
      if (criteria.conditions.length > 0 && !criteria.conditions.includes(sb.condition as ConditionStatus)) return false;
      if (criteria.colors.length > 0) {
        const hasColor = criteria.colors.some(c => sb.colors.includes(c));
        if (!hasColor) return false;
      }
      if (criteria.tags.length > 0) {
        const hasTag = criteria.tags.some(t => sb.tags.includes(t));
        if (!hasTag) return false;
      }
      if (criteria.locations.length > 0) {
        const matchLocation = criteria.locations.some(loc => sb.location.includes(loc));
        if (!matchLocation) return false;
      }
      if (criteria.hasRestoration !== null) {
        const hasRest = sb.restorationHistory.length > 1;
        if (criteria.hasRestoration !== hasRest) return false;
      }
      if (criteria.buildingTypes.length > 0 && !criteria.buildingTypes.includes(sb.buildingType)) return false;
      return true;
    });
  }, []);

  const value = useMemo<ResearchLabContextType>(() => ({
    notes,
    colorGroups,
    eraSnapshots,
    activeFilter,
    addNote,
    updateNote,
    deleteNote,
    getNote,
    getNotesByCategory,
    getNotesForSignboard,
    addColorGroup,
    updateColorGroup,
    deleteColorGroup,
    toggleSignboardInColorGroup,
    addEraSnapshot,
    updateEraSnapshot,
    deleteEraSnapshot,
    setActiveFilter,
    resetActiveFilter,
    filterSignboards
  }), [
    notes,
    colorGroups,
    eraSnapshots,
    activeFilter,
    addNote,
    updateNote,
    deleteNote,
    getNote,
    getNotesByCategory,
    getNotesForSignboard,
    addColorGroup,
    updateColorGroup,
    deleteColorGroup,
    toggleSignboardInColorGroup,
    addEraSnapshot,
    updateEraSnapshot,
    deleteEraSnapshot,
    setActiveFilter,
    resetActiveFilter,
    filterSignboards
  ]);

  return (
    <ResearchLabContext.Provider value={value}>
      {children}
    </ResearchLabContext.Provider>
  );
};

export const useResearchLab = () => {
  const context = useContext(ResearchLabContext);
  if (!context) throw new Error('useResearchLab must be used within ResearchLabProvider');
  return context;
};
