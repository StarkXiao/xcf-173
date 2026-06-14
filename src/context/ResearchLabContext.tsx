import React, { createContext, useContext, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  ResearchNote,
  ColorComparisonGroup,
  EraAnalysisSnapshot,
  SampleFilterCriteria,
  ResearchLabContextType,
  Signboard,
  ConditionStatus,
  FavoriteResearchStats
} from '../types';
import { useCRUD, useFilterState } from '../hooks';

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
  buildingTypes: [],
  onlyFavorites: false,
  onlyInCollections: []
};

const migrateFilter = (raw: any): SampleFilterCriteria => {
  return {
    onlyFavorites: false,
    onlyInCollections: [],
    ...raw
  };
};

export const ResearchLabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const notesCRUD = useCRUD<ResearchNote>({
    localStorageKey: NOTES_KEY,
    generateId: generateNoteId,
    defaults: {
      relatedCollectionIds: [],
      source: 'manual'
    }
  });

  const colorGroupsCRUD = useCRUD<ColorComparisonGroup>({
    localStorageKey: COLOR_GROUPS_KEY,
    generateId: generateGroupId
  });

  const eraSnapshotsCRUD = useCRUD<EraAnalysisSnapshot>({
    localStorageKey: ERA_SNAPSHOTS_KEY,
    generateId: generateSnapshotId
  });

  const {
    filter: activeFilter,
    setFilter: setActiveFilter,
    resetFilter: resetActiveFilter,
    toggleArrayFilter,
    activeFilterCount
  } = useFilterState<SampleFilterCriteria>({
    localStorageKey: FILTER_KEY,
    defaultFilter,
    migrate: migrateFilter
  });

  const notes = useMemo(() => {
    const raw = notesCRUD.items;
    return Array.isArray(raw) ? raw : [];
  }, [notesCRUD.items]);

  const colorGroups = useMemo(() => {
    const raw = colorGroupsCRUD.items;
    return Array.isArray(raw) ? raw : [];
  }, [colorGroupsCRUD.items]);

  const eraSnapshots = useMemo(() => {
    const raw = eraSnapshotsCRUD.items;
    return Array.isArray(raw) ? raw : [];
  }, [eraSnapshotsCRUD.items]);

  const addNote = useCallback(
    (data: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt'>): ResearchNote => {
      return notesCRUD.add(data);
    },
    [notesCRUD]
  );

  const updateNote = useCallback(
    (id: string, updates: Partial<Omit<ResearchNote, 'id' | 'createdAt'>>) => {
      notesCRUD.update(id, updates);
    },
    [notesCRUD]
  );

  const deleteNote = useCallback(
    (id: string) => {
      notesCRUD.remove(id);
    },
    [notesCRUD]
  );

  const getNote = useCallback(
    (id: string): ResearchNote | undefined => {
      return notesCRUD.getById(id);
    },
    [notesCRUD]
  );

  const getNotesByCategory = useCallback(
    (category: ResearchNote['category']): ResearchNote[] => {
      return notesCRUD.getByField('category', category);
    },
    [notesCRUD]
  );

  const getNotesForSignboard = useCallback(
    (signboardId: string): ResearchNote[] => {
      return notes.filter(
        n => n.signboardId === signboardId || n.relatedSignboardIds.includes(signboardId)
      );
    },
    [notes]
  );

  const getNotesForCollection = useCallback(
    (collectionId: string): ResearchNote[] => {
      return notes.filter(n => n.relatedCollectionIds.includes(collectionId));
    },
    [notes]
  );

  const getNotesForCollections = useCallback(
    (collectionIds: string[]): ResearchNote[] => {
      const set = new Set(collectionIds);
      return notes.filter(n => n.relatedCollectionIds.some(id => set.has(id)));
    },
    [notes]
  );

  const getNotesForFavorites = useCallback(
    (favoriteIds: string[]): ResearchNote[] => {
      const favSet = new Set(favoriteIds);
      return notes.filter(
        n =>
          (n.signboardId && favSet.has(n.signboardId)) ||
          n.relatedSignboardIds.some(id => favSet.has(id)) ||
          favSet.size === 0
      );
    },
    [notes]
  );

  const getFavoriteResearchStats = useCallback(
    (
      _allSignboards: Signboard[],
      favoriteIds: string[],
      collections: { id: string; items: { signboardId: string }[] }[]
    ): FavoriteResearchStats => {
      const notesPerFavorite: Record<string, number> = {};
      const notesPerCollection: Record<string, number> = {};

      favoriteIds.forEach(fid => {
        const count = notes.filter(
          n => n.signboardId === fid || n.relatedSignboardIds.includes(fid)
        ).length;
        if (count > 0) notesPerFavorite[fid] = count;
      });

      collections.forEach(col => {
        const colSignboardIds = new Set(col.items.map(i => i.signboardId));
        const count = notes.filter(
          n =>
            n.relatedCollectionIds.includes(col.id) ||
            (n.signboardId && colSignboardIds.has(n.signboardId)) ||
            n.relatedSignboardIds.some(id => colSignboardIds.has(id))
        ).length;
        if (count > 0) notesPerCollection[col.id] = count;
      });

      const totalFavoritesWithNotes = Object.keys(notesPerFavorite).length;
      const totalCollectionsWithNotes = Object.keys(notesPerCollection).length;

      return {
        totalFavoritesWithNotes,
        totalCollectionsWithNotes,
        notesPerFavorite,
        notesPerCollection
      };
    },
    [notes]
  );

  const addColorGroup = useCallback(
    (data: Omit<ColorComparisonGroup, 'id' | 'createdAt'>): ColorComparisonGroup => {
      return colorGroupsCRUD.add(data);
    },
    [colorGroupsCRUD]
  );

  const updateColorGroup = useCallback(
    (id: string, updates: Partial<Omit<ColorComparisonGroup, 'id' | 'createdAt'>>) => {
      colorGroupsCRUD.update(id, updates);
    },
    [colorGroupsCRUD]
  );

  const deleteColorGroup = useCallback(
    (id: string) => {
      colorGroupsCRUD.remove(id);
    },
    [colorGroupsCRUD]
  );

  const toggleSignboardInColorGroup = useCallback(
    (groupId: string, signboardId: string) => {
      colorGroupsCRUD.setItems(prev =>
        prev.map(group => {
          if (group.id !== groupId) return group;
          const has = group.signboardIds.includes(signboardId);
          return {
            ...group,
            signboardIds: has
              ? group.signboardIds.filter(id => id !== signboardId)
              : [...group.signboardIds, signboardId]
          };
        })
      );
    },
    [colorGroupsCRUD]
  );

  const addEraSnapshot = useCallback(
    (data: Omit<EraAnalysisSnapshot, 'id' | 'createdAt'>): EraAnalysisSnapshot => {
      return eraSnapshotsCRUD.add(data);
    },
    [eraSnapshotsCRUD]
  );

  const updateEraSnapshot = useCallback(
    (id: string, updates: Partial<Omit<EraAnalysisSnapshot, 'id' | 'createdAt'>>) => {
      eraSnapshotsCRUD.update(id, updates);
    },
    [eraSnapshotsCRUD]
  );

  const deleteEraSnapshot = useCallback(
    (id: string) => {
      eraSnapshotsCRUD.remove(id);
    },
    [eraSnapshotsCRUD]
  );

  const filterSignboards = useCallback(
    (
      signboards: Signboard[],
      criteria: SampleFilterCriteria,
      favoriteIds?: string[],
      collectionMap?: Map<string, string[]>
    ): Signboard[] => {
      let result = signboards.filter(sb => {
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

      if (criteria.onlyFavorites && favoriteIds) {
        const favSet = new Set(favoriteIds);
        result = result.filter(sb => favSet.has(sb.id));
      }

      if (criteria.onlyInCollections.length > 0 && collectionMap) {
        const collectionSignboardIds = new Set<string>();
        criteria.onlyInCollections.forEach(cid => {
          const ids = collectionMap.get(cid);
          if (ids) ids.forEach(id => collectionSignboardIds.add(id));
        });
        result = result.filter(sb => collectionSignboardIds.has(sb.id));
      }

      return result;
    },
    []
  );

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
    getNotesForCollection,
    getNotesForCollections,
    getNotesForFavorites,
    getFavoriteResearchStats,
    addColorGroup,
    updateColorGroup,
    deleteColorGroup,
    toggleSignboardInColorGroup,
    addEraSnapshot,
    updateEraSnapshot,
    deleteEraSnapshot,
    setActiveFilter,
    resetActiveFilter,
    filterSignboards,
    toggleArrayFilter,
    activeFilterCount
  } as ResearchLabContextType), [
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
    getNotesForCollection,
    getNotesForCollections,
    getNotesForFavorites,
    getFavoriteResearchStats,
    addColorGroup,
    updateColorGroup,
    deleteColorGroup,
    toggleSignboardInColorGroup,
    addEraSnapshot,
    updateEraSnapshot,
    deleteEraSnapshot,
    setActiveFilter,
    resetActiveFilter,
    filterSignboards,
    toggleArrayFilter,
    activeFilterCount
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
