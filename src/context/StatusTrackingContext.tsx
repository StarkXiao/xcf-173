import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { StatusRecord, ConditionStatus, StatusTrackingContextType } from '../types';

const StatusTrackingContext = createContext<StatusTrackingContextType | undefined>(undefined);

const generateId = () => `status-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const StatusTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<StatusRecord[]>(() => {
    const saved = localStorage.getItem('signboard-status-records');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('signboard-status-records', JSON.stringify(records));
  }, [records]);

  const addRecord = (signboardId: string, data: Omit<StatusRecord, 'id' | 'signboardId' | 'recordedAt' | 'updatedAt'>): StatusRecord => {
    const now = Date.now();
    const newRecord: StatusRecord = {
      id: generateId(),
      signboardId,
      ...data,
      recordedAt: now,
      updatedAt: now
    };
    setRecords(prev => [...prev, newRecord]);
    return newRecord;
  };

  const updateRecord = (id: string, data: Partial<Omit<StatusRecord, 'id' | 'signboardId' | 'recordedAt'>>) => {
    setRecords(prev =>
      prev.map(record =>
        record.id === id
          ? { ...record, ...data, updatedAt: Date.now() }
          : record
      )
    );
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  const getRecordsForSignboard = (signboardId: string): StatusRecord[] => {
    return records
      .filter(r => r.signboardId === signboardId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getLatestStatus = (signboardId: string): ConditionStatus | null => {
    const signboardRecords = getRecordsForSignboard(signboardId);
    if (signboardRecords.length === 0) return null;
    return signboardRecords[0].condition;
  };

  const hasRecords = (signboardId: string): boolean => {
    return records.some(r => r.signboardId === signboardId);
  };

  const getStatusStats = (signboardIds: string[]): Record<ConditionStatus, number> => {
    const stats: Record<ConditionStatus, number> = {
      'well-preserved': 0,
      'weathered': 0,
      'damaged': 0,
      'restored': 0
    };
    
    signboardIds.forEach(id => {
      const latest = getLatestStatus(id);
      if (latest) {
        stats[latest]++;
      }
    });
    
    return stats;
  };

  return (
    <StatusTrackingContext.Provider
      value={{
        records,
        addRecord,
        updateRecord,
        deleteRecord,
        getRecordsForSignboard,
        getLatestStatus,
        hasRecords,
        getStatusStats
      }}
    >
      {children}
    </StatusTrackingContext.Provider>
  );
};

export const useStatusTracking = () => {
  const context = useContext(StatusTrackingContext);
  if (!context) throw new Error('useStatusTracking must be used within StatusTrackingProvider');
  return context;
};
