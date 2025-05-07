
import { Column } from '@/types/column';
import { ValidationRules, ColumnValidation } from '@/types/column';

// Column tipini API-dən frontend tiplərə çevirmək üçün adapter
export const useColumnAdapters = () => {
  // API-dən alınan sütun məlumatlarını frontend tipinə çevirmək
  const adaptColumnFromApi = (apiColumn: any): Column => {
    return {
      id: apiColumn.id,
      name: apiColumn.name,
      type: apiColumn.type,
      category_id: apiColumn.category_id,
      is_required: apiColumn.is_required || false,
      order_index: apiColumn.order_index || 0,
      options: apiColumn.options ? JSON.parse(apiColumn.options) : undefined,
      validation: apiColumn.validation ? JSON.parse(apiColumn.validation) : undefined,
      help_text: apiColumn.help_text,
      placeholder: apiColumn.placeholder,
      default_value: apiColumn.default_value,
      parent_column_id: apiColumn.parent_column_id,
      conditional_display: apiColumn.conditional_display ? JSON.parse(apiColumn.conditional_display) : undefined,
      status: apiColumn.status || 'active',
      created_at: apiColumn.created_at,
      updated_at: apiColumn.updated_at
    };
  };
  
  // Frontend sütun məlumatlarını API formatına çevirmək
  const adaptColumnToApi = (column: Partial<Column>): any => {
    const apiColumn: any = {
      name: column.name,
      type: column.type,
      category_id: column.category_id,
      is_required: column.is_required || false,
      order_index: column.order_index || 0
    };
    
    if (column.options) {
      apiColumn.options = JSON.stringify(column.options);
    }
    
    if (column.validation) {
      apiColumn.validation = JSON.stringify(column.validation);
    }
    
    if (column.help_text) {
      apiColumn.help_text = column.help_text;
    }
    
    if (column.placeholder) {
      apiColumn.placeholder = column.placeholder;
    }
    
    if (column.default_value !== undefined) {
      apiColumn.default_value = column.default_value;
    }
    
    if (column.parent_column_id) {
      apiColumn.parent_column_id = column.parent_column_id;
    }
    
    if (column.conditional_display) {
      apiColumn.conditional_display = JSON.stringify(column.conditional_display);
    }
    
    if (column.status) {
      apiColumn.status = column.status;
    }
    
    return apiColumn;
  };
  
  // Validation qaydalarını formata çevirmək
  const adaptValidationRules = (rules: ValidationRules): ColumnValidation => {
    return {
      required: rules.required,
      minLength: rules.minLength,
      maxLength: rules.maxLength,
      min: rules.min,
      max: rules.max,
      minValue: rules.minValue,
      maxValue: rules.maxValue,
      pattern: rules.pattern,
      email: rules.email,
      url: rules.url
    };
  };
  
  return {
    adaptColumnFromApi,
    adaptColumnToApi,
    adaptValidationRules
  };
};
