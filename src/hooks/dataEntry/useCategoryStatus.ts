
import { useState, useEffect, useCallback } from 'react';
import { CategoryWithColumns } from '@/types/column';

interface UseCategoryStatusResult {
  status: 'loading' | 'not_started' | 'in_progress' | 'completed' | 'error';
  completionPercentage: number;
  isCompleted: boolean;
  isStarted: boolean;
  error: Error | null;
}

export const useCategoryStatus = (category: CategoryWithColumns | null): UseCategoryStatusResult => {
  const [status, setStatus] = useState<'loading' | 'not_started' | 'in_progress' | 'completed' | 'error'>('loading');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const calculateStatus = useCallback(() => {
    if (!category) {
      setStatus('loading');
      setCompletionPercentage(0);
      return;
    }

    try {
      // Use the completionRate if it exists
      let completion = category.completionRate || 0;
      
      // If not defined but we have columns, calculate it from entries
      if (completion === 0 && category.entries && category.columns) {
        const totalColumns = category.columns.length;
        const filledEntries = (category.entries || []).length;
        completion = totalColumns > 0 ? (filledEntries / totalColumns) * 100 : 0;
      }

      setCompletionPercentage(completion);

      if (completion === 0) {
        setStatus('not_started');
      } else if (completion < 100) {
        setStatus('in_progress');
      } else {
        setStatus('completed');
      }
    } catch (err) {
      console.error('Error calculating category status:', err);
      setStatus('error');
      setError(err instanceof Error ? err : new Error('Unknown error calculating status'));
    }
  }, [category]);

  useEffect(() => {
    calculateStatus();
  }, [calculateStatus]);

  return {
    status,
    completionPercentage,
    isCompleted: status === 'completed',
    isStarted: status !== 'not_started' && status !== 'loading',
    error
  };
};
