import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

export interface CRUDItem {
  id: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface UseCRUDOptions<T extends CRUDItem> {
  localStorageKey?: string;
  generateId: () => string;
  defaults?: Partial<T>;
}

export function useCRUD<T extends CRUDItem>(options: UseCRUDOptions<T>) {
  const { localStorageKey, generateId, defaults = {} } = options;

  const [items, setItems] = localStorageKey
    ? useLocalStorage<T[]>(localStorageKey, [])
    : useState<T[]>([]);

  const add = useCallback(
    (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<T, 'createdAt' | 'updatedAt'>>): T => {
      const now = Date.now();
      const newItem: T = {
        ...defaults,
        ...data,
        id: generateId(),
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now
      } as T;
      setItems(prev => [newItem, ...prev]);
      return newItem;
    },
    [generateId, defaults, setItems]
  );

  const update = useCallback(
    (id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>) => {
      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, ...updates, updatedAt: Date.now() }
            : item
        )
      );
    },
    [setItems]
  );

  const remove = useCallback(
    (id: string) => {
      setItems(prev => prev.filter(item => item.id !== id));
    },
    [setItems]
  );

  const getById = useCallback(
    (id: string): T | undefined => {
      return items.find(item => item.id === id);
    },
    [items]
  );

  const getByField = useCallback(
    <K extends keyof T>(field: K, value: T[K]): T[] => {
      return items.filter(item => item[field] === value);
    },
    [items]
  );

  return {
    items,
    setItems,
    add,
    update,
    remove,
    getById,
    getByField
  };
}

export default useCRUD;
