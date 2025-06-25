
import { useState, useEffect } from 'react';
import { EnhancedDashboardData } from '@/types/dashboard';

interface UseDashboardDataOptions {
  enhanced?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useDashboardData = (options: UseDashboardDataOptions = {}) => {
  const [data, setData] = useState<any>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = () => {
    // Mock enhanced data for now
    const mockEnhancedData: EnhancedDashboardData = {
      totalCategories: 5,
      completedCategories: 3,
      totalColumns: 25,
      filledColumns: 18,
      overallProgress: 72,
      categoryProgress: [],
      columnStatuses: [],
      totalForms: 10,
      completedForms: 7,
      pendingForms: 3,
      completionRate: 70
    };

    setData(mockEnhancedData);
    setEnhancedData(mockEnhancedData);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    data,
    enhancedData,
    loading,
    refreshData,
    isReady: !loading,
    hasData: !!data,
    isEmpty: !data || (data.totalCategories === 0)
  };
};

export type { EnhancedDashboardData };
