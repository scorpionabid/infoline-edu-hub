
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';

export const getCompletionStatus = (category: CategoryWithColumns, entryData?: CategoryEntryData) => {
  if (!entryData) {
    return {
      isCompleted: false,
      isSubmitted: false,
      completionPercentage: 0,
      status: 'draft' as const,
    };
  }

  const { entries, status } = entryData;

  // Find required columns
  const requiredColumns = category.columns.filter(col => col.isRequired);
  
  if (requiredColumns.length === 0) {
    return {
      isCompleted: true,
      isSubmitted: status === 'submitted' || status === 'pending' || status === 'approved',
      completionPercentage: 100,
      status,
    };
  }

  // Count filled required columns
  const filledRequiredCount = requiredColumns.reduce((count, column) => {
    const entry = entries.find(e => e.columnId === column.id);
    if (entry && entry.value !== undefined && entry.value !== null && entry.value !== '') {
      return count + 1;
    }
    return count;
  }, 0);

  const completionPercentage = Math.round((filledRequiredCount / requiredColumns.length) * 100);
  
  return {
    isCompleted: filledRequiredCount === requiredColumns.length,
    isSubmitted: status === 'submitted' || status === 'pending' || status === 'approved',
    completionPercentage,
    status,
  };
};

// categoryId və daxil edilmiş məlumatlar əsasında formlar üçün struktur yaradır
export const generateCategoryEntryForm = (category: CategoryWithColumns): CategoryEntryData => {
  return {
    categoryId: category.id,
    entries: category.columns.map(column => ({
      columnId: column.id,
      value: column.defaultValue || '',
      status: 'draft',
    })),
    status: 'draft',
    isCompleted: false,
    isSubmitted: false,
    completionPercentage: 0,
  };
};
