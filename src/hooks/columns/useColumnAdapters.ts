
import { Column } from '@/types/column';

export const useColumnAdapters = () => {
  const adaptColumnToForm = (column: Column) => {
    return {
      ...column,
      parent_column_id: column.parent_column_id || undefined
    };
  };

  const adaptFormToColumn = (formData: Partial<Column>): Partial<Column> => {
    return {
      ...formData,
      parent_column_id: formData.parent_column_id || null
    };
  };

  return {
    adaptColumnToForm,
    adaptFormToColumn
  };
};
