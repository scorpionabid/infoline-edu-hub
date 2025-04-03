
import { v4 as uuidv4 } from 'uuid';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData, ColumnEntry, DataEntryStatus } from '@/types/dataEntry';

export const getCategoryName = (categories: CategoryWithColumns[], categoryId: string): string => {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : '';
};

export const getRequiredColumnIds = (categories: CategoryWithColumns[], categoryId: string): string[] => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];
  
  return category.columns
    .filter(column => column.isRequired)
    .map(column => column.id);
};

export const findColumnById = (categories: CategoryWithColumns[], columnId: string) => {
  for (const category of categories) {
    const column = category.columns.find(c => c.id === columnId);
    if (column) return column;
  }
  return null;
};

export const findCategoryForColumn = (categories: CategoryWithColumns[], columnId: string) => {
  for (const category of categories) {
    if (category.columns.some(c => c.id === columnId)) {
      return category;
    }
  }
  return null;
};

export const areRequiredFieldsComplete = (
  categoryEntry: CategoryEntryData,
  requiredColumnIds: string[]
): boolean => {
  if (!requiredColumnIds.length) return true;
  
  // İlk olaraq values massivini yoxla
  if (categoryEntry.values && categoryEntry.values.length > 0) {
    return requiredColumnIds.every(id => {
      const entry = categoryEntry.values.find(v => v.columnId === id);
      return entry && entry.value && entry.value.trim() !== '';
    });
  }
  
  // Geri uyğunluq üçün entries massivini yoxla
  if (categoryEntry.entries && categoryEntry.entries.length > 0) {
    return requiredColumnIds.every(id => {
      const entry = categoryEntry.entries.find(e => e.columnId === id);
      return entry && entry.value && entry.value.trim() !== '';
    });
  }
  
  return false;
};

export const initializeEmptyCategoryData = (
  categories: CategoryWithColumns[]
): CategoryEntryData[] => {
  return categories.map(category => {
    const emptyValues = category.columns.map(column => ({
      id: uuidv4(),
      columnId: column.id,
      value: '',
      status: 'draft' as DataEntryStatus
    }));
    
    return {
      id: uuidv4(),
      categoryId: category.id,
      categoryName: category.name,
      status: 'draft' as DataEntryStatus,
      order: category.order || 0,
      progress: 0,
      values: emptyValues,
      isSubmitted: false
    };
  });
};

export const convertToDisplayFormat = (
  categories: CategoryWithColumns[],
  data: any[],
  status: DataEntryStatus = 'pending'
): CategoryEntryData[] => {
  // Create a map of column values by categoryId and columnId
  const columnValueMap: Record<string, Record<string, any>> = {};
  data.forEach(item => {
    if (!columnValueMap[item.category_id]) {
      columnValueMap[item.category_id] = {};
    }
    columnValueMap[item.category_id][item.column_id] = { 
      value: item.value, 
      status: item.status,
      id: item.id
    };
  });
  
  // Convert to CategoryEntryData format
  return categories.map(category => {
    const valueData = columnValueMap[category.id] || {};
    const values: ColumnEntry[] = category.columns.map(column => {
      const entryData = valueData[column.id] || {};
      return {
        id: entryData.id || uuidv4(),
        columnId: column.id,
        value: entryData.value || '',
        status: entryData.status || status,
      };
    });
    
    // Calculate progress
    const requiredColumns = category.columns.filter(c => c.isRequired);
    const requiredColumnIds = requiredColumns.map(c => c.id);
    const completedRequired = requiredColumnIds.filter(id => {
      const entry = values.find(v => v.columnId === id);
      return entry && entry.value && entry.value.trim() !== '';
    }).length;
    
    const progress = requiredColumns.length > 0 
      ? Math.round((completedRequired / requiredColumns.length) * 100)
      : 100;
    
    return {
      id: uuidv4(),
      categoryId: category.id,
      categoryName: category.name,
      order: category.order || 0,
      status,
      progress,
      values,
      isSubmitted: status !== 'draft',
    };
  });
};
