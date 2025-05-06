
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'approved' | 'archived';
export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  deadline?: string;
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
