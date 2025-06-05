
import { useState, useEffect, useCallback } from 'react';

export interface RealTimeSyncState {
  isConnected: boolean;
  lastUpdate: Date | null;
  pendingChanges: number;
}

export interface UseRealTimeSyncResult {
  syncState: RealTimeSyncState;
  connect: () => void;
  disconnect: () => void;
  pushChange: (change: any) => void;
}

export const useRealTimeSync = (): UseRealTimeSyncResult => {
  const [syncState, setSyncState] = useState<RealTimeSyncState>({
    isConnected: false,
    lastUpdate: null,
    pendingChanges: 0
  });

  const connect = useCallback(() => {
    setSyncState(prev => ({
      ...prev,
      isConnected: true
    }));
  }, []);

  const disconnect = useCallback(() => {
    setSyncState(prev => ({
      ...prev,
      isConnected: false
    }));
  }, []);

  const pushChange = useCallback((change: any) => {
    setSyncState(prev => ({
      ...prev,
      pendingChanges: prev.pendingChanges + 1,
      lastUpdate: new Date()
    }));
  }, []);

  return {
    syncState,
    connect,
    disconnect,
    pushChange
  };
};

export default useRealTimeSync;
