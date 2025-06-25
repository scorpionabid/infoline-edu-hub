
import { useState, useEffect } from 'react';

export interface EnhancedDashboardData {
  totalCategories: number;
  completedCategories: number;
  totalColumns: number;
  filledColumns: number;
  overallProgress: number;
  categoryProgress: CategoryProgress[];
  columnStatuses: ColumnStatus[];
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  completionRate: number;
}

export interface CategoryProgress {
  id: string;
  name: string;
  progress: number;
  status: string;
  completionRate: number;
}

export interface ColumnStatus {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'empty';
  categoryId: string;
  categoryName: string;
}

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
      categoryProgress: [
        {
          id: '1',
          name: 'Ümumi Məlumatlar',
          progress: 85,
          status: 'completed',
          completionRate: 85
        },
        {
          id: '2', 
          name: 'Müəllim Məlumatları',
          progress: 60,
          status: 'pending',
          completionRate: 60
        }
      ],
      columnStatuses: [
        {
          id: '1',
          name: 'Məktəb Adı',
          status: 'completed',
          categoryId: '1',
          categoryName: 'Ümumi Məlumatlar'
        },
        {
          id: '2',
          name: 'Müəllim Sayı',
          status: 'pending',
          categoryId: '2',
          categoryName: 'Müəllim Məlumatları'
        }
      ],
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

export type { EnhancedDashboardData, CategoryProgress, ColumnStatus };
