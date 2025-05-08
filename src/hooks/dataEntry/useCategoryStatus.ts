
import { useCallback, useMemo } from 'react';
import { CategoryWithColumns } from '@/types/column';

interface CategoryStatus {
  status: 'not_started' | 'in_progress' | 'completed' | 'pending' | 'approved' | 'rejected';
  completionPercentage: number;
}

export const useCategoryStatus = (categories: CategoryWithColumns[] = []) => {
  const getStatus = useCallback((category: CategoryWithColumns): CategoryStatus => {
    // Use the completion rate from the category or calculate it if not provided
    const completionRate = typeof category.completionRate !== 'undefined' ? category.completionRate : 0;
    
    // Check if entries exist in the category
    const hasEntries = category.entries && Array.isArray(category.entries) && category.entries.length > 0;
    
    // Check approved/rejected/pending status from entries if available
    if (hasEntries) {
      const pendingEntries = category.entries.filter(entry => entry.status === 'pending');
      const rejectedEntries = category.entries.filter(entry => entry.status === 'rejected');
      const approvedEntries = category.entries.filter(entry => entry.status === 'approved');
      
      if (pendingEntries.length > 0) {
        return { status: 'pending', completionPercentage: completionRate };
      }
      
      if (rejectedEntries.length > 0) {
        return { status: 'rejected', completionPercentage: completionRate };
      }
      
      if (approvedEntries.length > 0 && completionRate === 100) {
        return { status: 'approved', completionPercentage: 100 };
      }
    }
    
    // Default statuses based on completion rate
    if (completionRate === 0) {
      return { status: 'not_started', completionPercentage: 0 };
    } else if (completionRate < 100) {
      return { status: 'in_progress', completionPercentage: completionRate };
    }
    
    return { status: 'completed', completionPercentage: 100 };
  }, []);

  const categoryStatuses = useMemo(() => {
    return categories.map(category => ({
      id: category.id,
      status: getStatus(category)
    }));
  }, [categories, getStatus]);

  return {
    getStatus,
    categoryStatuses
  };
};

export default useCategoryStatus;
