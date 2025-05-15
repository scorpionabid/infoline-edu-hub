
export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved' | 'pending';

export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus | string;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  deadline?: string;
  archived?: boolean;
  column_count?: number;
  assignment?: CategoryAssignment | string;
  completionRate?: number;
}

export interface CategoryWithColumns extends Category {
  columns: import('./column').Column[];
  columnCount?: number;
  completionRate?: number;
}

export interface TabDefinition {
  id: string;
  title: string;
  label: string;
  columns?: any[];
}

export interface CategoryFilter {
  search: string;
  status: CategoryStatus | '';
  assignment: CategoryAssignment | '';
}
