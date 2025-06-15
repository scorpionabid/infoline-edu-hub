
export interface Category {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  assignment: 'all' | 'schools' | 'sectors' | 'regions';
  status: 'active' | 'inactive' | 'draft' | 'approved' | 'archived' | 'pending';
  priority: number;
  deadline: string;
  order_index: number;
  column_count?: number;
  completion_rate?: number;
  completionRate?: number;
  archived?: boolean;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  default_value?: string;
  options?: any;
  validation?: any;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AddCategoryFormData {
  name: string;
  description: string;
  assignment: 'all' | 'schools' | 'sectors' | 'regions';
  status: 'active' | 'inactive' | 'draft' | 'approved' | 'archived' | 'pending';
  priority: number;
  deadline: string | Date;
  order_index?: number;
}

export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'approved' | 'archived' | 'pending';
export type CategoryAssignment = 'all' | 'schools' | 'sectors' | 'regions';

export interface CategoryFilter {
  search: string;
  status: CategoryStatus | string | null;
  assignment: CategoryAssignment | string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const formatDeadlineForApi = (deadline: string | Date): string => {
  if (typeof deadline === 'string') {
    return deadline;
  }
  return deadline.toISOString();
};
