
export type CategoryAssignment = 'all' | 'sectors' | 'schools';
export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  assignment: CategoryAssignment;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  priority?: number;
  deadline?: string | Date | null;
  column_count?: number;
  completionRate?: number;
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

export interface CategoryWithColumns extends Category {
  columns: ColumnData[];
}

export interface FormCategory extends Category {
  completionRate?: number;
}
