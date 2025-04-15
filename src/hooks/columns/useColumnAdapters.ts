
import { Column } from '@/types/column';

/**
 * Column tipinin verilənlər bazası formatına çevrilməsi
 */
export function adaptColumnToSupabase(column: Partial<Column>): any {
  return {
    id: column.id,
    name: column.name,
    type: column.type,
    category_id: column.category_id,
    is_required: column.is_required,
    order_index: column.order_index,
    help_text: column.help_text || null,
    placeholder: column.placeholder || null,
    options: column.options || [],
    validation: column.validation || {},
    default_value: column.default_value || null,
    status: column.status || 'active',
    parent_column_id: column.parentColumnId,
  };
}

/**
 * Verilənlər bazası formatından Column tipinə çevrilməsi
 */
export function adaptSupabaseToColumn(data: any): Column {
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    category_id: data.category_id,
    is_required: data.is_required,
    order_index: data.order_index || 0,
    help_text: data.help_text || '',
    placeholder: data.placeholder || '',
    options: data.options || [],
    validation: data.validation || {},
    default_value: data.default_value || '',
    status: data.status || 'active',
    created_at: data.created_at,
    updated_at: data.updated_at,
    parentColumnId: data.parent_column_id
  };
}

// Əsas adaptSupabaseToColumn funksiyasını dəstəkləmək üçün alias
export const adaptSupabaseColumn = adaptSupabaseToColumn;
