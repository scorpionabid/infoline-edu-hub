
import {
  CategoryStatus,
  CategoryAssignment,
  Category,
  CategoryWithColumns,
  CategoryFormData,
  CategoryFilter,
  formatDeadlineForApi
} from './core/category';
import { TabDefinition } from './dataEntry';

// Re-export core types
export type {
  CategoryStatus,
  CategoryAssignment,
  Category,
  CategoryWithColumns,
  CategoryFilter,
  TabDefinition
};

export { formatDeadlineForApi };

// UI-specific types
export interface CategoryFilterProps {
  filter: CategoryFilter;
  onFilterChange: (filter: Partial<CategoryFilter>) => void;
}

export interface CreateCategoryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCategoryCreated?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export interface AddCategoryFormData {
  name: string;
  description?: string;
  deadline?: Date | null | string;
  status?: CategoryStatus;
  assignment?: CategoryAssignment;
  priority?: number;
}
