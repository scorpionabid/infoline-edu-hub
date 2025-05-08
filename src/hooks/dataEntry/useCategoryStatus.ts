
import { useCallback } from 'react';
import { CategoryWithEntries } from '@/types/column';

interface UseCategoryStatusResult {
  getCategoryStatus: (category: CategoryWithEntries) => 'not_started' | 'in_progress' | 'completed';
  calculateCompletionRate: (category: CategoryWithEntries) => number;
}

export const useCategoryStatus = (): UseCategoryStatusResult => {
  // Calculate completion rate
  const calculateCompletionRate = useCallback((category: CategoryWithEntries) => {
    if (!category.entries || category.entries.length === 0 || !category.columns || category.columns.length === 0) {
      return 0;
    }

    // Count required fields
    const requiredColumns = category.columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) return 0;

    // Count filled required entries
    const filledRequiredEntries = category.entries.filter(entry => {
      const column = requiredColumns.find(col => col.id === entry.column_id);
      return column && entry.value && entry.value.trim() !== '';
    });

    return (filledRequiredEntries.length / requiredColumns.length) * 100;
  }, []);

  // Get status based on completion rate
  const getCategoryStatus = useCallback((category: CategoryWithEntries) => {
    const completionRate = category.completionRate ?? calculateCompletionRate(category);
    
    if (completionRate === 0) return 'not_started';
    if (completionRate < 100) return 'in_progress';
    return 'completed';
  }, [calculateCompletionRate]);

  return {
    getCategoryStatus,
    calculateCompletionRate
  };
};

export default useCategoryStatus;
