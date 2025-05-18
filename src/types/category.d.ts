
import { Column } from './column';

export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved' | 'pending' | string;
export type CategoryAssignment = 'all' | 'sectors' | 'schools' | 'regions';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus | string;
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

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  status?: string;
  completionRate: number;
  deadline?: string;
  daysLeft?: number;
  columnCount?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  columnCount?: number;
  column_count?: number;
  completionRate?: number;
}

export interface TabDefinition {
  id: string;
  title: string;
  label?: string;
  columns?: any[];
}

export interface CategoryFilter {
  search: string;
  status: CategoryStatus | '';
  assignment: CategoryAssignment | '';
}

export interface CategoryFilterProps {
  filters: CategoryFilter;
  onChange: (filters: CategoryFilter) => void;
  showAssignmentFilter?: boolean;
}

export interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: () => Promise<void>;
}

export interface AddCategoryFormData {
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: CategoryStatus;
  priority: number;
  deadline?: string | null;
}
