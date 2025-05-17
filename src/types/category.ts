
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived' | 'approved' | 'pending';

export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  priority?: number;
  deadline?: string | Date;
  column_count?: number;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  assignment?: CategoryAssignment | string;
  completionRate?: number;
}

export interface CategoryWithColumns extends Category {
  columns?: any[];
}

// Function to normalize category status
export function normalizeCategoryStatus(status: string | string[] | undefined): CategoryStatus[] {
  if (!status) return ['active'];
  
  if (typeof status === 'string') {
    return [status as CategoryStatus];
  }
  
  return status as CategoryStatus[];
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

export interface AddCategoryFormData {
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: CategoryStatus;
  priority: number;
  deadline?: string | null;
}

export interface CategoryFilterProps {
  filters: CategoryFilter;
  onChange: (filters: CategoryFilter) => void;
  showAssignmentFilter?: boolean;
}

export interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: () => void;
}
