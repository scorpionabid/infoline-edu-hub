
export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: CategoryStatus;
  deadline?: string;
  priority?: number;
  created_at: string;
  updated_at: string;
  assignment?: CategoryAssignment;
  archived?: boolean;
  column_count?: number;
  completionRate?: number; // Add this property to match component usage
}

export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived';

export type CategoryAssignment = 'all' | 'sectors' | 'regions';

export interface CategoryFilter {
  search?: string;
  status?: CategoryStatus[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  archived?: boolean;
}

export interface AddCategoryFormData {
  name: string;
  description?: string;
  status?: CategoryStatus;
  deadline?: string;
  assignment?: CategoryAssignment;
  priority?: number;
}
