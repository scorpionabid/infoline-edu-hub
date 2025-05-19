
// Import the required types from column.d.ts
import { Column, ColumnType } from './column';

export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved' | 'pending' | string;

export type CategoryAssignment = 'all' | 'sectors' | 'schools' | 'regions';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: CategoryStatus | string;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  deadline?: string;
  archived?: boolean;
  column_count?: number;
  columnCount?: number; // Alias for compatibility
  assignment?: CategoryAssignment | string;
  completionRate?: number;
}

export interface CategoryFilter {
  search: string;
  status: string | null;
  assignment: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryFilterProps {
  filter: CategoryFilter;
  onFilterChange: (filter: Partial<CategoryFilter>) => void;
}

export interface AddCategoryFormData {
  name: string;
  description?: string;
  deadline?: string | null;
  status?: CategoryStatus;
  assignment?: CategoryAssignment;
  priority?: number;
}

export interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: () => Promise<void>;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

// Additional type definitions to ensure compatibility
export interface TabDefinition {
  id: string;
  title: string;
  label?: string;
  columns?: any[];
}

// Export all the interfaces to ensure they're available
export { ColumnType, Column };
