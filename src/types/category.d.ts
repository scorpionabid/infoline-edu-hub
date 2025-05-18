
export type CategoryStatus = 'active' | 'draft' | 'archived';
export type CategoryAssignment = 'all' | 'region' | 'sector' | 'school';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: CategoryStatus;
  created_at?: string;
  updated_at?: string;
  deadline?: string | Date;
  column_count?: number;
  priority?: number;
  archived?: boolean;
  assignment?: CategoryAssignment;
  completionRate?: number;
}

export interface CategoryFilter {
  search: string;
  status: CategoryStatus | '';
  assignment: CategoryAssignment | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryFilterProps {
  filter: CategoryFilter;
  onFilterChange: (filter: Partial<CategoryFilter>) => void;
}

export interface CreateCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (category: Category) => void;
}

export interface AddCategoryFormData {
  name: string;
  description?: string;
  deadline?: Date | null;
  status: CategoryStatus;
  assignment: CategoryAssignment;
}
