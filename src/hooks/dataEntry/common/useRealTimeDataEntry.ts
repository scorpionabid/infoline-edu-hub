
import { useState, useCallback } from 'react';

export interface UseRealTimeDataEntryOptions {
  categoryId: string;
  schoolId: string;
  userId?: string;
  onDataChange?: (payload: any) => void;
  enabled?: boolean;
}

export interface UseRealTimeDataEntryResult {
  isConnected: boolean;
  activeUsers: any[];
  activeUserCount: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export const useRealTimeDataEntry = ({
  categoryId,
  schoolId,
  userId,
  onDataChange,
  enabled = true
}: UseRealTimeDataEntryOptions): UseRealTimeDataEntryResult => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  return {
    isConnected,
    activeUsers,
    activeUserCount: activeUsers.length,
    connectionStatus: isConnected ? 'connected' : 'disconnected'
  };
};

export default useRealTimeDataEntry;
