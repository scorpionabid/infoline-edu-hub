
export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status?: 'active' | 'inactive' | 'archived';
  priority?: number;
  created_at?: string;
  updated_at?: string;
  column_count?: number;
}

export interface CategoryWithColumns extends Category {
  columns?: any[];
}
