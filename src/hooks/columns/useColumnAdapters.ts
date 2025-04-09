
import { Column } from '@/types/column';

// Supabase-dən gələn sütun məlumatlarını bizim Column tipinə adaptasiya etmək
export const adaptSupabaseColumn = (data: any): Column => {
  return {
    id: data.id,
    category_id: data.category_id,
    name: data.name,
    type: data.type,
    is_required: data.is_required || true,
    order_index: data.order_index || 0,
    status: data.status || 'active',
    validation: data.validation,
    default_value: data.default_value,
    placeholder: data.placeholder,
    help_text: data.help_text,
    options: data.options,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

// Column məlumatlarını Supabase formatına çevirmək
export const adaptColumnToSupabase = (column: Partial<Column>): any => {
  return {
    id: column.id,
    category_id: column.category_id,
    name: column.name,
    type: column.type,
    is_required: column.is_required,
    order_index: column.order_index,
    status: column.status,
    validation: column.validation,
    default_value: column.default_value,
    placeholder: column.placeholder,
    help_text: column.help_text,
    options: column.options,
    created_at: column.created_at,
    updated_at: column.updated_at
  };
};
