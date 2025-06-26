
import { Column } from '@/types/column';
import { useCallback } from 'react';

// Extended Column type to include frontend-specific properties
interface ExtendedColumn extends Column {
  label?: string;
  section?: string;
  parent_column_id?: string | null;
  conditional_display?: any | null;
}

// This function adapts a column from the database to the frontend format
export const adaptDbColumnToFrontend = (column: Column): ExtendedColumn => {
  return {
    ...column,
    // Add frontend-specific properties
    label: column.name || '',
    is_required: column.is_required !== undefined ? column.is_required : true,
    validation: column.validation || {},
    options: column.options || [],
    section: '',
    parent_column_id: null,
    conditional_display: null,
    order_index: column.order_index || 0
  };
};

// This function adapts a frontend column to the database format
export const adaptFrontendColumnToDb = (column: Partial<ExtendedColumn>): Partial<Column> => {
  // Create a copy with all properties
  const dbColumn: Partial<Column> = {
    ...column,
    name: column.name || column.label || '',
  };
  
  // Clean up frontend-only properties
  const result = { ...dbColumn };
  delete (result as any).label;
  delete (result as any).section;
  delete (result as any).parent_column_id;
  delete (result as any).conditional_display;

  return result;
};

// Custom hook for column adapter utilities
export const useColumnAdapters = () => {
  const adaptToFrontend = useCallback((column: Column): ExtendedColumn => {
    return adaptDbColumnToFrontend(column);
  }, []);

  const adaptToDb = useCallback((column: Partial<ExtendedColumn>): Partial<Column> => {
    return adaptFrontendColumnToDb(column);
  }, []);

  return {
    adaptToFrontend,
    adaptToDb,
    adaptDbColumnToFrontend,
    // adaptFrontendColumnToDb
  };
};

export default useColumnAdapters;
