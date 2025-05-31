
import { Column } from '@/types/column';

export const formatColumns = (columns: Column[]): Column[] => {
  return columns.map(column => ({
    ...column,
    options: Array.isArray(column.options) ? column.options : []
  }));
};

export const formatSelectOptions = (options: any): Array<{ label: string; value: string }> => {
  if (!options) return [];
  
  if (Array.isArray(options)) {
    return options.map(option => {
      if (typeof option === 'string') {
        return { label: option, value: option };
      }
      if (typeof option === 'object' && option.label && option.value) {
        return { label: option.label, value: option.value };
      }
      return { label: String(option), value: String(option) };
    });
  }
  
  return [];
};
