
export type CategoryStatus = 'active' | 'inactive' | 'archived';
export type CategoryAssignment = 'all' | 'sectors' | 'specific';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  assignment: CategoryAssignment;
  priority: number;
  archived: boolean;
  column_count: number;
  order?: number;
  deadline?: string | null;
}

export interface CategoryWithOrder extends Category {
  order: number;
}

export interface CategoryWithColumns {
  category: Category;
  columns: import('@/types/column').Column[];
}
