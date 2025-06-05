
import { useState, useCallback } from 'react';

export interface OfflineState {
  isOnline: boolean;
  queuedActions: any[];
  lastSync: Date | null;
}

export interface UseOfflineSupportResult {
  offlineState: OfflineState;
  queueAction: (action: any) => void;
  syncQueued: () => Promise<void>;
  clearQueue: () => void;
}

export const useOfflineSupport = (): UseOfflineSupportResult => {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    queuedActions: [],
    lastSync: null
  });

  const queueAction = useCallback((action: any) => {
    setOfflineState(prev => ({
      ...prev,
      queuedActions: [...prev.queuedActions, action]
    }));
  }, []);

  const syncQueued = useCallback(async () => {
    // Mock sync implementation
    setOfflineState(prev => ({
      ...prev,
      queuedActions: [],
      lastSync: new Date()
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setOfflineState(prev => ({
      ...prev,
      queuedActions: []
    }));
  }, []);

  return {
    offlineState,
    queueAction,
    syncQueued,
    clearQueue
  };
};

export default useOfflineSupport;
