
import { Column } from '@/types/column';
import { useCallback } from 'react';

// This function adapts a column from the database to the frontend format
export const adaptDbColumnToFrontend = (column: Column): Column => {
  return {
    ...column,
    // Add frontend-specific properties
    label: column.name || '',
    is_required: column.is_required !== undefined ? column.is_required : true,
    validation: column.validation || {},
    options: column.options || [],
    section: column.section || '',
    parent_column_id: column.parent_column_id || null,
    conditional_display: column.conditional_display || null,
    order_index: column.order_index || 0
  };
};

// This function adapts a frontend column to the database format
export const adaptFrontendColumnToDb = (column: Partial<Column>): Partial<Column> => {
  const dbColumn: Partial<Column> = {
    ...column,
    name: column.name || column.label || '',
  };
  
  // Clean up frontend-only properties
  if ('label' in dbColumn) delete dbColumn.label;
  if ('section' in dbColumn) delete dbColumn.section;
  if ('parent_column_id' in dbColumn && !dbColumn.parent_column_id) delete dbColumn.parent_column_id;
  if ('conditional_display' in dbColumn && !dbColumn.conditional_display) delete dbColumn.conditional_display;

  return dbColumn;
};

// Custom hook for column adapter utilities
const useColumnAdapters = () => {
  const adaptToFrontend = useCallback((column: Column): Column => {
    return adaptDbColumnToFrontend(column);
  }, []);

  const adaptToDb = useCallback((column: Partial<Column>): Partial<Column> => {
    return adaptFrontendColumnToDb(column);
  }, []);

  return {
    adaptToFrontend,
    adaptToDb,
    adaptDbColumnToFrontend,
    adaptFrontendColumnToDb
  };
};

export default useColumnAdapters;
