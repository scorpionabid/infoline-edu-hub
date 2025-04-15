
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'textarea';

export interface ColumnOption {
  value: string;
  label: string;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  order_index: number;
  status: 'active' | 'inactive' | 'draft';
  validation: any;
  default_value?: string;
  placeholder?: string;
  help_text?: string;
  options: string[] | ColumnOption[];
  created_at: string;
  updated_at: string;
  parentColumnId?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description: string;
  assignment: 'all' | 'sectors';
  deadline: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  created_at: string;
  updated_at: string;
  archived: boolean;
  column_count: number;
  columns: Column[];
}

// Sütun adapteri funksiyaları
export const adaptColumnToSupabase = (column: Partial<Column>) => {
  return {
    name: column.name,
    category_id: column.category_id,
    type: column.type,
    is_required: column.is_required,
    order_index: column.order_index,
    status: column.status,
    validation: column.validation,
    default_value: column.default_value,
    placeholder: column.placeholder,
    help_text: column.help_text,
    options: column.options,
    parent_column_id: column.parentColumnId
  };
};

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
}
