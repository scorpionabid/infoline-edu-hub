
import type { Category } from '@/types/category';
import type { Column } from '@/types/column';

export { useDataManagement } from './useDataManagement';

// Define missing types locally since they're not available from useDataManagement
export type DataManagementStep = 'category' | 'column' | 'data';

export type SchoolDataEntry = {
  id: string;
  school_id: string;
  category_id: string;
  column_data: Record<string, any>;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type DataStats = {
  totalEntries: number;
  completedEntries: number;
  pendingEntries: number;
  rejectedEntries: number;
};

// Re-export types from their proper sources
export type { Category, Column };

// DataManagementState type definition
export type DataManagementState = {
  currentStep: DataManagementStep;
  selectedCategory: Category | null;
  selectedColumn: Column | null;
  schoolData: SchoolDataEntry[];
  isLoading: boolean;
  error: string | null;
};
