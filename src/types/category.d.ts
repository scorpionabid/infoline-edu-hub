
export type CategoryStatus = 'active' | 'inactive' | 'archived';

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
  assignment?: string;
}

export interface CategoryWithColumns extends Category {
  columns: import('./column').Column[];
  columnCount?: number;
  completionRate?: number;
}
