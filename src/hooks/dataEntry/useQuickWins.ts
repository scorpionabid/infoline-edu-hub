
import { useMemo } from 'react';

export interface UseQuickWinsResult {
  currentCategoryIndex: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  goToPrevious: () => void;
  goToNext: () => void;
}

export function useDataEntryQuickWins(
  categories: any[] = [],
  schools: any[] = []
): UseQuickWinsResult {
  const currentCategoryIndex = 0;

  const canGoPrevious = useMemo(() => {
    return currentCategoryIndex > 0;
  }, [currentCategoryIndex]);

  const canGoNext = useMemo(() => {
    return currentCategoryIndex < categories.length - 1;
  }, [currentCategoryIndex, categories.length]);

  const goToPrevious = () => {
    // Implementation for previous category
    console.log('Go to previous category');
  };

  const goToNext = () => {
    // Implementation for next category
    console.log('Go to next category');
  };

  return {
    currentCategoryIndex,
    canGoPrevious,
    canGoNext,
    goToPrevious,
    goToNext
  };
}

export default useDataEntryQuickWins;
