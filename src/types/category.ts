
import { Column } from './column';

export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved' | 'pending';

export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: CategoryStatus;
  priority?: number;
  deadline?: string;
  assignment?: CategoryAssignment;
  archived?: boolean;
  column_count?: number;
  created_at?: string;
  updated_at?: string;
  completionRate?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

export interface CategoryFilter {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  archived?: boolean;
}

export interface AddCategoryFormData {
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: CategoryStatus;
  priority: number;
  deadline?: string | null;
}

export interface TabDefinition {
  id: string;
  title: string;
  label?: string;
  columns?: any[];
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  status?: string;
  completion: number;
  completionRate?: number;
  deadline?: string;
  daysLeft?: number;
  columnCount?: number;
}
