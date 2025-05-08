
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'approved' | 'archived';
export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  deadline?: string | Date;
  status: CategoryStatus;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  column_count?: number;
  completionRate?: number;
}

export interface CategoryWithColumns extends Category {
  columns?: any[];
}

export interface FormItem {
  id: string;
  name: string;
  title: string;
  status: string;
  categoryName: string;
  dueDate: string;
  createdAt: string;
  completionRate: number;
}

export interface CategoryFilter {
  status?: string;
  deadline?: string;
  search?: string;
  date?: string | Date;
  assignment?: string;
}

export interface ColumnData {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  options?: any;
  validation?: any;
  help_text?: string;
  placeholder?: string;
  category_id: string;
  order_index?: number;
  status?: string;
}

export interface TabDefinition {
  id: string;
  label: string;
  columns: any[];
}
