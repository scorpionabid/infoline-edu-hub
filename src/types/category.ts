
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
  completionRate?: number;
}

export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived' | 'approved';

export type CategoryAssignment = 'all' | 'sectors' | 'regions';

export interface CategoryFilter {
  search?: string;
  status?: CategoryStatus[] | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  archived?: boolean;
  assignment?: CategoryAssignment | string;
}

export interface AddCategoryFormData {
  name: string;
  description?: string;
  status?: CategoryStatus;
  deadline?: string;
  assignment?: CategoryAssignment;
  priority?: number;
}

export interface CategoryWithColumns extends Category {
  columns?: Column[];
}

export interface TabDefinition {
  id: string;
  title: string;
  label?: string;
  columns: Column[];
}

// Import Column type for CategoryWithColumns
import { Column } from './column';
