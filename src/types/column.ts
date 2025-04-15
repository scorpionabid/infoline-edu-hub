
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image';

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
