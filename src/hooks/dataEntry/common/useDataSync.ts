
import { useState, useCallback } from 'react';

export interface SyncStatus {
  isSync: boolean;
  lastSync: Date | null;
  pendingChanges: number;
}

export interface UseDataSyncResult {
  syncStatus: SyncStatus;
  sync: () => Promise<void>;
  markDirty: () => void;
  markClean: () => void;
}

export const useDataSync = (): UseDataSyncResult => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSync: true,
    lastSync: null,
    pendingChanges: 0
  });

  const sync = useCallback(async () => {
    try {
      // Mock sync implementation
      console.log('Syncing data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncStatus(prev => ({
        ...prev,
        isSync: true,
        lastSync: new Date(),
        pendingChanges: 0
      }));
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, []);

  const markDirty = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      isSync: false,
      pendingChanges: prev.pendingChanges + 1
    }));
  }, []);

  const markClean = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      isSync: true,
      pendingChanges: 0
    }));
  }, []);

  return {
    syncStatus,
    sync,
    markDirty,
    markClean
  };
};

export default useDataSync;
