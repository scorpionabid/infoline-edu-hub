
import { useMemo } from 'react';
import { CategoryWithColumns } from '@/types/column';

interface Entry {
  id: string;
  status: string;
  value?: any;
}

interface CategoryWithEntries extends CategoryWithColumns {
  entries?: Entry[];
}

interface UseCategoryStatusResult {
  getCategoryStatus: (category: CategoryWithEntries) => 'not_started' | 'in_progress' | 'completed';
  getCompletionRate: (category: CategoryWithEntries) => number;
}

export const useCategoryStatus = (): UseCategoryStatusResult => {
  const getCompletionRate = useMemo(() => (category: CategoryWithEntries) => {
    // If completionRate is already set, use it
    if (typeof category.completionRate === 'number') {
      return category.completionRate;
    }

    // Calculate from entries if available
    if (category.entries && category.entries.length > 0 && category.columns && category.columns.length > 0) {
      const totalEntries = category.columns.length;
      const filledEntries = category.entries.filter(entry => entry.value !== null && entry.value !== undefined && entry.value !== '').length;
      return Math.floor((filledEntries / totalEntries) * 100);
    }

    return 0;
  }, []);

  const getCategoryStatus = useMemo(() => (category: CategoryWithEntries) => {
    const completionRate = getCompletionRate(category);
    
    if (completionRate === 0) {
      return 'not_started';
    } else if (completionRate < 100) {
      return 'in_progress';
    } else {
      return 'completed';
    }
  }, [getCompletionRate]);

  return {
    getCategoryStatus,
    getCompletionRate
  };
};

export default useCategoryStatus;
