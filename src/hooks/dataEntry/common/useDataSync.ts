
import { useState, useCallback } from 'react';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  hasError: boolean;
  errorMessage?: string;
}

export interface UseDataSyncResult {
  syncStatus: SyncStatus;
  sync: (data: any) => Promise<void>;
  clearError: () => void;
}

export const useDataSync = (): UseDataSyncResult => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    hasError: false
  });

  const sync = useCallback(async (data: any) => {
    setSyncStatus(prev => ({
      ...prev,
      isSyncing: true,
      hasError: false,
      errorMessage: undefined
    }));

    try {
      // Mock sync operation - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        hasError: false
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'Sync error occurred'
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      hasError: false,
      errorMessage: undefined
    }));
  }, []);

  return {
    syncStatus,
    sync,
    clearError
  };
};

export default useDataSync;
