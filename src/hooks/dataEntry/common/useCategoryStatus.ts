
import { useMemo } from 'react';
import { CategoryWithColumns } from '@/types/category';

export function useCategoryStatus(category: CategoryWithColumns | null) {
  const isComplete = useMemo(() => {
    if (!category) return false;
    if (category.completionRate === undefined) return false;
    return category.completionRate === 100;
  }, [category]);

  const isPending = useMemo(() => {
    if (!category) return false;
    if (category.completionRate === undefined) return false;
    return category.completionRate > 0 && category.completionRate < 100;
  }, [category]);

  const status = useMemo(() => {
    if (!category) return 'unknown';
    if (isComplete) return 'completed';
    if (isPending) return 'in-progress';
    return 'not-started';
  }, [category, isComplete, isPending]);

  return {
    isComplete,
    isPending,
    // status
  };
}

export default useCategoryStatus;
