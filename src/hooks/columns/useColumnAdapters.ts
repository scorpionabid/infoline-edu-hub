import { useMemo } from 'react';
import { Column } from '@/types/column';
import { ColumnValidation } from '@/types/column';

// Fix the adapter function to include all required properties
export const useColumnAdapters = () => {
  const adaptColumnToFormData = (column: Column) => {
    return {
      id: column.id,
      name: column.name,
      label: column.label || column.name, // Use label if available or fall back to name
      type: column.type,
      category_id: column.category_id,
      order_index: column.order_index,
      is_required: column.is_required,
      placeholder: column.placeholder || '',
      help_text: column.help_text || '',
      default_value: column.default_value || '',
      options: column.options || null,
      validation: column.validation || {},
      status: column.status || 'active',
      section: column.section || null, // Handle section property
      parent_column_id: column.parent_column_id || null, // Handle parent_column_id
      conditional_display: column.conditional_display || null, // Handle conditional_display
    };
  };

  const adaptColumnFromAPI = (formData: any): Column => {
    return {
      id: formData.id,
      name: formData.name,
      type: formData.type,
      category_id: formData.category_id,
      order_index: formData.order_index,
      is_required: formData.is_required,
      placeholder: formData.placeholder,
      help_text: formData.help_text,
      default_value: formData.default_value,
      options: formData.options,
      validation: formData.validation,
      status: formData.status,
      label: formData.label,
      section: formData.section,
      parent_column_id: formData.parent_column_id,
      conditional_display: formData.conditional_display,
      created_at: formData.created_at,
      updated_at: formData.updated_at,
    };
  };

  // Update adaptColumnToAPI to handle all properties
  const adaptColumnToAPI = (column: Partial<Column>) => {
    const apiColumn: any = {
      name: column.name || '',
      type: column.type || 'text',
      category_id: column.category_id || '',
      order_index: column.order_index || 0,
      is_required: column.is_required !== undefined ? column.is_required : true,
      placeholder: column.placeholder || null,
      help_text: column.help_text || null,
      default_value: column.default_value || null,
      options: column.options || null,
      validation: column.validation || null,
      status: column.status || 'active',
      label: column.label || column.name || '', // Include label
      section: column.section || null, // Include section
    };

    // Include ID only if it exists
    if (column.id) {
      apiColumn.id = column.id;
    }

    // Include parent_column_id only if it exists
    if (column.parent_column_id) {
      apiColumn.parent_column_id = column.parent_column_id;
    }

    // Include conditional_display only if it exists
    if (column.conditional_display) {
      apiColumn.conditional_display = column.conditional_display;
    }

    return apiColumn;
  };

  const adaptColumnsToFormData = (columns: Column[]) => {
    return useMemo(() => {
      return columns?.map((column) => adaptColumnToFormData(column));
    }, [columns]);
  };

  return {
    adaptColumnToFormData,
    adaptColumnFromAPI,
    adaptColumnToAPI,
  };
};
