import { useState, useCallback, useMemo } from 'react';
import useLocalStorage from './useLocalStorage';
import type { ArrayFilterField, FilterStateBase } from '../types';

export interface UseFilterStateOptions<F extends FilterStateBase> {
  localStorageKey?: string;
  defaultFilter: F;
  migrate?: (raw: any) => F;
}

export function useFilterState<F extends FilterStateBase>(
  options: UseFilterStateOptions<F>
) {
  const { localStorageKey, defaultFilter, migrate } = options;

  const [filter, setFilterState] = localStorageKey
    ? useLocalStorage<F>(localStorageKey, defaultFilter, migrate)
    : useState<F>(defaultFilter);

  const setFilter = useCallback(
    (updates: Partial<F>) => {
      setFilterState(prev => ({ ...prev, ...updates }));
    },
    [setFilterState]
  );

  const resetFilter = useCallback(() => {
    setFilterState(defaultFilter);
  }, [defaultFilter, setFilterState]);

  const toggleArrayFilter = useCallback(
    (field: keyof ArrayFilterField, value: string) => {
      setFilterState(prev => {
        const current = (prev[field] as string[]) || [];
        const updated = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        return { ...prev, [field]: updated } as F;
      });
    },
    [setFilterState]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filter.yearRange) count++;
    if ((filter.eras || []).length) count++;
    if ((filter.fontStyles || []).length) count++;
    if ((filter.conditions || []).length) count++;
    if ((filter.colors || []).length) count++;
    if ((filter.tags || []).length) count++;
    if ((filter.locations || []).length) count++;
    if (filter.hasRestoration !== null && filter.hasRestoration !== undefined) count++;
    if ((filter.buildingTypes || []).length) count++;
    if (filter.onlyFavorites) count++;
    if ((filter.onlyInCollections || []).length) count++;
    return count;
  }, [filter]);

  return {
    filter,
    setFilter,
    resetFilter,
    toggleArrayFilter,
    activeFilterCount
  };
}

export default useFilterState;
