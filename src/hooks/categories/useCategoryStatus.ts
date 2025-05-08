
import { useCallback } from 'react';
import { CategoryWithColumns } from '@/types/column';

interface UseCategoryStatusResult {
  getCategoryStatus: (category: CategoryWithColumns) => 'not_started' | 'in_progress' | 'completed';
}

export const useCategoryStatus = (): UseCategoryStatusResult => {
  // Inside the useCategoryStatus function, ensure completionRate is handled properly
  const getCategoryStatus = useCallback((category: CategoryWithColumns) => {
    // Add completionRate if it doesn't exist
    const completionRate = category.completionRate !== undefined ? category.completionRate : 0;
    
    // Get status based on completion rate
    if (completionRate === 0) return 'not_started';
    if (completionRate < 100) return 'in_progress';
    return 'completed';
  }, []);

  return {
    getCategoryStatus,
  };
};
