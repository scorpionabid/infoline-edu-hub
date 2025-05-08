
import { useMemo } from 'react';
import { CategoryWithColumns } from '@/types/column';

export function useCategoryStatus(categories: CategoryWithColumns[] = []) {
  const pendingCount = useMemo(() => {
    return categories.filter(category => category.status === 'pending').length;
  }, [categories]);

  const activeCount = useMemo(() => {
    return categories.filter(category => category.status === 'active').length;
  }, [categories]);

  const completedCount = useMemo(() => {
    return categories.filter(category => 
      category.status === 'completed' || 
      (typeof category.completionRate === 'number' && category.completionRate === 100)
    ).length;
  }, [categories]);

  return {
    pendingCount,
    activeCount,
    completedCount,
    totalCount: categories.length
  };
}

export default useCategoryStatus;
