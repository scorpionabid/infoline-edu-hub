
import { useMemo } from 'react';
import { CategoryWithColumns } from '@/types/column';

/**
 * Hook that determines the status of a category based on its completion rate
 * and deadline status
 */
export const useCategoryStatus = (category: CategoryWithColumns | null) => {
  const statusInfo = useMemo(() => {
    if (!category) {
      return { status: 'unknown', label: 'Unknown', color: 'gray' };
    }

    // If completionRate is not defined in category, default to 0
    const completionRate = category.completionRate ?? 0;
    
    // Calculate days left if deadline exists
    let daysLeft = null;
    if (category.deadline) {
      const deadline = new Date(category.deadline);
      const today = new Date();
      const diffTime = deadline.getTime() - today.getTime();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Determine status based on completion rate and deadline
    if (completionRate === 100) {
      return { 
        status: 'completed',
        label: 'Tamamlanıb',
        color: 'green',
        daysLeft
      };
    } else if (daysLeft !== null && daysLeft < 0) {
      return { 
        status: 'overdue',
        label: 'Gecikib',
        color: 'red',
        daysLeft
      };
    } else if (daysLeft !== null && daysLeft <= 7) {
      return { 
        status: 'urgent',
        label: 'Təcili',
        color: 'orange',
        daysLeft
      };
    } else if (completionRate > 0) {
      return { 
        status: 'in-progress',
        label: 'Davam edir',
        color: 'blue',
        daysLeft
      };
    } else {
      return { 
        status: 'not-started',
        label: 'Başlanmayıb',
        color: 'gray',
        daysLeft
      };
    }
  }, [category]);

  return statusInfo;
};
