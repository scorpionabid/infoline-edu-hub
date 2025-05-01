
import { Category, Column } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';

/**
 * Supabase-dən gələn kateqoriya məlumatlarını lokal tipə çevirmək üçün adapter
 */
export function adaptSupabaseCategory(data: any): Category {
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    assignment: data.assignment || 'all',
    deadline: data.deadline,
    status: data.status || 'active',
    priority: data.priority || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    archived: data.archived || false,
    column_count: data.column_count || 0
  };
}

/**
 * Supabase-dən gələn sütun məlumatlarını lokal tipə çevirmək üçün adapter
 */
export function adaptSupabaseColumn(data: any): Column {
  let options = data.options;
  let validation = data.validation;
  
  // options və validation sahələrini işləmə
  try {
    if (options && typeof options === 'string') {
      options = JSON.parse(options);
    }
  } catch (e) {
    console.warn('Sütun seçimlərini parse etmək alınmadı:', e);
    options = [];
  }
  
  try {
    if (validation && typeof validation === 'string') {
      validation = JSON.parse(validation);
    }
  } catch (e) {
    console.warn('Sütun validasiyasını parse etmək alınmadı:', e);
    validation = {};
  }
  
  return {
    id: data.id,
    category_id: data.category_id,
    name: data.name,
    type: data.type,
    is_required: data.is_required !== false, // default true
    placeholder: data.placeholder,
    help_text: data.help_text,
    order_index: data.order_index || 0,
    status: data.status || 'active',
    options: options || [],
    validation: validation || {},
    default_value: data.default_value,
    created_at: data.created_at,
    updated_at: data.updated_at,
    parent_column_id: data.parent_column_id
  };
}

/**
 * Supabase-dən gələn data entry məlumatlarını lokal tipə çevirmək üçün adapter
 */
export function adaptSupabaseDataEntry(data: any): DataEntry {
  return {
    id: data.id,
    school_id: data.school_id,
    category_id: data.category_id,
    column_id: data.column_id,
    value: data.value || '',
    status: data.status || 'draft',
    created_by: data.created_by,
    approved_by: data.approved_by,
    approved_at: data.approved_at,
    rejected_by: data.rejected_by,
    rejection_reason: data.rejection_reason,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}
