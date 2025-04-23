
import { CategoryStatus } from './schema';

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
  column_count?: number;
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

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea';

export interface CategoryFilter {
  status?: CategoryStatus[];
  assignment?: ('all' | 'sectors' | 'schools')[];
  search?: string;
  archived?: boolean;
}

export type FormStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface CategoryAdapter {
  adaptSupabaseCategory: (data: any) => Category;
  adaptCategoryToSupabase: (category: Category) => any;
}

