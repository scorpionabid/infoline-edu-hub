
import { CategoryStatus, ColumnType } from './schema';

export interface Category {
  id: string;
  name: string;
  status: CategoryStatus;
  assignment: 'all' | 'sectors' | 'schools';
  description?: string;
  priority?: number;
  deadline?: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithColumns extends Category {
  columns?: Column[];
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required?: boolean;
  validation?: ColumnValidation;
  options?: any[];
  help_text?: string;
  placeholder?: string;
  order_index?: number;
  status?: 'active' | 'inactive';
}

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
}
