
import { AssignmentType } from './category';

export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'image';

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customError?: string;
}

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  description?: string;
  placeholder?: string;
  default_value?: string;
  is_required: boolean;
  is_visible: boolean;
  status: 'active' | 'inactive' | 'draft';
  created_at: Date;
  updated_at: Date;
  order_index: number;
  validation?: ColumnValidation[];
  options?: ColumnOption[];
  parent_column_id?: string;
  conditional_display?: {
    column_id: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=';
    value: string | number;
  };
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: AssignmentType;
  status: 'active' | 'inactive' | 'draft';
  deadline?: Date;
  created_at: Date;
  updated_at: Date;
  archived: boolean;
  priority: number;
  columns: Column[];
}
