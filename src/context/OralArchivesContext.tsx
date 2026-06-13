import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { OralArchive, OralArchivesContextType } from '../types';

const OralArchivesContext = createContext<OralArchivesContextType | undefined>(undefined);

export const OralArchivesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [archives, setArchives] = useState<OralArchive[]>(() => {
    const saved = localStorage.getItem('signboard-oral-archives');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('signboard-oral-archives', JSON.stringify(archives));
  }, [archives]);

  const saveArchive = (
    signboardId: string,
    data: Partial<Omit<OralArchive, 'signboardId' | 'recordedAt' | 'updatedAt'>>
  ) => {
    const now = Date.now();
    setArchives(prev => {
      const existing = prev.find(a => a.signboardId === signboardId);
      if (existing) {
        return prev.map(a =>
          a.signboardId === signboardId
            ? { ...a, ...data, updatedAt: now }
            : a
        );
      }
      return [
        ...prev,
        {
          signboardId,
          storySummary: data.storySummary || '',
          sourceNote: data.sourceNote || '',
          recordedAt: now,
          updatedAt: now,
          informant: data.informant,
          recordingDate: data.recordingDate
        }
      ];
    });
  };

  const deleteArchive = (signboardId: string) => {
    setArchives(prev => prev.filter(a => a.signboardId !== signboardId));
  };

  const getArchive = (signboardId: string) => {
    return archives.find(a => a.signboardId === signboardId);
  };

  const hasArchive = (signboardId: string) => {
    return archives.some(a => a.signboardId === signboardId);
  };

  const getArchivesForSignboards = (signboardIds: string[]) => {
    return archives.filter(a => signboardIds.includes(a.signboardId));
  };

  return (
    <OralArchivesContext.Provider
      value={{
        archives,
        saveArchive,
        deleteArchive,
        getArchive,
        hasArchive,
        getArchivesForSignboards
      }}
    >
      {children}
    </OralArchivesContext.Provider>
  );
};

export const useOralArchives = () => {
  const context = useContext(OralArchivesContext);
  if (!context) throw new Error('useOralArchives must be used within OralArchivesProvider');
  return context;
};
