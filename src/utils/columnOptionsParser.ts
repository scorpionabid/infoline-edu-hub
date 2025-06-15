
import { Column, ColumnOption } from '@/types/column';

export const transformRawColumnData = (rawColumn: any): Partial<Column> => {
  let options: ColumnOption[] = [];
  
  if (rawColumn.options) {
    try {
      if (typeof rawColumn.options === 'string') {
        options = JSON.parse(rawColumn.options);
      } else if (Array.isArray(rawColumn.options)) {
        options = rawColumn.options;
      }
    } catch (error) {
      console.warn('Failed to parse column options:', error);
      options = [];
    }
  }

  return {
    options,
    description: rawColumn.description || '',
  };
};
