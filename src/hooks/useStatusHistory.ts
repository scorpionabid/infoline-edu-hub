import { useState, useEffect, useCallback } from 'react';
import { StatusHistoryService, StatusHistoryEntry, StatusHistoryServiceResponse } from '@/services/statusHistoryService';

/**
 * React Hook for Status History Management
 * 
 * Bu hook status tarixçəsini idarə etmək üçün istifadə olunur və
 * Security Advisor tələblərinə uyğun secure əməliyyatlar həyata keçirir.
 */

export interface UseStatusHistoryOptions {
  entryId?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseStatusHistoryReturn {
  history: StatusHistoryEntry[];
  loading: boolean;
  error: string | null;
  hasData: boolean;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  logStatusChange: (
    dataEntryId: string,
    oldStatus: string,
    newStatus: string,
    comment?: string
  ) => Promise<boolean>;
  exportHistory: () => Promise<any[] | null>;
  getStatistics: () => Promise<any | null>;
  testConnection: () => Promise<any | null>;
}

/**
 * Status History Hook
 */
export const useStatusHistory = (options: UseStatusHistoryOptions = {}): UseStatusHistoryReturn => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    entryId,
    limit = 50,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  /**
   * Status tarixçəsini yüklə
   */
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result: StatusHistoryServiceResponse;
      
      if (entryId) {
        result = await StatusHistoryService.getEntryStatusHistory(entryId);
      } else {
        result = await StatusHistoryService.getRecentStatusChanges(limit);
      }
      
      if (result.success && result.data) {
        setHistory(result.data);
        setRetryCount(0); // Reset retry count on success
      } else {
        setError(result.error || 'Unknown error occurred');
        
        // Auto retry once for transient errors
        if (retryCount < 1 && result.error?.includes('operator does not exist')) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchHistory(), 2000);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error in useStatusHistory';
      setError(errorMessage);
      console.error('Error in useStatusHistory:', err);
      
      // Auto retry for network errors
      if (retryCount < 1 && errorMessage.includes('network')) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchHistory(), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [entryId, limit, retryCount]);

  /**
   * Status dəyişikliyi qeyd et
   */
  const logStatusChange = useCallback(async (
    dataEntryId: string,
    oldStatus: string,
    newStatus: string,
    comment?: string
  ): Promise<boolean> => {
    try {
      const result = await StatusHistoryService.logStatusChange(
        dataEntryId,
        oldStatus,
        newStatus,
        comment
      );
      
      if (result.success) {
        // Automatically refresh history after logging
        await fetchHistory();
        return true;
      } else {
        setError(result.error || 'Failed to log status change');
        return false;
      }
    } catch (error: any) {
      setError(error.message || 'Error logging status change');
      console.error('Error logging status change:', error);
      return false;
    }
  }, [fetchHistory]);

  /**
   * Tarixçəni export et
   */
  const exportHistory = useCallback(async (): Promise<any[] | null> => {
    try {
      const result = await StatusHistoryService.exportStatusHistory({
        entryId,
        limit: 1000
      });
      
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to export history');
        return null;
      }
    } catch (error: any) {
      setError(error.message || 'Error exporting history');
      console.error('Error exporting history:', error);
      return null;
    }
  }, [entryId]);

  /**
   * Status statistikalarını əldə et
   */
  const getStatistics = useCallback(async (): Promise<any | null> => {
    try {
      const result = await StatusHistoryService.getStatusStatistics();
      
      if (result.success && result.data) {
        return result.data[0];
      } else {
        setError(result.error || 'Failed to get statistics');
        return null;
      }
    } catch (error: any) {
      setError(error.message || 'Error getting statistics');
      console.error('Error getting statistics:', error);
      return null;
    }
  }, []);

  /**
   * Database connection test
   */
  const testConnection = useCallback(async (): Promise<any | null> => {
    try {
      const result = await StatusHistoryService.testConnection();
      
      if (result.success && result.data) {
        return result.data[0];
      } else {
        setError(result.error || 'Connection test failed');
        return null;
      }
    } catch (error: any) {
      setError(error.message || 'Error testing connection');
      console.error('Error testing connection:', error);
      return null;
    }
  }, []);

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    setRetryCount(0); // Reset retry count for manual refresh
    await fetchHistory();
  }, [fetchHistory]);

  // Initial load
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Auto refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchHistory();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchHistory]);

  return {
    history,
    loading,
    error,
    hasData: history.length > 0,
    refetch: fetchHistory,
    refresh,
    logStatusChange,
    exportHistory,
    getStatistics,
    testConnection
  };
};

/**
 * Filtered Status History Hook
 */
export const useFilteredStatusHistory = (
  filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    userId?: string;
    entryId?: string;
  },
  limit: number = 50
) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFilteredHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await StatusHistoryService.getFilteredStatusHistory(filters, limit);
      
      if (result.success && result.data) {
        setHistory(result.data);
      } else {
        setError(result.error || 'Failed to fetch filtered history');
      }
    } catch (error: any) {
      setError(error.message || 'Error fetching filtered history');
      console.error('Error in useFilteredStatusHistory:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, limit]);

  useEffect(() => {
    fetchFilteredHistory();
  }, [fetchFilteredHistory]);

  return {
    history,
    loading,
    error,
    hasData: history.length > 0,
    refetch: fetchFilteredHistory
  };
};

/**
 * Status Statistics Hook
 */
export const useStatusStatistics = () => {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await StatusHistoryService.getStatusStatistics();
      
      if (result.success && result.data) {
        setStatistics(result.data[0]);
      } else {
        setError(result.error || 'Failed to fetch statistics');
      }
    } catch (error: any) {
      setError(error.message || 'Error fetching statistics');
      console.error('Error in useStatusStatistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics
  };
};

export default useStatusHistory;
