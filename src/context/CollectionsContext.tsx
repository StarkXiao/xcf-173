import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Collection, CollectionsContextType } from '../types';

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

const generateId = () => `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const CollectionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('signboard-collections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    const defaultCollection: Collection = {
      id: generateId(),
      name: '我的招牌珍藏',
      description: '默认收藏册，存放我最喜欢的招牌',
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return [defaultCollection];
  });

  useEffect(() => {
    localStorage.setItem('signboard-collections', JSON.stringify(collections));
  }, [collections]);

  const createCollection = useCallback((name: string, description: string = ''): Collection => {
    const newCollection: Collection = {
      id: generateId(),
      name,
      description,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setCollections(prev => [...prev, newCollection]);
    return newCollection;
  }, []);

  const updateCollection = useCallback((id: string, updates: Partial<Omit<Collection, 'id' | 'createdAt'>>) => {
    setCollections(prev => prev.map(col =>
      col.id === id ? { ...col, ...updates, updatedAt: Date.now() } : col
    ));
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections(prev => prev.filter(col => col.id !== id));
  }, []);

  const addToCollection = useCallback((collectionId: string, signboardId: string, note?: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id !== collectionId) return col;
      if (col.items.some(item => item.signboardId === signboardId)) return col;
      return {
        ...col,
        items: [...col.items, { signboardId, note, addedAt: Date.now() }],
        updatedAt: Date.now()
      };
    }));
  }, []);

  const removeFromCollection = useCallback((collectionId: string, signboardId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id !== collectionId) return col;
      return {
        ...col,
        items: col.items.filter(item => item.signboardId !== signboardId),
        updatedAt: Date.now()
      };
    }));
  }, []);

  const updateItemNote = useCallback((collectionId: string, signboardId: string, note: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id !== collectionId) return col;
      return {
        ...col,
        items: col.items.map(item =>
          item.signboardId === signboardId ? { ...item, note } : item
        ),
        updatedAt: Date.now()
      };
    }));
  }, []);

  const reorderItems = useCallback((collectionId: string, signboardIds: string[]) => {
    setCollections(prev => prev.map(col => {
      if (col.id !== collectionId) return col;
      const reorderedItems = signboardIds
        .map(id => col.items.find(item => item.signboardId === id))
        .filter((item): item is NonNullable<typeof item> => item !== undefined);
      return {
        ...col,
        items: reorderedItems,
        updatedAt: Date.now()
      };
    }));
  }, []);

  const setCollectionCover = useCallback((collectionId: string, signboardId: string | undefined) => {
    setCollections(prev => prev.map(col =>
      col.id === collectionId ? { ...col, coverSignboardId: signboardId, updatedAt: Date.now() } : col
    ));
  }, []);

  const getCollectionsContainingSignboard = useCallback((signboardId: string): Collection[] => {
    return collections.filter(col => col.items.some(item => item.signboardId === signboardId));
  }, [collections]);

  const isSignboardInCollection = useCallback((collectionId: string, signboardId: string): boolean => {
    const collection = collections.find(col => col.id === collectionId);
    return collection?.items.some(item => item.signboardId === signboardId) ?? false;
  }, [collections]);

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        createCollection,
        updateCollection,
        deleteCollection,
        addToCollection,
        removeFromCollection,
        updateItemNote,
        reorderItems,
        setCollectionCover,
        getCollectionsContainingSignboard,
        isSignboardInCollection
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
};

export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (!context) throw new Error('useCollections must be used within CollectionsProvider');
  return context;
};
