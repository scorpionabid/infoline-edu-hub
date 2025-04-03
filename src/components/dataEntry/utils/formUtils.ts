
import { Column, CategoryWithColumns } from '@/types/column';
import { CategoryEntryData, ColumnEntry, DataEntryStatus } from '@/types/dataEntry';

export const createEmptyForm = (categories: CategoryWithColumns[]): CategoryEntryData[] => {
  return categories.map(category => ({
    categoryId: category.id,
    entries: category.columns.map(column => ({
      columnId: column.id,
      value: column.defaultValue || '',
      status: 'draft' as DataEntryStatus
    })),
    status: 'draft',
    isCompleted: false,
    isSubmitted: false,
    completionPercentage: 0
  }));
};

export const getEntryByColumnId = (
  entries: CategoryEntryData[],
  categoryId: string,
  columnId: string
): ColumnEntry | undefined => {
  const categoryEntries = entries.find(entry => entry.categoryId === categoryId);
  if (!categoryEntries) return undefined;
  
  return categoryEntries.entries.find(entry => entry.columnId === columnId);
};

export const getEntryValue = (
  entries: CategoryEntryData[],
  categoryId: string,
  columnId: string
): any => {
  const entry = getEntryByColumnId(entries, categoryId, columnId);
  return entry ? entry.value : '';
};

export const calculateCategoryCompletionPercentage = (
  category: CategoryWithColumns,
  entries: ColumnEntry[]
): number => {
  const requiredColumns = category.columns.filter(col => col.isRequired);
  if (requiredColumns.length === 0) return 100;
  
  const filledRequiredCount = requiredColumns.reduce((count, column) => {
    const entry = entries.find(e => e.columnId === column.id);
    if (entry && entry.value !== '' && entry.value !== null && entry.value !== undefined) {
      return count + 1;
    }
    return count;
  }, 0);
  
  return Math.round((filledRequiredCount / requiredColumns.length) * 100);
};
