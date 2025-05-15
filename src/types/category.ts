
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'approved' | 'archived';

export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: CategoryStatus;
  created_at?: string;
  updated_at?: string;
  assignment?: CategoryAssignment;
  priority?: number;
  deadline?: string | Date | null;
  archived?: boolean;
  column_count?: number;
  completionRate?: number; // Added missing property
}

export interface CategoryFilter {
  status?: CategoryStatus | null;
  search?: string | null;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc' | null;
  archived?: boolean;
}

// Definition for TabDefinition used in CategoryForm
export interface TabDefinition {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ExtendedCategoryFilter extends CategoryFilter {
  search?: string;
}
