
import { useMemo } from 'react';

// Define the CategoryWithEntries interface locally if it's missing from types
export interface CategoryWithEntries {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
  completionRate: number;
  entries?: {
    id: string;
    columnId: string;
    value: string;
    status: string;
  }[];
}

export function useCategoryStatus(category: CategoryWithEntries | null) {
  const isComplete = useMemo(() => {
    if (!category) return false;
    return category.completionRate === 100;
  }, [category]);

  const isPending = useMemo(() => {
    if (!category) return false;
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
    status
  };
}

export default useCategoryStatus;
