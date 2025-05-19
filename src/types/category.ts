
// Type definitions
export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved' | 'pending' | string;
export type CategoryAssignment = 'all' | 'sectors' | 'schools' | 'regions' | string;

// Main Category interface
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
  completion_rate?: number;
}

// Filtering
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

// Form data for creating/editing categories
export interface AddCategoryFormData {
  name: string;
  description?: string;
  deadline?: string | Date | null;
  status?: CategoryStatus;
  assignment?: CategoryAssignment;
  priority?: number;
}

// Dialog props
export interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: () => Promise<void>;
}

// Category with columns
export interface CategoryWithColumns extends Category {
  columns: any[];
}

// Tab definition
export interface TabDefinition {
  id: string;
  title: string;
  label?: string;
  columns?: any[];
  value?: string;
  count?: number;
}

// Helper function to convert Date to string for API
export function formatDeadlineForApi(deadline: Date | string | null | undefined): string | null {
  if (!deadline) return null;
  if (typeof deadline === 'string') return deadline;
  return deadline.toISOString();
}
