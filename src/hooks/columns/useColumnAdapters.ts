
import { useState, useCallback } from 'react';
import { Column } from '@/types/column.d';
import { ColumnValidation } from '@/types/column.d';

export const useColumnAdapters = () => {
  const adaptDbColumnToFrontend = useCallback((column: Column): Column => {
    return {
      ...column,
      id: column.id,
      name: column.name,
      type: column.type,
      order_index: column.order_index,
      is_required: column.is_required,
      category_id: column.category_id,
      options: column.options,
      placeholder: column.placeholder,
      help_text: column.help_text,
      validation: column.validation,
      default_value: column.default_value,
      status: column.status,
      created_at: column.created_at,
      updated_at: column.updated_at,
      label: column.label || column.name,
      section: column.section || '',
      parent_column_id: column.parent_column_id,
      conditional_display: column.conditional_display
    };
  }, []);

  const adaptFrontendColumnToDb = useCallback((column: Partial<Column>): Partial<Column> => {
    const dbColumn = {
      ...column,
      name: column.name,
      type: column.type,
      category_id: column.category_id,
      order_index: column.order_index || 0,
      is_required: column.is_required !== undefined ? column.is_required : true,
      options: column.options,
      placeholder: column.placeholder,
      help_text: column.help_text,
      validation: column.validation,
      default_value: column.default_value,
      status: column.status || 'active',
      label: column.label || column.name,
      section: column.section
    };
    
    return dbColumn;
  }, []);

  const adaptFrontendColumnsToDb = useCallback((columns: Partial<Column>[]): Partial<Column>[] => {
    return columns.map(adaptFrontendColumnToDb);
  }, [adaptFrontendColumnToDb]);

  const adaptComplexColumnToSimple = useCallback((column: Partial<Column>): Partial<Column> => {
    const simpleColumn = { ...column };

    // Delete complex properties that aren't needed for simple operations
    if (simpleColumn.parent_column_id !== undefined) {
      delete simpleColumn.parent_column_id;
    }
    
    if (simpleColumn.conditional_display !== undefined) {
      delete simpleColumn.conditional_display;
    }

    return simpleColumn;
  }, []);

  return {
    adaptDbColumnToFrontend,
    adaptFrontendColumnToDb,
    adaptFrontendColumnsToDb,
    adaptComplexColumnToSimple
  };
};

export { useColumnAdapters };
export const adaptDbColumnToFrontend = (column: Column): Column => {
  return {
    ...column,
    id: column.id,
    name: column.name,
    type: column.type,
    order_index: column.order_index,
    is_required: column.is_required,
    category_id: column.category_id,
    options: column.options,
    placeholder: column.placeholder,
    help_text: column.help_text,
    validation: column.validation,
    default_value: column.default_value,
    status: column.status,
    created_at: column.created_at,
    updated_at: column.updated_at,
    label: column.label || column.name,
    section: column.section || '',
    parent_column_id: column.parent_column_id,
    conditional_display: column.conditional_display
  };
};
