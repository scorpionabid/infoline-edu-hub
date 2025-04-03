
export type CategoryAssignment = 'all' | 'sectors';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: 'active' | 'inactive' | 'archived';
  priority?: number;
  column_count?: number;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
}

export interface CategoryWithOrder extends Category {
  order?: number;
}
