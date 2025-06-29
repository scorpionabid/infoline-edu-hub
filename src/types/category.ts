
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'approved' | 'archived';
export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: CategoryStatus;
  deadline?: string;
  priority?: number;
  order_index?: number;
  column_count?: number;
  archived?: boolean;
  created_at: string;
  updated_at: string;
  completion_rate?: number;
  completionRate?: number;
  columns?: any[];
}

export interface CategoryWithColumns extends Category {
  columns: any[];
}

export interface CategoryFilter {
  search: string;
  status: CategoryStatus | '';
  assignment: CategoryAssignment | '';
}

export interface AddCategoryFormData {
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: CategoryStatus;
  priority: number;
  deadline?: string | null;
  order_index?: number;
}

export interface CreateCategoryFormData extends AddCategoryFormData {
  created_at?: string;
  updated_at?: string;
}

export interface UpdateCategoryFormData extends Partial<AddCategoryFormData> {
  id: string;
  updated_at?: string;
}

// Add the missing UpdateCategoryData type
export interface UpdateCategoryData {
  name?: string;
  description?: string;
  assignment?: CategoryAssignment;
  status?: CategoryStatus;
  priority?: number;
  deadline?: string | null;
  updated_at?: string;
}

export const formatDeadlineForApi = (deadline: any): string | null => {
  if (!deadline) return null;
  if (typeof deadline === 'string') return deadline;
  if (deadline instanceof Date) return deadline.toISOString();
  return null;
};
