
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'image' | 'email' | 'phone' | 'boolean';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ValidationRules {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternError?: string;
  minDate?: string;
  maxDate?: string;
  format?: string;
  regex?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index: number;
  help_text?: string;
  placeholder?: string;
  options: ColumnOption[] | string[];
  validation: ValidationRules;
  default_value?: string;
  status: string;
  created_at: string;
  updated_at: string;
  parentColumnId?: string; // Added for compatibility
}

export interface Category {
  id: string;
  name: string;
  description: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
  status: string;
  priority: number;
  created_at: string;
  updated_at: string;
  archived: boolean;
  column_count: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

// Function to adapt Column type for Supabase
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
    status: column.status,
  };
}
