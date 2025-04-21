
import { useState, useEffect } from 'react';
import { CategoryEntryData } from '@/types/dataEntry';

interface UseCategoryFormReturn {
  categoryStatus: string;
  updateCategoryStatus: (category: CategoryEntryData) => void;
}

export function useCategoryForm(): UseCategoryFormReturn {
  const [categoryStatus, setCategoryStatus] = useState<string>('idle');

  const updateCategoryStatus = (category: CategoryEntryData) => {
    // Calculate completion percentage (if missing)
    const completionPercentage = category.completionPercentage || 0; 

    if (completionPercentage === 100) {
      setCategoryStatus('completed');
    } else if (completionPercentage > 0) {
      setCategoryStatus('pending');
    } else {
      setCategoryStatus('draft');
    }
  };

  return {
    categoryStatus,
    updateCategoryStatus,
  };
}
