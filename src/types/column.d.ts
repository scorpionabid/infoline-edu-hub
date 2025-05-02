
export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  is_required: boolean;
  options?: any[];
  order_index: number;
  status: 'active' | 'inactive';
  validation?: ColumnValidation;
  created_at: string;
  updated_at: string;
}

export type ColumnType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image';

export interface ColumnValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  requiredMessage?: string;
  patternMessage?: string;
  email?: boolean;
  url?: boolean;
  min?: number;
  max?: number;
  inclusion?: string[];
}

export interface ColumnValidationError {
  message: string;
  type: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  status: 'active' | 'inactive' | 'draft';
  priority?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  columns: Column[];
  entries?: DataEntry[];
  completionPercentage?: number;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'partial';
}
